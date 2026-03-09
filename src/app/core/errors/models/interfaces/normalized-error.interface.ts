import { ErrorContextType } from '../types/error-context.type';
import { ErrorPlatformType } from '../types/error-platform.type';

export interface NormalizedError {
    platform: ErrorPlatformType;
    code: string | null;
    message: string;
    status: number | null;
    originalError: unknown;
    context?: ErrorContextType;
}
