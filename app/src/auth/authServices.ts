import {Injectable} from '@angular/core';
import {Observable} from 'rxjs/Observable';
import {Cookie} from "../utils/Cookie";

@Injectable()
export class AuthServices {

    constructor() { }

    login(email: string, password: string, rememberMe: boolean) {
        console.log("Loggin in with email: " + email + " and password " + password + " and rememberMe " + rememberMe);
        return new Observable(observer => {
            Cookie.setCookie(Cookie.USER_AUTH_TOKEN, "simpleFakeTokenJustForTest");
            observer.next();
            observer.complete();
        });
    }

    logout() {
        return new Observable(observer => {
            Cookie.deleteCookie(Cookie.USER_AUTH_TOKEN);
            observer.next();
            observer.complete();
        });
    }

    isLoggedIn(): boolean {
        return Cookie.getCookie(Cookie.USER_AUTH_TOKEN) != null;
    }

}