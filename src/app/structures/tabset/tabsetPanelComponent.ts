import { ChangeDetectorRef, Component, EventEmitter, Input, Output, ViewChild } from "@angular/core";
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { DataStructureUtils } from 'src/app/models/DataStructure';
import { CustomTreeSettings } from 'src/app/models/Properties';
import { ModalOptions, ModalType } from 'src/app/widget/modal/Modals';
import { ARTResource, ARTURIResource, RDFResourceRolesEnum } from "../../models/ARTResources";
import { EDOAL, OntoLex, SKOS } from "../../models/Vocabulary";
import { AuthorizationEvaluator } from "../../utils/AuthorizationEvaluator";
import { TreeListContext } from "../../utils/UIUtils";
import { VBActionsEnum } from "../../utils/VBActions";
import { ProjectContext, VBContext } from "../../utils/VBContext";
import { BasicModalServices } from "../../widget/modal/basicModal/basicModalServices";
import { SharedModalServices } from "../../widget/modal/sharedModal/sharedModalServices";
import { DatatypeListPanelComponent } from "../lists/datatype/datatypeListPanelComponent";
import { LexicalEntryListPanelComponent } from "../lists/lexicalEntry/lexicalEntryListPanelComponent";
import { LexiconListPanelComponent } from "../lists/lexicon/lexiconListPanelComponent";
import { SchemeListPanelComponent } from "../lists/scheme/schemeListPanelComponent";
import { ClassIndividualTreePanelComponent } from "../trees/class/classIndividualTreePanelComponent";
import { CollectionTreePanelComponent } from "../trees/collection/collectionTreePanelComponent";
import { ConceptTreePanelComponent } from "../trees/concept/conceptTreePanelComponent";
import { PropertyTreePanelComponent } from "../trees/property/propertyTreePanelComponent";
import { TreeListSettingsModal } from "./treeListSettingsModal";

@Component({
    selector: "tabset-panel",
    templateUrl: "./tabsetPanelComponent.html",
    host: { class: "vbox" }
})
export class TabsetPanelComponent {

    @Input() projectCtx: ProjectContext;
    @Input() hiddenTabs: RDFResourceRolesEnum[];
    @Input() readonly: boolean = false;
    @Input() editable: boolean = true;
    @Output() nodeSelected = new EventEmitter<ARTResource>();

    @ViewChild(ConceptTreePanelComponent) viewChildConceptPanel: ConceptTreePanelComponent;
    @ViewChild(CollectionTreePanelComponent) viewChildCollectionPanel: CollectionTreePanelComponent;
    @ViewChild(SchemeListPanelComponent) viewChildSchemePanel: SchemeListPanelComponent;
    @ViewChild(PropertyTreePanelComponent) viewChildPropertyPanel: PropertyTreePanelComponent;
    @ViewChild(ClassIndividualTreePanelComponent) viewChildClsIndPanel: ClassIndividualTreePanelComponent;
    @ViewChild(LexiconListPanelComponent) viewChildLexiconPanel: LexiconListPanelComponent;
    @ViewChild(LexicalEntryListPanelComponent) viewChildLexialEntryPanel: LexicalEntryListPanelComponent;
    @ViewChild(DatatypeListPanelComponent) viewChildDatatypePanel: DatatypeListPanelComponent;

    RDFResourceRoleEnum = RDFResourceRolesEnum; //workaround for using enum in template

    context: TreeListContext = TreeListContext.dataPanel;

    selectedResource: ARTResource;

    tabs: { role: RDFResourceRolesEnum, translationKey: string }[];
    activeTab: RDFResourceRolesEnum;
    allowMultiselection: boolean = true;

    constructor(private modalService: NgbModal, private basicModals: BasicModalServices, private sharedModals: SharedModalServices, private changeDetectorRef: ChangeDetectorRef) { }

    ngOnInit() {
        this.init();
    }

