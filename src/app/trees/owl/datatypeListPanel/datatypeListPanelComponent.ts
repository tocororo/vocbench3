import { Component, Input, ViewChild } from "@angular/core";
import { ARTURIResource, RDFResourceRolesEnum, ResourceUtils, SortAttribute } from "../../../models/ARTResources";
import { SearchSettings } from "../../../models/Properties";
import { RDFS } from "../../../models/Vocabulary";
import { CustomFormsServices } from "../../../services/customFormsServices";
import { DatatypesServices } from "../../../services/datatypesServices";
import { ResourcesServices } from "../../../services/resourcesServices";
import { SearchServices } from "../../../services/searchServices";
import { UIUtils } from "../../../utils/UIUtils";
import { VBEventHandler } from "../../../utils/VBEventHandler";
import { VBProperties } from "../../../utils/VBProperties";
import { BasicModalServices } from "../../../widget/modal/basicModal/basicModalServices";
import { CreationModalServices } from "../../../widget/modal/creationModal/creationModalServices";
import { AbstractPanel } from "../../abstractPanel";
import { DatatypeListComponent } from "../datatypeList/datatypeListComponent";

@Component({
    selector: "datatype-list-panel",
    templateUrl: "./datatypeListPanelComponent.html",
    host: { class: "vbox" }
})
export class DatatypeListPanelComponent extends AbstractPanel {

    @Input() full: boolean = false; //if true show all the datatypes (also the owl2 that are not declared as rdfs:Datatype)

    @ViewChild(DatatypeListComponent) viewChildList: DatatypeListComponent;

    panelRole: RDFResourceRolesEnum = RDFResourceRolesEnum.dataRange;
    // rendering: boolean = false; //override the value in AbstractPanel

    constructor(private datatypeService: DatatypesServices, private searchService: SearchServices, private creationModals: CreationModalServices,
        cfService: CustomFormsServices, resourceService: ResourcesServices, basicModals: BasicModalServices,
        eventHandler: VBEventHandler, vbProp: VBProperties) {
        super(cfService, resourceService, basicModals, eventHandler, vbProp);
    }

    private create() {
        this.creationModals.newResourceCf("Create a new datatype", RDFS.datatype, false).then(
            (data: any) => {
                this.datatypeService.createDatatype(data.uriResource).subscribe();
            },
            () => {}
        );
    }

    delete() {
        UIUtils.startLoadingDiv(this.viewChildList.blockDivElement.nativeElement);
        this.datatypeService.deleteDatatype(this.selectedNode).subscribe(
            stResp => {
                this.nodeDeleted.emit(this.selectedNode);
                this.selectedNode = null;
                UIUtils.stopLoadingDiv(this.viewChildList.blockDivElement.nativeElement);
            }
        )
    }

    refresh() {
        this.selectedNode = null;
        this.viewChildList.initList();
    }

    //search handlers

    doSearch(searchedText: string) {
        let searchSettings: SearchSettings = this.vbProp.getSearchSettings();
        let searchLangs: string[];
        let includeLocales: boolean;
        if (searchSettings.restrictLang) {
            searchLangs = searchSettings.languages;
            includeLocales = searchSettings.includeLocales;
        }
        this.searchService.searchResource(searchedText, [RDFResourceRolesEnum.dataRange], searchSettings.useLocalName, 
            searchSettings.useURI, searchSettings.useNotes, searchSettings.stringMatchMode, searchLangs, includeLocales).subscribe(
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

}