import { Injectable, inject } from '@angular/core';
import { ResolvedError } from '../models/interfaces/resolved-error.interface';
import { ToastService } from '../../../shared/components/toast/toast.service';

@Injectable({
    providedIn: 'root'
})
export class ErrorToastPresenter {
    private toastService = inject(ToastService);

    /**
     * Sole responsibility is to present the resolved message visually to the user.
     */
    public present(resolvedError: ResolvedError): void {
        const prefix = resolvedError.code ? `[${resolvedError.code}] ` : '';
        const output = `${prefix}${resolvedError.message}`;

        // Keep console log for debugging
        console.error(`🔴 [ErrorManager]: ${output}`, resolvedError.originalError as any);

        // Trigger the global toast
        this.toastService.showError(resolvedError.message, 5000);
    }
}
