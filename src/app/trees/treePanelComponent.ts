import { Component, EventEmitter, Output, ViewChild } from "@angular/core";
import { OverlayConfig } from 'ngx-modialog';
import { BSModalContextBuilder, Modal } from 'ngx-modialog/plugins/bootstrap';
import { ARTResource, ARTURIResource, RDFResourceRolesEnum } from "../models/ARTResources";
import { OntoLex, SKOS } from "../models/Vocabulary";
import { ClassIndividualTreePanelComponent } from "./owl/classIndividualTreePanel/classIndividualTreePanelComponent";
import { PropertyTreePanelComponent } from "./property/propertyTreePanel/propertyTreePanelComponent";
import { CollectionTreePanelComponent } from "./skos/collection/collectionTreePanel/collectionTreePanelComponent";
import { ConceptTreePanelComponent } from "./skos/concept/conceptTreePanel/conceptTreePanelComponent";
import { SchemeListPanelComponent } from "./skos/scheme/schemeListPanel/schemeListPanelComponent";
import { AuthorizationEvaluator } from "../utils/AuthorizationEvaluator";
import { TreeListContext } from "../utils/UIUtils";
import { VBContext } from "../utils/VBContext";
import { BasicModalServices } from "../widget/modal/basicModal/basicModalServices";
import { SharedModalServices } from "../widget/modal/sharedModal/sharedModalServices";
import { LexicalEntryListPanelComponent } from "./ontolex/lexicalEntry/lexicalEntryListPanel/lexicalEntryListPanelComponent";
import { LexiconListPanelComponent } from "./ontolex/lexicon/lexiconListPanel/lexiconListPanelComponent";
import { DatatypeListPanelComponent } from "./owl/datatypeListPanel/datatypeListPanelComponent";
import { TreeListSettingsModal } from "./treeListSettingsModal";

@Component({
    selector: "tree-panel",
    templateUrl: "./treePanelComponent.html",
})
export class TreePanelComponent {
    @Output() nodeSelected = new EventEmitter<ARTResource>();
    @Output() nodeDeleted = new EventEmitter<ARTResource>();

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

    private ONTO_TYPE: string;
    private readonly: boolean;    

    private activeTab: RDFResourceRolesEnum;

    constructor(private modal: Modal, private basicModals: BasicModalServices, private sharedModals: SharedModalServices) { }

    ngOnInit() {
        this.ONTO_TYPE = VBContext.getWorkingProject().getModelType();
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
        this.readonly = VBContext.getContextVersion() != null; //if the RV is working on an old dump version, disable the updates
    }

    private onNodeSelected(node: ARTResource) {
        this.nodeSelected.emit(node);
    }

    private onNodeDeleted(node: ARTResource) {
        this.nodeDeleted.emit(node);
    }

    public syncResource(resource: ARTResource) {
        let resRole: RDFResourceRolesEnum = resource.getRole();
        //sync the resource in the tree/list only if the resource has the same role of the tree/list currently active
        if (resource.isURIResource() && this.activeTab == resRole) {
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

    private selectTab(tabName: RDFResourceRolesEnum) {
        this.activeTab = tabName;
    }

    private isClassAuthorized() {
        return AuthorizationEvaluator.isAuthorized(AuthorizationEvaluator.Actions.CLASSES_GET_CLASS_TAXONOMY);
    }
    private isConceptAuthorized() {
        return AuthorizationEvaluator.isAuthorized(AuthorizationEvaluator.Actions.SKOS_GET_CONCEPT_TAXONOMY);
    }
    private isSchemeAuthorized() {
        return AuthorizationEvaluator.isAuthorized(AuthorizationEvaluator.Actions.SKOS_GET_SCHEMES);
    }
    private isCollectionAuthorized() {
        return AuthorizationEvaluator.isAuthorized(AuthorizationEvaluator.Actions.SKOS_GET_COLLECTION_TAXONOMY);
    }
    private isPropertyAuthorized() {
        return AuthorizationEvaluator.isAuthorized(AuthorizationEvaluator.Actions.PROPERTIES_GET_PROPERTY_TAXONOMY);
    }
    private isLexiconAuthorized() {
        return AuthorizationEvaluator.isAuthorized(AuthorizationEvaluator.Actions.ONTOLEX_GET_LEXICON);
    }
    private isLexicalEntryAuthorized() {
        return AuthorizationEvaluator.isAuthorized(AuthorizationEvaluator.Actions.ONTOLEX_GET_LEXICAL_ENTRY);
    }
    private isDataRangeAuthorized() {
        return AuthorizationEvaluator.isAuthorized(AuthorizationEvaluator.Actions.DATATYPES_GET_DATATYPES);
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
        } else {
            this.basicModals.alert("Search", "The resoruce " + resource.getShow() + " cannot be focused in a tree/list view, so its ResourceView will be shown in a modal dialog", "warning").then(
                () => {
                    this.sharedModals.openResourceView(resource, false);
                }
            );
        }
        if (tabToActivate != null) {
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
        }
    }

}