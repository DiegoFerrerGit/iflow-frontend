import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpResponse } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, finalize } from 'rxjs';
import { LoaderService } from '../loader-manager/loader.service';
import { HIDE_SPINNER, NO_INTERCEPTORS } from '../interceptors/models/constants/interceptors.constants';

@Injectable()
export class LoaderInterceptor implements HttpInterceptor {
    private readonly loaderService: LoaderService = inject(LoaderService);
    private pendingRequests = 0;

    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        // Skip loader if HIDE_SPINNER or NO_INTERCEPTORS context flag is set
        if (req.context.get(HIDE_SPINNER) === true || req.context.get(NO_INTERCEPTORS) === true) {
            return next.handle(req);
        }

        this.pendingRequests++;
        this.show();

        return next.handle(req).pipe(
            finalize(() => {
                this.pendingRequests--;
                if (this.pendingRequests <= 0) {
                    this.pendingRequests = 0;
                    this.hide();
                }
            })
        );
    }

    private show() {
        this.loaderService.show();
    }

    private hide() {
        this.loaderService.hide();
    }
}
