import {Component, Input, Output, EventEmitter, ViewChild} from "angular2/core";
import {ClassTreeComponent} from "../classTree/classTreeComponent";
import {InstanceListComponent} from "../instanceList/instanceListComponent";
import {SearchServices} from "../../services/searchServices";
import {OwlServices} from "../../services/owlServices";
import {ARTURIResource} from "../../utils/ARTResources";

@Component({
	selector: "class-tree-panel",
	templateUrl: "app/src/owl/classTreePanel/classTreePanelComponent.html",
	directives: [ClassTreeComponent, InstanceListComponent],
    providers: [OwlServices, SearchServices],
})
export class ClassTreePanelComponent {
    @Input('rootclass') rootClass:ARTURIResource;
    @Output() classSelected = new EventEmitter<ARTURIResource>();
    @Output() instanceSelected = new EventEmitter<ARTURIResource>();
    
    @ViewChild(ClassTreeComponent) viewChildTree: ClassTreeComponent;
    
    private selectedClass:ARTURIResource;
    private selectedInstance:ARTURIResource;
    
	constructor(private owlService:OwlServices, private searchService: SearchServices) {}
    
    ngOnInit() {
        if (this.rootClass == undefined) {
            this.rootClass = new ARTURIResource("http://www.w3.org/2002/07/owl#Thing", "owl:Thing", "cls");
        }
    }
    
    private createClass() {
        var className = prompt("Insert class name");
        if (className == null) return;
        this.owlService.createClass(this.rootClass.getURI(), className).subscribe(
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
        this.owlService.createClass(this.selectedClass.getURI(), className).subscribe(
            stResp => {},
            err => {
                alert("Error: " + err);
                console.error(err['stack']);
            }
        );
    }
    
    private deleteClass() {
        this.owlService.removeClass(this.selectedClass.getURI()).subscribe(
            stResp => {
                this.selectedClass = null;
                this.classSelected.emit(undefined);
            },
            err => {
                alert("Error: " + err);
                console.error(err['stack']);
            }
        );
    }
    
    private createInstance() {
        var instanceName = prompt("Insert instance name");
        if (instanceName == null) return;
        this.owlService.createInstance(this.selectedClass.getURI(), instanceName).subscribe(
            stResp => {},
            err => {
                alert("Error: " + err);
                console.error(err['stack']);
            }
        );
    }
    
    private deleteInstance() {
        this.owlService.removeInstance(this.selectedInstance.getURI(), this.selectedClass.getURI()).subscribe(
            stResp => {
                this.selectedInstance = null;
                this.instanceSelected.emit(undefined);
            }
        )
    }
    
    private doSearch(searchedText: string) {
        this.searchService.searchResource(searchedText, ["cls"], true, "contain").subscribe(
            searchResult => {
                if (searchResult.length == 0) {
                    alert("No results found for '" + searchedText + "'");
                } else if (searchResult.length == 1) {
                    this.viewChildTree.openTreeAt(searchResult[0]);
                } else {
                    //modal dialog still not available, so it's not possible to let the user choose which result prefer
                    alert(searchResult.length + " results found. This function is currently not available for multiple results");
                }
                
            },
            err => {
                alert("Error: " + err);
                console.error(err['stack']);
            });
    }
    
    /**
     * Handles the keypress event in search text field (when enter key is pressed execute the search)
     */
    private searchKeyHandler(keyIdentifier, searchedText) {
        if (keyIdentifier == "Enter") {
            if (searchedText.trim() == "") {
                alert("Please enter a valid string to search");
            } else {
                this.doSearch(searchedText);           
            }
        }
    }
    
    //EVENT LISTENERS
    private onClassSelected(cls:ARTURIResource) {
        this.selectedClass = cls;
        this.classSelected.emit(cls);
    }
    
    private onInstanceSelected(instance:ARTURIResource) {
        this.selectedInstance = instance;
        this.instanceSelected.emit(instance);
    }
}