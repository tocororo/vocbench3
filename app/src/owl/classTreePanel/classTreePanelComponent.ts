import {Component, Input, Output, EventEmitter} from "angular2/core";
import {ClassTreeComponent} from "../../tree/classTree/classTreeComponent";
import {OwlServices} from "../../services/owlServices";
import {ARTURIResource} from "../../utils/ARTResources";

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
    
	constructor(private owlService:OwlServices) {}
    
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
                stResp => {},
                err => { 
                    alert("Error: " + err);
                    console.error(err['stack']);
                }
            );
    }
    
    private createSubClass() {
        var className = prompt("Insert class name");
        if (className == null) return;
        this.owlService.createClass(this.selectedClass.getURI(), className)
            .subscribe(
                stResp => {},
                err => { 
                    alert("Error: " + err);
                    console.error(err['stack']);
                }
            );
    }
    
    private deleteClass() {
        this.owlService.removeClass(this.selectedClass.getURI())
            .subscribe(
                stResp => {
                    this.selectedClass = null;
                    this.itemSelected.emit(undefined);
                },
                err => { 
                    alert("Error: " + err);
                    console.error(err['stack']);
                }
            )
    }
    
    //EVENT LISTENERS
    private onNodeSelected(node:ARTURIResource) {
        this.selectedClass = node;
        this.itemSelected.emit(node);
    }
}