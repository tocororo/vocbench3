import {Component} from "@angular/core";
import {Router} from '@angular/router-deprecated';
import {ClassTreePanelComponent} from "./classTreePanel/classTreePanelComponent";
import {ResourceViewTabComponent} from "../resourceView/resourceViewPanel/resourceViewTabComponent";
import {ARTURIResource} from "../utils/ARTResources";
import {VocbenchCtx} from '../utils/VocbenchCtx';

@Component({
    selector: "class-component",
    templateUrl: "app/src/owl/classComponent.html",
    directives: [ClassTreePanelComponent, ResourceViewTabComponent],
    host: { class: "pageComponent" }
})
export class ClassComponent {
    
    private resource:ARTURIResource;
    
    constructor(private vbCtx: VocbenchCtx, private router: Router) {
        //navigate to Home view if not authenticated
        if (vbCtx.getAuthenticationToken() == undefined) {
            router.navigate(['Home']);
        } else if (vbCtx.getWorkingProject() == undefined) {//navigate to Projects view if a project is not selected
            router.navigate(['Projects']);
        }
    }
    
    //EVENT LISTENERS 
    private onClassSelected(cls) {
        this.resource = cls;
    }
    
    private onInstanceSelected(instance) {
        this.resource = instance;
    }
    
}