import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter, withInMemoryScrolling } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideStore, provideState } from '@ngrx/store';
import { provideEffects } from '@ngrx/effects';
import { provideStoreDevtools } from '@ngrx/store-devtools';
import { isDevMode } from '@angular/core';
import { provideServiceWorker } from '@angular/service-worker';

import { routes } from './app.routes';
import { appReducers, metaReducers } from './core/state/global.state';
import { AuthenticationEffects } from './modules/authentication/state/authentication.effects';
import { authInterceptor } from './modules/authentication/interceptors/authentication.interceptor';
import { loaderInterceptor } from './core/interceptors/loader.interceptor';
import { cacheInterceptor } from './core/cache/interceptors/cache.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes, withInMemoryScrolling({ scrollPositionRestoration: 'enabled' })),
    provideHttpClient(withInterceptors([loaderInterceptor, cacheInterceptor, authInterceptor])),
    provideStore(appReducers, { metaReducers }),
    provideEffects([AuthenticationEffects]),
    provideStoreDevtools({
      maxAge: 25,
      logOnly: !isDevMode(),
      autoPause: true,
      trace: false,
      traceLimit: 75,
    }),
    provideServiceWorker('ngsw-worker.js', {
      enabled: !isDevMode(),
      registrationStrategy: 'registerWhenStable:30000'
    }),
  ]
};
