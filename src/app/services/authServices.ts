import {Injectable} from '@angular/core';
import {Observable} from 'rxjs/Observable';
import {HttpManager} from "../utils/HttpManager";
import {VocbenchCtx} from "../utils/VocbenchCtx";
import {User} from "../utils/User";

@Injectable()
export class AuthServices {

    private serviceName = "Auth";
    private oldTypeService = false;

    constructor(private httpMgr: HttpManager, private vbCtx: VocbenchCtx) {}

    /**
     * Logs in and registers the logged user in the VocbenchCtx
     */
    login(email: string, password: string, rememberMe: boolean): Observable<User> {
        console.log("[AuthServices] login");
        var params: any = {
            email: email,
            password: password,
            _spring_security_remember_me: rememberMe
        }
        return this.httpMgr.doPost(this.serviceName, "login", params, this.oldTypeService, true, true).map(
            stResp => {
                var loggedUser: User = new User(
                    stResp.user.email, stResp.user.firstName, stResp.user.lastName, stResp.user.roles);
                this.vbCtx.setLoggedUser(loggedUser); 
                return loggedUser;
            }
        );
        
    }

    /**
     * Logs out and removes the logged user from the VocbenchCtx
     */
    logout() {
        console.log("[AuthServices] logout");
        return this.httpMgr.doGet(this.serviceName, "logout", null, this.oldTypeService, true).map(
            stResp => {
                this.vbCtx.removeLoggedUser();
                return stResp;
            }
        );
    }

}