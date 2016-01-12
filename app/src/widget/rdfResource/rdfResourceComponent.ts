import {Component, Input, OnInit} from "angular2/core";
import {ARTNode, ARTURIResource} from "../../utils/ARTResources";

@Component({
	selector: "rdf-resource",
	//templateUrl: "app/src/widget/rdfResource/rdfResource.html",
    template: `
        <img [src]="imageSrc">
        <label>{{resourceShow}}</label>
    `,
})
export class RdfResourceComponent implements OnInit {
	@Input() resource:ARTNode;
	public imageSrc: string;
	public resourceShow: string;
	
	constructor() {
        
	}
    
    ngOnInit() {
        console.log("In rdfResourceComponent " + JSON.stringify(this.resource));
        //this.resource = new ARTURIResource("http://demo.it#concept", "concept", "concept");
        this.imageSrc = "app/assets/images/concept.png";
		this.resourceShow = this.resource.getShow();	//find a way to cast ARTNode to ARTURIResource
    }
	
	//some function of the controller here
}