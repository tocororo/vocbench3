import {Component, Input, OnInit} from "angular2/core";
import {ARTResource, ARTURIResource} from "../../utils/ARTResources";
import {ResourceUtils} from "../../utils/ResourceUtils";

@Component({
	selector: "rdf-resource",
	templateUrl: "app/src/widget/rdfResource/rdfResource.html",
    providers: [ResourceUtils],
})
export class RdfResourceComponent implements OnInit {
	@Input() resource:ARTResource;
	public imageSrc: string;
	public resourceShow: string;
	
	constructor(private resUtils:ResourceUtils) {}
    
    ngOnInit() {
        this.imageSrc = this.resUtils.getImageSrc(this.resource);
		this.resourceShow = this.resource.getShow();
    }
	
}