import {Component, Input} from "@angular/core";
import {ARTNode} from "../../utils/ARTResources";
import {ResourceUtils} from "../../utils/ResourceUtils";

@Component({
	selector: "rdf-resource",
	templateUrl: "./rdfResourceComponent.html",
})
export class RdfResourceComponent {
	@Input() resource: ARTNode;
	
	constructor() {}
    
    private getImgSrc() {
        return ResourceUtils.getImageSrc(this.resource);
    }

}