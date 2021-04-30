import { Component, EventEmitter, Input, Output, ViewChild } from "@angular/core";
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { TranslateService } from "@ngx-translate/core";
import { Observable, of } from 'rxjs';
import { ModalOptions, ModalType } from 'src/app/widget/modal/Modals';
import { SharedModalServices } from 'src/app/widget/modal/sharedModal/sharedModalServices';
import { GraphModalServices } from "../../../graph/modal/graphModalServices";
import { ARTURIResource, RDFResourceRolesEnum, ResAttribute } from "../../../models/ARTResources";
import { Project } from "../../../models/Project";
import { ConceptTreeVisualizationMode, ProjectPreferences, SearchSettings } from "../../../models/Properties";
import { CustomFormsServices } from "../../../services/customFormsServices";
import { ResourcesServices } from "../../../services/resourcesServices";
import { SearchServices } from "../../../services/searchServices";
import { SkosServices } from "../../../services/skosServices";
import { AuthorizationEvaluator } from "../../../utils/AuthorizationEvaluator";
import { VBRequestOptions } from "../../../utils/HttpManager";
import { ResourceUtils, SortAttribute } from "../../../utils/ResourceUtils";
import { ActionDescription, RoleActionResolver } from "../../../utils/RoleActionResolver";
import { UIUtils } from "../../../utils/UIUtils";
import { VBActionFunctionCtx, VBActionsEnum } from "../../../utils/VBActions";
import { VBContext } from "../../../utils/VBContext";
import { VBEventHandler } from "../../../utils/VBEventHandler";
import { VBProperties } from "../../../utils/VBProperties";
import { BasicModalServices } from "../../../widget/modal/basicModal/basicModalServices";
import { BrowsingModalServices } from "../../../widget/modal/browsingModal/browsingModalServices";
import { MultiSubjectEnrichmentHelper } from "../../multiSubjectEnrichmentHelper";
import { AbstractTreePanel } from "../abstractTreePanel";
import { AddToSchemeModal } from "./addToSchemeModal";
import { ConceptTreeComponent } from "./conceptTreeComponent";
import { ConceptTreeSettingsModal } from "./conceptTreeSettingsModal";

@Component({
    selector: "concept-tree-panel",
    templateUrl: "./conceptTreePanelComponent.html",
    host: { class: "vbox" }
})
export class ConceptTreePanelComponent extends AbstractTreePanel {

    @Input() schemes: ARTURIResource[]; //if set the concept tree is initialized with this scheme, otherwise with the scheme from VB context
    @Input() schemeChangeable: boolean = false; //if true, above the tree is shown a menu to select a scheme
    @Output() schemeChanged = new EventEmitter<ARTURIResource>();//when dynamic scheme is changed

    @ViewChild(ConceptTreeComponent) viewChildTree: ConceptTreeComponent

    panelRole: RDFResourceRolesEnum = RDFResourceRolesEnum.concept;

    private modelType: string;

    private schemeList: Array<ARTURIResource>;
    private selectedSchemeUri: string; //needed for the <select> element where I cannot use ARTURIResource as <option> values
    //because I need also a <option> with null value for the no-scheme mode (and it's not possible)
    workingSchemes: ARTURIResource[];//keep track of the selected scheme: could be assigned throught @Input scheme or scheme selection
    //(useful expecially when schemeChangeable is true so the changes don't effect the scheme in context)

    visualizationMode: ConceptTreeVisualizationMode;//this could be changed dynamically, so each time it is used, get it again from preferences
    
    //for visualization searchBased
    lastSearch: string;

    constructor(private skosService: SkosServices, private searchService: SearchServices, private browsingModals: BrowsingModalServices, private modalService: NgbModal,
        cfService: CustomFormsServices, resourceService: ResourcesServices, basicModals: BasicModalServices, sharedModals: SharedModalServices, graphModals: GraphModalServices,
        eventHandler: VBEventHandler, vbProp: VBProperties, actionResolver: RoleActionResolver, multiEnrichment: MultiSubjectEnrichmentHelper,
        private translateService: TranslateService) {
        super(cfService, resourceService, basicModals, sharedModals, graphModals, eventHandler, vbProp, actionResolver, multiEnrichment);

        this.eventSubscriptions.push(eventHandler.schemeChangedEvent.subscribe(
            (data: { schemes: ARTURIResource[], project: Project }) => {
                if (VBContext.getWorkingProjectCtx(this.projectCtx).getProject().getName() == data.project.getName()) {
                    this.onSchemeChanged(data.schemes);
                }
            })
        );
    }

