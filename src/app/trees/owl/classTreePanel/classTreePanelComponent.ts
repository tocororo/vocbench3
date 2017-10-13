import { Component, Input, Output, EventEmitter, ViewChild } from "@angular/core";
import { AbstractTreePanel } from "../../abstractTreePanel"
import { ClassTreeComponent } from "../classTree/classTreeComponent";
import { ClassesServices } from "../../../services/classesServices";
import { SearchServices } from "../../../services/searchServices";
import { CustomFormsServices } from "../../../services/customFormsServices";
import { BasicModalServices } from "../../../widget/modal/basicModal/basicModalServices";
import { CreationModalServices } from "../../../widget/modal/creationModal/creationModalServices";
import { ARTURIResource, ResAttribute, RDFResourceRolesEnum, ResourceUtils } from "../../../models/ARTResources";
import { RDF, OWL } from "../../../models/Vocabulary";
import { VBProperties, SearchSettings } from "../../../utils/VBProperties";
import { UIUtils } from "../../../utils/UIUtils";
import { VBEventHandler } from "../../../utils/VBEventHandler";
import { AuthorizationEvaluator } from "../../../utils/AuthorizationEvaluator";

@Component({
    selector: "class-tree-panel",
    templateUrl: "./classTreePanelComponent.html",
})
export class ClassTreePanelComponent extends AbstractTreePanel {
    @Input() hideSearch: boolean = false; //if true hide the search bar
    @Input() roots: ARTURIResource[]; //root classes

    @ViewChild(ClassTreeComponent) viewChildTree: ClassTreeComponent;

    panelRole: RDFResourceRolesEnum = RDFResourceRolesEnum.cls;
    rendering: boolean = false; //override the value in AbstractPanel

    constructor(private classesService: ClassesServices, private searchService: SearchServices, private creationModals: CreationModalServices,
        private vbProp: VBProperties, cfService: CustomFormsServices, basicModals: BasicModalServices, eventHandler: VBEventHandler) {
        super(cfService, basicModals, eventHandler);
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
        if (this.selectedNode.getAdditionalProperty(ResAttribute.MORE)) {
            this.basicModals.alert("Operation denied", "Cannot delete " + this.selectedNode.getURI() + 
                " since it has subClass(es). Please delete the subClass(es) and retry", "warning");
            return;
        }
        UIUtils.startLoadingDiv(this.viewChildTree.blockDivElement.nativeElement);;
        this.classesService.deleteClass(this.selectedNode).subscribe(
            stResp => {
                this.nodeDeleted.emit(this.selectedNode);
                this.selectedNode = null;
                UIUtils.stopLoadingDiv(this.viewChildTree.blockDivElement.nativeElement);
            }
        );
    }

    refresh() {
        this.selectedNode = null; //instance list refresh automatically after this since it listen for changes on cls
        this.nodeSelected.emit(this.selectedNode); //emit nodeSelected with node null, so classIndividualTreePanel reset the instance list
        this.viewChildTree.initTree();
    }

    //search handlers

    doSearch(searchedText: string) {
        if (searchedText.trim() == "") {
            this.basicModals.alert("Search", "Please enter a valid string to search", "error");
        } else {
            let searchSettings: SearchSettings = this.vbProp.getSearchSettings();
            UIUtils.startLoadingDiv(this.viewChildTree.blockDivElement.nativeElement);
            this.searchService.searchResource(searchedText, [RDFResourceRolesEnum.cls], searchSettings.useLocalName, searchSettings.useURI,
                searchSettings.stringMatchMode).subscribe(
                searchResult => {
                    UIUtils.stopLoadingDiv(this.viewChildTree.blockDivElement.nativeElement);
                    if (searchResult.length == 0) {
                        this.basicModals.alert("Search", "No results found for '" + searchedText + "'", "warning");
                    } else { //1 or more results
                        if (searchResult.length == 1) {
                            this.openTreeAt(searchResult[0]);
                        } else { //multiple results, ask the user which one select
                            ResourceUtils.sortResources(searchResult, this.rendering ? "show" : "value");
                            this.basicModals.selectResource("Search", searchResult.length + " results found.", searchResult, this.rendering).then(
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