    init() {
        this.initTabs();

        //init active tab
        if (this.activeTab != null) {
            if (!this.tabs.some(tab => tab.role == this.activeTab)) {
                this.activeTab = null;
            }
        }
        if (this.activeTab == null) {
            let model = this.getWorkingContext().getProject().getModelType();
            let tabsPriority: RDFResourceRolesEnum[] = DataStructureUtils.panelsPriority[model];
            for (let t of tabsPriority) {
                if (this.tabs.some(tab => tab.role == t)) {
                    this.activeTab = t;
                    break;
                }
            }
            if (this.activeTab == null && this.tabs.length > 0) {
                this.activeTab = this.tabs[0].role;
            }
        }

        if (this.readonly == false) { //if readonly is false (or not provided as @Input)
            this.readonly = VBContext.getContextVersion() != null; //if it is working on an old dump version, disable the updates
        }
        if (this.readonly || !this.editable) {
            this.allowMultiselection = false;
        }
    }

    onNodeSelected(node: ARTResource) {
        this.nodeSelected.emit(node);
    }

    syncResource(resource: ARTResource, allowTabChange?: boolean) {
        if (resource.isURIResource()) { //in the trees/lists are visible only IRI resources, so allow to sync only ARTURIResource
            let resRole: RDFResourceRolesEnum = resource.getRole();
            if (allowTabChange && this.activeTab != resRole && this.isTabVisible(resRole)) { //if the tab needs to be changed and the target tab is visible
                this.activeTab = resRole;
            }
            //sync the resource in the tree/list only if the resource has the same role of the tree/list currently active
            if (this.activeTab == resRole) {
                if (resRole == RDFResourceRolesEnum.concept) {
                    this.viewChildConceptPanel.openTreeAt(<ARTURIResource>resource);
                } else if (resRole == RDFResourceRolesEnum.conceptScheme) {
                    this.viewChildSchemePanel.openAt(<ARTURIResource>resource);
                } else if (resRole == RDFResourceRolesEnum.skosCollection || resRole == RDFResourceRolesEnum.skosOrderedCollection) {
                    this.viewChildCollectionPanel.openTreeAt(<ARTURIResource>resource);
                } else if (resRole == RDFResourceRolesEnum.property || resRole == RDFResourceRolesEnum.annotationProperty ||
                    resRole == RDFResourceRolesEnum.datatypeProperty || resRole == RDFResourceRolesEnum.objectProperty ||
                    resRole == RDFResourceRolesEnum.ontologyProperty) {
                    this.viewChildPropertyPanel.openTreeAt(<ARTURIResource>resource);
                } else if (resRole == RDFResourceRolesEnum.cls) {
                    this.viewChildClsIndPanel.openClassTreeAt(<ARTURIResource>resource);
                } else if (resRole == RDFResourceRolesEnum.limeLexicon) {
                    this.viewChildLexiconPanel.openAt(<ARTURIResource>resource);
                } else if (resRole == RDFResourceRolesEnum.ontolexLexicalEntry) {
                    this.viewChildLexialEntryPanel.openAt(<ARTURIResource>resource);
                } else if (resRole == RDFResourceRolesEnum.dataRange) {
                    this.viewChildDatatypePanel.openAt(<ARTURIResource>resource);
                }
            }
        }
    }

    //TAB HANDLER

    private initTabs() {
        let allTabs: RDFResourceRolesEnum[] = [RDFResourceRolesEnum.cls, RDFResourceRolesEnum.concept, RDFResourceRolesEnum.conceptScheme,
            RDFResourceRolesEnum.skosCollection, RDFResourceRolesEnum.property, RDFResourceRolesEnum.limeLexicon, RDFResourceRolesEnum.ontolexLexicalEntry, RDFResourceRolesEnum.dataRange];
        this.tabs = allTabs
            .filter(t => {
                /**
                 * Determines the visibility of a panel according:
                 * - project model
                 * - user authorizations
                 * - input hiddenTabs
                 * - structurePanelFilter preference
                 */
                let model = this.getWorkingContext().getProject().getModelType();
                let visible: boolean;
                if (model == EDOAL.uri) { //in edoal project, only concept and schemes are visible
                    visible = t == RDFResourceRolesEnum.concept || t == RDFResourceRolesEnum.conceptScheme;
                } else {
                    visible =
                        this.isPanelCompliantWithCurrentModel(t, model) &&
                        this.isTabAuthorized(t) &&
                        (this.hiddenTabs == null || !this.hiddenTabs.includes(t)) &&
                        !this.getWorkingContext().getProjectPreferences().structurePanelFilter.includes(t);
                }
                return visible;
            })
            .map(t => {
                return { role: t, translationKey: DataStructureUtils.panelTranslationMap[t] };
            });


        //if a custom tree is configured, add the Custom tab
        let ctSettings: CustomTreeSettings = VBContext.getWorkingProjectCtx(this.projectCtx).getProjectPreferences().customTreeSettings;
        if (ctSettings.enabled) {
            this.tabs.push({ role: RDFResourceRolesEnum.undetermined, translationKey: "Custom" });
        }
    }

