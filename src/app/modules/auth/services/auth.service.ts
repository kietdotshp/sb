import {Injectable, OnDestroy} from '@angular/core';
import {BehaviorSubject, Observable, of, Subscription} from 'rxjs';
import {catchError, finalize, map, switchMap} from 'rxjs/operators';
import {UserModel} from '../models/user.model';
import {AuthModel} from '../models/auth.model';
import {AuthHTTPService} from './auth-http';
import {environment} from 'src/environments/environment';
import {Router} from '@angular/router';
import {LdapAuthen} from "../../../models/ldap-authen.model";
import {HttpClient} from "@angular/common/http";
import {ApiResponse} from "../../../models/api-response";
import {LoginResponse} from "../../../models/login-response";
import {Login} from "../../../models/login.model";
import {ApiRequest} from "../../../models/api-request";
import {AccountInfoModel} from "../../../models/account-info.model";

export type UserType = UserModel | undefined;

@Injectable({
    providedIn: 'root',
})
export class AuthService implements OnDestroy {
    // private fields
    private unsubscribe: Subscription[] = []; // Read more: => https://brianflove.com/2016/12/11/anguar-2-unsubscribe-observables/
    private authLocalStorageToken = `${environment.appVersion}-${environment.USERDATA_KEY}`;

    // public fields
    currentUser$: Observable<UserType>;
    isLoading$: Observable<boolean>;
    currentUserSubject: BehaviorSubject<UserType>;
    isLoadingSubject: BehaviorSubject<boolean>;

    get currentUserValue(): UserType {
        return this.currentUserSubject.value;
    }

    set currentUserValue(user: UserType) {
        this.currentUserSubject.next(user);
    }

    constructor(
        private authHttpService: AuthHTTPService,
        private router: Router,
        private http: HttpClient
    ) {
        this.isLoadingSubject = new BehaviorSubject<boolean>(false);
        this.currentUserSubject = new BehaviorSubject<UserType>(undefined);
        this.currentUser$ = this.currentUserSubject.asObservable();
        this.isLoading$ = this.isLoadingSubject.asObservable();
        const subscr = this.getUserByToken().subscribe();
        this.unsubscribe.push(subscr);
    }

    // public methods
    login(email: string, password: string): Observable<UserType> {
        this.isLoadingSubject.next(true);
        return this.authHttpService.login(email, password).pipe(
            map((auth: AuthModel) => {
                const result = this.setAuthFromLocalStorage(auth);
                return result;
            }),
            switchMap(() => this.getUserByToken()),
            catchError((err) => {
                console.error('err', err);
                return of(undefined);
            }),
            finalize(() => this.isLoadingSubject.next(false))
        );
    }

    login1(email: string, password: string): Observable<UserType> {
        let login = new Login(email, password, false);
        let auth = LdapAuthen.defConstructor(login)
        let url = environment.GATEWAY_URL + 'services/msuaa/api/authenticate/ldapAuthen';
        return this.http.post<ApiResponse<LoginResponse>>(url, auth)
            .pipe(
                map(response => {
                    if (response == null || response.body == null || response.body.status !== 'OK') {
                        return undefined;
                    }
                    let authModel = new AuthModel();
                    authModel.authToken = response.body.data.id_token;
                    this.setAuthFromLocalStorage(authModel);
                }),
                switchMap(() => this.getUserByToken()),
                catchError((err) => {
                    console.error('err', err);
                    return of(undefined);
                }),
                finalize(() => this.isLoadingSubject.next(false))
            );
    }

    logout() {
        localStorage.removeItem(this.authLocalStorageToken);
        this.router.navigate(['/auth/login'], {
            queryParams: {},
        });
    }

    getUserByToken(): Observable<UserType> {
        const auth = this.getAuthFromLocalStorage();
        if (!auth || !auth.authToken) {
            return of(undefined);
        }

        this.isLoadingSubject.next(true);
        // return this.authHttpService.getUserByToken(auth.authToken).pipe(
        //     map((user: UserType) => {
        //         if (user) {
        //             this.currentUserSubject.next(user);
        //         } else {
        //             this.logout();
        //         }
        //         return user;
        //     }),
        //     finalize(() => this.isLoadingSubject.next(false))
        // );

        let apiRequest = new ApiRequest();
        return this.http
            .post<ApiResponse<AccountInfoModel>>(environment.GATEWAY_URL + 'services/msuaa/api/user-info/ldap-account-info', apiRequest)
            .pipe(
                map((res) => {
                    if(res == null || res.body.status !== 'OK'){
                        this.logout();
                    }
                    let user = new UserModel();

                    this.currentUserSubject.next(user);
                    return user;
                }),
                finalize(() => this.isLoadingSubject.next(false))
            );
    }

    // need create new user then login
    registration(user: UserModel): Observable<any> {
        this.isLoadingSubject.next(true);
        return this.authHttpService.createUser(user).pipe(
            map(() => {
                this.isLoadingSubject.next(false);
            }),
            switchMap(() => this.login(user.email, user.password)),
            catchError((err) => {
                console.error('err', err);
                return of(undefined);
            }),
            finalize(() => this.isLoadingSubject.next(false))
        );
    }

    forgotPassword(email: string): Observable<boolean> {
        this.isLoadingSubject.next(true);
        return this.authHttpService
            .forgotPassword(email)
            .pipe(finalize(() => this.isLoadingSubject.next(false)));
    }

    // private methods
    private setAuthFromLocalStorage(auth: AuthModel): boolean {
        // store auth authToken/refreshToken/epiresIn in local storage to keep user logged in between page refreshes
        if (auth && auth.authToken) {
            localStorage.setItem(this.authLocalStorageToken, JSON.stringify(auth));
            return true;
        }
        return false;
    }

    private getAuthFromLocalStorage(): AuthModel | undefined {
        try {
            const lsValue = localStorage.getItem(this.authLocalStorageToken);
            if (!lsValue) {
                return undefined;
            }

            const authData = JSON.parse(lsValue);
            return authData;
        } catch (error) {
            console.error(error);
            return undefined;
        }
    }

    ngOnDestroy() {
        this.unsubscribe.forEach((sb) => sb.unsubscribe());
    }
}
