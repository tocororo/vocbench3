import {Injectable} from '@angular/core';
import {Observable} from 'rxjs/Observable';
import {Deserializer} from "../utils/Deserializer";
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
                return Deserializer.createUser(stResp);
            }
        );
    }

    registerUser(email: string, password: string, firstName: string, lastName: string,
        birthday: Date, gender: string, country: string, address: string, affiliation: string, url: string, phone: string) {
        console.log("[UserServices] registerUser");
        var params: any = {
            email: email,
            password: password,
            firstName: firstName,
            lastName: lastName
        }
        if (birthday != undefined) {
            params.birthday = birthday;
        }
        if (gender != undefined) {
            params.gender = gender;
        }
        if (country != undefined) {
            params.country = country;
        }
        if (address != undefined) {
            params.address = address;
        }
        if (affiliation != undefined) {
            params.affiliation = affiliation;
        }
        if (url != undefined) {
            params.url = url;
        }
        if (phone != undefined) {
            params.phone = phone;
        }
        return this.httpMgr.doPost(this.serviceName, "registerUser", params, this.oldTypeService, true);
    }

    testRequiredAdmin() {
        return this.httpMgr.doGet(this.serviceName, "testRequiredAdmin", null, this.oldTypeService, true);
    }

}