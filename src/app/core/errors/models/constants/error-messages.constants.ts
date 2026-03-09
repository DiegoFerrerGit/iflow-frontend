import { ERROR_CODES } from './error-codes.constants';
import { ERROR_CONTEXTS } from './error-contexts.constants';

/**
 * Fallback messages used when there is no specific context-based message.
 */
export const FALLBACK_MESSAGES: Record<string, string> = {
    [ERROR_CODES.INVALID_CREDENTIALS]: 'Credenciales incorrectas. Verifica tu email y contraseña.',
    [ERROR_CODES.INVALID_ACCESS_TOKEN]: 'Tu sesión ha expirado o es inválida. Por favor, vuelve a iniciar sesión.',
    [ERROR_CODES.INVALID_SESSION]: 'Sesión inválida. Por favor, vuelve a iniciar sesión.',
    [ERROR_CODES.FORBIDDEN]: 'No tienes permisos para realizar esta acción.',
    [ERROR_CODES.RESOURCE_NOT_FOUND]: 'El recurso solicitado no existe.',
    [ERROR_CODES.INFRASTRUCTURE_ERROR]: 'Ocurrió un error en la infraestructura. Intenta nuevamente.',
    [ERROR_CODES.HTTP_ERROR]: 'Ocurrió un error de conexión con nuestros servicios.',
    [ERROR_CODES.UNEXPECTED_ERROR]: 'Ocurrió un error inesperado. Intenta más tarde.',

    NETWORK_ERROR: 'No hay conexión a internet o el servidor no responde.',
    UNKNOWN_ERROR: 'Ha ocurrido un error inesperado al procesar tu solicitud.'
};

/**
 * Product-level messages defined for specific error codes, regardless of context.
 * These are prioritized over raw backend technical messages.
 */
export const PRODUCT_MESSAGES: Record<string, string> = {
    [ERROR_CODES.INVALID_RESOURCE_ID]: 'El identificador solicitado no es válido.',
    [ERROR_CODES.VALIDATION_ERROR]: 'Los datos ingresados no son válidos. Por favor revisa la información e intenta nuevamente.'
};

/**
 * Contextual messages that override fallbacks based on the action being performed.
 * Key format: `${CONTEXT}::${ERROR_CODE}`
 */
export const CONTEXTUAL_MESSAGES: Record<string, string> = {
    [`${ERROR_CONTEXTS.AUTH_LOGIN}::${ERROR_CODES.INVALID_CREDENTIALS}`]: 'El usuario o la contraseña ingresados no son correctos.',
    [`${ERROR_CONTEXTS.ODIN_CREATE_ITEM}::${ERROR_CODES.PERCENTAGE_EXCEEDS_LIMIT}`]: 'No tienes suficiente dinero/porcentaje disponible en la categoría para este ítem.',
    [`${ERROR_CONTEXTS.ODIN_CREATE_BOX}::${ERROR_CODES.VALIDATION_ERROR}`]: 'Los datos de la caja no son válidos. Verifica montos y nombres.',
    [`${ERROR_CONTEXTS.ODIN_DELETE_ITEM}::${ERROR_CODES.ITEM_NOT_FOUND}`]: 'El ítem que intentas eliminar ya no existe.'
};
