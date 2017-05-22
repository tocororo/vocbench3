import { Component, Input, Output, EventEmitter, ViewChild } from "@angular/core";
import { AbstractTreePanel } from "../../abstractTreePanel"
import { ClassTreeComponent } from "../classTree/classTreeComponent";
import { OwlServices } from "../../../services/owlServices";
import { ClassesServices } from "../../../services/classesServices";
import { DeleteServices } from "../../../services/deleteServices";
import { SearchServices } from "../../../services/searchServices";
import { CustomFormsServices } from "../../../services/customFormsServices";
import { BasicModalServices } from "../../../widget/modal/basicModal/basicModalServices";
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
        private deleteService: DeleteServices, private searchService: SearchServices, private creationModals: CreationModalServices,
        cfService: CustomFormsServices, basicModals: BasicModalServices) {
        super(cfService, basicModals);
    }

    //Top Bar commands handlers

    createRoot() {
        this.creationModals.newResourceCf("Create a new class", OWL.class, false).then(
            (data: any) => {
                this.classesService.createClass(data.uriResource, OWL.thing, data.cfId, data.cfValueMap).subscribe();
            },
            () => {}
        );
    }

    createChild() {
        this.creationModals.newResourceCf("Create a subClass of " + this.selectedNode.getShow(), OWL.class, false).then(
            (data: any) => {
                this.classesService.createClass(data.uriResource, this.selectedNode, data.cfId, data.cfValueMap).subscribe();
            },
            () => {}
        );
    }

    delete() {
        if (this.selectedNode.getAdditionalProperty(ResAttribute.NUM_INST) != 0) {
            this.basicModals.alert("Operation denied", "Cannot delete " + this.selectedNode.getURI() +
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
            this.basicModals.alert("Search", "Please enter a valid string to search", "error");
        } else {
            UIUtils.startLoadingDiv(this.viewChildTree.blockDivElement.nativeElement);
            this.searchService.searchResource(searchedText, [RDFResourceRolesEnum.cls], true, true, "contain").subscribe(
                searchResult => {
                    UIUtils.stopLoadingDiv(this.viewChildTree.blockDivElement.nativeElement);
                    if (searchResult.length == 0) {
                        this.basicModals.alert("Search", "No results found for '" + searchedText + "'", "warning");
                    } else { //1 or more results
                        if (searchResult.length == 1) {
                            this.openTreeAt(searchResult[0]);
                        } else { //multiple results, ask the user which one select
                            this.basicModals.selectResource("Search", searchResult.length + " results found.", searchResult).then(
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