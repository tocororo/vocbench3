import {Component, Input, OnInit} from "angular2/core";
import {ARTURIResource} from "../../utils/ARTResources";
import {Deserializer} from "../../utils/Deserializer";
import {VBEventHandler} from "../../utils/VBEventHandler";
import {OwlServices} from "../../services/owlServices";
import {ClassTreeNodeComponent} from "./classTreeNodeComponent";

@Component({
	selector: "class-tree",
	templateUrl: "app/src/tree/classTree/classTreeComponent.html",
    directives: [ClassTreeNodeComponent],
    providers: [OwlServices],
})
export class ClassTreeComponent implements OnInit {
	@Input('rootclass') rootClass:ARTURIResource;
    public roots:ARTURIResource[];
    private selectedNode:ARTURIResource;
    
    private subscrNodeSelected;
    private subscrRootClassCreated;
    private subscrClassDeleted;
	
	constructor(private owlService:OwlServices, public deserializer:Deserializer, private eventHandler:VBEventHandler) {
        this.subscrNodeSelected = eventHandler.classTreeNodeSelectedEvent.subscribe(node => this.onClassSelected(node));
        this.subscrClassDeleted = eventHandler.classDeletedEvent.subscribe(cls => this.onClassDeleted(cls));
    }
    
    ngOnInit() {
        var rootClassUri = null;
        if (this.rootClass == undefined) {
            rootClassUri = "http://www.w3.org/2002/07/owl#Thing";
        } else {
            rootClassUri = this.rootClass.getURI();
        }
        this.owlService.getClassesInfoAsRootsForTree(rootClassUri)
            .subscribe(
                stResp => {
                    this.roots = this.deserializer.createRDFArray(stResp);
                    for (var i=0; i<this.roots.length; i++) {
                        this.roots[i].setAdditionalProperty("children", []);
                    }
                }
            );
    }
    
    ngOnDestroy() {
        this.subscrNodeSelected.unsubscribe();
        this.subscrRootClassCreated.unsubscribe();
        this.subscrClassDeleted.unsubscribe();
    }
    
    
    //EVENT LISTENERS
    
    private onClassSelected(node:ARTURIResource) {
        if (this.selectedNode == undefined) {
            this.selectedNode = node;
            this.selectedNode.setAdditionalProperty("selected", true);    
        } else if (this.selectedNode.getURI() != node.getURI()) {
            this.selectedNode.deleteAdditionalProperty("selected");
            this.selectedNode = node;
            this.selectedNode.setAdditionalProperty("selected", true);
        }
    }
    
    private onClassDeleted(cls:ARTURIResource) {
        //check if the class to delete is a root
        for (var i = 0; i < this.roots.length; i++) {
            if (this.roots[i].getURI() == cls.getURI()) {
                this.roots.splice(i, 1);
                break;
            }
        }
    }
    
}