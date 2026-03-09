import { Injectable } from '@angular/core';
import { NormalizedError } from '../models/interfaces/normalized-error.interface';
import { ResolvedError } from '../models/interfaces/resolved-error.interface';
import { CONTEXTUAL_MESSAGES, PRODUCT_MESSAGES, FALLBACK_MESSAGES } from '../models/constants/error-messages.constants';

@Injectable({
    providedIn: 'root'
})
export class ErrorMessageResolver {

    /**
     * Computes the final user-facing message based on context, code, and backend message.
     * Priority:
     * 1. Contextual Message (Context + Code)
     * 2. IFlow Backend Message (if platform is iflow)
     * 3. Fallback Message (by Code)
     * 4. Normalized default message
     */
    public resolve(normalized: NormalizedError): ResolvedError {
        let finalMessage = normalized.message;

        if (normalized.code) {
            // 1. Try to find a highly specific contextual message
            if (normalized.context) {
                const contextualKey = `${normalized.context}::${normalized.code}`;
                if (CONTEXTUAL_MESSAGES[contextualKey]) {
                    finalMessage = CONTEXTUAL_MESSAGES[contextualKey];
                    return this.buildResult(normalized, finalMessage);
                }
            }

            // 1b. Try to find a general product message for this code before trusting the backend
            if (PRODUCT_MESSAGES[normalized.code]) {
                finalMessage = PRODUCT_MESSAGES[normalized.code];
                return this.buildResult(normalized, finalMessage);
            }

            // 2. If it's an IFlow error, we respect the backend message next (already in normalized.message)
            if (normalized.platform === 'iflow') {
                return this.buildResult(normalized, finalMessage);
            }

            // 3. Try to find a general fallback message for this code
            if (FALLBACK_MESSAGES[normalized.code]) {
                finalMessage = FALLBACK_MESSAGES[normalized.code];
                return this.buildResult(normalized, finalMessage);
            }
        }

        // 4. Return whatever default message the normalizer deduced
        return this.buildResult(normalized, finalMessage);
    }

    private buildResult(normalized: NormalizedError, message: string): ResolvedError {
        return {
            platform: normalized.platform,
            code: normalized.code,
            message: message,
            originalError: normalized.originalError
        };
    }
}
