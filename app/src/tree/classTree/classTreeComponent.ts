import {Component, Input, OnInit} from "angular2/core";
import {ARTURIResource} from "../../utils/ARTResources";
import {Deserializer} from "../../utils/Deserializer";
import {OwlServices} from "../../services/owlServices";
import {ClassTreeNodeComponent} from "./classTreeNodeComponent";

@Component({
	selector: "class-tree",
	templateUrl: "app/src/tree/classTree/classTreeComponent.html",
    directives: [ClassTreeNodeComponent],
    providers: [OwlServices, Deserializer],
})
export class ClassTreeComponent implements OnInit {
	@Input() rootClass:ARTURIResource;
    public roots:ARTURIResource[];
	
	constructor(private owlService:OwlServices, public deserializer:Deserializer) {}
    
    ngOnInit() {
        var rootClassUri = null;
        if (this.rootClass == undefined) {
            rootClassUri = "http://www.w3.org/2002/07/owl#Thing";
        }
        this.owlService.getClassesInfoAsRootsForTree(rootClassUri)
            .subscribe(
                stResp => {
                    this.roots = this.deserializer.createRDFArray(stResp);
                    console.log("Roots in class tree onInit " + JSON.stringify(this.roots));
                }
            );
    }
    
}