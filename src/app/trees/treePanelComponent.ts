import {Component, Output, EventEmitter} from "@angular/core";
import {ARTResource, ARTURIResource, RDFResourceRolesEnum} from "../models/ARTResources";
import {VBContext} from "../utils/VBContext";

@Component({
    selector: "tree-panel",
    templateUrl: "./treePanelComponent.html",
})
export class TreePanelComponent {
    @Output() nodeSelected = new EventEmitter<ARTResource>();
    
    private selectedResource: ARTResource;

    private ONTO_TYPE: string;

    private tabs: string[] = [
        RDFResourceRolesEnum.cls,
        RDFResourceRolesEnum.concept,
        RDFResourceRolesEnum.conceptScheme,
        RDFResourceRolesEnum.skosCollection,
        RDFResourceRolesEnum.property,
    ];
    private activeTab: string;
    
    constructor() {}

    ngOnInit() {
        this.ONTO_TYPE = VBContext.getWorkingProject().getPrettyPrintOntoType();
        if (this.ONTO_TYPE.includes("SKOS")) {
            this.activeTab = RDFResourceRolesEnum.concept;
        } else {
            this.activeTab = RDFResourceRolesEnum.cls;
        }
    }

    private onNodeSelected(node: ARTResource) {
        this.nodeSelected.emit(node);
    }

    /**
     * returns true if a project is SKOS or SKOS-XL. Useful to show/hide tree panel
     */
    private isProjectSKOS(): boolean {
        return this.ONTO_TYPE.includes("SKOS");
    }
    
    //TAB HANDLER
    
    private selectTab(tabName: string) {
        this.activeTab = tabName;
    }
    
}