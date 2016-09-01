import {Component} from "@angular/core";
import {ARTURIResource} from "../../utils/ARTResources";

@Component({
    selector: "scheme-component",
    templateUrl: "app/src/skos/scheme/schemesComponent.html",
    host: { class: "pageComponent" }
})
export class SchemesComponent {
    
    public resource:ARTURIResource;
    
    //EVENT LISTENERS 
    private onSchemeSelected(node) {
        this.resource = node;
    }
    
}