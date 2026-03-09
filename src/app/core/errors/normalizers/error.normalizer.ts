import { HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { isIFlowErrorResponse } from '../guards/is-iflow-error.guard';
import { NormalizedError } from '../models/interfaces/normalized-error.interface';
import { ErrorContextType } from '../models/types/error-context.type';
import { FALLBACK_MESSAGES } from '../models/constants/error-messages.constants';

@Injectable({
    providedIn: 'root'
})
export class ErrorNormalizer {

    /**
     * Transforms any unknown error into a predictable NormalizedError format.
     */
    public normalize(error: unknown, context?: ErrorContextType): NormalizedError {

        // 1. Check if it's an Angular HttpErrorResponse
        if (error instanceof HttpErrorResponse) {

            // 1a. Network Error (No response from server)
            if (error.status === 0) {
                return {
                    platform: 'network',
                    code: null,
                    message: FALLBACK_MESSAGES['NETWORK_ERROR'],
                    status: 0,
                    originalError: error,
                    context
                };
            }

            // 1b. Backend responded with our IFlowError contract
            if (isIFlowErrorResponse(error.error)) {
                return {
                    platform: 'iflow',
                    code: error.error.error.code,
                    message: error.error.error.message, // Backend provided message
                    status: error.error.error.status,
                    originalError: error,
                    context
                };
            }

            // 1c. Unknown HTTP Error (e.g., 500 from proxy, 404 from missing route)
            return {
                platform: 'http_unknown',
                code: null,
                message: error.message || FALLBACK_MESSAGES['HTTP_ERROR'],
                status: error.status,
                originalError: error,
                context
            };
        }

        // 2. Check if it's a manual Javascript Error
        if (error instanceof Error) {
            return {
                platform: 'local',
                code: null,
                message: error.message,
                status: null,
                originalError: error,
                context
            };
        }

        // 3. Completely unknown error (e.g., throw "string" or throw null)
        return {
            platform: 'unknown',
            code: null,
            message: FALLBACK_MESSAGES['UNKNOWN_ERROR'],
            status: null,
            originalError: error,
            context
        };
    }
}