    ngOnInit() {
        super.ngOnInit();

        this.visualizationMode = VBContext.getWorkingProjectCtx(this.projectCtx).getProjectPreferences().conceptTreePreferences.visualization;

        this.modelType = VBContext.getWorkingProjectCtx(this.projectCtx).getProject().getModelType();
            
        //Initialize working schemes
        if (this.schemes === undefined) { //if @Input is not provided at all, get the scheme from the preferences
            this.workingSchemes = VBContext.getWorkingProjectCtx(this.projectCtx).getProjectPreferences().activeSchemes;
        } else { //if @Input schemes is provided (it could be null => no scheme-mode), initialize the tree with this scheme
            this.workingSchemes = this.schemes;
        }

        if (this.schemeChangeable) {
            //init the scheme list if the concept tree allows dynamic change of scheme
            this.skosService.getAllSchemes(VBRequestOptions.getRequestOptions(this.projectCtx)).subscribe(
                schemes => {
                    ResourceUtils.sortResources(schemes, this.rendering ? SortAttribute.show : SortAttribute.value);
                    this.schemeList = schemes;
                }
            );
            if (this.workingSchemes.length > 0) { //multiple schemes not allowed when schemeChangeable true => select the first
                this.selectedSchemeUri = this.workingSchemes[0].getURI();
                this.workingSchemes = [this.workingSchemes[0]];
            } else { //no scheme mode
                this.selectedSchemeUri = "---"; //no scheme
            }
        }
    }
    
    //top bar commands handlers

    getActionContext(): VBActionFunctionCtx {
        let metaClass: ARTURIResource = ResourceUtils.convertRoleToClass(this.panelRole, this.modelType);
        let actionCtx: VBActionFunctionCtx = { metaClass: metaClass, loadingDivRef: this.viewChildTree.blockDivElement, schemes: this.workingSchemes }
        return actionCtx;
    }


    //@Override
    isActionDisabled(action: ActionDescription) {
        //In addition to the cross-panel conditions, in this case the create actions are disabled if the panel is in no-scheme mode
        return super.isActionDisabled(action) || (action.editType == "C" && this.isNoSchemeMode());
    }

    refresh() {
        this.visualizationMode = VBContext.getWorkingProjectCtx(this.projectCtx).getProjectPreferences().conceptTreePreferences.visualization;
        if (this.visualizationMode == ConceptTreeVisualizationMode.hierarchyBased) {
            //in index based visualization reinit the list
            this.viewChildTree.init();
        } else if (this.visualizationMode == ConceptTreeVisualizationMode.searchBased) {
            //in search based visualization repeat the search
            if (this.lastSearch != undefined) {
                this.doSearch(this.lastSearch);
            }
        }
    }

    private isNoSchemeMode() {
        return this.workingSchemes.length == 0;
    }

    //scheme selection menu handlers

    /**
     * Listener to <select> element that allows to change dynamically the scheme of the
     * concept tree (visible only if @Input schemeChangeable is true).
     * This is only invokable if schemeChangeable is true, this mode allow only one scheme at time, so can reset workingSchemes
     */
    private onSchemeSelectionChange() {
        var newSelectedScheme: ARTURIResource = this.getSchemeResourceFromUri(this.selectedSchemeUri);
        if (newSelectedScheme != null) { //if it is not "no-scheme"                 
            this.workingSchemes = [newSelectedScheme];
        } else {
            this.workingSchemes = [];
        }
        this.schemeChanged.emit(newSelectedScheme);
    }

    /**
     * Retrieves the ARTURIResource of a scheme URI from the available scheme. Returns null
     * if the URI doesn't represent a scheme in the list.
     */
    private getSchemeResourceFromUri(schemeUri: string): ARTURIResource {
        for (var i = 0; i < this.schemeList.length; i++) {
            if (this.schemeList[i].getURI() == schemeUri) {
                return this.schemeList[i];
            }
        }
        return null; //schemeUri was probably "---", so for no-scheme mode return a null object
    }

    private getSchemeRendering(scheme: ARTURIResource) {
        return ResourceUtils.getRendering(scheme, this.rendering);
    }

    //search handlers

