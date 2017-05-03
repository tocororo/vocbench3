import { Component, Input, Output, EventEmitter, ViewChild } from "@angular/core";
import { AbstractTreePanel } from "../../abstractTreePanel"
import { ClassTreeComponent } from "../classTree/classTreeComponent";
import { OwlServices } from "../../../services/owlServices";
import { ClassesServices } from "../../../services/classesServices";
import { DeleteServices } from "../../../services/deleteServices";
import { SearchServices } from "../../../services/searchServices";
import { CustomFormsServices } from "../../../services/customFormsServices";
import { ModalServices } from "../../../widget/modal/basicModal/modalServices";
import { CreationModalServices } from "../../../widget/modal/creationModal/creationModalServices";
import { ARTURIResource, ResAttribute, RDFResourceRolesEnum } from "../../../models/ARTResources";
import { RDF, OWL } from "../../../models/Vocabulary";
import { UIUtils } from "../../../utils/UIUtils";

@Component({
    selector: "class-tree-panel",
    templateUrl: "./classTreePanelComponent.html",
})
export class ClassTreePanelComponent extends AbstractTreePanel {
    @Input() hideSearch: boolean = false; //if true hide the search bar
    @Input() roots: ARTURIResource[]; //root classes

    @ViewChild(ClassTreeComponent) viewChildTree: ClassTreeComponent;

    rendering: boolean = false; //override the value in AbstractPanel

    constructor(private classesService: ClassesServices, private owlService: OwlServices,
        private deleteService: DeleteServices, private searchService: SearchServices, private creationModal: CreationModalServices,
        cfService: CustomFormsServices, modalService: ModalServices) {
        super(cfService, modalService);
    }

    //Top Bar commands handlers

    createRoot() {
        this.selectCustomForm(OWL.class).then(
            cfId => { 
                this.creationModal.newResourceCf("Create a new class", OWL.class, false, cfId).then(
                    (data: any) => {
                        this.classesService.createClass(data.uriResource, OWL.thing, cfId, data.cfValueMap).subscribe();
                    },
                    () => {}
                )
            }
        );
    }

    createChild() {
        this.selectCustomForm(OWL.class).then(
            cfId => { 
                this.creationModal.newResourceCf("Create a subClass of " + this.selectedNode.getShow(), OWL.class, false, cfId).then(
                    (data: any) => {
                        this.classesService.createClass(data.uriResource, this.selectedNode, cfId, data.cfValueMap).subscribe();
                    },
                    () => {}
                )
            }
        );
    }

    delete() {
        if (this.selectedNode.getAdditionalProperty(ResAttribute.NUM_INST) != 0) {
            this.modalService.alert("Operation denied", "Cannot delete " + this.selectedNode.getURI() +
                " since it has instance(s). Please delete the instance(s) and retry.", "warning");
            return;
        }
        UIUtils.startLoadingDiv(this.viewChildTree.blockDivElement.nativeElement);;
        this.deleteService.removeClass(this.selectedNode).subscribe(
            stResp => {
                this.selectedNode = null;
                this.nodeSelected.emit(this.selectedNode);
                UIUtils.stopLoadingDiv(this.viewChildTree.blockDivElement.nativeElement);
            },
            err => { UIUtils.stopLoadingDiv(this.viewChildTree.blockDivElement.nativeElement); }
        );
    }

    refresh() {
        this.selectedNode = null; //instance list refresh automatically after this since it listen for changes on cls
        this.nodeSelected.emit(this.selectedNode);
        this.viewChildTree.initTree();
    }

    //search handlers

    doSearch(searchedText: string) {
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

}