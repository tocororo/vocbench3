import { Component, EventEmitter, Input, Output, ViewChild } from "@angular/core";
import { OverlayConfig } from 'ngx-modialog';
import { BSModalContextBuilder, Modal } from 'ngx-modialog/plugins/bootstrap';
import { ARTResource, ARTURIResource, RDFResourceRolesEnum } from "../../models/ARTResources";
import { OntoLex, SKOS } from "../../models/Vocabulary";
import { AuthorizationEvaluator } from "../../utils/AuthorizationEvaluator";
import { TreeListContext } from "../../utils/UIUtils";
import { VBActionsEnum } from "../../utils/VBActions";
import { ProjectContext, VBContext } from "../../utils/VBContext";
import { BasicModalServices } from "../../widget/modal/basicModal/basicModalServices";
import { SharedModalServices } from "../../widget/modal/sharedModal/sharedModalServices";
import { LexicalEntryListPanelComponent } from "../ontolex/lexicalEntry/lexicalEntryListPanel/lexicalEntryListPanelComponent";
import { LexiconListPanelComponent } from "../ontolex/lexicon/lexiconListPanel/lexiconListPanelComponent";
import { ClassIndividualTreePanelComponent } from "../owl/classIndividualTreePanel/classIndividualTreePanelComponent";
import { DatatypeListPanelComponent } from "../owl/datatypeListPanel/datatypeListPanelComponent";
import { PropertyTreePanelComponent } from "../property/propertyTreePanel/propertyTreePanelComponent";
import { CollectionTreePanelComponent } from "../skos/collection/collectionTreePanel/collectionTreePanelComponent";
import { ConceptTreePanelComponent } from "../skos/concept/conceptTreePanel/conceptTreePanelComponent";
import { SchemeListPanelComponent } from "../skos/scheme/schemeListPanel/schemeListPanelComponent";
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

    private context: TreeListContext = TreeListContext.dataPanel;

    private selectedResource: ARTResource;

    private showTabCache: {[key: string]: boolean} = {};

    private ONTO_TYPE: string;
    
    private tabs: { role: RDFResourceRolesEnum, label: string }[] = [
        { role: RDFResourceRolesEnum.cls, label: "Class" },
        { role: RDFResourceRolesEnum.concept, label: "Concept" },
        { role: RDFResourceRolesEnum.conceptScheme, label: "Scheme" },
        { role: RDFResourceRolesEnum.skosCollection, label: "Collection" },
        { role: RDFResourceRolesEnum.property, label: "Property" },
        { role: RDFResourceRolesEnum.limeLexicon, label: "Lexicon" },
        { role: RDFResourceRolesEnum.ontolexLexicalEntry, label: "Lex.Entry" },
        { role: RDFResourceRolesEnum.dataRange, label: "Datatype" }
    ];
    private activeTab: RDFResourceRolesEnum;
    private allowMultiselection: boolean = true;

    constructor(private modal: Modal, private basicModals: BasicModalServices, private sharedModals: SharedModalServices) { }

    ngOnInit() {
        this.ONTO_TYPE = this.getWorkingContext().getProject().getModelType();
        if (this.ONTO_TYPE == SKOS.uri) {
            if (this.isConceptAuthorized()) {
                this.activeTab = RDFResourceRolesEnum.concept;
            } else if (this.isCollectionAuthorized()) {
                this.activeTab = RDFResourceRolesEnum.skosCollection;
            } else if (this.isSchemeAuthorized()) {
                this.activeTab = RDFResourceRolesEnum.conceptScheme;
            } else if (this.isClassAuthorized()) {
                this.activeTab = RDFResourceRolesEnum.cls;
            } else if (this.isPropertyAuthorized()) {
                this.activeTab = RDFResourceRolesEnum.property;
            } else if (this.isDataRangeAuthorized()) {
                this.activeTab = RDFResourceRolesEnum.dataRange;
            }
        } else if (this.ONTO_TYPE == OntoLex.uri) {
            if (this.isLexiconAuthorized()) {
                this.activeTab = RDFResourceRolesEnum.limeLexicon;
            } else if (this.isLexicalEntryAuthorized()) {
                this.activeTab = RDFResourceRolesEnum.ontolexLexicalEntry;
            } else if (this.isConceptAuthorized()) {
                this.activeTab = RDFResourceRolesEnum.concept;
            } else if (this.isCollectionAuthorized()) {
                this.activeTab = RDFResourceRolesEnum.skosCollection;
            } else if (this.isSchemeAuthorized()) {
                this.activeTab = RDFResourceRolesEnum.conceptScheme;
            } else if (this.isClassAuthorized()) {
                this.activeTab = RDFResourceRolesEnum.cls;
            } else if (this.isPropertyAuthorized()) {
                this.activeTab = RDFResourceRolesEnum.property;
            } else if (this.isDataRangeAuthorized()) {
                this.activeTab = RDFResourceRolesEnum.dataRange;
            }
        } else { //OWL
            if (this.isClassAuthorized()) {
                this.activeTab = RDFResourceRolesEnum.cls;
            } else if (this.isPropertyAuthorized()) {
                this.activeTab = RDFResourceRolesEnum.property;
            } else if (this.isDataRangeAuthorized()) {
                this.activeTab = RDFResourceRolesEnum.dataRange;
            }
        }
        if (this.readonly == false) { //if readonly is false (or not provided as @Input)
            this.readonly = VBContext.getContextVersion() != null; //if it is working on an old dump version, disable the updates
        }
        if (this.readonly || !this.editable) {
            this.allowMultiselection = false;
        }
        
    }

    private onNodeSelected(node: ARTResource) {
        this.nodeSelected.emit(node);
    }

    public syncResource(resource: ARTResource, allowTabChange?: boolean) {
        if (resource.isURIResource()) { //in the trees/lists are visible only IRI resources, so allow to sync only ARTURIResource
            let resRole: RDFResourceRolesEnum = resource.getRole();
            if (allowTabChange && this.activeTab != resRole && this.showTab(resRole)) { //if the tab needs to be changed and the target tab is visible
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

    private isProjectSKOS(): boolean {
        return (this.ONTO_TYPE == SKOS.uri);
    }

    private isProjectOntolex(): boolean {
        return (this.ONTO_TYPE == OntoLex.uri);
    }

    private openSettings() {
        const builder = new BSModalContextBuilder<any>();
        let overlayConfig: OverlayConfig = { context: builder.keyboard(27).toJSON() };
        return this.modal.open(TreeListSettingsModal, overlayConfig).result;
    }

    //TAB HANDLER

    private showTab(tab: RDFResourceRolesEnum): boolean {
        if (this.showTabCache[tab] == null) {
            let show: boolean = false;
            if (tab == RDFResourceRolesEnum.cls) { //always visible, except if explicitly hidden
                show = this.isTabAuthorized(tab) && (this.hiddenTabs == null || this.hiddenTabs.indexOf(tab) == -1); 
            } else if (tab == RDFResourceRolesEnum.concept) { //visible for skos and ontolex projects, except if explicitly hidden
                show = (
                    this.isTabAuthorized(tab) && 
                    (this.isProjectSKOS() || this.isProjectOntolex()) &&
                    (this.hiddenTabs == null || this.hiddenTabs.indexOf(tab) == -1)
                );
            } else if (tab == RDFResourceRolesEnum.conceptScheme) { //visible for skos and ontolex projects, except if explicitly hidden
                show = (
                    this.isTabAuthorized(tab) &&
                    (this.isProjectSKOS() || this.isProjectOntolex()) &&
                    (this.hiddenTabs == null || this.hiddenTabs.indexOf(tab) == -1)
                );
            } else if (tab == RDFResourceRolesEnum.skosCollection) { //visible for skos and ontolex projects, except if explicitly hidden
                show = (
                    this.isTabAuthorized(tab) &&
                    (this.isProjectSKOS() || this.isProjectOntolex()) &&
                    (this.hiddenTabs == null || this.hiddenTabs.indexOf(tab) == -1)
                );
            } else if (tab == RDFResourceRolesEnum.property) { //always visible, except if explicitly hidden
                show = this.isTabAuthorized(tab) && (this.hiddenTabs == null || this.hiddenTabs.indexOf(tab) == -1);
            } else if (tab == RDFResourceRolesEnum.limeLexicon) { //visible for ontolex projects, except if explicitly hidden
                show = this.isTabAuthorized(tab) && this.isProjectOntolex() && (this.hiddenTabs == null || this.hiddenTabs.indexOf(tab) == -1);
            } else if (tab == RDFResourceRolesEnum.ontolexLexicalEntry) { //visible for ontolex projects, except if explicitly hidden
                show = this.isTabAuthorized(tab) && this.isProjectOntolex() && (this.hiddenTabs == null || this.hiddenTabs.indexOf(tab) == -1);
            } else if (tab == RDFResourceRolesEnum.dataRange) { //always visible, except if explicitly hidden
                show = this.isTabAuthorized(tab) && this.hiddenTabs == null || this.hiddenTabs.indexOf(tab) == -1;
            } else {
                show = false;
            }
            this.showTabCache[tab] = show;
        }
        return this.showTabCache[tab];
    }

    private selectTab(tabName: RDFResourceRolesEnum) {
        this.activeTab = tabName;
    }

    private isTabAuthorized(tab: RDFResourceRolesEnum): boolean {
        if (tab == RDFResourceRolesEnum.cls) {
            return this.isClassAuthorized();
        } else if (tab == RDFResourceRolesEnum.concept) {
            return this.isConceptAuthorized();
        } else if (tab == RDFResourceRolesEnum.conceptScheme) {
            return this.isSchemeAuthorized();
        } else if (tab == RDFResourceRolesEnum.skosCollection) {
            return this.isCollectionAuthorized();
        } else if (tab == RDFResourceRolesEnum.property) { 
            return this.isPropertyAuthorized();
        } else if (tab == RDFResourceRolesEnum.limeLexicon) {
            return this.isLexiconAuthorized();
        } else if (tab == RDFResourceRolesEnum.ontolexLexicalEntry) {
            return this.isLexicalEntryAuthorized();
        } else if (tab == RDFResourceRolesEnum.dataRange) {
            return this.isDataRangeAuthorized();
        } else {
            return false;
        }
    }

    private isClassAuthorized() {
        return AuthorizationEvaluator.isAuthorized(VBActionsEnum.classesGetClassTaxonomy);
    }
    private isConceptAuthorized() {
        return AuthorizationEvaluator.isAuthorized(VBActionsEnum.skosGetConceptTaxonomy);
    }
    private isSchemeAuthorized() {
        return AuthorizationEvaluator.isAuthorized(VBActionsEnum.skosGetSchemes);
    }
    private isCollectionAuthorized() {
        return AuthorizationEvaluator.isAuthorized(VBActionsEnum.skosGetCollectionTaxonomy);
    }
    private isPropertyAuthorized() {
        return AuthorizationEvaluator.isAuthorized(VBActionsEnum.propertiesGetPropertyTaxonomy);
    }
    private isLexiconAuthorized() {
        return AuthorizationEvaluator.isAuthorized(VBActionsEnum.ontolexGetLexicon);
    }
    private isLexicalEntryAuthorized() {
        return AuthorizationEvaluator.isAuthorized(VBActionsEnum.ontolexGetLexicalEntry);
    }
    private isDataRangeAuthorized() {
        return AuthorizationEvaluator.isAuthorized(VBActionsEnum.datatypesGetDatatype);
    }

    //Focus the panel and select the searched resource after an advanced search
    private advancedSearch(resource: ARTResource) {
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
            this.basicModals.alert("Search", "The resoruce " + resource.getShow() + " cannot be focused in a tree/list view, so its ResourceView will be shown in a modal dialog", "warning").then(
                () => {
                    this.sharedModals.openResourceView(resource, false);
                }
            );
        }
        if (tabToActivate != null) {
            if (this.showTab(tabToActivate)) { //if the tab is visible => oper activate the tab and select the resource in list/tree
                this.activeTab = tabToActivate;
                setTimeout(() => {
                    //wait the update of the UI after the change of the tab
                    if (tabToActivate == RDFResourceRolesEnum.property) {
                        this.viewChildPropertyPanel.openTreeAt(<ARTURIResource>resource);
                    } else if (tabToActivate == RDFResourceRolesEnum.cls) {
                        this.viewChildClsIndPanel.selectSearchedResource(<ARTURIResource>resource);
                    } else if (tabToActivate == RDFResourceRolesEnum.concept) {
                        this.viewChildConceptPanel.selectSearchedResource(<ARTURIResource>resource);
                    } else if (tabToActivate == RDFResourceRolesEnum.conceptScheme) {
                        this.viewChildSchemePanel.openAt(<ARTURIResource>resource)
                    } else if (tabToActivate == RDFResourceRolesEnum.limeLexicon) {
                        this.viewChildLexiconPanel.openAt(<ARTURIResource>resource);
                    } else if (tabToActivate == RDFResourceRolesEnum.ontolexLexicalEntry) {
                        this.viewChildLexialEntryPanel.selectAdvancedSearchedResource(<ARTURIResource>resource);
                    } else if (tabToActivate == RDFResourceRolesEnum.skosCollection) {
                        this.viewChildCollectionPanel.openTreeAt(<ARTURIResource>resource);
                    } else if (tabToActivate == RDFResourceRolesEnum.dataRange) {
                        this.viewChildDatatypePanel.openAt(<ARTURIResource>resource);
                    }
                });
            } else { //if not visible, open resource in modal
                this.basicModals.alert("Search", "The resoruce " + resource.getShow() + " cannot be focused in a tree/list view, so its ResourceView will be shown in a modal dialog", "warning").then(
                    () => {
                        this.sharedModals.openResourceView(resource, false);
                    }
                );
            }
        }
    }

    private getWorkingContext() {
        if (this.projectCtx != null) {
            return this.projectCtx;
        } else {
            return VBContext.getWorkingProjectCtx();
        }
    }

}