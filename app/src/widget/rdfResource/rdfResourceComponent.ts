import {Component, Input, OnInit} from "angular2/core";
import {ARTResource, ARTURIResource} from "../../utils/ARTResources";
import {ResourceUtils} from "../../utils/ResourceUtils";

@Component({
	selector: "rdf-resource",
	templateUrl: "app/src/widget/rdfResource/rdfResourceComponent.html",
    providers: [ResourceUtils],
})
export class RdfResourceComponent {
	@Input() resource:ARTResource;
	public imageSrc: string;
	public resourceShow: string;
	
	constructor(private resUtils:ResourceUtils) {}
    
    ngOnChanges(changes) {
        this.imageSrc = this.resUtils.getImageSrc(this.resource);
		this.resourceShow = this.resource.getShow();
    }
	
}