// Angular
import {Injectable} from '@angular/core';
import {HttpEvent, HttpHandler, HttpInterceptor, HttpRequest} from '@angular/common/http';
// RxJS
import {Observable} from 'rxjs';
import {environment} from "../../../environments/environment";
import {AuthModel} from "../auth/models/auth.model";

/**
 *
 * HttpInterceptor for Authorization and Language
 *
 */
@Injectable()
export class AuthInterceptor implements HttpInterceptor {
    // intercept request and add token
    private authLocalStorageToken = `${environment.appVersion}-${environment.USERDATA_KEY}`;
    intercept(
        request: HttpRequest<any>,
        next: HttpHandler
    ): Observable<HttpEvent<any>> {
        const lang = localStorage.getItem('language');
        const authStr = localStorage.getItem(this.authLocalStorageToken);
        let token = '';
        if (authStr != null && authStr !== '') {
            let auth = JSON.parse(authStr) as AuthModel;
            token = 'Bearer ' + auth.authToken;
        }

        request = request.clone({
            setHeaders: {
                Authorization: token,
                'Language': lang == null ? 'vn': lang
            }
        });
        return next.handle(request);
    }
}
