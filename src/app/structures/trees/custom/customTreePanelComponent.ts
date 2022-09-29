import { Component, ViewChild } from "@angular/core";
import { CustomTreesServices } from 'src/app/services/customTreesServices';
import { SharedModalServices } from 'src/app/widget/modal/sharedModal/sharedModalServices';
import { GraphModalServices } from "../../../graph/modal/graphModalServices";
import { ARTURIResource, RDFResourceRolesEnum } from "../../../models/ARTResources";
import { CustomFormsServices } from "../../../services/customFormsServices";
import { ResourcesServices } from "../../../services/resourcesServices";
import { SearchServices } from "../../../services/searchServices";
import { RoleActionResolver } from "../../../utils/RoleActionResolver";
import { VBActionFunctionCtx } from "../../../utils/VBActions";
import { VBEventHandler } from "../../../utils/VBEventHandler";
import { VBProperties } from "../../../utils/VBProperties";
import { BasicModalServices } from "../../../widget/modal/basicModal/basicModalServices";
import { MultiSubjectEnrichmentHelper } from "../../multiSubjectEnrichmentHelper";
import { AbstractTreePanel } from "../abstractTreePanel";
import { CustomTreeComponent } from './customTreeComponent';

@Component({
    selector: "custom-tree-panel",
    templateUrl: "./customTreePanelComponent.html",
    host: { class: "vbox" }
})
export class CustomTreePanelComponent extends AbstractTreePanel {

    @ViewChild(CustomTreeComponent) viewChildTree: CustomTreeComponent;

    panelRole: RDFResourceRolesEnum = RDFResourceRolesEnum.undetermined;

    constructor(private searchService: SearchServices, private customTreeService: CustomTreesServices,
        cfService: CustomFormsServices, resourceService: ResourcesServices, basicModals: BasicModalServices, sharedModals: SharedModalServices, graphModals: GraphModalServices,
        eventHandler: VBEventHandler, vbProp: VBProperties, actionResolver: RoleActionResolver, multiEnrichment: MultiSubjectEnrichmentHelper) {
        super(cfService, resourceService, basicModals, sharedModals, graphModals, eventHandler, vbProp, actionResolver, multiEnrichment);
    }


    getActionContext(role?: RDFResourceRolesEnum): VBActionFunctionCtx {
        // let metaClass: ARTURIResource = role ? this.convertRoleToClass(role) : this.convertRoleToClass(this.selectedNode.getRole());
        // let actionCtx: VBActionFunctionCtx = { metaClass: metaClass, loadingDivRef: this.viewChildTree.blockDivElement };
        // return actionCtx;

        return { metaClass: null, loadingDivRef: this.viewChildTree.blockDivElement };
    }

    refresh() {
        this.viewChildTree.init();
    }

    //search handlers

    doSearch(searchedText: string) {
    }

    openTreeAt(resource: ARTURIResource) {
        this.viewChildTree.openTreeAt(resource);
    }

}