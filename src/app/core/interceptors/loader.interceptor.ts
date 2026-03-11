import { HttpInterceptorFn, HttpResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { finalize, tap, filter, delay } from 'rxjs';
import { LoaderManager } from '../loader-manager/loader.manager';
import { HIDE_SPINNER, NO_INTERCEPTORS } from './models/constants/interceptors.constants';

let pendingRequests = 0;

export const loaderInterceptor: HttpInterceptorFn = (req, next) => {
    // Skip loader if HIDE_SPINNER or NO_INTERCEPTORS context flag is set
    if (req.context.get(HIDE_SPINNER) === true || req.context.get(NO_INTERCEPTORS) === true) {
        return next(req);
    }


    const loaderService = inject(LoaderManager);
    pendingRequests++;

    // We call show synchronously to ensure it fires
    loaderService.show();

    return next(req).pipe(
        finalize(() => {
            pendingRequests--;
            if (pendingRequests <= 0) {
                pendingRequests = 0;
                loaderService.hide();
            }
        })
    );
};
