import { Component, Output, EventEmitter, ViewChild } from "@angular/core";
import { Modal, BSModalContextBuilder } from 'ngx-modialog/plugins/bootstrap';
import { OverlayConfig } from 'ngx-modialog';
import { TreeListSettingsModal } from "./treeListSettingsModal";
import { ConceptTreePanelComponent } from "../trees/skos/concept/conceptTreePanel/conceptTreePanelComponent";
import { CollectionTreePanelComponent } from "../trees/skos/collection/collectionTreePanel/collectionTreePanelComponent";
import { SchemeListPanelComponent } from "../trees/skos/scheme/schemeListPanel/schemeListPanelComponent";
import { PropertyTreePanelComponent } from "../trees/property/propertyTreePanel/propertyTreePanelComponent";
import { ClassIndividualTreePanelComponent } from "../trees/owl/classIndividualTreePanel/classIndividualTreePanelComponent";
import { ARTResource, ARTURIResource, RDFResourceRolesEnum } from "../models/ARTResources";
import { SKOS, OntoLex } from "../models/Vocabulary";
import { VBContext } from "../utils/VBContext";
import { AuthorizationEvaluator } from "../utils/AuthorizationEvaluator";

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

    private selectedResource: ARTResource;

    private ONTO_TYPE: string;
    private readonly: boolean;    

    private tabs: string[] = [
        RDFResourceRolesEnum.cls,
        RDFResourceRolesEnum.concept,
        RDFResourceRolesEnum.conceptScheme,
        RDFResourceRolesEnum.skosCollection,
        RDFResourceRolesEnum.property,
    ];
    private activeTab: string;

    constructor(private modal: Modal) { }

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
            }
        } else { //OWL
            if (this.isClassAuthorized()) {
                this.activeTab = RDFResourceRolesEnum.cls;
            } else if (this.isPropertyAuthorized()) {
                this.activeTab = RDFResourceRolesEnum.property;
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
            }
        }
    }

    /**
     * returns true if a project is SKOS or OntoLex. Useful to show/hide tree panel
     */
    private showSKOSPanels(): boolean {
        return (this.ONTO_TYPE == SKOS.uri) || (this.ONTO_TYPE == OntoLex.uri);
    }

    private openSettings() {
        const builder = new BSModalContextBuilder<any>();
        let overlayConfig: OverlayConfig = { context: builder.keyboard(null).toJSON() };
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

}