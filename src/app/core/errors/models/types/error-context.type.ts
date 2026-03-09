import { ERROR_CONTEXTS } from '../constants/error-contexts.constants';

export type ErrorContextType = typeof ERROR_CONTEXTS[keyof typeof ERROR_CONTEXTS];
