import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot, RouterStateSnapshot } from "@angular/router";
import { Observable } from 'rxjs/Observable';
import { UserServices } from "../services/userServices";
import { User } from "../models/User";
import { VBContext } from "./VBContext";

@Injectable()
export class UserResolver implements Resolve<User> {

    constructor(private userService: UserServices) {}

    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<User> {
        if (VBContext.isLoggedIn()) { //if the user is already in context there is no need to call getUser()
            return Observable.of(VBContext.getLoggedUser());
        }
        return this.userService.getUser();
    }

}
