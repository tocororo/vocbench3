import {Injectable} from '@angular/core';
import {Observable} from 'rxjs/Observable';
import {HttpManager} from "../utils/HttpManager";
import {User} from "../utils/User";

@Injectable()
export class UserServices {

    private serviceName = "Users";
    private oldTypeService = false;

    constructor(private httpMgr: HttpManager) {}

    /**
     * Returns the user corrently logged. Returns null if no user is logged
     */
    getUser(): Observable<User> {
        console.log("[UserServices] getUser");
        return this.httpMgr.doGet(this.serviceName, "getUser", null, this.oldTypeService, true, true).map(
            stResp => {
                if (stResp.user) {
                    return new User(stResp.user.email, stResp.user.firstName, stResp.user.lastName, stResp.user.roles);
                } else {
                    return null;
                }
            }
        );
    }

    registerUser(email: string, password: string, firstName: string, lastName: string) {
        console.log("[UserServices] registerUser");
        var params: any = {
            email: email,
            password: password,
            firstName: firstName,
            lastName: lastName
        }
        return this.httpMgr.doPost(this.serviceName, "registerUser", params, this.oldTypeService, true);
    }

    testRequiredAdmin() {
        return this.httpMgr.doGet(this.serviceName, "testRequiredAdmin", null, this.oldTypeService, true);
    }

}