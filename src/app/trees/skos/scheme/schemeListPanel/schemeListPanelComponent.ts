import { Component, ViewChild } from "@angular/core";
import { ARTURIResource, RDFResourceRolesEnum, ResourceUtils, SortAttribute } from "../../../../models/ARTResources";
import { SearchSettings } from "../../../../models/Properties";
import { SKOS } from "../../../../models/Vocabulary";
import { CustomFormsServices } from "../../../../services/customFormsServices";
import { ResourcesServices } from "../../../../services/resourcesServices";
import { SearchServices } from "../../../../services/searchServices";
import { SkosServices } from "../../../../services/skosServices";
import { VBEventHandler } from "../../../../utils/VBEventHandler";
import { VBProperties } from '../../../../utils/VBProperties';
import { BasicModalServices } from "../../../../widget/modal/basicModal/basicModalServices";
import { CreationModalServices } from "../../../../widget/modal/creationModal/creationModalServices";
import { NewResourceWithLiteralCfModalReturnData } from "../../../../widget/modal/creationModal/newResourceModal/shared/newResourceWithLiteralCfModal";
import { AbstractPanel } from "../../../abstractPanel";
import { SchemeListComponent } from "../schemeList/schemeListComponent";

@Component({
    selector: "scheme-list-panel",
    templateUrl: "./schemeListPanelComponent.html",
})
export class SchemeListPanelComponent extends AbstractPanel {

    @ViewChild(SchemeListComponent) viewChildList: SchemeListComponent;

    panelRole: RDFResourceRolesEnum = RDFResourceRolesEnum.conceptScheme;

    constructor(private skosService: SkosServices, private searchService: SearchServices, private creationModals: CreationModalServices,
        cfService: CustomFormsServices, resourceService: ResourcesServices, basicModals: BasicModalServices, 
        eventHandler: VBEventHandler, vbProp: VBProperties) {
        super(cfService, resourceService, basicModals, eventHandler, vbProp);
    }

    private create() {
        this.creationModals.newResourceWithLiteralCf("Create new skos:ConceptScheme", SKOS.conceptScheme, true).then(
            (data: NewResourceWithLiteralCfModalReturnData) => {
                this.skosService.createConceptScheme(data.literal, data.uriResource, data.cls, data.cfValue).subscribe(
                    newScheme => { },
                    (err: Error) => {
                        if (err.name.endsWith('PrefAltLabelClashException')) {
                            this.basicModals.confirm("Warning", err.message + " Do you want to force the creation?", "warning").then(
                                confirm => {
                                    this.skosService.createConceptScheme(data.literal, data.uriResource, data.cls, data.cfValue, false).subscribe(
                                        newScheme => { }
                                    );
                                },
                                () => {}
                            );
                        }
                    }
                );
            },
            () => { }
        );
    }

    delete() {
        this.skosService.isSchemeEmpty(this.selectedNode).subscribe(
            empty => {
                if (empty) {
                    this.deleteSelectedScheme();
                } else {
                    this.basicModals.confirm("Delete scheme", "The scheme is not empty. Deleting it will produce dangling concepts."
                        + " Are you sure to continue?", "warning").then(
                        (confirm: any) => {
                            this.deleteSelectedScheme();
                        },
                        (reject: any) => {}
                    );
                }
            }
        )
    }

    private deleteSelectedScheme() {
        this.skosService.deleteConceptScheme(this.selectedNode).subscribe(
            stResp => {
                this.eventHandler.schemeDeletedEvent.emit(this.selectedNode);
                this.nodeDeleted.emit(this.selectedNode);
                this.selectedNode = null;
            }
        );
    }

    doSearch(searchedText: string) {
        let searchSettings: SearchSettings = this.vbProp.getSearchSettings();
        let searchLangs: string[];
        let includeLocales: boolean;
        if (searchSettings.restrictLang) {
            searchLangs = searchSettings.languages;
            includeLocales = searchSettings.includeLocales;
        }
        this.searchService.searchResource(searchedText, [RDFResourceRolesEnum.conceptScheme], searchSettings.useLocalName, 
            searchSettings.useURI, searchSettings.stringMatchMode, searchLangs, includeLocales).subscribe(
            searchResult => {
                if (searchResult.length == 0) {
                    this.basicModals.alert("Search", "No results found for '" + searchedText + "'", "warning");
                } else { //1 or more results
                    if (searchResult.length == 1) {
                        this.openAt(searchResult[0]);
                    } else { //multiple results, ask the user which one select
                        ResourceUtils.sortResources(searchResult, this.rendering ? SortAttribute.show : SortAttribute.value);
                        this.basicModals.selectResource("Search", searchResult.length + " results found.", searchResult, this.rendering).then(
                            (selectedResource: any) => {
                                this.openAt(selectedResource);
                            },
                            () => { }
                        );
                    }
                }
            }
        );
    }

    public openAt(node: ARTURIResource) {
        this.viewChildList.openListAt(node);
    }

    private activateAllScheme() {
        this.viewChildList.activateAllScheme();
    }

    private deactivateAllScheme() {
        this.viewChildList.deactivateAllScheme();
    }

    refresh() {
        this.viewChildList.initList();
    }

}