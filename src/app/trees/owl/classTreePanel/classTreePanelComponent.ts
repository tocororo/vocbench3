import { Component, Input, Output, EventEmitter, ViewChild } from "@angular/core";
import { ClassTreeComponent } from "../classTree/classTreeComponent";
import { OwlServices } from "../../../services/owlServices";
import { DeleteServices } from "../../../services/deleteServices";
import { SearchServices } from "../../../services/searchServices";
import { ModalServices } from "../../../widget/modal/modalServices";
import { ARTURIResource, ResAttribute, RDFResourceRolesEnum } from "../../../models/ARTResources";
import { RDF, OWL } from "../../../models/Vocabulary";
import { UIUtils } from "../../../utils/UIUtils";

@Component({
    selector: "class-tree-panel",
    templateUrl: "./classTreePanelComponent.html",
})
export class ClassTreePanelComponent {
    @Input() editable: boolean = true; //if true show the buttons to edit the tree
    @Input() hideSearch: boolean = false; //if true hide the search bar
    @Input() roots: ARTURIResource[]; //root classes
    @Output() nodeSelected = new EventEmitter<ARTURIResource>();

    @ViewChild(ClassTreeComponent) viewChildTree: ClassTreeComponent;

    private rendering: boolean = false; //if true the nodes in the tree should be rendered with the show, with the qname otherwise

    private selectedClass: ARTURIResource;

    constructor(private owlService: OwlServices, private deleteService: DeleteServices, private searchService: SearchServices,
        private modalService: ModalServices) { }

    //Top Bar commands handlers

    private createClass() {
        //currently uses prompt instead of newResource since createClass service doesn't allow to provide a label
        this.modalService.prompt("Create new owl:Class", "Name", null, null, false, true).then(
            (result: any) => {
                UIUtils.startLoadingDiv(this.viewChildTree.blockDivElement.nativeElement);
                this.owlService.createClass(OWL.thing, result).subscribe(
                    stResp => UIUtils.stopLoadingDiv(this.viewChildTree.blockDivElement.nativeElement),
                    err => UIUtils.stopLoadingDiv(this.viewChildTree.blockDivElement.nativeElement)
                );
            },
            () => { }
        );
    }

    private createSubClass() {
        //currently uses prompt instead of newResource since createClass service doesn't allow to provide a label
        this.modalService.prompt("Create new owl:Class", "Name", null, null, false, true).then(
            (result: any) => {
                UIUtils.startLoadingDiv(this.viewChildTree.blockDivElement.nativeElement);;
                this.owlService.createClass(this.selectedClass, result).subscribe(
                    stResp => UIUtils.stopLoadingDiv(this.viewChildTree.blockDivElement.nativeElement),
                    err => UIUtils.stopLoadingDiv(this.viewChildTree.blockDivElement.nativeElement)
                );
            },
            () => { }
        );
    }

    private deleteClass() {
        if (this.selectedClass.getAdditionalProperty(ResAttribute.NUM_INST) != 0) {
            this.modalService.alert("Operation denied", "Cannot delete " + this.selectedClass.getURI() +
                " since it has instance(s). Please delete the instance(s) and retry.", "warning");
            return;
        }
        UIUtils.startLoadingDiv(this.viewChildTree.blockDivElement.nativeElement);;
        this.deleteService.removeClass(this.selectedClass).subscribe(
            stResp => {
                this.selectedClass = null;
                this.nodeSelected.emit(this.selectedClass);
                UIUtils.stopLoadingDiv(this.viewChildTree.blockDivElement.nativeElement);
            },
            err => { UIUtils.stopLoadingDiv(this.viewChildTree.blockDivElement.nativeElement); }
        );
    }

    private refresh() {
        this.selectedClass = null; //instance list refresh automatically after this since it listen for changes on cls
        this.nodeSelected.emit(this.selectedClass);
        this.viewChildTree.initTree();
    }

    //search handlers

    /**
     * Handles the keydown event in search text field (when enter key is pressed execute the search)
     */
    private searchKeyHandler(key: number, searchedText: string) {
        if (key == 13) {
            this.doSearch(searchedText);
        }
    }

    private doSearch(searchedText: string) {
        if (searchedText.trim() == "") {
            this.modalService.alert("Search", "Please enter a valid string to search", "error");
        } else {
            this.searchService.searchResource(searchedText, [RDFResourceRolesEnum.cls], true, true, "contain").subscribe(
                searchResult => {
                    if (searchResult.length == 0) {
                        this.modalService.alert("Search", "No results found for '" + searchedText + "'", "warning");
                    } else { //1 or more results
                        if (searchResult.length == 1) {
                            this.openTreeAt(searchResult[0]);
                        } else { //multiple results, ask the user which one select
                            this.modalService.selectResource("Search", searchResult.length + " results found.", searchResult).then(
                                (selectedResource: any) => {
                                    this.openTreeAt(selectedResource);
                                },
                                () => { }
                            );
                        }
                    }
                }
            );
        }
    }

    //this is public so it can be invoked from classIndividualTreePanelComponent
    openTreeAt(cls: ARTURIResource) {
        this.viewChildTree.openTreeAt(cls);
    }

    //EVENT LISTENERS
    private onNodeSelected(node: ARTURIResource) {
        this.selectedClass = node;
        this.nodeSelected.emit(node);
    }

}