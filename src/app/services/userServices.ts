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

    /**
     * Register a new user
     * @param email
     * @param password
     * @param firstName
     * @param lastName
     * @param birthday
     * @param gender
     * @param country
     * @param address
     * @param affiliation
     * @param url
     * @param phone
     */
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

    /**
     * Updates firstName of the given user. Returns the updated user.
     * @param email email of the user to update
     * @param firstName
     */
    updateUserFirstName(email: string, firstName: string): Observable<User> {
        console.log("[UserServices] updateUserFirstName");
        var params: any = {
            email: email,
            firstName: firstName,
        }
        return this.httpMgr.doGet(this.serviceName, "updateUserFirstName", params, this.oldTypeService, true).map(
            stResp => {
                return Deserializer.createUser(stResp);
            }
        );
    }

    /**
     * Updates lastName of the given user. Returns the updated user.
     * @param email email of the user to update
     * @param lastName
     */
    updateUserLastName(email: string, lastName: string): Observable<User> {
        console.log("[UserServices] updateUserLastName");
        var params: any = {
            email: email,
            lastName: lastName,
        }
        return this.httpMgr.doGet(this.serviceName, "updateUserLastName", params, this.oldTypeService, true).map(
            stResp => {
                return Deserializer.createUser(stResp);
            }
        );
    }

    /**
     * Updates phone of the given user. Returns the updated user.
     * @param email email of the user to update
     * @param phone
     */
    updateUserPhone(email: string, phone: string): Observable<User> {
        console.log("[UserServices] updateUserPhone");
        var params: any = {
            email: email,
            phone: phone,
        }
        return this.httpMgr.doGet(this.serviceName, "updateUserPhone", params, this.oldTypeService, true).map(
            stResp => {
                return Deserializer.createUser(stResp);
            }
        );
    }

    /**
     * Updates birthday of the given user. Returns the updated user.
     * @param email email of the user to update
     * @param birthday
     */
    updateUserBirthday(email: string, birthday: Date): Observable<User> {
        console.log("[UserServices] updateUserBirthday");
        var params: any = {
            email: email,
            birthday: birthday,
        }
        return this.httpMgr.doGet(this.serviceName, "updateUserBirthday", params, this.oldTypeService, true).map(
            stResp => {
                return Deserializer.createUser(stResp);
            }
        );
    }

    /**
     * Updates gender of the given user. Returns the updated user.
     * @param email email of the user to update
     * @param gender
     */
    updateUserGender(email: string, gender: string): Observable<User> {
        console.log("[UserServices] updateUserGender");
        var params: any = {
            email: email,
            gender: gender,
        }
        return this.httpMgr.doGet(this.serviceName, "updateUserGender", params, this.oldTypeService, true).map(
            stResp => {
                return Deserializer.createUser(stResp);
            }
        );
    }

    /**
     * Updates country of the given user. Returns the updated user.
     * @param email email of the user to update
     * @param country
     */
    updateUserCountry(email: string, country: string): Observable<User> {
        console.log("[UserServices] updateUserCountry");
        var params: any = {
            email: email,
            country: country,
        }
        return this.httpMgr.doGet(this.serviceName, "updateUserCountry", params, this.oldTypeService, true).map(
            stResp => {
                return Deserializer.createUser(stResp);
            }
        );
    }

    /**
     * Updates address of the given user. Returns the updated user.
     * @param email email of the user to update
     * @param address
     */
    updateUserAddress(email: string, address: string): Observable<User> {
        console.log("[UserServices] updateUserAddress");
        var params: any = {
            email: email,
            address: address,
        }
        return this.httpMgr.doGet(this.serviceName, "updateUserAddress", params, this.oldTypeService, true).map(
            stResp => {
                return Deserializer.createUser(stResp);
            }
        );
    }

    /**
     * Updates affiliation of the given user. Returns the updated user.
     * @param email email of the user to update
     * @param affiliation
     */
    updateUserAffiliation(email: string, affiliation: string): Observable<User> {
        console.log("[UserServices] updateUserAffiliation");
        var params: any = {
            email: email,
            affiliation: affiliation,
        }
        return this.httpMgr.doGet(this.serviceName, "updateUserAffiliation", params, this.oldTypeService, true).map(
            stResp => {
                return Deserializer.createUser(stResp);
            }
        );
    }

    /**
     * Updates url of the given user. Returns the updated user.
     * @param email email of the user to update
     * @param url
     */
    updateUserUrl(email: string, url: string): Observable<User> {
        console.log("[UserServices] updateUserUrl");
        var params: any = {
            email: email,
            url: url,
        }
        return this.httpMgr.doGet(this.serviceName, "updateUserUrl", params, this.oldTypeService, true).map(
            stResp => {
                return Deserializer.createUser(stResp);
            }
        );
    }

}