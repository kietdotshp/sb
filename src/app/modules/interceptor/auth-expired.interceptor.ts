import {Injectable} from '@angular/core';
import {HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest} from '@angular/common/http';
import {Observable} from 'rxjs';
import {tap} from 'rxjs/operators';

@Injectable()
export class AuthExpiredInterceptor implements HttpInterceptor {
    constructor(
        // private loginService: LoginService
    ) {
    }

    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        return next.handle(request).pipe(
            tap(null, (err: HttpErrorResponse) => {
                if (err.status === 401 && err.url && !err.url.includes('api/account-info')) {
                    // this.loginService.logout();
                }
            })
        );
    }
}
