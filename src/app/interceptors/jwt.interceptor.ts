import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable()
export class JwtInterceptor implements HttpInterceptor {
    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        // Obtenir le token du local storage
        const token = localStorage.getItem('saty_auth_token');
        const isApiUrl = request.url.startsWith(environment.apiUrl);

        console.log(`[JwtInterceptor] Request to ${request.url}`);
        console.log(`[JwtInterceptor] Token found: ${!!token}, isApiUrl: ${isApiUrl}`);

        if (token && isApiUrl) {
            console.log(`[JwtInterceptor] Attaching token to request`);
            request = request.clone({
                setHeaders: {
                    Authorization: `Bearer ${token}`
                }
            });
        }

        return next.handle(request);
    }
}
