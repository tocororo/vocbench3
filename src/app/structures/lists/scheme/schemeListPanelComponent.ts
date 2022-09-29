import { Component, ViewChild } from "@angular/core";
import { ModalType } from 'src/app/widget/modal/Modals';
import { SharedModalServices } from 'src/app/widget/modal/sharedModal/sharedModalServices';
import { GraphModalServices } from "../../../graph/modal/graphModalServices";
import { ARTURIResource, RDFResourceRolesEnum } from "../../../models/ARTResources";
import { MultischemeMode, SearchSettings } from "../../../models/Properties";
import { CustomFormsServices } from "../../../services/customFormsServices";
import { ResourcesServices } from "../../../services/resourcesServices";
import { SearchServices } from "../../../services/searchServices";
import { SkosServices } from "../../../services/skosServices";
import { VBRequestOptions } from "../../../utils/HttpManager";
import { ResourceUtils, SortAttribute } from "../../../utils/ResourceUtils";
import { RoleActionResolver } from "../../../utils/RoleActionResolver";
import { UIUtils } from "../../../utils/UIUtils";
import { VBActionFunctionCtx } from "../../../utils/VBActions";
import { VBContext } from "../../../utils/VBContext";
import { VBEventHandler } from "../../../utils/VBEventHandler";
import { VBProperties } from '../../../utils/VBProperties';
import { BasicModalServices } from "../../../widget/modal/basicModal/basicModalServices";
import { MultiSubjectEnrichmentHelper } from "../../multiSubjectEnrichmentHelper";
import { AbstractListPanel } from "../abstractListPanel";
import { SchemeListComponent } from "./schemeListComponent";

@Component({
    selector: "scheme-list-panel",
    templateUrl: "./schemeListPanelComponent.html",
    host: { class: "vbox" }
})
export class SchemeListPanelComponent extends AbstractListPanel {

    @ViewChild(SchemeListComponent) viewChildList: SchemeListComponent;

    panelRole: RDFResourceRolesEnum = RDFResourceRolesEnum.conceptScheme;

    private modelType: string;

    private multischemeMode: MultischemeMode;

    constructor(private skosService: SkosServices, private searchService: SearchServices,
        cfService: CustomFormsServices, resourceService: ResourcesServices, basicModals: BasicModalServices, sharedModals: SharedModalServices, graphModals: GraphModalServices,
        eventHandler: VBEventHandler, vbProp: VBProperties, actionResolver: RoleActionResolver, multiEnrichment: MultiSubjectEnrichmentHelper) {
        super(cfService, resourceService, basicModals, sharedModals, graphModals, eventHandler, vbProp, actionResolver, multiEnrichment);
    }

    ngOnInit() {
        super.ngOnInit();
        this.modelType = VBContext.getWorkingProjectCtx(this.projectCtx).getProject().getModelType();
        this.multischemeMode = VBContext.getWorkingProjectCtx(this.projectCtx).getProjectPreferences().conceptTreePreferences.multischemeMode;
    }


    getActionContext(): VBActionFunctionCtx {
        let metaClass: ARTURIResource = ResourceUtils.convertRoleToClass(this.panelRole, this.modelType);
        let actionCtx: VBActionFunctionCtx = { metaClass: metaClass, loadingDivRef: this.viewChildList.blockDivElement };
        return actionCtx;
    }

    doSearch(searchedText: string) {
        let searchSettings: SearchSettings = VBContext.getWorkingProjectCtx(this.projectCtx).getProjectPreferences().searchSettings;
        let searchLangs: string[];
        let includeLocales: boolean;
        if (searchSettings.restrictLang) {
            searchLangs = searchSettings.languages;
            includeLocales = searchSettings.includeLocales;
        }
        this.searchService.searchResource(searchedText, [RDFResourceRolesEnum.conceptScheme], searchSettings.useLocalName,
            searchSettings.useURI, searchSettings.useNotes, searchSettings.stringMatchMode, searchLangs, includeLocales, null, null,
            VBRequestOptions.getRequestOptions(this.projectCtx)).subscribe(
                searchResult => {
                    if (searchResult.length == 0) {
                        this.basicModals.alert({ key: "SEARCH.SEARCH" }, { key: "MESSAGES.NO_RESULTS_FOUND_FOR", params: { text: searchedText } }, ModalType.warning);
                    } else { //1 or more results
                        if (searchResult.length == 1) {
                            this.openAt(searchResult[0]);
                        } else { //multiple results, ask the user which one select
                            ResourceUtils.sortResources(searchResult, this.rendering ? SortAttribute.show : SortAttribute.value);
                            this.sharedModals.selectResource({ key: "SEARCH.SEARCH" }, { key: "MESSAGES.TOT_RESULTS_FOUND", params: { count: searchResult.length } }, searchResult, this.rendering).then(
                                (selectedResources: ARTURIResource[]) => {
                                    this.openAt(selectedResources[0]);
                                },
                                () => { }
                            );
                        }
                    }
                }
            );
    }

    openAt(node: ARTURIResource) {
        this.viewChildList.openListAt(node);
    }

    private activateAllScheme() {
        this.viewChildList.activateAllScheme();
    }

    private deactivateAllScheme() {
        this.viewChildList.deactivateAllScheme();
    }

    private switchMultischemeMode() {
        this.multischemeMode = (this.multischemeMode == MultischemeMode.and) ? MultischemeMode.or : MultischemeMode.and;
        let concTreePrefs = VBContext.getWorkingProjectCtx().getProjectPreferences().conceptTreePreferences;
        concTreePrefs.multischemeMode = this.multischemeMode;
        this.vbProp.setConceptTreePreferences(concTreePrefs).subscribe();
        this.eventHandler.multischemeModeChangedEvent.emit();
    }

    isAddAllConceptsEnabled() {
        return this.selectedNode != null && this.isContextDataPanel();
    }

    private addAllConcepts() {
        //message to warn the user that in case of a lot of concept the process could be long?
        this.basicModals.confirm({ key: "DATA.ACTIONS.ADD_CONCEPT_TO_SCHEME" }, { key: "MESSAGES.ADD_ALL_CONCEPT_TO_SCHEME_CONFIRM", params: { scheme: this.selectedNode.getShow() } },
            ModalType.warning).then(
                confirm => {
                    UIUtils.startLoadingDiv(UIUtils.blockDivFullScreen);
                    this.skosService.addMultipleConceptsToScheme(this.selectedNode).subscribe(
                        stResp => {
                            UIUtils.stopLoadingDiv(UIUtils.blockDivFullScreen);
                            if (ResourceUtils.containsNode(VBContext.getWorkingProjectCtx(this.projectCtx).getProjectPreferences().activeSchemes, this.selectedNode)) {
                                //in case the target scheme is active emit refreshTreeEvent so that the concept tree refreshes
                                this.eventHandler.refreshTreeListEvent.emit([RDFResourceRolesEnum.concept]);
                            }
                        }
                    );
                },
                () => { }
            );

    }

    refresh() {
        this.viewChildList.init();
    }

}