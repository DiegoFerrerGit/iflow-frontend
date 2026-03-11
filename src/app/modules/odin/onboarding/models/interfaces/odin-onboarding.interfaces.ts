import { OdinOnboardingStep } from '../types/odin-onboarding.types';

/**
 * ODIN Onboarding — Interface definitions
 */

export interface OdinOnboardingState {
    /** Whether the onboarding overlay is currently active */
    active: boolean;
    /** Current step in the flow */
    currentStep: OdinOnboardingStep;
    /** If true, the page should render mocked demo data instead of real data */
    useMockData: boolean;
    /** data-onboarding-target value of the element to highlight (null = centered, no target) */
    highlightTarget: string | null;
    /** If true, user interaction outside the card / target is blocked */
    blockInteraction: boolean;
    /** If true, the page should autoscroll to the target element before displaying the card */
    shouldAutoScroll: boolean;
    /** If true, the overlay and card are visible. False when a form is open during onboarding */
    showOverlay: boolean;
}

export interface OdinOnboardingStepConfig {
    /** Unique step identifier */
    id: OdinOnboardingStep;
    /** Card title (Spanish, user-facing) */
    title: string;
    /** Card description (Spanish, user-facing) */
    description: string;
    /** Optional additional helper text shown below the description */
    supportText?: string;
    /** data-onboarding-target value to highlight, null = centered card with no highlight */
    target: string | null;
    /** Primary button label */
    primaryCta: string;
    /** Secondary button label (back / entendido) */
    secondaryCta?: string;
    /** Whether to show a "skip onboarding" option */
    showSkip: boolean;
    /** Whether mock data should be active during this step */
    useMockData: boolean;
    /** Card positioning strategy */
    cardPosition: 'center' | 'near-target';
}
