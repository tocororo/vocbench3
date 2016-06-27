import {Component} from "@angular/core";
import {SchemeListPanelComponent} from "./schemeListPanel/schemeListPanelComponent";
import {ResourceViewPanelComponent} from "../../resourceView/resourceViewPanel/resourceViewPanelComponent";
import {ARTURIResource} from "../../utils/ARTResources";

@Component({
    selector: "scheme-component",
    templateUrl: "app/src/skos/scheme/schemesComponent.html",
    directives: [SchemeListPanelComponent, ResourceViewPanelComponent],
    host: { class: "pageComponent" }
})
export class SchemesComponent {
    
    public resource:ARTURIResource;
    
    //EVENT LISTENERS 
    private onSchemeSelected(node) {
        this.resource = node;
    }
    
}