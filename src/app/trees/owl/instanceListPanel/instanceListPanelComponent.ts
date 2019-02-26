import { Component, Input, ViewChild } from "@angular/core";
import { GraphModalServices } from "../../../graph/modal/graphModalServices";
import { ARTURIResource, RDFResourceRolesEnum } from "../../../models/ARTResources";
import { SearchSettings } from "../../../models/Properties";
import { ClassesServices } from "../../../services/classesServices";
import { CustomFormsServices } from "../../../services/customFormsServices";
import { ResourcesServices } from "../../../services/resourcesServices";
import { SearchServices } from "../../../services/searchServices";
import { ResourceUtils, SortAttribute } from "../../../utils/ResourceUtils";
import { ActionDescription, RoleActionResolver } from "../../../utils/RoleActionResolver";
import { VBActionFunctionCtx } from "../../../utils/VBActions";
import { VBEventHandler } from "../../../utils/VBEventHandler";
import { VBProperties } from "../../../utils/VBProperties";
import { BasicModalServices } from "../../../widget/modal/basicModal/basicModalServices";
import { CreationModalServices } from "../../../widget/modal/creationModal/creationModalServices";
import { AbstractListPanel } from "../../abstractListPanel";
import { InstanceListComponent } from "../instanceList/instanceListComponent";

@Component({
    selector: "instance-list-panel",
    templateUrl: "./instanceListPanelComponent.html",
    host: { class: "vbox" }
})
export class InstanceListPanelComponent extends AbstractListPanel {
    @Input() hideSearch: boolean = false; //if true hide the search bar
    @Input() cls: ARTURIResource; //class of the instances

    @ViewChild(InstanceListComponent) viewChildInstanceList: InstanceListComponent;

    panelRole: RDFResourceRolesEnum = RDFResourceRolesEnum.individual;
    rendering: boolean = false; //override the value in AbstractPanel

    constructor(private classesService: ClassesServices, private searchService: SearchServices, private creationModals: CreationModalServices,
        cfService: CustomFormsServices, resourceService: ResourcesServices, basicModals: BasicModalServices, graphModals: GraphModalServices,
        eventHandler: VBEventHandler, vbProp: VBProperties, actionResolver: RoleActionResolver) {
        super(cfService, resourceService, basicModals, graphModals, eventHandler, vbProp, actionResolver);
    }

    getActionContext(): VBActionFunctionCtx {
        let actionCtx: VBActionFunctionCtx = { metaClass: this.cls, loadingDivRef: this.viewChildInstanceList.blockDivElement }
        return actionCtx;
    }

    //@Override
    isActionDisabled(action: ActionDescription) {
        //In addition to the cross-panel conditions, in this case the actions are disabled if the panel has no input cls
        return super.isActionDisabled(action) || !this.cls
    }

    // //@Override
    // isCreateDisabled(): boolean {
    //     return (!this.cls || this.readonly || !AuthorizationEvaluator.Tree.isCreateAuthorized(this.panelRole));
    // }
    // //@Override
    // isDeleteDisabled(): boolean {
    //     return (
    //         !this.cls || !this.selectedNode || !this.selectedNode.getAdditionalProperty(ResAttribute.EXPLICIT) || 
    //         this.readonly || !AuthorizationEvaluator.Tree.isDeleteAuthorized(this.panelRole)
    //     );
    // }

    // private create() {
    //     this.creationModals.newResourceCf("Create a new instance of " + this.cls.getShow(), this.cls, false).then(
    //         (data: any) => {
    //             this.classesService.createInstance(data.uriResource, this.cls, data.cfValue).subscribe();
    //         },
    //         () => {}
    //     );
    // }

    // delete() {
    //     UIUtils.startLoadingDiv(this.viewChildInstanceList.blockDivElement.nativeElement);
    //     this.classesService.deleteInstance(this.selectedNode, this.cls).subscribe(
    //         stResp => {
    //             this.selectedNode = null;
    //             UIUtils.stopLoadingDiv(this.viewChildInstanceList.blockDivElement.nativeElement);
    //         },
    //         err => { UIUtils.stopLoadingDiv(this.viewChildInstanceList.blockDivElement.nativeElement); }
    //     )
    // }

    refresh() {
        this.viewChildInstanceList.init();
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
        this.searchService.searchInstancesOfClass(this.cls, searchedText, searchSettings.useLocalName, searchSettings.useURI,
            searchSettings.useNotes, searchSettings.stringMatchMode, searchLangs, includeLocales).subscribe(
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

    //this is public so it can be invoked from classIndividualTreePanelComponent
    openAt(instance: ARTURIResource) {
        this.viewChildInstanceList.openListAt(instance);
    }

}