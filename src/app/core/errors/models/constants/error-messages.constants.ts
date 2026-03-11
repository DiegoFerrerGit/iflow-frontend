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
    // Auth & Access
    [ERROR_CODES.INVALID_RESOURCE_ID]: 'El identificador solicitado no es válido.',
    [ERROR_CODES.VALIDATION_ERROR]: 'Los datos ingresados no son válidos. Por favor revisa la información e intenta nuevamente.',
    [ERROR_CODES.EMAIL_NOT_ALLOWED]: 'Usuario no registrado.',
    [ERROR_CODES.INVALID_SIGNUP_SECRET]: 'El código de invitación no es válido o ya ha sido utilizado.',
    [ERROR_CODES.USER_NOT_FOUND]: 'No encontramos ninguna cuenta asociada a estos datos.',
    [ERROR_CODES.INVALID_GOOGLE_TOKEN]: 'Hubo un problema al validar tu cuenta de Google. Intenta ingresar de nuevo.',

    // Common & System
    [ERROR_CODES.FORBIDDEN]: 'No tienes permisos para realizar esta acción.',
    [ERROR_CODES.RESOURCE_NOT_FOUND]: 'Lo sentimos, no pudimos encontrar lo que buscabas.',
    [ERROR_CODES.BUSINESS_RULE_VIOLATION]: 'Esta acción no puede realizarse según las reglas del sistema.',
    [ERROR_CODES.EXTERNAL_SERVICE_ERROR]: 'Estamos teniendo problemas con un servicio externo. Intenta nuevamente en unos momentos.',
    [ERROR_CODES.ALLOWLIST_DISABLED]: 'El acceso restringido está desactivado actualmente.',

    // Odin Specific
    [ERROR_CODES.INCOME_SOURCE_NOT_FOUND]: 'La fuente de ingreso solicitada no existe.',
    [ERROR_CODES.ALLOCATION_BOX_NOT_FOUND]: 'La caja de asignación no fue encontrada.',
    [ERROR_CODES.SUBCATEGORY_NOT_FOUND]: 'La subcategoría seleccionada no está disponible.',
    [ERROR_CODES.ITEM_NOT_FOUND]: 'El ítem solicitado no existe.',
    [ERROR_CODES.PERCENTAGE_EXCEEDS_LIMIT]: 'El porcentaje total asignado no puede superar el 100%.'
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
