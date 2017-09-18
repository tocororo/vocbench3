import { Component, Output, EventEmitter } from "@angular/core";
import { AbstractPanel } from "../../../abstractPanel"
import { SkosServices } from "../../../../services/skosServices";
import { SearchServices } from "../../../../services/searchServices";
import { CustomFormsServices } from "../../../../services/customFormsServices";
import { BasicModalServices } from "../../../../widget/modal/basicModal/basicModalServices";
import { CreationModalServices } from "../../../../widget/modal/creationModal/creationModalServices";
import { VBProperties, SearchSettings } from '../../../../utils/VBProperties';
import { VBEventHandler } from "../../../../utils/VBEventHandler";
import { AuthorizationEvaluator } from "../../../../utils/AuthorizationEvaluator";
import { ARTURIResource, ResAttribute, RDFResourceRolesEnum, ResourceUtils } from "../../../../models/ARTResources";
import { SKOS } from "../../../../models/Vocabulary";

@Component({
    selector: "scheme-list-panel",
    templateUrl: "./schemeListPanelComponent.html",
})
export class SchemeListPanelComponent extends AbstractPanel {

    panelRole: RDFResourceRolesEnum = RDFResourceRolesEnum.conceptScheme;

    private schemeList: SchemeListItem[];

    constructor(private skosService: SkosServices, private searchService: SearchServices,
        private eventHandler: VBEventHandler, private vbProp: VBProperties, private creationModals: CreationModalServices,
        cfService: CustomFormsServices, basicModals: BasicModalServices) {
        super(cfService, basicModals);
        this.eventSubscriptions.push(eventHandler.refreshDataBroadcastEvent.subscribe(() => this.initList()));
    }

    ngOnInit() {
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
                    let active: boolean = this.vbProp.isActiveScheme(schemes[i]);
                    this.schemeList.push({ checked: active, scheme: schemes[i] });
                }
            }
        );
    }

    private create() {
        this.creationModals.newSkosResourceCf("Create new skos:ConceptScheme", SKOS.conceptScheme, true).then(
            (res: any) => {
                this.skosService.createConceptScheme(res.label, res.uriResource, res.cls, res.cfId, res.cfValueMap).subscribe(
                    newScheme => { this.schemeList.push({ checked: false, scheme: newScheme }); },
                    err => { }
                );
            },
            () => { }
        );
    }

    delete() {
        this.skosService.isSchemeEmpty(this.selectedNode).subscribe(
            empty => {
                if (empty) {
                    this.deleteScheme();
                } else {
                    this.basicModals.confirm("Delete scheme", "The scheme is not empty. Deleting it will produce dangling concepts."
                        + " Are you sure to continue?", "warning").then(
                        confirm => {
                            this.deleteScheme();
                        },
                        reject => {}
                    );
                }
            }
        )
    }

    private deleteScheme() {
        this.skosService.deleteConceptScheme(this.selectedNode).subscribe(
            stResp => this.deleteSchemeRespHandler(),
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
        if (this.vbProp.isActiveScheme(this.selectedNode)) {
            this.updateActiveSchemesPref();
            this.nodeDeleted.emit(this.selectedNode);
            this.selectedNode = null;
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
            let searchSettings: SearchSettings = this.vbProp.getSearchSettings();
            this.searchService.searchResource(searchedText, [RDFResourceRolesEnum.conceptScheme], searchSettings.useLocalName, 
                searchSettings.useURI, searchSettings.stringMatchMode).subscribe(
                searchResult => {
                    if (searchResult.length == 0) {
                        this.basicModals.alert("Search", "No results found for '" + searchedText + "'", "warning");
                    } else { //1 or more results
                        if (searchResult.length == 1) {
                            this.selectSchemeItem(this.getSchemeToSelectFromList(searchResult[0]));
                        } else { //multiple results, ask the user which one select
                            ResourceUtils.sortResources(searchResult, this.rendering ? "show" : "value");
                            this.basicModals.selectResource("Search", searchResult.length + " results found.", searchResult, this.rendering).then(
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

    private activateAllScheme() {
        for (var i = 0; i < this.schemeList.length; i++) {
            this.schemeList[i].checked = true;
        }
        this.vbProp.setActiveSchemes(this.collectCheckedSchemes());
    }

    private deactivateAllScheme() {
        for (var i = 0; i < this.schemeList.length; i++) {
            this.schemeList[i].checked = false;
        }
        this.vbProp.setActiveSchemes(this.collectCheckedSchemes());
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
        this.vbProp.setActiveSchemes(this.collectCheckedSchemes());
    }

    refresh() {
        this.initList();
    }

}

class SchemeListItem {
    public checked: boolean;
    public scheme: ARTURIResource;
}