import {Component, Input, OnInit} from "angular2/core";
import {ARTResource} from "../../utils/ARTResources";
import {ResourceUtils} from "../../utils/ResourceUtils";

@Component({
	selector: "rdf-resource",
	templateUrl: "app/src/widget/rdfResource/rdfResourceComponent.html",
})
export class RdfResourceComponent {
	@Input() resource:ARTResource;
	
	constructor() {}
    
    private getImgSrc() {
        return ResourceUtils.getImageSrc(this.resource);
    }

}