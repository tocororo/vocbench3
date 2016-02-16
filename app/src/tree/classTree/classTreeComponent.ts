import {Component, Input, Output, EventEmitter} from "angular2/core";
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
export class ClassTreeComponent {
	@Input('rootclass') rootClass:ARTURIResource;
    @Output() itemSelected = new EventEmitter<ARTURIResource>();
    
    public roots:ARTURIResource[];
    private selectedNode:ARTURIResource;
    
    private eventSubscriptions = [];
	
	constructor(private owlService:OwlServices, private deserializer:Deserializer, private eventHandler:VBEventHandler) {
        this.eventSubscriptions.push(eventHandler.classTreeNodeSelectedEvent.subscribe(node => this.onClassSelected(node)));
        this.eventSubscriptions.push(eventHandler.classDeletedEvent.subscribe(cls => this.onClassDeleted(cls)));
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
                    this.roots = this.deserializer.createURIArray(stResp);
                    for (var i=0; i<this.roots.length; i++) {
                        this.roots[i].setAdditionalProperty("children", []);
                    }
                },
                err => { 
                    alert("Error: " + err);
                    console.error(err.stack);
                }
            );
    }
    
    ngOnDestroy() {
        this.eventHandler.unsubscribeAll(this.eventSubscriptions);
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
        this.itemSelected.emit(node);
    }
    
    private onClassDeleted(cls:ARTURIResource) {
        //check if the class to delete is a root
        for (var i = 0; i < this.roots.length; i++) {
            if (this.roots[i].getURI() == cls.getURI()) {
                this.roots.splice(i, 1);
                break;
            }
        }
        //reset the selected item
        this.itemSelected.emit(undefined);
    }
    
}