    doSearch(searchedText: string) {
        this.lastSearch = searchedText;

        let projPref: ProjectPreferences = VBContext.getWorkingProjectCtx(this.projectCtx).getProjectPreferences();
        let searchSettings: SearchSettings = projPref.searchSettings;
        let searchLangs: string[];
        let includeLocales: boolean;
        if (searchSettings.restrictLang) {
            searchLangs = searchSettings.languages;
            includeLocales = searchSettings.includeLocales;
        }
        let searchingScheme: ARTURIResource[] = [];
        if (searchSettings.restrictActiveScheme) {
            if (this.schemeChangeable) {
                searchingScheme.push(this.getSchemeResourceFromUri(this.selectedSchemeUri));
            } else {
                searchingScheme = this.workingSchemes;
            }
        }

        UIUtils.startLoadingDiv(this.viewChildTree.blockDivElement.nativeElement);
        this.searchService.searchResource(searchedText, [RDFResourceRolesEnum.concept], searchSettings.useLocalName, searchSettings.useURI,
            searchSettings.useNotes, searchSettings.stringMatchMode, searchLangs, includeLocales, searchingScheme, 
            projPref.conceptTreePreferences.multischemeMode, VBRequestOptions.getRequestOptions(this.projectCtx)).subscribe(
            searchResult => {
                UIUtils.stopLoadingDiv(this.viewChildTree.blockDivElement.nativeElement);
                ResourceUtils.sortResources(searchResult, this.rendering ? SortAttribute.show : SortAttribute.value);
                this.visualizationMode = projPref.conceptTreePreferences.visualization;
                if (this.visualizationMode == ConceptTreeVisualizationMode.hierarchyBased) {
                    if (searchResult.length == 0) {
                        this.basicModals.alert({key:"SEARCH.SEARCH"}, {key:"MESSAGES.NO_RESULTS_FOUND_FOR", params:{text: searchedText}}, ModalType.warning);
                    } else { //1 or more results
                        if (searchResult.length == 1) {
                            this.selectSearchedResource(searchResult[0]);
                        } else { //multiple results, ask the user which one select
                            this.sharedModals.selectResource({key:"SEARCH.SEARCH"}, {key:"MESSAGES.TOT_RESULTS_FOUND", params:{count: searchResult.length}}, searchResult, this.rendering).then(
                                (selectedResource: any) => {
                                    this.selectSearchedResource(selectedResource);
                                },
                                () => { }
                            );
                        }
                    }
                } else { //searchBased
                    if (searchResult.length == 0) {
                        this.basicModals.alert({key:"SEARCH.SEARCH"}, {key:"MESSAGES.NO_RESULTS_FOUND_FOR", params:{text: searchedText}}, ModalType.warning);
                    }
                    this.viewChildTree.forceList(searchResult);
                }
            }
        );
    }

    /**
     * This method could be invoked by:
     * - the current component in doSearch only in hierarchy-based mode
     * - the parent component after an advanced search, so it should takes in account also the search-based mode
     * @param resource 
     */
    public selectSearchedResource(resource: ARTURIResource) {
        this.getSearchedConceptSchemes(resource).subscribe(
            schemes => {
                let isInActiveSchemes: boolean = false;
                if (this.workingSchemes.length == 0) { //no scheme mode -> searched concept should be visible
                    isInActiveSchemes = true;
                } else {
                    for (var i = 0; i < schemes.length; i++) {
                        if (ResourceUtils.containsNode(this.workingSchemes, schemes[i])) {
                            isInActiveSchemes = true;
                            break;
                        }
                    }
                }
                if (isInActiveSchemes) {
                    this.selectResourceVisualizationModeAware(resource);
                } else {
                    if (schemes.length == 0) { //searched concept doesn't belong to any scheme => ask switch to no-scheme mode
                        this.basicModals.confirm({key:"SEARCH.SEARCH"}, {key:"MESSAGES.SWITCH_SCHEME_FOR_SEARCHED_CONCEPT_CONFIRM"}, ModalType.warning).then(
                            confirm => {
                                this.vbProp.setActiveSchemes(VBContext.getWorkingProjectCtx(this.projectCtx), []); //update the active schemes
                                setTimeout(() => {
                                    this.selectResourceVisualizationModeAware(resource);
                                });
                            },
                            cancel => {}
                        )
                    } else { //searched concept belongs to at least one scheme => ask to activate one of them
                        let message = this.translateService.instant("MESSAGES.SWITCH_SCHEME_FOR_SEARCHED_CONCEPT_SELECT.BELONGS_TO_FOLLOWING");
                        if (schemes.length > 1) {
                            message += " " + this.translateService.instant("MESSAGES.SWITCH_SCHEME_FOR_SEARCHED_CONCEPT_SELECT.SCHEMES");
                        } else {
                            message += " " + this.translateService.instant("MESSAGES.SWITCH_SCHEME_FOR_SEARCHED_CONCEPT_SELECT.SCHEME");
                        }
                        this.resourceService.getResourcesInfo(schemes).subscribe(
                            schemes => {
                                this.sharedModals.selectResource({key:"SEARCH.SEARCH"}, message, schemes, this.rendering).then(
                                    (scheme: ARTURIResource) => {
                                        this.vbProp.setActiveSchemes(VBContext.getWorkingProjectCtx(this.projectCtx), this.workingSchemes.concat(scheme)); //update the active schemes
                                        setTimeout(() => {
                                            this.selectResourceVisualizationModeAware(resource);
                                        });
                                    },
                                    () => {}
                                );
                            }
                        );
                    }
                }
            }
        );
    }

