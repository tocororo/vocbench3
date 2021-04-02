import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ARTURIResource } from "../models/ARTResources";
import { User, UserFormFields } from "../models/User";
import { AuthorizationEvaluator } from "../utils/AuthorizationEvaluator";
import { Deserializer } from "../utils/Deserializer";
import { HttpManager, VBRequestOptions } from "../utils/HttpManager";
import { VBContext } from "../utils/VBContext";

@Injectable()
export class UserServices {

    private serviceName = "Users";

    constructor(private httpMgr: HttpManager, private router: Router) { }

    /**
     * Returns the user corrently logged (response contains user object).
     * Returns null if no user is logged (response contains empty user object).
     * Throw exception if no user is register at all (in this case the response of getUser() is empty).
     */
    getUser(): Observable<User> {
        var params: any = {}
        return this.httpMgr.doGet(this.serviceName, "getUser", params).pipe(
            map(stResp => {
                if (stResp.user != null) { //user object in respnse => serialize it (it could be empty, so no user logged)
                    let user: User = Deserializer.createUser(stResp.user);
                    if (user != null) {
                        VBContext.setLoggedUser(user);
                    }
                    return user;
                } else { //no user object in the response => there is no user registered
                    this.router.navigate(["/Registration/1"]);
                }
            })
        );
    }

    /**
     * Lists all the registered users
     */
    listUsers(): Observable<User[]> {
        var params: any = {}
        return this.httpMgr.doGet(this.serviceName, "listUsers", params).pipe(
            map(stResp => {
                let users: User[] = Deserializer.createUsersArray(stResp);
                users.sort((u1: User, u2: User) => {
                    return u1.getGivenName().localeCompare(u2.getGivenName());
                });
                return users;
            })
        );
    }

    /**
     * Lists all the online users
     */
    listOnlineUsers(): Observable<User[]> {
        var params: any = {}
        return this.httpMgr.doGet(this.serviceName, "listOnlineUsers", params).pipe(
            map(stResp => {
                let users: User[] = Deserializer.createUsersArray(stResp);
                users.sort((u1: User, u2: User) => {
                    return u1.getGivenName().localeCompare(u2.getGivenName());
                });
                return users;
            })
        );
    }

    /**
     * Returns the capabilities of the current logged user in according the roles he has in the current project.
     * Note: this is used just in projectListModal and not in projectComponent,
     * since the latter is accessed only by the admin that doesn't require authorization check and has no capabilities
     */
    listUserCapabilities(): Observable<string[]> {
        var params: any = {}
        return this.httpMgr.doGet(this.serviceName, "listUserCapabilities", params).pipe(
            map(stResp => {
                AuthorizationEvaluator.initEvalutator(stResp);
                return stResp;
            })
        );
    }

    /**
     * Lists the users that have at least a role assigned in the given project
     * @param projectName
     */
    listUsersBoundToProject(projectName: string): Observable<User[]> {
        var params: any = {
            projectName: projectName
        }
        return this.httpMgr.doGet(this.serviceName, "listUsersBoundToProject", params).pipe(
            map(stResp => {
                let users: User[] = Deserializer.createUsersArray(stResp);
                users.sort((u1: User, u2: User) => {
                    return u1.getGivenName().localeCompare(u2.getGivenName());
                });
                return users;
            })
        );
    }

    /**
     * 
     * @param userIri 
     */
    listProjectsBoundToUser(userIri: ARTURIResource): Observable<string[]> {
        var params: any = {
            userIri: userIri
        }
        return this.httpMgr.doGet(this.serviceName, "listProjectsBoundToUser", params);
    }

    /**
     * Register a new user
     * @param email
     * @param password
     * @param givenName
     * @param familyName
     * @param address
     * @param affiliation
     * @param url
     * @param phone
     */
    registerUser(email: string, password: string, givenName: string, familyName: string, iri?: ARTURIResource,
        address?: string, affiliation?: string, url?: string, avatarUrl?: string, phone?: string, 
        languageProficiencies?: string[], customProperties?: {[iri: string]: string}) {
        //customProperties server side is a Map<IRI, String>, so the keys of the customProperties should be serialized as NT IRIs
        let convertedCustomProps: {[iri: string]: string} = {};
        for (let prop in customProperties) {
            convertedCustomProps["<"+prop+">"] = customProperties[prop];
        }
        let params: any = {
            email: email,
            password: password,
            givenName: givenName,
            familyName: familyName,
            iri: iri,
            address: address,
            affiliation: affiliation,
            url: url,
            avatarUrl: avatarUrl,
            phone: phone,
            languageProficiencies: languageProficiencies,
            customProperties: JSON.stringify(convertedCustomProps),
            vbHostAddress: location.protocol+"//"+location.hostname+((location.port !="") ? ":"+location.port : "")+location.pathname
        }
        return this.httpMgr.doPost(this.serviceName, "registerUser", params);
    }

