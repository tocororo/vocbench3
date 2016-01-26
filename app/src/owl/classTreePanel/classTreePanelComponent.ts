import {Component, Input} from "angular2/core";
import {ClassTreeComponent} from "../../tree/classTree/classTreeComponent";
import {OwlServices} from "../../services/owlServices";
import {ARTURIResource} from "../../utils/ARTResources";
import {VBEventHandler} from "../../utils/VBEventHandler";
import {Deserializer} from "../../utils/Deserializer";
import {STResponseUtils} from "../../utils/STResponseUtils";

@Component({
	selector: "class-tree-panel",
	templateUrl: "app/src/owl/classTreePanel/classTreePanelComponent.html",
	directives: [ClassTreeComponent],
    providers: [OwlServices]
})
export class ClassTreePanelComponent {
    @Input('rootclass') rootClass:ARTURIResource;
    
    private selectedClass:ARTURIResource;
    private subscrNodeSelected;
    
	constructor(private owlService:OwlServices, private deserializer:Deserializer, private respUtils:STResponseUtils, 
            private eventHandler:VBEventHandler) {
        this.subscrNodeSelected = eventHandler.classTreeNodeSelectedEvent.subscribe(node => this.onNodeSelected(node)); 
    }
    
    ngOnInit() {
        if (this.rootClass == undefined) {
            this.rootClass = new ARTURIResource("http://www.w3.org/2002/07/owl#Thing", "owl:Thing", "cls");
        }
    }
    
    ngOnDestroy() {
        this.subscrNodeSelected.unsubscribe();
    }
    
    public createClass() {
        var className = prompt("Insert class name");
        if (className == null) return;
        this.owlService.createClass(this.rootClass.getURI(), className)
            .subscribe(
                stResp => {
                    if (this.respUtils.isException(stResp)) { //when class already exists
                        alert(this.respUtils.getExceptionMessage(stResp));
                    } else {
                        var newClass = this.deserializer.createURI(stResp.getElementsByTagName("Class")[0]);
                        newClass.setAdditionalProperty("children", []);
                        this.eventHandler.subClassCreatedEvent.emit({"resource": newClass, "parent": this.rootClass});
                    }
                }
            );
    }
    
    public createSubClass() {
        var className = prompt("Insert class name");
        if (className == null) return;
        this.owlService.createClass(this.selectedClass.getURI(), className)
            .subscribe(
                stResp => {
                    if (this.respUtils.isException(stResp)) { //when class already exists
                        alert(this.respUtils.getExceptionMessage(stResp));
                    } else {
                        var newClass = this.deserializer.createURI(stResp.getElementsByTagName("Class")[0]);
                        newClass.setAdditionalProperty("children", []);
                        this.eventHandler.subClassCreatedEvent.emit({"resource": newClass, "parent": this.selectedClass});
                    }
                }
            );
    }
    
    public deleteClass() {
        this.owlService.deleteClass(this.selectedClass.getURI())
            .subscribe(
                stResp => {
                    if (this.respUtils.isFail(stResp)) { //when class has subClasses
                        alert(this.respUtils.getFailMessage(stResp));
                    } else {
                        this.eventHandler.classDeletedEvent.emit(this.selectedClass);
                        this.selectedClass = null;
                    }
                }
            )
    }
    
    //EVENT LISTENERS
    
    private onNodeSelected(node:ARTURIResource) {
        this.selectedClass = node;
    }
}