    selectTab(tabName: RDFResourceRolesEnum) {
        this.activeTab = tabName;
    }

    private isTabAuthorized(tab: RDFResourceRolesEnum): boolean {
        if (tab == RDFResourceRolesEnum.cls) {
            return AuthorizationEvaluator.isAuthorized(VBActionsEnum.classesGetClassTaxonomy);
        } else if (tab == RDFResourceRolesEnum.concept) {
            return AuthorizationEvaluator.isAuthorized(VBActionsEnum.skosGetConceptTaxonomy);
        } else if (tab == RDFResourceRolesEnum.conceptScheme) {
            return AuthorizationEvaluator.isAuthorized(VBActionsEnum.skosGetSchemes);
        } else if (tab == RDFResourceRolesEnum.skosCollection) {
            return AuthorizationEvaluator.isAuthorized(VBActionsEnum.skosGetCollectionTaxonomy);
        } else if (tab == RDFResourceRolesEnum.property) {
            return AuthorizationEvaluator.isAuthorized(VBActionsEnum.propertiesGetPropertyTaxonomy);
        } else if (tab == RDFResourceRolesEnum.limeLexicon) {
            return AuthorizationEvaluator.isAuthorized(VBActionsEnum.ontolexGetLexicon);
        } else if (tab == RDFResourceRolesEnum.ontolexLexicalEntry) {
            return AuthorizationEvaluator.isAuthorized(VBActionsEnum.ontolexGetLexicalEntry);
        } else if (tab == RDFResourceRolesEnum.dataRange) {
            return AuthorizationEvaluator.isAuthorized(VBActionsEnum.datatypesGetDatatype);
        } else {
            return false;
        }
    }

    isTabVisible(tab: RDFResourceRolesEnum): boolean {
        return this.tabs.some(t => t.role == tab);
    }

    private isPanelCompliantWithCurrentModel(panel: RDFResourceRolesEnum, model: string): boolean {
        if (panel == RDFResourceRolesEnum.cls) { //always visible
            return true;
        } else if (panel == RDFResourceRolesEnum.concept) { //visible for skos and ontolex
            return model == SKOS.uri || model == OntoLex.uri;
        } else if (panel == RDFResourceRolesEnum.conceptScheme) { //visible for skos and ontolex
            return model == SKOS.uri || model == OntoLex.uri;
        } else if (panel == RDFResourceRolesEnum.skosCollection) { //visible for skos and ontolex
            return model == SKOS.uri || model == OntoLex.uri;
        } else if (panel == RDFResourceRolesEnum.property) { //always visible
            return true;
        } else if (panel == RDFResourceRolesEnum.limeLexicon) { //visible for ontolex
            return model == OntoLex.uri;
        } else if (panel == RDFResourceRolesEnum.ontolexLexicalEntry) { //visible for ontolex
            return model == OntoLex.uri;
        } else if (panel == RDFResourceRolesEnum.dataRange) { //always visible
            return true;
        }
        return true; //other (should never happen)
    }


