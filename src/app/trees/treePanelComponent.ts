import { Component, Output, EventEmitter } from "@angular/core";
import { ARTResource, ARTURIResource, RDFResourceRolesEnum } from "../models/ARTResources";
import { SKOS } from "../models/Vocabulary";
import { VBContext } from "../utils/VBContext";
import { HttpServiceContext } from "../utils/HttpManager";
import { AuthorizationEvaluator } from "../utils/AuthorizationEvaluator";

@Component({
    selector: "tree-panel",
    templateUrl: "./treePanelComponent.html",
})
export class TreePanelComponent {
    @Output() nodeSelected = new EventEmitter<ARTResource>();

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

    constructor() { }

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
        this.readonly = HttpServiceContext.getContextVersion() != null; //if the RV is working on an old dump version, disable the updates
    }

    private onNodeSelected(node: ARTResource) {
        this.nodeSelected.emit(node);
    }

    /**
     * returns true if a project is SKOS or SKOS-XL. Useful to show/hide tree panel
     */
    private isProjectSKOS(): boolean {
        return this.ONTO_TYPE == SKOS.uri;
    }

    //TAB HANDLER

    private selectTab(tabName: string) {
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