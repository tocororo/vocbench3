import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Deserializer } from "../utils/Deserializer";
import { HttpManager, VBRequestOptions } from "../utils/HttpManager";
import { VBContext } from "../utils/VBContext";
import { AuthorizationEvaluator } from "../utils/AuthorizationEvaluator";
import { User } from "../models/User";

@Injectable()
export class AuthServices {

    private serviceName = "Auth";

    constructor(private httpMgr: HttpManager) { }

    /**
     * Logs in and registers the logged user in the VBContext
     */
    login(email: string, password: string, rememberMe: boolean): Observable<User> {
        console.log("[AuthServices] login");
        var params: any = {
            email: email,
            password: password,
            _spring_security_remember_me: rememberMe
        }
        var options: VBRequestOptions = new VBRequestOptions({ errorAlertOpt: { show: false } });
        return this.httpMgr.doPost(this.serviceName, "login", params, true, options).map(
            stResp => {
                var loggedUser: User = Deserializer.createUser(stResp);
                VBContext.setLoggedUser(loggedUser);
                return loggedUser;
            }
        );

    }

    /**
     * Logs out and removes the logged user from the VBContext
     */
    logout() {
        console.log("[AuthServices] logout");
        return this.httpMgr.doGet(this.serviceName, "logout", null, true).map(
            stResp => {
                VBContext.removeLoggedUser();
                VBContext.removeWorkingProject();
                AuthorizationEvaluator.reset();
                return stResp;
            }
        );
    }

}