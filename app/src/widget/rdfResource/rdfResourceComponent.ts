import {Component, Input} from "angular2/core";
import {ARTNode, ARTURIResource} from "../../utils/ARTResources";

@Component({
	selector: "rdf-resource",
	templateUrl: "app/src/widget/rdfResource/rdfResource.html",
})
export class RdfResourceComponent {
	@Input('resource') res: ARTNode;
	public imageSrc: string;
	public resourceShow: string;
	
	constructor() {
        this.res = new ARTURIResource("http://demo.it#concept", "concept", "concept");
        this.imageSrc = "app/assets/images/concept.png";
		this.resourceShow = this.res.getShow();	//find a way to cast ARTNode to ARTURIResource
	}
	
	//some function of the controller here
}