import { HttpContext, HttpContextToken } from '@angular/common/http';

export const NO_INTERCEPTORS = new HttpContextToken<boolean>(() => false);

export const WITH_CREDENTIALS = {
    withCredentials: true
};

export const SKIP_INTERCEPTORS_OPTIONS = {
    context: new HttpContext().set(NO_INTERCEPTORS, true)
};

export const CREDENTIALS_AND_SKIP_INTERCEPTORS = {
    withCredentials: true,
    context: new HttpContext().set(NO_INTERCEPTORS, true)
};
