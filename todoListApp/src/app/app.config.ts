import {
  HTTP_INTERCEPTORS,
  provideHttpClient,
  withInterceptorsFromDi
} from '@angular/common/http';
import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { AuthInterceptor } from './interceptor/auth-interceptor';


export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),

    // enables DI-based (class) interceptors
    provideHttpClient(withInterceptorsFromDi()),

    // register your interceptor
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true }
  ]
};