    verifyUserEmail(email: string, token: string) {
        let params = {
            email: email,
            token: token,
        }
        let options: VBRequestOptions = new VBRequestOptions({
            errorAlertOpt: { 
                show: true, 
                exceptionsToSkip: ['it.uniroma2.art.semanticturkey.user.EmailVerificationExpiredException']
            } 
        });
        return this.httpMgr.doPost(this.serviceName, "verifyUserEmail", params, options);
    }

    createUser(email: string, password: string, givenName: string, familyName: string, iri?: ARTURIResource,
        address?: string, affiliation?: string, url?: string, avatarUrl?: string, phone?: string, 
        languageProficiencies?: string[], customProperties?: {[iri: string]: string}) {
        //customProperties server side is a Map<IRI, String>, so the keys of the customProperties should be serialized as NT IRIs
        let convertedCustomProps: {[iri: string]: string} = {};
        for (let prop in customProperties) {
            convertedCustomProps["<"+prop+">"] = customProperties[prop];
        }
        let params: any = {
            email: email,
            password: password,
            givenName: givenName,
            familyName: familyName,
            iri: iri,
            address: address,
            affiliation: affiliation,
            url: url,
            avatarUrl: avatarUrl,
            phone: phone,
            languageProficiencies: languageProficiencies,
            customProperties: JSON.stringify(convertedCustomProps)
        }
        return this.httpMgr.doPost(this.serviceName, "createUser", params);
    }

    /**
     * Updates givenName of the given user. Returns the updated user.
     * @param email email of the user to update
     * @param givenName
     */
    updateUserGivenName(email: string, givenName: string): Observable<User> {
        var params: any = {
            email: email,
            givenName: givenName,
        }
        return this.httpMgr.doPost(this.serviceName, "updateUserGivenName", params).pipe(
            map(stResp => {
                return Deserializer.createUser(stResp);
            })
        );
    }

    /**
     * Updates familyName of the given user. Returns the updated user.
     * @param email email of the user to update
     * @param familyName
     */
    updateUserFamilyName(email: string, familyName: string): Observable<User> {
        var params: any = {
            email: email,
            familyName: familyName,
        }
        return this.httpMgr.doPost(this.serviceName, "updateUserFamilyName", params).pipe(
            map(stResp => {
                return Deserializer.createUser(stResp);
            })
        );
    }

    /**
     * Updates givenName of the given user. Returns the updated user.
     * @param email email of the user to update
     * @param givenName
     */
    updateUserEmail(email: string, newEmail: string): Observable<User> {
        var params: any = {
            email: email,
            newEmail: newEmail,
        }
        return this.httpMgr.doPost(this.serviceName, "updateUserEmail", params).pipe(
            map(stResp => {
                return Deserializer.createUser(stResp);
            })
        );
    }

    /**
     * Updates phone of the given user. Returns the updated user.
     * @param email email of the user to update
     * @param phone if not provided, remove the info
     */
    updateUserPhone(email: string, phone?: string): Observable<User> {
        var params: any = {
            email: email,
        }
        if (phone != null) {
            params.phone = phone;
        }
        return this.httpMgr.doPost(this.serviceName, "updateUserPhone", params).pipe(
            map(stResp => {
                return Deserializer.createUser(stResp);
            })
        );
    }

    /**
     * Updates address of the given user. Returns the updated user.
     * @param email email of the user to update
     * @param address if not provided removes the info
     */
    updateUserAddress(email: string, address?: string): Observable<User> {
        var params: any = {
            email: email,
        }
        if (address != null) {
            params.address = address;
        }
        return this.httpMgr.doPost(this.serviceName, "updateUserAddress", params).pipe(
            map(stResp => {
                return Deserializer.createUser(stResp);
            })
        );
    }

    /**
     * Updates affiliation of the given user. Returns the updated user.
     * @param email email of the user to update
     * @param affiliation if not provided removes the info
     */
    updateUserAffiliation(email: string, affiliation?: string): Observable<User> {
        var params: any = {
            email: email,
        }
        if (affiliation != null) {
            params.affiliation = affiliation;
        }
        return this.httpMgr.doPost(this.serviceName, "updateUserAffiliation", params).pipe(
            map(stResp => {
                return Deserializer.createUser(stResp);
            })
        );
    }

    /**
     * Updates url of the given user. Returns the updated user.
     * @param email email of the user to update
     * @param url if not provided removes the info
     */
    updateUserUrl(email: string, url?: string): Observable<User> {
        var params: any = {
            email: email,
        }
        if (url != null) {
            params.url = url;
        }
        return this.httpMgr.doPost(this.serviceName, "updateUserUrl", params).pipe(
            map(stResp => {
                return Deserializer.createUser(stResp);
            })
        );
    }

