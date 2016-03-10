import {Component} from "angular2/core";
import {Router} from 'angular2/router';
import {ClassTreePanelComponent} from "./classTreePanel/classTreePanelComponent";
import {ResourceViewComponent} from "../resourceView/resourceViewComponent";
import {ARTURIResource} from "../utils/ARTResources";
import {VocbenchCtx} from '../utils/VocbenchCtx';

@Component({
    selector: "class-component",
    templateUrl: "app/src/owl/classComponent.html",
    directives: [ClassTreePanelComponent, ResourceViewComponent],
    host: { class: "pageComponent" }
})
export class ClassComponent {
    
    private resource:ARTURIResource;
    
    constructor(private vbCtx: VocbenchCtx, private router: Router) {
        //navigate to Projects view if a project is not selected 
        if (vbCtx.getProject() == undefined) {
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