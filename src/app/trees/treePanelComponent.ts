import {Component, Output, EventEmitter} from "@angular/core";
import {ARTResource, ARTURIResource, RDFResourceRolesEnum} from "../utils/ARTResources";
import {VocbenchCtx} from "../utils/VocbenchCtx";

@Component({
    selector: "tree-panel",
    templateUrl: "./treePanelComponent.html",
})
export class TreePanelComponent {

    @Output() nodeSelected = new EventEmitter<ARTResource>();

    private selectedResource: ARTResource;

    private tabs: string[] = [
        RDFResourceRolesEnum.cls,
        RDFResourceRolesEnum.concept,
        RDFResourceRolesEnum.conceptScheme,
        RDFResourceRolesEnum.skosCollection,
        RDFResourceRolesEnum.property,
    ];
    private activeTab: string = this.tabs[0];
    
    constructor(private vbCtx: VocbenchCtx) {}

    private onNodeSelected(node: ARTResource) {
        this.nodeSelected.emit(node);
    }

    /**
     * returns true if a project is SKOS or SKOS-XL. Useful to show/hide tree panel
     */
    private isProjectSKOS(): boolean {
        return this.vbCtx.getWorkingProject().getPrettyPrintOntoType().includes("SKOS");
    }
    
    //TAB HANDLER
    
    private selectTab(tabName: string) {
        this.activeTab = tabName;
    }
    
}