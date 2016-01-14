import {Component, Input, OnInit} from "angular2/core";
import {ARTURIResource} from "../../utils/ARTResources";
import {Deserializer} from "../../utils/Deserializer";
import {SkosServices} from "../../services/skosServices";
import {ConceptTreeNodeComponent} from "./ConceptTreeNodeComponent";

@Component({
	selector: "concept-tree",
	templateUrl: "app/src/tree/conceptTree/conceptTreeComponent.html",
    directives: [ConceptTreeNodeComponent],
    providers: [SkosServices, Deserializer],
})
export class ConceptTreeComponent implements OnInit {
	@Input() scheme:ARTURIResource;
    public roots:ARTURIResource[];
	
	constructor(private skosService:SkosServices, public deserializer:Deserializer) {}
    
    ngOnInit() {
        var schemeUri = null;
        if (this.scheme != undefined) {
            schemeUri = this.scheme.getURI();
        }
        this.skosService.getTopConcepts(schemeUri)
            .subscribe(
                stResp => {
                    this.roots = this.deserializer.createRDFArray(stResp);
                    console.log("Roots in concept tree onInit " + JSON.stringify(this.roots));
                }
            );
    }
    
}