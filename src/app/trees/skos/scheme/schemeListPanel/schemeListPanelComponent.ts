import { Component, Output, EventEmitter } from "@angular/core";
import { AbstractPanel } from "../../../abstractPanel"
import { SkosServices } from "../../../../services/skosServices";
import { SkosxlServices } from "../../../../services/skosxlServices";
import { SearchServices } from "../../../../services/searchServices";
import { CustomFormsServices } from "../../../../services/customFormsServices";
import { BasicModalServices } from "../../../../widget/modal/basicModal/basicModalServices";
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

    private schemeList: SchemeListItem[];

    private ONTO_TYPE: string;

    constructor(private skosService: SkosServices, private skosxlService: SkosxlServices, private searchService: SearchServices,
        private eventHandler: VBEventHandler, private preferences: VBPreferences, private creationModals: CreationModalServices,
        cfService: CustomFormsServices, basicModals: BasicModalServices) {
        super(cfService, basicModals);
        this.eventSubscriptions.push(eventHandler.refreshDataBroadcastEvent.subscribe(() => this.initList()));
    }

    ngOnInit() {
        this.ONTO_TYPE = VBContext.getWorkingProject().getPrettyPrintOntoType();
        this.initList();
    }

    private initList() {
        this.schemeList = [];
        this.selectedNode = null;
        this.skosService.getAllSchemes().subscribe(
            schemes => {
                //sort by show if rendering is active, uri otherwise
                let attribute: "show" | "value" = this.rendering ? "show" : "value";
                ResourceUtils.sortResources(schemes, attribute);

                for (var i = 0; i < schemes.length; i++) {
                    let active: boolean = this.preferences.isActiveScheme(schemes[i]);
                    this.schemeList.push({ checked: active, scheme: schemes[i] });
                }
            }
        );
    }

    private create() {
        this.creationModals.newSkosResourceCf("Create new skos:ConceptScheme", SKOS.conceptScheme, true).then(
            (res: any) => {
                console.log("returned data ", res);
                if (this.ONTO_TYPE == "SKOS") {
                    this.skosService.createConceptScheme(res.label, res.uriResource, res.cls, res.cfId, res.cfValueMap).subscribe(
                        newScheme => { this.schemeList.push({ checked: false, scheme: newScheme }); },
                        err => { }
                    );
                } else { //SKOSXL
                    this.skosxlService.createConceptScheme(res.label, res.uriResource, res.cls, res.cfId, res.cfValueMap).subscribe(
                        newScheme => { this.schemeList.push({ checked: false, scheme: newScheme }); },
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
                stResp => this.deleteSchemeRespHandler(),
                err => this.deleteNotEmptySchemeHandler()
            );
        } else { //SKOSXL
            this.skosxlService.deleteScheme(this.selectedNode).subscribe(
                stResp => this.deleteSchemeRespHandler(),
                err => this.deleteNotEmptySchemeHandler()
            );
        }
    }

    private deleteNotEmptySchemeHandler() {
        var retainOpt = "Retain dangling concepts";
        var deleteOpt = "Delete dangling concepts";
        this.basicModals.select("Delete scheme", "The operation will produce dangling concepts"
            + " because the scheme is not empty. What do you want to do?", [retainOpt, deleteOpt]).then(
            (selection: any) => {
                var deleteDanglingConc = selection == deleteOpt;
                if (this.ONTO_TYPE == "SKOS") {
                    this.skosService.deleteScheme(this.selectedNode, deleteDanglingConc).subscribe(
                        stResp => this.deleteSchemeRespHandler()
                    );
                } else { //SKOSXL
                    this.skosxlService.deleteScheme(this.selectedNode, deleteDanglingConc).subscribe(
                        stResp => this.deleteSchemeRespHandler()
                    );
                }
            },
            () => { }
            );
    }

    /**
     * Handles the scheme deletion
     */
    private deleteSchemeRespHandler() {
        for (var i = 0; i < this.schemeList.length; i++) {//Update the schemeList
            if (this.schemeList[i].scheme.getURI() == this.selectedNode.getURI()) {
                this.schemeList.splice(i, 1);
                break;
            }
        }
        //update the activeSchemes if the deleted was active
        if (this.preferences.isActiveScheme(this.selectedNode)) {
            this.updateActiveSchemesPref();
            this.selectedNode = null;
            this.nodeSelected.emit(this.selectedNode);
        }
    }

    /**
     * Called when a scheme is clicked. Set the clicked scheme as selected
     */
    private selectSchemeItem(schemeItem: SchemeListItem) {
        if (this.selectedNode != undefined) {
            this.selectedNode.deleteAdditionalProperty(ResAttribute.SELECTED);
        }
        this.selectedNode = schemeItem.scheme;
        this.selectedNode.setAdditionalProperty(ResAttribute.SELECTED, true);
        this.nodeSelected.emit(schemeItem.scheme);
    }

    doSearch(searchedText: string) {
        if (searchedText.trim() == "") {
            this.basicModals.alert("Search", "Please enter a valid string to search", "error");
        } else {
            this.searchService.searchResource(searchedText, [RDFResourceRolesEnum.conceptScheme], true, true, "contain").subscribe(
                searchResult => {
                    if (searchResult.length == 0) {
                        this.basicModals.alert("Search", "No results found for '" + searchedText + "'", "warning");
                    } else { //1 or more results
                        if (searchResult.length == 1) {
                            console.log("1 result");
                            this.selectSchemeItem(this.getSchemeToSelectFromList(searchResult[0]));
                        } else { //multiple results, ask the user which one select
                            this.basicModals.selectResource("Search", searchResult.length + " results found.", searchResult).then(
                                (selectedResource: any) => {
                                    this.selectSchemeItem(this.getSchemeToSelectFromList(selectedResource));
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
    private getSchemeToSelectFromList(scheme: ARTURIResource): SchemeListItem {
        for (var i = 0; i < this.schemeList.length; i++) {
            if (this.schemeList[i].scheme.getURI() == scheme.getURI()) {
                return this.schemeList[i];
            }
        }
    }

    /**
     * Collects all the schemes checked
     */
    private collectCheckedSchemes(): ARTURIResource[] {
        //collect all the active scheme
        var activeSchemes: ARTURIResource[] = [];
        for (var i = 0; i < this.schemeList.length; i++) {
            if (this.schemeList[i].checked) {
                activeSchemes.push(this.schemeList[i].scheme);
            }
        }
        return activeSchemes;
    }

    private updateActiveSchemesPref() {
        this.preferences.setActiveSchemes(this.collectCheckedSchemes());
    }

    refresh() {
        this.initList();
    }

}

class SchemeListItem {
    public checked: boolean;
    public scheme: ARTURIResource;
}