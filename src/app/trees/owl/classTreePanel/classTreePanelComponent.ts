import {Component, Input, Output, EventEmitter, ViewChild} from "@angular/core";
import {ClassTreeComponent} from "../classTree/classTreeComponent";
import {InstanceListComponent} from "../instanceList/instanceListComponent";
import {SearchServices} from "../../../services/searchServices";
import {OwlServices} from "../../../services/owlServices";
import {DeleteServices} from "../../../services/deleteServices";
import {ModalServices} from "../../../widget/modal/modalServices";
import {ARTURIResource, ResAttribute, RDFResourceRolesEnum} from "../../../utils/ARTResources";
import {RDF, OWL} from "../../../utils/Vocabulary";

/**
 * While classTreeComponent has as @Input rootClasses this componente cannot
 * because if it allows multiple roots, when the user wants to add a class (not a sublcass)
 * I don't know wich class consider as superClass of the new added class
 */

@Component({
	selector: "class-tree-panel",
	templateUrl: "./classTreePanelComponent.html",
})
export class ClassTreePanelComponent {
    @Output() nodeSelected = new EventEmitter<ARTURIResource>();
    @Output() instanceSelected = new EventEmitter<ARTURIResource>();
    
    @ViewChild(ClassTreeComponent) viewChildTree: ClassTreeComponent;
    @ViewChild(InstanceListComponent) viewChildInstanceList: InstanceListComponent;

    private rendering: boolean = true; //if true the nodes in the tree should be rendered with the show, with the qname otherwise
    
    private selectedClass:ARTURIResource;
    private selectedInstance:ARTURIResource;
    
	constructor(private owlService:OwlServices, private searchService: SearchServices, private deleteService: DeleteServices, 
        private modalService: ModalServices) {}
    
    private createClass() {
        //currently uses prompt instead of newResource since createClass service doesn't allow to provide a label
        this.modalService.prompt("Create new owl:Class", "Name", null, false, true).then(
            (result: any) => {
                this.viewChildTree.blockDivElement.nativeElement.style.display = "block";
                this.owlService.createClass(OWL.thing, result).subscribe(
                    stResp => this.viewChildTree.blockDivElement.nativeElement.style.display = "none",
                    err => this.viewChildTree.blockDivElement.nativeElement.style.display = "none"
                );
            },
            () => {}
        );
        
    }
    
    private createSubClass() {
        //currently uses prompt instead of newResource since createClass service doesn't allow to provide a label
        this.modalService.prompt("Create new owl:Class", "Name", null, false, true).then(
            (result: any) => {
                this.viewChildTree.blockDivElement.nativeElement.style.display = "block";
                this.owlService.createClass(this.selectedClass, result).subscribe(
                    stResp => this.viewChildTree.blockDivElement.nativeElement.style.display = "none",
                    err => this.viewChildTree.blockDivElement.nativeElement.style.display = "none"
                );
            },
            () => {}
        );
    }
    
    private deleteClass() {
        if (this.selectedClass.getAdditionalProperty(ResAttribute.NUM_INST) != 0) {
            this.modalService.alert("Operation denied", "Cannot delete " + this.selectedClass.getURI() + 
                " since it has instance(s). Please delete the instance(s) and retry.", "warning");
            return;
        }
        this.viewChildTree.blockDivElement.nativeElement.style.display = "block";
        this.deleteService.removeClass(this.selectedClass).subscribe(
            stResp => {
                this.selectedClass = null;
                this.nodeSelected.emit(undefined);
                this.viewChildTree.blockDivElement.nativeElement.style.display = "none";
            },
            err => { this.viewChildTree.blockDivElement.nativeElement.style.display = "none"; }
        );
    }
    
