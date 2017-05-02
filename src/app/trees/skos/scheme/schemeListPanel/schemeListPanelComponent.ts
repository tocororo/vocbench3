import { Component, Output, EventEmitter } from "@angular/core";
import { AbstractPanel } from "../../../abstractPanel"
import { SkosServices } from "../../../../services/skosServices";
import { SkosxlServices } from "../../../../services/skosxlServices";
import { SearchServices } from "../../../../services/searchServices";
import { CustomFormsServices } from "../../../../services/customFormsServices";
import { ModalServices } from "../../../../widget/modal/basicModal/modalServices";
import { CreationModalServices } from "../../../../widget/modal/creationModal/creationModalServices";
import { VBContext } from '../../../../utils/VBContext';
import { VBPreferences } from '../../../../utils/VBPreferences';
import { VBEventHandler } from "../../../../utils/VBEventHandler";
import { ARTURIResource, ResAttribute, RDFResourceRolesEnum, ResourceUtils } from "../../../../models/ARTResources";
import { SKOS } from "../../../../models/Vocabulary";

@Component({
    selector: "scheme-list-panel",
    templateUrl: "./schemeListPanelComponent.html",
})
export class SchemeListPanelComponent extends AbstractPanel {

    private schemeList: ARTURIResource[];
    private activeScheme: ARTURIResource;

    private ONTO_TYPE: string;

    constructor(private skosService: SkosServices, private skosxlService: SkosxlServices, private searchService: SearchServices,
        private eventHandler: VBEventHandler, private preferences: VBPreferences, private creationModal: CreationModalServices,
        cfService: CustomFormsServices, modalService: ModalServices) {
        super(cfService, modalService);
        this.eventSubscriptions.push(eventHandler.refreshDataBroadcastEvent.subscribe(() => this.initList()));
    }

    ngOnInit() {
        this.ONTO_TYPE = VBContext.getWorkingProject().getPrettyPrintOntoType();
        this.activeScheme = this.preferences.getActiveScheme();
        this.initList();
    }

    private initList() {
        this.selectedNode = null;
        this.skosService.getAllSchemes().subscribe( //new service
            schemeList => {
                //sort by show if rendering is active, uri otherwise
                let attribute: "show" | "value" = this.rendering ? "show" : "value";
                ResourceUtils.sortResources(schemeList, attribute);
                this.schemeList = schemeList;
            }
        );
    }

    private create() {
        this.selectCustomForm(SKOS.conceptScheme).then(
            cfId => { this.createScheme(cfId); }
        );
    }

    private createScheme(cfId?: string) {
        this.creationModal.newSkosResourceCf("Create new skos:ConceptScheme", SKOS.conceptScheme).then(
            (res: any) => {
                console.log("returned data ", res);
                if (this.ONTO_TYPE == "SKOS") {
                    this.skosService.createConceptScheme(res.label, res.uriResource, res.cls, res.cfId, res.cfValueMap).subscribe(
                        newScheme => { this.schemeList.push(newScheme); },
                        err => { }
                    );
                } else { //SKOSXL
                    this.skosxlService.createConceptScheme(res.label, res.uriResource, res.cls, res.cfId, res.cfValueMap).subscribe(
                        newScheme => { this.schemeList.push(newScheme); },
                        err => { }
                    );
                }
            },
            () => { }
        );
    }

    delete() {
        if (this.ONTO_TYPE == "SKOS") {
            this.skosService.deleteScheme(this.selectedNode).subscribe(
                stResp => this.deleteSchemeRespHandler(stResp),
                err => this.deleteNotEmptySchemeHandler()
            );
        } else { //SKOSXL
            this.skosxlService.deleteScheme(this.selectedNode).subscribe(
                stResp => this.deleteSchemeRespHandler(stResp),
                err => this.deleteNotEmptySchemeHandler()
            );
        }
    }

