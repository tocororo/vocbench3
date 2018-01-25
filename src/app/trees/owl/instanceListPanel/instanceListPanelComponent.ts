import { Component, Input, Output, EventEmitter, ViewChild } from "@angular/core";
import { AbstractPanel } from "../../abstractPanel"
import { InstanceListComponent } from "../instanceList/instanceListComponent";
import { SearchServices } from "../../../services/searchServices";
import { ClassesServices } from "../../../services/classesServices";
import { CustomFormsServices } from "../../../services/customFormsServices";
import { BasicModalServices } from "../../../widget/modal/basicModal/basicModalServices";
import { CreationModalServices } from "../../../widget/modal/creationModal/creationModalServices";
import { ARTURIResource, ResAttribute, RDFResourceRolesEnum, ResourceUtils } from "../../../models/ARTResources";
import { SearchSettings } from "../../../models/Properties";
import { VBProperties } from "../../../utils/VBProperties";
import { UIUtils } from "../../../utils/UIUtils";
import { VBEventHandler } from "../../../utils/VBEventHandler";
import { AuthorizationEvaluator } from "../../../utils/AuthorizationEvaluator";

@Component({
    selector: "instance-list-panel",
    templateUrl: "./instanceListPanelComponent.html",
})
export class InstanceListPanelComponent extends AbstractPanel {
    @Input() hideSearch: boolean = false; //if true hide the search bar
    @Input() cls: ARTURIResource; //class of the instances

    @ViewChild(InstanceListComponent) viewChildInstanceList: InstanceListComponent;

    panelRole: RDFResourceRolesEnum = RDFResourceRolesEnum.individual;
    rendering: boolean = false; //override the value in AbstractPanel

    constructor(private classesService: ClassesServices, private searchService: SearchServices, private vbProp: VBProperties,
        private creationModals: CreationModalServices, cfService: CustomFormsServices, basicModals: BasicModalServices, eventHandler: VBEventHandler) {
        super(cfService, basicModals, eventHandler);
    }

    //@Override
    isCreateDisabled(): boolean {
        return (!this.cls || this.readonly || !AuthorizationEvaluator.Tree.isCreateAuthorized(this.panelRole));
    }
    //@Override
    isDeleteDisabled(): boolean {
        return (
            !this.cls || !this.selectedNode || !this.selectedNode.getAdditionalProperty(ResAttribute.EXPLICIT) || 
            this.readonly || !AuthorizationEvaluator.Tree.isDeleteAuthorized(this.panelRole)
        );
    }

    private create() {
        this.creationModals.newResourceCf("Create a new instance of " + this.cls.getShow(), this.cls, false).then(
            (data: any) => {
                this.classesService.createInstance(data.uriResource, this.cls, data.cfValue).subscribe();
            },
            () => {}
        );
    }

    delete() {
        UIUtils.startLoadingDiv(this.viewChildInstanceList.blockDivElement.nativeElement);
        this.classesService.deleteInstance(this.selectedNode, this.cls).subscribe(
            stResp => {
                this.nodeDeleted.emit(this.selectedNode);
                this.selectedNode = null;
                UIUtils.stopLoadingDiv(this.viewChildInstanceList.blockDivElement.nativeElement);
            },
            err => { UIUtils.stopLoadingDiv(this.viewChildInstanceList.blockDivElement.nativeElement); }
        )
    }

    refresh() {
        this.selectedNode = null;
        this.viewChildInstanceList.initList();
    }

    //search handlers

    doSearch(searchedText: string) {
        if (searchedText.trim() == "") {
            this.basicModals.alert("Search", "Please enter a valid string to search", "error");
        } else {
            let searchSettings: SearchSettings = this.vbProp.getSearchSettings();
            let searchLangs: string[];
            let includeLocales: boolean;
            if (searchSettings.restrictLang) {
                searchLangs = searchSettings.languages;
                includeLocales = searchSettings.includeLocales;
            }
            this.searchService.searchInstancesOfClass(this.cls, searchedText, searchSettings.useLocalName, searchSettings.useURI,
                searchSettings.stringMatchMode, searchLangs, includeLocales).subscribe(
                searchResult => {
                    if (searchResult.length == 0) {
                        this.basicModals.alert("Search", "No results found for '" + searchedText + "'", "warning");
                    } else { //1 or more results
                        if (searchResult.length == 1) {
                            this.selectSearchedInstance(this.cls, searchResult[0]);
                        } else { //multiple results, ask the user which one select
                            ResourceUtils.sortResources(searchResult, this.rendering ? "show" : "value");
                            this.basicModals.selectResource("Search", searchResult.length + " results found.", searchResult, this.rendering).then(
                                (selectedResource: any) => {
                                    this.selectSearchedInstance(this.cls, selectedResource);
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
    selectSearchedInstance(cls: ARTURIResource, instance: ARTURIResource) {
        this.viewChildInstanceList.selectSearchedInstance(cls, instance);
    }

}