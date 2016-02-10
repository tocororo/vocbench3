import {Component, Input, Output, EventEmitter} from "angular2/core";
import {ClassTreeComponent} from "../../tree/classTree/classTreeComponent";
import {OwlServices} from "../../services/owlServices";
import {ARTURIResource} from "../../utils/ARTResources";
import {VBEventHandler} from "../../utils/VBEventHandler";
import {Deserializer} from "../../utils/Deserializer";

@Component({
	selector: "class-tree-panel",
	templateUrl: "app/src/owl/classTreePanel/classTreePanelComponent.html",
	directives: [ClassTreeComponent],
    providers: [OwlServices],
})
export class ClassTreePanelComponent {
    @Input('rootclass') rootClass:ARTURIResource;
    @Output() itemSelected = new EventEmitter<ARTURIResource>();
    
    private selectedClass:ARTURIResource;
    
	constructor(private owlService:OwlServices, private deserializer:Deserializer, private eventHandler:VBEventHandler) {}
    
    ngOnInit() {
        if (this.rootClass == undefined) {
            this.rootClass = new ARTURIResource("http://www.w3.org/2002/07/owl#Thing", "owl:Thing", "cls");
        }
    }
    
    private createClass() {
        var className = prompt("Insert class name");
        if (className == null) return;
        this.owlService.createClass(this.rootClass.getURI(), className)
            .subscribe(
                stResp => {
                    var newClass = this.deserializer.createURI(stResp.getElementsByTagName("Class")[0]);
                    newClass.setAdditionalProperty("children", []);
                    this.eventHandler.subClassCreatedEvent.emit({ "resource": newClass, "parent": this.rootClass });
                },
                err => { 
                    alert("Error: " + err);
                    console.error(err.stack);
                }
            );
    }
    
    public createSubClass() {
        var className = prompt("Insert class name");
        if (className == null) return;
        this.owlService.createClass(this.selectedClass.getURI(), className)
            .subscribe(
                stResp => {
                    var newClass = this.deserializer.createURI(stResp.getElementsByTagName("Class")[0]);
                    newClass.setAdditionalProperty("children", []);
                    this.eventHandler.subClassCreatedEvent.emit({"resource": newClass, "parent": this.selectedClass});
                },
                err => { 
                    alert("Error: " + err);
                    console.error(err.stack);
                }
            );
    }
    
    public deleteClass() {
        this.owlService.removeClass(this.selectedClass.getURI())
            .subscribe(
                stResp => {
                    this.eventHandler.classDeletedEvent.emit(this.selectedClass);
                    this.selectedClass = null;
                    this.itemSelected.emit(undefined);
                },
                err => { 
                    alert("Error: " + err);
                    console.error(err.stack);
                }
            )
    }
    
    //EVENT LISTENERS
    private onNodeSelected(node:ARTURIResource) {
        this.selectedClass = node;
        this.itemSelected.emit(node);
    }
}