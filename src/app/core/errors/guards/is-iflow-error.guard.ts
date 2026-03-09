import { IFlowErrorResponse, IFlowError } from '../models/interfaces/iflow-error.interface';

/**
 * Type guard to check if an unknown error payload matches the IFlowErrorResponse contract.
 */
export function isIFlowErrorResponse(error: unknown): error is IFlowErrorResponse {
    if (!error || typeof error !== 'object') {
        return false;
    }

    const potentialResponse = error as Record<string, unknown>;
    const potentialError = potentialResponse['error'] as Record<string, unknown>;

    if (!potentialError || typeof potentialError !== 'object') {
        return false;
    }

    // Check required properties of IFlowError
    const hasCode = typeof potentialError['code'] === 'string';
    const hasMessage = typeof potentialError['message'] === 'string';
    const hasCategory = typeof potentialError['category'] === 'string';
    const hasStatus = typeof potentialError['status'] === 'number';

    return hasCode && hasMessage && hasCategory && hasStatus;
}
