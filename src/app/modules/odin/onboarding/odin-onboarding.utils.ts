/**
 * ODIN Onboarding — DOM utility helpers
 * Handles scrolling to targets and computing element positions.
 */

/**
 * Finds a DOM element by its data-onboarding-target attribute value.
 */
export function findOnboardingTarget(targetId: string): HTMLElement | null {
    return document.querySelector<HTMLElement>(`[data-onboarding-target="${targetId}"]`);
}

/**
 * Returns the bounding rect of a target element, or null if not found.
 * Retries up to `maxRetries` times with a short delay if not found immediately
 * (handles delayed rendering).
 */
export async function getTargetRect(targetId: string, maxRetries: number = 5): Promise<DOMRect | null> {
    for (let i = 0; i < maxRetries; i++) {
        const el = findOnboardingTarget(targetId);
        if (el) {
            return el.getBoundingClientRect();
        }
        await delay(150);
    }
    return null;
}

/**
 * Smoothly scrolls the page so that the target element is visible,
 * centered vertically with some offset.
 * Returns a promise that resolves when scrolling finishes.
 */
export function scrollToTarget(targetId: string, offset: number = 40): Promise<void> {
    return new Promise(resolve => {
        const el = findOnboardingTarget(targetId);
        if (!el) {
            resolve();
            return;
        }

        const rect = el.getBoundingClientRect();
        const absoluteTop = rect.top + window.scrollY;
        const scrollTarget = absoluteTop - offset;

        window.scrollTo({ top: scrollTarget, behavior: 'smooth' });

        // Wait for smooth scroll to finish
        let lastPos = -1;
        let stableFrames = 0;
        const checkScroll = () => {
            const currentPos = window.scrollY;
            if (Math.abs(currentPos - lastPos) < 1) {
                stableFrames++;
                if (stableFrames >= 3) {
                    resolve();
                    return;
                }
            } else {
                stableFrames = 0;
            }
            lastPos = currentPos;
            requestAnimationFrame(checkScroll);
        };
        requestAnimationFrame(checkScroll);
    });
}

/**
 * Simple delay helper.
 */
function delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}
