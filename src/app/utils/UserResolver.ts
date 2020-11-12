import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from "@angular/router";
import { Observable, of } from 'rxjs';
import { User } from "../models/User";
import { UserServices } from "../services/userServices";
import { VBContext } from "./VBContext";

@Injectable()
export class UserResolver implements Resolve<User> {

    constructor(private userService: UserServices) {}

    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<User> {
        if (VBContext.isLoggedIn()) { //if the user is already in context there is no need to call getUser()
            return of(VBContext.getLoggedUser());
        }
        return this.userService.getUser();
    }

}