    private selectResourceVisualizationModeAware(resource: ARTURIResource) {
        this.visualizationMode = VBContext.getWorkingProjectCtx(this.projectCtx).getProjectPreferences().conceptTreePreferences.visualization;
        if (this.visualizationMode == ConceptTreeVisualizationMode.hierarchyBased) {
            this.openTreeAt(resource);
        } else {
            this.viewChildTree.forceList([resource]);
            setTimeout(() => {
                this.viewChildTree.openRoot([resource]);
            })
        }
    }

    /**
     * Schemes of a searched concept could be retrieved from a "schemes" attribute (if searched by a "ordinary" search), or from
     * invoking a specific service (if the "schemes" attr is not present when searched by advanced search)
     */
    private getSearchedConceptSchemes(concept: ARTURIResource): Observable<ARTURIResource[]> {
        let schemes: ARTURIResource[] = concept.getAdditionalProperty(ResAttribute.SCHEMES);
        if (schemes == null) {
            return this.skosService.getSchemesOfConcept(concept);
        } else {
            return of(schemes);
        }
    }

    openTreeAt(resource: ARTURIResource) {
        this.viewChildTree.openTreeAt(resource);
    }

    settings() {
        const modalRef: NgbModalRef = this.modalService.open(ConceptTreeSettingsModal, new ModalOptions());
        return modalRef.result.then(
            () => {
                this.viewChildTree.init();
            },
            () => {}
        );
    }

    onSwitchMode(mode: ConceptTreeVisualizationMode) {
        let concTreePrefs = VBContext.getWorkingProjectCtx().getProjectPreferences().conceptTreePreferences;
        concTreePrefs.visualization = mode;
        this.vbProp.setConceptTreePreferences(concTreePrefs);
        this.viewChildTree.init();
    }

    isAddToSchemeEnabled() {
        return this.selectedNode != null && this.isContextDataPanel() && this.editable &&
            AuthorizationEvaluator.isAuthorized(VBActionsEnum.skosAddMultipleToScheme);
    }
    private addToScheme() {
        this.browsingModals.browseSchemeList({key:"DATA.ACTIONS.SELECT_SCHEME"}).then(
            scheme => {
                const modalRef: NgbModalRef = this.modalService.open(AddToSchemeModal, new ModalOptions());
                modalRef.componentInstance.title = "Add concepts to scheme";
                modalRef.componentInstance.concept = this.selectedNode;
                modalRef.componentInstance.scheme = scheme;
                return modalRef.result;
            },
            () => {}
        )
    }

    //EVENT LISTENERS

    //when a concept is removed from a scheme, it should be still visible in res view,
    //but no more selected in the tree if it was in the current scheme 
    onConceptRemovedFromScheme(concept: ARTURIResource) {
        this.selectedNode = null;
    }

    private onSchemeChanged(schemes: ARTURIResource[]) {
        this.workingSchemes = schemes;
        //in case of visualization search based reset the list (in case of hierarchy the tree is refreshed following ngOnChanges on @Input schemes)
        this.visualizationMode = VBContext.getWorkingProjectCtx(this.projectCtx).getProjectPreferences().conceptTreePreferences.visualization;
        if (this.visualizationMode == ConceptTreeVisualizationMode.searchBased && this.lastSearch != null) {
            this.viewChildTree.init();
        }
    }

}