    private createInstance() {
        //currently uses prompt instead of newResource since createInstance service doesn't allow to provide a label
        this.modalService.prompt("Create new instance", "Name", null, false, true).then(
            (result: any) => {
                this.viewChildInstanceList.blockDivElement.nativeElement.style.display = "block";
                this.owlService.createInstance(this.selectedClass, result).subscribe(
                    stResp => this.viewChildInstanceList.blockDivElement.nativeElement.style.display = "none",
                    err => this.viewChildInstanceList.blockDivElement.nativeElement.style.display = "none"
                );
            },
            () => {}
        );
    }
    
    private deleteInstance() {
        this.viewChildInstanceList.blockDivElement.nativeElement.style.display = "block";
        this.deleteService.removeInstance(this.selectedInstance, this.selectedClass).subscribe(
            stResp => {
                this.selectedInstance = null;
                this.instanceSelected.emit(undefined);
                //no more selected instance => select the class, so the resource view show the description of this class
                if (this.selectedClass != null) {
                    this.nodeSelected.emit(this.selectedClass);
                }
                this.viewChildInstanceList.blockDivElement.nativeElement.style.display = "none";
            },
            err => { this.viewChildInstanceList.blockDivElement.nativeElement.style.display = "none"; }
        )
    }
    
    private doSearch(searchedText: string) {
        if (searchedText.trim() == "") {
            this.modalService.alert("Search", "Please enter a valid string to search", "error");
        } else {
            this.searchService.searchResource(searchedText, [RDFResourceRolesEnum.cls, RDFResourceRolesEnum.individual], true, true, "contain").subscribe(
                searchResult => {
                    if (searchResult.length == 0) {
                        this.modalService.alert("Search", "No results found for '" + searchedText + "'", "warning");
                    } else { //1 or more results
                        if (searchResult.length == 1) {
                            this.selectSearchedResource(searchResult[0]);
                        } else { //multiple results, ask the user which one select
                            this.modalService.selectResource("Search", searchResult.length + " results found.", searchResult).then(
                                (selectedResource: any) => {
                                    this.selectSearchedResource(selectedResource);
                                },
                                () => {}
                            );
                        }
                    }
                }
            );
        }
    }
    
    /**
     * If resource is a class expands the class tree and select the resource,
     * otherwise (resource is an instance) expands the class tree to the class of the instance and
     * select the instance in the instance list
     */
    private selectSearchedResource(resource: ARTURIResource) {
        if (resource.getRole() == RDFResourceRolesEnum.cls) {
            this.viewChildTree.openTreeAt(resource);
        } else { // resource is an instance
            //get type of instance, then open the tree to that class
            this.owlService.getDirectNamedTypes(resource).subscribe(
                types => {
                    this.viewChildTree.openTreeAt(types[0]);
                    //center instanceList to the individual
                    this.viewChildInstanceList.selectSearchedInstance(types[0], resource);
                }
            )
        }
    }
    
    /**
     * Handles the keydown event in search text field (when enter key is pressed execute the search)
     */
    private searchKeyHandler(key: number, searchedText: string) {
        if (key == 13) {
            this.doSearch(searchedText);           
        }
    }

    private refresh() {
        this.selectedClass = null; //instance list refresh automatically after this since it listen for changes on cls
        this.viewChildTree.initTree();
    }

    // private onMousedown() {
    //     this.onMousemove = this.draggingHandler;
    // }
    // private onMouseup() {
    //     this.onMousemove = (event: MouseEvent) => {};
    // }
    // private onMousemove(event: MouseEvent) {}
    // private draggingHandler(event: MouseEvent) {
    //     console.log(event.clientY);
    //     //TODO change dimension of classtree and instancetree
    // }
    
    //EVENT LISTENERS
    private onClassSelected(cls:ARTURIResource) {
        this.selectedClass = cls;
        if (this.selectedInstance != null) {
            this.selectedInstance.setAdditionalProperty(ResAttribute.SELECTED, false);
            this.selectedInstance = null;    
        }
        this.nodeSelected.emit(cls);
    }
    
    private onInstanceSelected(instance:ARTURIResource) {
        this.selectedInstance = instance;
        this.instanceSelected.emit(instance);
    }

}