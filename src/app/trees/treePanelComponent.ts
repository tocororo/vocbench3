import { Component, Output, EventEmitter } from "@angular/core";
import { ARTResource, ARTURIResource, RDFResourceRolesEnum } from "../models/ARTResources";
import { SKOS } from "../models/Vocabulary";
import { VBContext } from "../utils/VBContext";

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
            this.activeTab = RDFResourceRolesEnum.concept;
        } else {
            this.activeTab = RDFResourceRolesEnum.cls;
        }
        this.readonly = VBContext.getContextVersion() != null; //if the RV is working on an old dump version, disable the updates
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

}