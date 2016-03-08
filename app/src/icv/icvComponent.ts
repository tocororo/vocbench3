import {Component} from "angular2/core";
import {Router} from 'angular2/router';
import {VocbenchCtx} from "../utils/VocbenchCtx";

@Component({
    selector: "icv-component",
    templateUrl: "app/src/icv/icvComponent.html",
})
export class IcvComponent {
    
    constructor(private vbCtx: VocbenchCtx, private router: Router) {
        //navigate to Projects view if a project is not selected
        if (vbCtx.getProject() == undefined) {
            router.navigate(['Projects']);
        }
    }
    
}