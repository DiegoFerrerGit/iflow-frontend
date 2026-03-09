import { HttpContext, HttpContextToken } from '@angular/common/http';


// CONTEXT INTERCEPTOR TYPES

export const NO_INTERCEPTORS = new HttpContextToken<boolean>(() => false);
export const HIDE_SPINNER = new HttpContextToken<boolean>(() => false);

// CONTEXT INTERCEPTOR OPTIONS

export const SKIP_INTERCEPTORS_OPTIONS: { context: HttpContext } = {
    context: new HttpContext().set(NO_INTERCEPTORS, true)
};

export const WITH_CREDENTIALS_AND_SKIP_INTERCEPTORS: { withCredentials: true, context: HttpContext } = {
    withCredentials: true,
    context: new HttpContext().set(NO_INTERCEPTORS, true)
};

export const HIDE_SPINNER_OPTIONS: { context: HttpContext } = {
    context: new HttpContext().set(HIDE_SPINNER, true)
};