    //Focus the panel and select the searched resource after an advanced search
    advancedSearch(resource: ARTResource) {
        let tabToActivate: RDFResourceRolesEnum;
        if (resource.isURIResource()) {
            let role = resource.getRole();
            if (role == RDFResourceRolesEnum.property || role == RDFResourceRolesEnum.annotationProperty ||
                role == RDFResourceRolesEnum.datatypeProperty || role == RDFResourceRolesEnum.objectProperty ||
                role == RDFResourceRolesEnum.ontologyProperty) {
                tabToActivate = RDFResourceRolesEnum.property;
            } else if (role == RDFResourceRolesEnum.cls || role == RDFResourceRolesEnum.individual) {
                tabToActivate = RDFResourceRolesEnum.cls;
            } else if (role == RDFResourceRolesEnum.concept) {
                tabToActivate = RDFResourceRolesEnum.concept;
            } else if (role == RDFResourceRolesEnum.conceptScheme) {
                tabToActivate = RDFResourceRolesEnum.conceptScheme;
            } else if (role == RDFResourceRolesEnum.limeLexicon) {
                tabToActivate = RDFResourceRolesEnum.limeLexicon;
            } else if (role == RDFResourceRolesEnum.ontolexLexicalEntry) {
                tabToActivate = RDFResourceRolesEnum.ontolexLexicalEntry;
            } else if (role == RDFResourceRolesEnum.skosCollection || role == RDFResourceRolesEnum.skosOrderedCollection) {
                tabToActivate = RDFResourceRolesEnum.skosCollection;
            } else if (role == RDFResourceRolesEnum.dataRange) {
                tabToActivate = RDFResourceRolesEnum.dataRange;
            } else {
                this.sharedModals.openResourceView(resource, false);
            }
        } else { //BNode are not in trees or lists => open in modal
            this.basicModals.alert({ key: "SEARCH.SEARCH" }, { key: "MESSAGES.RESOURCE_NOT_FOCUSABLE_RES_VIEW_MODAL", params: { resource: resource.getShow() } }, ModalType.warning).then(
                () => {
                    this.sharedModals.openResourceView(resource, false);
                }
            );
        }
        if (tabToActivate != null) {
            if (this.isTabVisible(tabToActivate)) { //if the tab is visible => activate the tab and select the resource in list/tree
                this.activeTab = tabToActivate;
                //wait the update of the UI after the change of the tab
                this.changeDetectorRef.detectChanges();
                if (tabToActivate == RDFResourceRolesEnum.property) {
                    this.viewChildPropertyPanel.openTreeAt(<ARTURIResource>resource);
                } else if (tabToActivate == RDFResourceRolesEnum.cls) {
                    this.viewChildClsIndPanel.selectSearchedResource(<ARTURIResource>resource);
                } else if (tabToActivate == RDFResourceRolesEnum.concept) {
                    this.viewChildConceptPanel.selectSearchedResource(<ARTURIResource>resource);
                } else if (tabToActivate == RDFResourceRolesEnum.conceptScheme) {
                    this.viewChildSchemePanel.openAt(<ARTURIResource>resource);
                } else if (tabToActivate == RDFResourceRolesEnum.limeLexicon) {
                    this.viewChildLexiconPanel.openAt(<ARTURIResource>resource);
                } else if (tabToActivate == RDFResourceRolesEnum.ontolexLexicalEntry) {
                    this.viewChildLexialEntryPanel.selectAdvancedSearchedResource(<ARTURIResource>resource);
                } else if (tabToActivate == RDFResourceRolesEnum.skosCollection) {
                    this.viewChildCollectionPanel.openTreeAt(<ARTURIResource>resource);
                } else if (tabToActivate == RDFResourceRolesEnum.dataRange) {
                    this.viewChildDatatypePanel.openAt(<ARTURIResource>resource);
                }
            } else { //if not visible, open resource in modal
                this.basicModals.alert({ key: "SEARCH.SEARCH" }, { key: "MESSAGES.RESOURCE_NOT_FOCUSABLE_RES_VIEW_MODAL", params: { resource: resource.getShow() } }, ModalType.warning).then(
                    () => {
                        this.sharedModals.openResourceView(resource, false);
                    }
                );
            }
        }
    }

    openSettings() {
        const modalRef: NgbModalRef = this.modalService.open(TreeListSettingsModal, new ModalOptions());
        modalRef.componentInstance.projectCtx = this.projectCtx;
        modalRef.result.then(
            () => {
                this.init();
            },
            () => { }
        );
    }

    private getWorkingContext() {
        if (this.projectCtx != null) {
            return this.projectCtx;
        } else {
            return VBContext.getWorkingProjectCtx();
        }
    }

}