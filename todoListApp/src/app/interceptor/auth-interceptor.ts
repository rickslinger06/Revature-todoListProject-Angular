import {
    HttpErrorResponse,
    HttpEvent,
    HttpHandler,
    HttpInterceptor,
    HttpRequest
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';
import { AuthService } from '../auth/auth.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
    constructor(private auth: AuthService) { }

    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        const token = this.auth.getToken();

        // Always include credentials so refresh cookie is sent
        let authReq = req.clone({ withCredentials: true });

        // Add Authorization header if token exists
        if (token) {
            authReq = authReq.clone({
                setHeaders: { Authorization: `Bearer ${token}` }
            });
        }

        return next.handle(authReq).pipe(
            catchError((err: unknown) => {
                if (!(err instanceof HttpErrorResponse)) {
                    return throwError(() => err);
                }

                // if unauthorized/forbidden, try refresh once (but not for auth endpoints)
                const isAuthEndpoint =
                    req.url.includes('/api/auth/authenticate') ||
                    req.url.includes('/api/auth/refresh') ||
                    req.url.includes('/api/auth/logout');

                if ((err.status === 401 || err.status === 403) && !isAuthEndpoint) {
                    return this.auth.refresh().pipe(
                        switchMap(() => {
                            const newToken = this.auth.getToken();

                            // retry original request with new token
                            let retryReq = req.clone({ withCredentials: true });

                            if (newToken) {
                                retryReq = retryReq.clone({
                                    setHeaders: { Authorization: `Bearer ${newToken}` }
                                });
                            }

                            return next.handle(retryReq);
                        }),
                        catchError((refreshErr) => {
                            // refresh failed: clear token and bubble error
                            this.auth.clearToken();
                            return throwError(() => refreshErr);
                        })
                    );
                }

                return throwError(() => err);
            })
        );
    }
}
