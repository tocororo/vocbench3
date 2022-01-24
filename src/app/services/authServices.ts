import { Injectable } from '@angular/core';
import { Router } from "@angular/router";
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { User } from "../models/User";
import { AuthorizationEvaluator } from "../utils/AuthorizationEvaluator";
import { Deserializer } from "../utils/Deserializer";
import { HttpManager, STRequestParams, VBRequestOptions } from "../utils/HttpManager";
import { VBContext } from "../utils/VBContext";
import { VBEventHandler } from '../utils/VBEventHandler';

@Injectable()
export class AuthServices {

    private serviceName = "Auth";

    constructor(private httpMgr: HttpManager, private eventHandler: VBEventHandler, private router: Router) { }

    /**
     * Logs in and registers the logged user in the VBContext
     */
    login(email: string, password: string, rememberMe?: boolean): Observable<User> {
        let params: STRequestParams = {
            email: email,
            password: password,
            _spring_security_remember_me: rememberMe
        }
        return this.httpMgr.doPost(this.serviceName, "login", params).pipe(
            map(stResp => {
                let loggedUser: User = Deserializer.createUser(stResp);
                VBContext.setLoggedUser(loggedUser);
                return loggedUser;
            })
        );

    }

    /**
     * Logs out and removes the logged user from the VBContext
     */
    logout() {
        let params: STRequestParams = {}
        return this.httpMgr.doGet(this.serviceName, "logout", params).pipe(
            map(stResp => {
                this.router.navigate(["/Home"]);
                VBContext.removeLoggedUser();
                VBContext.removeWorkingProject();
                this.eventHandler.themeChangedEvent.emit(); //when quitting current project, reset the style to the default
                AuthorizationEvaluator.reset();
                return stResp;
            })
        );
    }

}