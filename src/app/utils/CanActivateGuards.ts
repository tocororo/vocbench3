import { Injectable } from '@angular/core';
import { CanActivate, CanLoad, Router } from '@angular/router';
import { Observable, of } from 'rxjs';
import { map, take } from 'rxjs/operators';
import { UserServices } from '../services/userServices';
import { VBContext } from './VBContext';

/**
 * Guard that prevents accessing page to not logged user
 */
@Injectable()
export class AuthGuard implements CanActivate, CanLoad {

    constructor(private router: Router, private userService: UserServices) { }

    //this canActivate return Observable<boolean> since I need to check asynchronously if a user is logged
    canActivate(): Observable<boolean> {
        return this.guarImpl();
    }
    canLoad(): Observable<boolean> {
        return this.guarImpl();
    }

    guarImpl(): Observable<boolean> {
        if (VBContext.isLoggedIn()) {
            return of(true);
        } else {
            /* if there is no user in vbCtx it doesn't mean that the user is not logged, in fact,
            if the user refresh the page, VBContext is reinitialized and then userLogged is reset to null.
            Here try to retrieve from server the logged user. */
            return this.userService.getUser().pipe(
                map(user => { //request completed succesfully, set the user in the context and return true
                    if (user) { //getUser returned the logged user
                        return true;
                    } else { //no logged user, getUser returned null
                        this.router.navigate(['/Home']);
                        return false;
                    }
                })
            )
        }
    }
}

/**
 * Guard that prevents accessing page to not "normal" user (allows only to admin)
 */
@Injectable()
export class AdminGuard implements CanActivate {

    constructor(private router: Router, private userService: UserServices) { }

    //this canActivate return Observable<boolean> since I need to check asynchronously if a user is logged
    canActivate(): Observable<boolean> {
        if (VBContext.isLoggedIn()) {
            return of(VBContext.getLoggedUser().isAdmin());
        } else {
            /* if there is no user in vbCtx it doesn't mean that the user is not logged, in fact,
            if the user refresh the page, VBContext is reinitialized and then userLogged is reset to null.
            Here try to retrieve from server the logged user. */
            return this.userService.getUser().pipe(
                map(user => { //request completed succesfully, set the user in the context and return true
                    if (user) { //getUser returned the logged user
                        return user.isAdmin();
                    } else { //no logged user, getUser returned null
                        this.router.navigate(['/Home']);
                        return false;
                    }
                })
            )
        }
    }
}

/**
 * Guard that prevents accessing page whit no project accessed
 */
@Injectable()
export class ProjectGuard implements CanActivate, CanLoad {

    constructor(private router: Router) { }

    canActivate(): boolean {
        return this.guardImpl();
    }
    canLoad(): boolean {
        return this.guardImpl();
    }

    guardImpl(): boolean {
        if (VBContext.getWorkingProject() != undefined) {
            return true;
        } else {
            this.router.navigate(['/Home']);
            return false;
        }
    }
}

export const GUARD_PROVIDERS = [AuthGuard, AdminGuard, ProjectGuard];