    private deleteNotEmptySchemeHandler() {
        var retainOpt = "Retain dangling concepts";
        var deleteOpt = "Delete dangling concepts";
        this.modalService.select("Delete scheme", "The operation will produce dangling concepts"
            + " because the scheme is not empty. What do you want to do?", [retainOpt, deleteOpt]).then(
            (selection: any) => {
                var deleteDanglingConc = selection == deleteOpt;
                if (this.ONTO_TYPE == "SKOS") {
                    this.skosService.deleteScheme(this.selectedNode, deleteDanglingConc).subscribe(
                        stResp => this.deleteSchemeRespHandler(stResp)
                    );
                } else { //SKOSXL
                    this.skosxlService.deleteScheme(this.selectedNode, deleteDanglingConc).subscribe(
                        stResp => this.deleteSchemeRespHandler(stResp)
                    );
                }
            },
            () => { }
            );
    }

    /**
     * Handles the scheme deletion
     */
    private deleteSchemeRespHandler(stResp: any) {
        for (var i = 0; i < this.schemeList.length; i++) {//Update the schemeList
            if (this.schemeList[i].getURI() == this.selectedNode.getURI()) {
                this.schemeList.splice(i, 1);
                break;
            }
        }
        //reset the activeScheme if the deleted was the active one
        if (this.activeScheme != undefined && (this.selectedNode.getURI() == this.activeScheme.getURI())) {
            this.activeScheme = null;
            this.preferences.setActiveScheme(this.activeScheme);
        }
        this.selectedNode = null;
        this.nodeSelected.emit(undefined);
    }

    private activateScheme(scheme: ARTURIResource) {
        //if the scheme that is trying to activate it was already active, pass to no-scheme mode
        if (this.activeScheme != undefined && this.activeScheme.getURI() == scheme.getURI()) {
            this.activeScheme = null;
            this.preferences.setActiveScheme(this.activeScheme);
        } else {
            this.activeScheme = scheme;
            this.preferences.setActiveScheme(this.activeScheme);
        }
    }

    private isActive(scheme: ARTURIResource) {
        return (this.activeScheme && scheme.getURI() == this.activeScheme.getURI());
    }

    /**
     * Called when a scheme is clicked. Set the clicked scheme as selected
     */
    private selectScheme(scheme: ARTURIResource) {
        if (this.selectedNode != undefined) {
            this.selectedNode.deleteAdditionalProperty(ResAttribute.SELECTED);
        }
        this.selectedNode = scheme;
        this.selectedNode.setAdditionalProperty(ResAttribute.SELECTED, true);
        this.nodeSelected.emit(scheme);
    }

    doSearch(searchedText: string) {
        if (searchedText.trim() == "") {
            this.modalService.alert("Search", "Please enter a valid string to search", "error");
        } else {
            this.searchService.searchResource(searchedText, [RDFResourceRolesEnum.conceptScheme], true, true, "contain").subscribe(
                searchResult => {
                    if (searchResult.length == 0) {
                        this.modalService.alert("Search", "No results found for '" + searchedText + "'", "warning");
                    } else { //1 or more results
                        if (searchResult.length == 1) {
                            console.log("1 result");
                            this.selectScheme(this.getSchemeToSelectFromList(searchResult[0]));
                        } else { //multiple results, ask the user which one select
                            this.modalService.selectResource("Search", searchResult.length + " results found.", searchResult).then(
                                (selectedResource: any) => {
                                    this.selectScheme(this.getSchemeToSelectFromList(selectedResource));
                                },
                                () => { }
                            );
                        }
                    }
                }
            );
        }
    }

    /**
     * Retrieves from the schemeList the scheme to select. This method is necessary because searchResource service
     * returns a new ARTURIResource that has the same attribute of the one in the schemeList but is not the same object,
     * so I need to invoke selectScheme to the one in the list, not to the one returned from service
     */
    private getSchemeToSelectFromList(scheme: ARTURIResource): ARTURIResource {
        for (var i = 0; i < this.schemeList.length; i++) {
            if (this.schemeList[i].getURI() == scheme.getURI()) {
                return this.schemeList[i];
            }
        }
    }

    refresh() {
        this.initList();
    }

}