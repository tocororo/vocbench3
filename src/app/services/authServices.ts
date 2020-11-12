import { Injectable } from '@angular/core';
import { Router } from "@angular/router";
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { User } from "../models/User";
import { AuthorizationEvaluator } from "../utils/AuthorizationEvaluator";
import { Deserializer } from "../utils/Deserializer";
import { HttpManager, VBRequestOptions } from "../utils/HttpManager";
import { UIUtils } from '../utils/UIUtils';
import { VBContext } from "../utils/VBContext";

@Injectable()
export class AuthServices {

    private serviceName = "Auth";

    constructor(private httpMgr: HttpManager, private router: Router) { }

    /**
     * Logs in and registers the logged user in the VBContext
     */
    login(email: string, password: string, rememberMe?: boolean): Observable<User> {
        var params: any = {
            email: email,
            password: password,
            _spring_security_remember_me: rememberMe
        }
        var options: VBRequestOptions = new VBRequestOptions({ errorAlertOpt: { show: false } });
        return this.httpMgr.doPost(this.serviceName, "login", params, options).pipe(
            map(stResp => {
                var loggedUser: User = Deserializer.createUser(stResp);
                VBContext.setLoggedUser(loggedUser);
                return loggedUser;
            })
        );

    }

    /**
     * Logs out and removes the logged user from the VBContext
     */
    logout() {
        var params: any = {}
        return this.httpMgr.doGet(this.serviceName, "logout", params).pipe(
            map(stResp => {
                this.router.navigate(["/Home"]);
                VBContext.removeLoggedUser();
                VBContext.removeWorkingProject();
                UIUtils.resetNavbarTheme(); //when quitting current project, reset the style to the default
                AuthorizationEvaluator.reset();
                return stResp;
            })
        );
    }

}