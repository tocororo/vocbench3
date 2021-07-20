import { map } from 'rxjs/operators';
import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot, Router } from "@angular/router";
import { Observable, of } from 'rxjs';
import { User } from "../models/User";
import { UserServices } from "../services/userServices";
import { VBContext } from "./VBContext";

@Injectable()
export class UserResolver implements Resolve<User> {

    constructor(private userService: UserServices, private router: Router) { }

    /**
     * This resolver runs each time VB is open in the browser for the first time and it tries to 
     * retrieve the logged user from the server and to set it into the VBContext.
     * It is automatically invoked when accessing the Home page.
     * Note: There's no need to use this resolver in other pages since in case user is not logged,
     * the AuthGuard (memo: Guard runs always before Resolve) redirects to the Home page. 
     */
    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<User> {
        if (VBContext.isLoggedIn()) { //if the user is already in context (e.g. navigated to Home without refreshing the whole app) there is no need to call getUser()
            return of(VBContext.getLoggedUser());
        }
        return this.userService.getUser().pipe(
            map(user => {
                if (user && user.isSamlUser()) { //special case: logged user is a "mockup" user for SAML login (EULogin), so redirect to the registration page
                    this.router.navigate(['/Registration/0'], { queryParams: { email: user.getEmail(), givenName: user.getGivenName(), familyName: user.getFamilyName() } });
                }
                return user;
            })
        );
    }

}
