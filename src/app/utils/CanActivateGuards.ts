import {Injectable} from '@angular/core';
import {CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot} from '@angular/router';
import {AuthServices} from '../auth/authServices';
import {VocbenchCtx} from '../utils/VocbenchCtx';

@Injectable()
export class AuthGuard implements CanActivate {

    constructor(private authService: AuthServices, private router: Router) { }

    canActivate() {
        if (this.authService.isLoggedIn()) {
            return true;
        } else {
            this.router.navigate(['/Home']);
            return false;
        }
    }
}

@Injectable()
export class ProjectGuard implements CanActivate {

    constructor(private vbCtx: VocbenchCtx, private router: Router) { }

    canActivate() {
        if (this.vbCtx.getWorkingProject() != undefined) {
            return true;
        } else {
            this.router.navigate(['/Projects']);
            return false;
        }
    }
}

export const GUARD_PROVIDERS = [AuthGuard, ProjectGuard];
