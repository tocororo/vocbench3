import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import { Deserializer } from "../utils/Deserializer";
import { HttpManager } from "../utils/HttpManager";
import { VBContext } from "../utils/VBContext";
import { User, UserStatusEnum } from "../models/User";
import { ARTURIResource } from "../models/ARTResources";

@Injectable()
export class UserServices {

    private serviceName = "Users";
    private oldTypeService = false;

    constructor(private httpMgr: HttpManager, private router: Router) { }

    /**
     * Returns the user corrently logged (response contains user object).
     * Returns null if no user is logged (response contains empty user object).
     * Throw exception if no user is register at all (in this case the response of getUser() is empty).
     */
    getUser(): Observable<User> {
        console.log("[UserServices] getUser");
        return this.httpMgr.doGet(this.serviceName, "getUser", null, this.oldTypeService, true).map(
            stResp => {
                if (stResp.user != null) { //user object in respnse => serialize it (it could be empty, so no user logged)
                    let user: User = Deserializer.createUser(stResp.user);
                    if (user != null) {
                        VBContext.setLoggedUser(user);
                    }
                    return user;
                } else { //no user object in the response => there is no user registered
                    this.router.navigate(["/Registration/1"]);
                }
            }
        );
    }

    /**
     * Lists all the registered users
     */
    listUsers(): Observable<User[]> {
        console.log("[UserServices] listUsers");
        return this.httpMgr.doGet(this.serviceName, "listUsers", null, this.oldTypeService, true).map(
            stResp => {
                return Deserializer.createUsersArray(stResp);
            }
        );
    }

    /**
     * Lists the users that have at least a role assigned in the given project
     * @param projectName
     */
    listUsersBoundToProject(projectName: string): Observable<User[]> {
        console.log("[UserServices] listUsersBoundToProject");
        var params: any = {
            projectName: projectName
        }
        return this.httpMgr.doGet(this.serviceName, "listUsersBoundToProject", params, this.oldTypeService, true).map(
            stResp => {
                return Deserializer.createUsersArray(stResp);
            }
        );
    }

    /**
     * Register a new user
     * @param email
     * @param password
     * @param givenName
     * @param familyName
     * @param birthday
     * @param gender
     * @param country
     * @param address
     * @param affiliation
     * @param url
     * @param phone
     */
    registerUser(email: string, password: string, givenName: string, familyName: string, iri: ARTURIResource,
        birthday: Date, gender: string, country: string, address: string, affiliation: string, url: string, phone: string) {
        console.log("[UserServices] registerUser");
        var params: any = {
            email: email,
            password: password,
            givenName: givenName,
            familyName: familyName
        }
        if (iri != undefined) {
            params.iri = iri;
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
     * Updates givenName of the given user. Returns the updated user.
     * @param email email of the user to update
     * @param givenName
     */
    updateUserGivenName(email: string, givenName: string): Observable<User> {
        console.log("[UserServices] updateUserGivenName");
        var params: any = {
            email: email,
            givenName: givenName,
        }
        return this.httpMgr.doPost(this.serviceName, "updateUserGivenName", params, this.oldTypeService, true).map(
            stResp => {
                return Deserializer.createUser(stResp);
            }
        );
    }

    /**
     * Updates familyName of the given user. Returns the updated user.
     * @param email email of the user to update
     * @param familyName
     */
    updateUserFamilyName(email: string, familyName: string): Observable<User> {
        console.log("[UserServices] updateUserFamilyName");
        var params: any = {
            email: email,
            familyName: familyName,
        }
        return this.httpMgr.doPost(this.serviceName, "updateUserFamilyName", params, this.oldTypeService, true).map(
            stResp => {
                return Deserializer.createUser(stResp);
            }
        );
    }

    /**
     * Updates givenName of the given user. Returns the updated user.
     * @param email email of the user to update
     * @param givenName
     */
    updateUserEmail(email: string, newEmail: string): Observable<User> {
        console.log("[UserServices] updateUserEmail");
        var params: any = {
            email: email,
            newEmail: newEmail,
        }
        return this.httpMgr.doPost(this.serviceName, "updateUserEmail", params, this.oldTypeService, true).map(
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
        return this.httpMgr.doPost(this.serviceName, "updateUserPhone", params, this.oldTypeService, true).map(
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
        return this.httpMgr.doPost(this.serviceName, "updateUserBirthday", params, this.oldTypeService, true).map(
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
        return this.httpMgr.doPost(this.serviceName, "updateUserGender", params, this.oldTypeService, true).map(
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
        return this.httpMgr.doPost(this.serviceName, "updateUserCountry", params, this.oldTypeService, true).map(
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
        return this.httpMgr.doPost(this.serviceName, "updateUserAddress", params, this.oldTypeService, true).map(
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
        return this.httpMgr.doPost(this.serviceName, "updateUserAffiliation", params, this.oldTypeService, true).map(
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
        return this.httpMgr.doPost(this.serviceName, "updateUserUrl", params, this.oldTypeService, true).map(
            stResp => {
                return Deserializer.createUser(stResp);
            }
        );
    }

    /**
     * Enables or disables a user
     * @param email email of the user to enable/disable
     * @param enabled true enables the user, false disables the user
     */
    enableUser(email: string, enabled: boolean): Observable<User> {
        console.log("[UserServices] enableUser");
        var params: any = {
            email: email,
            enabled: enabled,
        }
        return this.httpMgr.doPost(this.serviceName, "enableUser", params, this.oldTypeService, true).map(
            stResp => {
                return Deserializer.createUser(stResp);
            }
        );
    }

    /**
     * Deletes a user
     * @param email
     */
    deleteUser(email: string) {
        console.log("[UserServices] deleteUser");
        var params: any = {
            email: email
        }
        return this.httpMgr.doPost(this.serviceName, "deleteUser", params, this.oldTypeService, true);
    }

    /**
     * 
     * @param email 
     */
    forgotPassword(email: string) {
        console.log("[UserServices] forgotPassword");
        var params: any = {
            email: email,
            vbHostAddress: location.hostname + ":" + location.port
        }
        return this.httpMgr.doPost(this.serviceName, "forgotPassword", params, this.oldTypeService, true);
    }

    /**
     * 
     * @param email 
     * @param token 
     */
    resetPassword(email: string, token: string) {
        console.log("[UserServices] resetPassword");
        var params: any = {
            email: email,
            token: token
        }
        return this.httpMgr.doPost(this.serviceName, "resetPassword", params, this.oldTypeService, true);
    }

}