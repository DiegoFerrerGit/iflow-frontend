import { Injectable, NgZone } from '@angular/core';
import { Store } from '@ngrx/store';
import { environment } from '../../../environments/environment';
import { AuthActions } from './state/authentication.actions';

/** Typings for Google Identity Services */
declare const google: {
    accounts: {
        id: {
            initialize(config: {
                client_id: string;
                callback: (response: { credential: string }) => void;
                auto_select?: boolean;
                cancel_on_tap_outside?: boolean;
                use_fedcm_for_prompt?: boolean;
            }): void;
            prompt(momentListener?: (notification: {
                isNotDisplayed(): boolean;
                isSkippedMoment(): boolean;
                getNotDisplayedReason(): string;
                getSkippedReason(): string;
            }) => void): void;
            renderButton(
                parent: HTMLElement,
                options: {
                    type?: string;
                    theme?: string;
                    size?: string;
                    width?: number;
                    text?: string;
                    shape?: string;
                    logo_alignment?: string;
                },
            ): void;
        };
    };
};

@Injectable({ providedIn: 'root' })
export class GoogleAuthService {
    private fallbackButtonContainer: HTMLElement | null = null;

    constructor(
        private store: Store,
        private ngZone: NgZone,
    ) { }

    /**
     * Initializes Google Identity Services with the OAuth client ID.
     * Includes a retry mechanism if the Google script isn't ready yet.
     */
    initialize(retries = 0): void {
        if (typeof google === 'undefined' || !google.accounts?.id) {
            if (retries < 10) {
                console.warn(`[GoogleAuth] Google script not ready, retrying in 200ms... (attempt ${retries + 1})`);
                setTimeout(() => this.initialize(retries + 1), 200);
            } else {
                console.error('[GoogleAuth] Could not load Google Identity Services after multiple attempts.');
            }
            return;
        }

        google.accounts.id.initialize({
            client_id: environment.googleOAuthClientId,
            callback: (response) => this.handleCredentialResponse(response),
            auto_select: false,
            cancel_on_tap_outside: true,
            use_fedcm_for_prompt: true,
        });
    }

    /**
     * Opens the Google sign-in flow.
     * Tries One Tap first; if blocked (FedCM disabled), falls back to
     * a hidden Google-rendered button that opens a popup and always works.
     */
    signIn(): void {
        this.initialize();
        google.accounts.id.prompt((notification) => {
            if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
                // FedCM blocked or prompt skipped → click the hidden fallback button
                this.clickFallbackButton();
            }
        });
    }

    /**
     * Handles the credential response from Google.
     * Dispatches loginStart action with the idToken.
     */
    private handleCredentialResponse(response: { credential: string }): void {
        this.ngZone.run(() => {
            this.store.dispatch(AuthActions.loginStart({ idToken: response.credential }));
        });
    }

    /**
     * Creates a hidden Google-rendered button and programmatically clicks it.
     * This opens the standard Google OAuth popup which is never blocked by FedCM.
     */
    private clickFallbackButton(): void {
        // Create an offscreen container if it doesn't exist
        if (!this.fallbackButtonContainer) {
            this.fallbackButtonContainer = document.createElement('div');
            this.fallbackButtonContainer.style.position = 'fixed';
            this.fallbackButtonContainer.style.top = '-1000px';
            this.fallbackButtonContainer.style.left = '-1000px';
            this.fallbackButtonContainer.style.opacity = '0';
            this.fallbackButtonContainer.style.pointerEvents = 'none';
            document.body.appendChild(this.fallbackButtonContainer);
        }

        // Clear previous content and render a new button
        this.fallbackButtonContainer.innerHTML = '';
        google.accounts.id.renderButton(this.fallbackButtonContainer, {
            type: 'standard',
            theme: 'filled_black',
            size: 'large',
            text: 'continue_with',
            shape: 'rectangular',
        });

        // Give the button time to render, then click it
        setTimeout(() => {
            const btn =
                this.fallbackButtonContainer?.querySelector('[role="button"]') as HTMLElement
                || this.fallbackButtonContainer?.querySelector('div[style]') as HTMLElement
                || this.fallbackButtonContainer?.firstElementChild as HTMLElement;
            if (btn) {
                // Temporarily make it clickable
                this.fallbackButtonContainer!.style.pointerEvents = 'auto';
                btn.click();
                this.fallbackButtonContainer!.style.pointerEvents = 'none';
            }
        }, 100);
    }
}