    /**
     * Updates avatarUrl of the given user. Returns the updated user.
     * @param email email of the user to update
     * @param avatarUrl if not provided removes the info
     */
    updateUserAvatarUrl(email: string, avatarUrl?: string): Observable<User> {
        var params: any = {
            email: email,
        }
        if (avatarUrl != null) {
            params.avatarUrl = avatarUrl;
        }
        return this.httpMgr.doPost(this.serviceName, "updateUserAvatarUrl", params).pipe(
            map(stResp => {
                return Deserializer.createUser(stResp);
            })
        );
    }

    /**
     * Updates url of the given user. Returns the updated user.
     * @param email email of the user to update
     * @param url
     */
    updateUserLanguageProficiencies(email: string, languageProficiencies: string[]): Observable<User> {
        var params: any = {
            email: email,
            languageProficiencies: languageProficiencies,
        }
        return this.httpMgr.doPost(this.serviceName, "updateUserLanguageProficiencies", params).pipe(
            map(stResp => {
                return Deserializer.createUser(stResp);
            })
        );
    }

    /**
     * 
     * @param email 
     * @param property 
     * @param value 
     */
    updateUserCustomField(email: string, property: ARTURIResource, value?: string): Observable<User> {
        var params: any = {
            email: email,
            property: property,
            value: value
        }
        return this.httpMgr.doPost(this.serviceName, "updateUserCustomField", params).pipe(
            map(stResp => {
                return Deserializer.createUser(stResp);
            })
        );
    }

    /**
     * Enables or disables a user
     * @param email email of the user to enable/disable
     * @param enabled true enables the user, false disables the user
     */
    enableUser(email: string, enabled: boolean): Observable<User> {
        var params: any = {
            email: email,
            enabled: enabled,
        }
        return this.httpMgr.doPost(this.serviceName, "enableUser", params).pipe(
            map(stResp => {
                return Deserializer.createUser(stResp);
            })
        );
    }

    /**
     * Deletes a user
     * @param email
     */
    deleteUser(email: string) {
        var params: any = {
            email: email
        }
        return this.httpMgr.doPost(this.serviceName, "deleteUser", params);
    }

    /**
     * 
     * @param email
     * @param oldPassword 
     * @param newPassword 
     */
    changePassword(email: string, oldPassword: string, newPassword: string) {
        var params: any = {
            email: email,
            oldPassword: oldPassword,
            newPassword: newPassword
        }
        return this.httpMgr.doPost(this.serviceName, "changePassword", params);
    }

    /**
     * 
     * @param password 
     */
    forcePassword(email: string, password: string) {
        var params: any = {
            email: email,
            password: password
        }
        return this.httpMgr.doPost(this.serviceName, "forcePassword", params);
    }

    /**
     * 
     * @param email 
     */
    forgotPassword(email: string) {
        var params: any = {
            email: email,
            vbHostAddress: location.protocol+"//"+location.hostname+((location.port !="") ? ":"+location.port : "")+location.pathname

        }
        return this.httpMgr.doPost(this.serviceName, "forgotPassword", params);
    }

    /**
     * 
     * @param email 
     * @param token 
     */
    resetPassword(email: string, token: string) {
        var params: any = {
            email: email,
            token: token
        }
        return this.httpMgr.doPost(this.serviceName, "resetPassword", params);
    }

    /**
     * User Form
     */

    getUserFormFields(): Observable<UserFormFields> {
        var params: any = {}
        return this.httpMgr.doGet(this.serviceName, "getUserFormFields", params);
    }

    updateUserFormOptionalFieldVisibility(field: ARTURIResource, visibility: boolean) {
        var params: any = {
            field: field,
            visibility: visibility
        }
        return this.httpMgr.doPost(this.serviceName, "updateUserFormOptionalFieldVisibility", params);
    }

    addUserFormCustomField(field: string) {
        var params: any = {
            field: field,
        }
        return this.httpMgr.doPost(this.serviceName, "addUserFormCustomField", params);
    }

    swapUserFormCustomFields(field1: ARTURIResource, field2: ARTURIResource) {
        var params: any = {
            field1: field1,
            field2: field2
        }
        return this.httpMgr.doPost(this.serviceName, "swapUserFormCustomFields", params);
    }

    updateUserFormCustomField(fieldIri: ARTURIResource, label: string, description?: string) {
        var params: any = {
            fieldIri: fieldIri,
            label: label,
            description: description
        }
        return this.httpMgr.doPost(this.serviceName, "updateUserFormCustomField", params);
    }

    removeUserFormCustomField(field: ARTURIResource) {
        var params: any = {
            field: field,
        }
        return this.httpMgr.doPost(this.serviceName, "removeUserFormCustomField", params);
    }


}
