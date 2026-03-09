import { ErrorPlatformType } from '../types/error-platform.type';

export interface ResolvedError {
    platform: ErrorPlatformType;
    message: string;
    originalError: unknown;
    code?: string | null;
}
