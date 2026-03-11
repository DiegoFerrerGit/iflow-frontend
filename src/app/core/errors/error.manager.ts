import { Injectable, inject } from '@angular/core';
import { ErrorContextType } from './models/types/error-context.type';
import { ErrorNormalizer } from './normalizers/error.normalizer';
import { ErrorMessageResolver } from './resolvers/error-message.resolver';
import { ErrorToastPresenter } from './presenters/error-toast.presenter';

@Injectable({
    providedIn: 'root'
})
export class ErrorsManager {
    private normalizer = inject(ErrorNormalizer);
    private resolver = inject(ErrorMessageResolver);
    private presenter = inject(ErrorToastPresenter);

    /**
     * Single public entry point for handling all errors in the application.
     * 
     * @param error The raw error caught (HttpErrorResponse, Error, string, etc.)
     * @param context Optional context indicating where the error occurred
     */
    public handle(error: unknown, context?: ErrorContextType): void {
        try {
            // 1. Normalize the unknown payload into a predictable structure
            const normalizedError = this.normalizer.normalize(error, context);

            // 2. Resolve the final message based on code, context, and backend response
            const resolvedError = this.resolver.resolve(normalizedError);

            // 3. Present the result visually purely via UI components
            this.presenter.present(resolvedError);

        } catch (managerError) {
            // Failsafe in case the ErrorManager itself crashes
        }
    }
}
