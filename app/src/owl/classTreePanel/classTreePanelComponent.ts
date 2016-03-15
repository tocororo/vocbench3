import {Component, Input, Output, EventEmitter, ViewChild} from "angular2/core";
import {ClassTreeComponent} from "../classTree/classTreeComponent";
import {InstanceListComponent} from "../instanceList/instanceListComponent";
import {SearchServices} from "../../services/searchServices";
import {OwlServices} from "../../services/owlServices";
import {ModalServices} from "../../widget/modal/modalServices";
import {ARTURIResource} from "../../utils/ARTResources";

@Component({
	selector: "class-tree-panel",
	templateUrl: "app/src/owl/classTreePanel/classTreePanelComponent.html",
	directives: [ClassTreeComponent, InstanceListComponent],
    providers: [OwlServices, SearchServices, ModalServices],
})
export class ClassTreePanelComponent {
    @Input('rootclass') rootClass:ARTURIResource;
    @Output() classSelected = new EventEmitter<ARTURIResource>();
    @Output() instanceSelected = new EventEmitter<ARTURIResource>();
    
    @ViewChild(ClassTreeComponent) viewChildTree: ClassTreeComponent;
    @ViewChild(InstanceListComponent) viewChildInstanceList: InstanceListComponent;
    
    private selectedClass:ARTURIResource;
    private selectedInstance:ARTURIResource;
    
	constructor(private owlService:OwlServices, private searchService: SearchServices, private modalService: ModalServices) {}
    
    ngOnInit() {
        if (this.rootClass == undefined) {
            this.rootClass = new ARTURIResource("http://www.w3.org/2002/07/owl#Thing", "owl:Thing", "cls");
        }
    }
    
    private createClass() {
        //currently uses prompt instead of newResource since createClass service doesn't allow to provide a label
        this.modalService.prompt("Create new owl:Class", "Name").then(
            resultPromise => {
                return resultPromise.result.then(
                    result => {
                        this.owlService.createClass(this.rootClass, result).subscribe(
                            stResp => {},
                            err => {
                                alert("Error: " + err);
                                console.error(err['stack']);
                            }
                        );
                    }
                );
            }
        );
        
    }
    
    private createSubClass() {
        //currently uses prompt instead of newResource since createClass service doesn't allow to provide a label
        this.modalService.prompt("Create new owl:Class", "Name").then(
            resultPromise => {
                return resultPromise.result.then(
                    result => {
                        this.owlService.createClass(this.selectedClass, result).subscribe(
                            stResp => {},
                            err => {
                                alert("Error: " + err);
                                console.error(err['stack']);
                            }
                        );
                    }
                );
            }
        );
    }
    
    private deleteClass() {
        if (this.selectedClass.getAdditionalProperty("numInst") != 0) {
            alert("Cannot delete " + this.selectedClass.getURI() + " since it has instance(s). Please delete the instance(s) and retry.");
            return;
        }
        this.owlService.removeClass(this.selectedClass).subscribe(
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
        //currently uses prompt instead of newResource since createInstance service doesn't allow to provide a label
        this.modalService.prompt("Create new instance", "Name").then(
            resultPromise => {
                return resultPromise.result.then(
                    result => {
                        this.owlService.createInstance(this.selectedClass, result).subscribe(
                            stResp => {},
                            err => {
                                alert("Error: " + err);
                                console.error(err['stack']);
                            }
                        );
                    }
                );
            }
        );
    }
    
    private deleteInstance() {
        this.owlService.removeInstance(this.selectedInstance, this.selectedClass).subscribe(
            stResp => {
                this.selectedInstance = null;
                this.instanceSelected.emit(undefined);
                //no more selected instance => select the class, so the resource view show the description of this class
                if (this.selectedClass != null) {
                    this.classSelected.emit(this.selectedClass);
                }
            }
        )
    }
    
    private doSearch(searchedText: string) {
        this.searchService.searchResource(searchedText, ["cls", "individual"], true, "contain").subscribe(
            searchResult => {
                if (searchResult.length == 0) {
                    alert("No results found for '" + searchedText + "'");
                } else if (searchResult.length == 1) {
                    if (searchResult[0].getRole() == "cls") {
                        this.viewChildTree.openTreeAt(searchResult[0]);    
                    } else { // role "individual"
                        //get type of individual, then open the tree to that class
                        this.owlService.getDirectNamedTypes(searchResult[0]).subscribe(
                            types => {
                                this.viewChildTree.openTreeAt(types[0]);
                                //center instanceList to the individual
                                this.viewChildInstanceList.selectSearchedInstance(types[0], searchResult[0]);
                            }
                        )
                    }
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
        if (this.selectedInstance != null) {
            this.selectedInstance.setAdditionalProperty("selected", false);
            this.selectedInstance = null;    
        }
        this.classSelected.emit(cls);
    }
    
    private onInstanceSelected(instance:ARTURIResource) {
        this.selectedInstance = instance;
        this.instanceSelected.emit(instance);
    }
}