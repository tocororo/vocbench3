import { Component, Input, ViewChild } from "@angular/core";
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { ModalOptions, ModalType } from 'src/app/widget/modal/Modals';
import { SharedModalServices } from 'src/app/widget/modal/sharedModal/sharedModalServices';
import { GraphMode } from "../../../graph/abstractGraph";
import { GraphModalServices } from "../../../graph/modal/graphModalServices";
import { ARTURIResource, RDFResourceRolesEnum, ResAttribute } from "../../../models/ARTResources";
import { SearchSettings } from "../../../models/Properties";
import { OWL, RDFS } from "../../../models/Vocabulary";
import { CustomFormsServices } from "../../../services/customFormsServices";
import { ResourcesServices } from "../../../services/resourcesServices";
import { SearchServices } from "../../../services/searchServices";
import { VBRequestOptions } from "../../../utils/HttpManager";
import { ResourceUtils, SortAttribute } from "../../../utils/ResourceUtils";
import { RoleActionResolver } from "../../../utils/RoleActionResolver";
import { UIUtils } from "../../../utils/UIUtils";
import { VBActionFunctionCtx } from "../../../utils/VBActions";
import { VBContext } from "../../../utils/VBContext";
import { VBEventHandler } from "../../../utils/VBEventHandler";
import { VBProperties } from "../../../utils/VBProperties";
import { BasicModalServices } from "../../../widget/modal/basicModal/basicModalServices";
import { AbstractTreePanel } from "../abstractTreePanel";
import { MultiSubjectEnrichmentHelper } from "../../multiSubjectEnrichmentHelper";
import { ClassTreeComponent } from "./classTreeComponent";
import { ClassTreeSettingsModal } from "./classTreeSettingsModal";

@Component({
    selector: "class-tree-panel",
    templateUrl: "./classTreePanelComponent.html",
    host: { class: "vbox" }
})
export class ClassTreePanelComponent extends AbstractTreePanel {
    @Input() roots: ARTURIResource[]; //root classes

    @ViewChild(ClassTreeComponent, { static: true }) viewChildTree: ClassTreeComponent;

    panelRole: RDFResourceRolesEnum = RDFResourceRolesEnum.cls;
    rendering: boolean = false; //override the value in AbstractPanel

    filterEnabled: boolean;
    private creatingClassType: ARTURIResource = OWL.class;

    constructor(private searchService: SearchServices, private modalService: NgbModal,
        cfService: CustomFormsServices, resourceService: ResourcesServices, basicModals: BasicModalServices, sharedModals: SharedModalServices, graphModals: GraphModalServices,
        eventHandler: VBEventHandler, vbProp: VBProperties, actionResolver: RoleActionResolver, multiEnrichment: MultiSubjectEnrichmentHelper) {
        super(cfService, resourceService, basicModals, sharedModals, graphModals, eventHandler, vbProp, actionResolver, multiEnrichment);
    }

    ngOnInit() {
        super.ngOnInit();

        this.filterEnabled = VBContext.getWorkingProjectCtx(this.projectCtx).getProjectPreferences().classTreePreferences.filter.enabled;
        if (VBContext.getWorkingProjectCtx(this.projectCtx).getProject().getModelType() == RDFS.uri) {
            this.creatingClassType = RDFS.class;
        }
    }

    //Top Bar commands handlers

    getActionContext(): VBActionFunctionCtx {
        let actionCtx: VBActionFunctionCtx = { metaClass: this.creatingClassType, loadingDivRef: this.viewChildTree.blockDivElement }
        return actionCtx;
    }

    refresh() {
        this.viewChildTree.init();
    }

    //search handlers

    doSearch(searchedText: string) {
        let searchSettings: SearchSettings = VBContext.getWorkingProjectCtx(this.projectCtx).getProjectPreferences().searchSettings;
        let searchLangs: string[];
        let includeLocales: boolean;
        if (searchSettings.restrictLang) {
            searchLangs = searchSettings.languages;
            includeLocales = searchSettings.includeLocales;
        }
        UIUtils.startLoadingDiv(this.viewChildTree.blockDivElement.nativeElement);
        this.searchService.searchResource(searchedText, [RDFResourceRolesEnum.cls], searchSettings.useLocalName, searchSettings.useURI,
            searchSettings.useNotes, searchSettings.stringMatchMode, searchLangs, includeLocales, null, null,
            VBRequestOptions.getRequestOptions(this.projectCtx)).subscribe(
            searchResult => {
                UIUtils.stopLoadingDiv(this.viewChildTree.blockDivElement.nativeElement);
                if (searchResult.length == 0) {
                    this.basicModals.alert({key:"SEARCH.SEARCH"}, {key:"MESSAGES.NO_RESULTS_FOUND_FOR", params:{text: searchedText}}, ModalType.warning);
                } else { //1 or more results
                    if (searchResult.length == 1) {
                        this.openTreeAt(searchResult[0]);
                    } else { //multiple results, ask the user which one select
                        ResourceUtils.sortResources(searchResult, this.rendering ? SortAttribute.show : SortAttribute.value);
                        this.sharedModals.selectResource({key:"SEARCH.SEARCH"}, {key:"MESSAGES.TOT_RESULTS_FOUND", params:{count: searchResult.length}}, searchResult, this.rendering).then(
                            (selectedResources: ARTURIResource[]) => {
                                this.openTreeAt(selectedResources[0]);
                            },
                            () => { }
                        );
                    }
                }
            }
        );
    }

    //this is public so it can be invoked from classIndividualTreePanelComponent
    openTreeAt(cls: ARTURIResource) {
        this.viewChildTree.openTreeAt(cls);
    }


    isOpenIncrementalModelGraphEnabled() {
        return this.isOpenGraphEnabled(GraphMode.modelOriented) && this.selectedNode != null && this.selectedNode.getAdditionalProperty(ResAttribute.EXPLICIT);
    }

    openIncrementalGraph() {
        this.graphModals.openModelGraph(this.selectedNode, this.rendering);
    }

    openUmlGraph(){
        this.graphModals.openUmlGraph(this.rendering);
    }

    settings() {
        const modalRef: NgbModalRef = this.modalService.open(ClassTreeSettingsModal, new ModalOptions());
        return modalRef.result.then(
            () => {
                this.filterEnabled = VBContext.getWorkingProjectCtx(this.projectCtx).getProjectPreferences().classTreePreferences.filter.enabled;
                this.refresh();
            },
            () => {
                this.filterEnabled = VBContext.getWorkingProjectCtx(this.projectCtx).getProjectPreferences().classTreePreferences.filter.enabled;
            }
        );
    }
    
}