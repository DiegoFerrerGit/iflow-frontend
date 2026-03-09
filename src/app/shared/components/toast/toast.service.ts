import { Injectable, signal } from '@angular/core';

export type ToastType = 'error' | 'success' | 'warning';

export interface ToastState {
    show: boolean;
    message: string;
    type: ToastType;
    duration: number;
}

@Injectable({
    providedIn: 'root'
})
export class ToastService {
    // We use Angular Signals for reactive state without RxJS boilerplate
    public readonly state = signal<ToastState>({
        show: false,
        message: '',
        type: 'error',
        duration: 5000
    });

    /**
     * Helper to show an error toast. Defaults to 5 seconds.
     */
    showError(message: string, duration: number = 5000): void {
        this.show(message, 'error', duration);
    }

    /**
     * Helper to show a success toast. Defaults to 5 seconds.
     */
    showSuccess(message: string, duration: number = 5000): void {
        this.show(message, 'success', duration);
    }

    /**
     * Helper to show a warning toast. Defaults to 5 seconds.
     */
    showWarning(message: string, duration: number = 5000): void {
        this.show(message, 'warning', duration);
    }

    /**
     * Core method to show a toast.
     */
    show(message: string, type: ToastType, duration: number = 5000): void {
        // First hide any existing toast to re-trigger the animation if needed
        this.hide();

        // Small timeout to allow the DOM to react to the 'hide' before showing again
        setTimeout(() => {
            this.state.set({
                show: true,
                message,
                type,
                duration
            });
        }, 50);
    }

    /**
     * Core method to hide the toast.
     */
    hide(): void {
        this.state.update(current => ({ ...current, show: false }));
    }
}
