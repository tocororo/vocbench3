import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, CanLoad, Router, RouterStateSnapshot } from '@angular/router';
import { Observable, of } from 'rxjs';
import { map, mergeMap } from 'rxjs/operators';
import { UserServices } from '../services/userServices';
import { AuthorizationEvaluator } from './AuthorizationEvaluator';
import { VBActionsEnum } from './VBActions';
import { VBContext } from './VBContext';
import { VBProperties } from './VBProperties';

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
        console.log("admin guard");
        if (VBContext.isLoggedIn()) {
            console.log("1", VBContext.getLoggedUser())
            return of(VBContext.getLoggedUser().isAdmin());
        } else {
            /* if there is no user in vbCtx it doesn't mean that the user is not logged, in fact,
            if the user refresh the page, VBContext is reinitialized and then userLogged is reset to null.
            Here try to retrieve from server the logged user. */
            return this.userService.getUser().pipe(
                map(user => { //request completed succesfully, set the user in the context and return true
                    console.log("2", user)
                    if (user) { //getUser returned the logged user
                        console.log("return", user.isAdmin())
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

@Injectable()
export class SuperUserGuard implements CanActivate {

    constructor(private router: Router, private userService: UserServices) { }

    canActivate(): Observable<boolean> {
        if (VBContext.isLoggedIn()) {
            return of(VBContext.getLoggedUser().isSuperUser() || VBContext.getLoggedUser().isAdmin());
        } else {
            /* if there is no user in vbCtx it doesn't mean that the user is not logged, in fact,
            if the user refresh the page, VBContext is reinitialized and then userLogged is reset to null.
            Here try to retrieve from server the logged user. */
            return this.userService.getUser().pipe(
                map(user => { //request completed succesfully, set the user in the context and return true
                    if (user) { //getUser returned the logged user
                        return user.isSuperUser() || user.isAdmin();
                    } else { //no logged user, getUser returned null
                        this.router.navigate(['/Home']);
                        return false;
                    }
                })
            )
        }
    }
}

@Injectable()
export class PMGuard implements CanActivate {

    constructor() { }

    //this canActivate return Observable<boolean> since I need to check asynchronously if a user is logged
    canActivate(): Observable<boolean> {
        if (VBContext.isLoggedIn()) {
            return of(AuthorizationEvaluator.isAuthorized(VBActionsEnum.administrationProjectManagement));
        } else {
            return of(false);
        }
    }
}

/**
 * Guard that prevents accessing page whit no project accessed
 */
@Injectable()
export class ProjectGuard implements CanActivate, CanLoad {

    constructor(private router: Router) { }

    canActivate(): Observable<boolean> {
        return this.guardImpl();
    }
    canLoad(): Observable<boolean> {
        return this.guardImpl();
    }

    guardImpl(): Observable<boolean> {
        if (VBContext.getWorkingProject() != undefined) {
            return of(true);
        } else {
            this.router.navigate(['/Home']);
            return of(false);
        }
    }
}

@Injectable()
export class SystemSettingsGuard implements CanActivate, CanLoad {

    constructor(private vbProp: VBProperties) { }

    canActivate(): Observable<boolean> {
        return this.guardImpl();
    }
    canLoad(): Observable<boolean> {
        return this.guardImpl();
    }

    guardImpl(): Observable<boolean> {
        if (VBContext.getSystemSettings() == null) {
            return this.vbProp.initStartupSystemSettings().pipe(
                map(() => {
                    return true;
                })
            );
        } else {
            return of(true);
        }
    }
}


/**
 * In some routes of VB I need to apply multiple guards (e.g. [AuthGuard, ProjectGuard, SystemSettingsGuard]).
 * Some Guards are async, they need to do service invocations in order to determine if the route can be activated or not.
 * Angular normally execute multiple guards in order, namely if I have [Guard1, Guard2] and Guard1 fails, Guard2 is not executed.
 * But this happens only if these guards are not async (return boolean, not Observable<boolean>), in such case, 
 * the route is activate if all guards returns true, but they are all executed.
 * This represents a problem in VB since it may happen that SystemSettingsGuard is invoked twice almost simoultaneously
 * causing error server side (ST may give error when trying to access the same settings file at the same time)
 * (e.g. 
 * - user refreshes Data page
 * - SystemSettingsGuard is invoked
 * - ProjectGuard is invoked as well and redirects to Home since the chached Project into VBContext has been reset
 * - SystemSettingsGuard is invoked again in Home but the 1st invocation was still going on
 * -> ST Error
 * )
 * 
 * The following is a solution inspired by answers found online (see useful links below).
 * This AsyncGuardResolver is a "master" guards that retrieves a list of guards ID from the route data object
 * (note: this is passed in the definition of the route like:
 * canActivate: [AsyncGuardResolver], data: { guards: [VBGuards.SystemSettingsGuard, AuthGuard, ProjectGuard] })
 * and execute them sequencially.
 * 
 * https://stackoverflow.com/questions/44641092/execute-multiple-asynchronous-route-guards-in-order
 * https://stackoverflow.com/questions/40589878/multiple-canactivate-guards-all-run-when-first-fails
 * https://github.com/angular/angular/issues/21702
 * 
 * Note: in lazy-loaded module has been enough to set SystemSettingsGuard in canActivate of the parent route (empty path "").
 */

@Injectable()
export class AsyncGuardResolver implements CanActivate {

    constructor(private router: Router, private userService: UserServices, private vbProp: VBProperties) {}

    private route: ActivatedRouteSnapshot;
    private state: RouterStateSnapshot;

    //This method gets triggered when the route is hit
    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> {
        this.route = route;
        this.state = state;

        if (this.route.data && this.route.data.guards && this.route.data.guards.length > 0) {
            //if a guards list has been provided in data, execute the guards
            return this.executeGuards();
        } else { 
            //otherwise (no guards), view can be activated 
            //(this should never happens since it makes no sense to set AsyncGuardResolver as guard if not check needs to be done)
            return of(true);
        }
    }

    //Execute the guards sent in the route data 
    private executeGuards(guardIndex: number = 0): Observable<boolean> {
        let guardName = this.route.data.guards[guardIndex];
        let guardFn: Observable<boolean> = this.getGuard(guardName);
        return guardFn.pipe(
            mergeMap(guardPassed => {
                if (!guardPassed) {
                    return of(false);
                } else {
                    if (guardIndex < this.route.data.guards.length - 1) {
                        return this.executeGuards(guardIndex + 1); //call the next guard
                    } else {
                        return of(true); //all guards passed, returns true
                    }
                }
            })
        )
    }

    //Create an instance of the guard and fire canActivate method returning the Observable
    private getGuard(guardKey: VBGuards): Observable<boolean> {
        let guard: AuthGuard | AdminGuard | PMGuard | ProjectGuard | SystemSettingsGuard;
        switch (guardKey) {
            case VBGuards.AuthGuard:
                guard = new AuthGuard(this.router, this.userService);
                break;
            case VBGuards.AdminGuard:
                guard = new AdminGuard(this.router, this.userService);
                break;
            case VBGuards.PMGuard: 
                guard = new PMGuard();
            case VBGuards.ProjectGuard:
                guard = new ProjectGuard(this.router);
                break;
            case VBGuards.SuperUserGuard:
                guard = new SuperUserGuard(this.router, this.userService);
                break;
            case VBGuards.SystemSettingsGuard:
                guard = new SystemSettingsGuard(this.vbProp);
                break;
            default:
                break; //should never happen
        }
        return guard.canActivate();
    }
}

export enum VBGuards {
    AuthGuard = "AuthGuard",
    AdminGuard = "AdminGuard",
    PMGuard = "PMGuard",
    ProjectGuard = "ProjectGuard",
    SuperUserGuard = "SuperUserGuard",
    SystemSettingsGuard = "SystemSettingsGuard",
}

export const GUARD_PROVIDERS = [AsyncGuardResolver, AuthGuard, AdminGuard, PMGuard, ProjectGuard, SuperUserGuard, SystemSettingsGuard];
