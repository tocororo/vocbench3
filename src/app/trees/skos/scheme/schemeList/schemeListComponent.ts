import { Component, QueryList, ViewChildren } from "@angular/core";
import { ARTURIResource, RDFResourceRolesEnum, ResAttribute } from "../../../../models/ARTResources";
import { Project } from "../../../../models/Project";
import { SemanticTurkey } from "../../../../models/Vocabulary";
import { SkosServices } from "../../../../services/skosServices";
import { AuthorizationEvaluator } from "../../../../utils/AuthorizationEvaluator";
import { VBRequestOptions } from "../../../../utils/HttpManager";
import { ResourceUtils, SortAttribute } from "../../../../utils/ResourceUtils";
import { UIUtils, TreeListContext } from "../../../../utils/UIUtils";
import { VBActionsEnum } from "../../../../utils/VBActions";
import { VBContext } from "../../../../utils/VBContext";
import { VBEventHandler } from "../../../../utils/VBEventHandler";
import { VBProperties } from "../../../../utils/VBProperties";
import { AbstractList } from "../../../abstractList";
import { SchemeListNodeComponent } from "./schemeListNodeComponent";

@Component({
    selector: "scheme-list",
    templateUrl: "./schemeListComponent.html",
    host: { class: "treeListComponent" }
})
export class SchemeListComponent extends AbstractList {

    @ViewChildren(SchemeListNodeComponent) viewChildrenNode: QueryList<SchemeListNodeComponent>;

    structRole = RDFResourceRolesEnum.conceptScheme;

    list: SchemeListItem[];

    constructor(private skosService: SkosServices, private vbProp: VBProperties, eventHandler: VBEventHandler) {
        super(eventHandler);
        this.eventSubscriptions.push(eventHandler.schemeCreatedEvent.subscribe((node: ARTURIResource) => this.onListNodeCreated(node)));
        this.eventSubscriptions.push(eventHandler.schemeDeletedEvent.subscribe((node: ARTURIResource) => this.onListNodeDeleted(node)));
        //handler when active schemes is changed programmatically when a searched concept belong to a non active scheme
        this.eventSubscriptions.push(eventHandler.schemeChangedEvent.subscribe(
            (data: { schemes: ARTURIResource[], project: Project }) => {
                if (VBContext.getWorkingProjectCtx(this.projectCtx).getProject().getName() == data.project.getName()) {
                    this.onSchemeChanged(data.schemes);
                }
            })
        );
    }

    ngOnInit() {
        if (!AuthorizationEvaluator.isAuthorized(VBActionsEnum.skosGetSchemes)) {
            return;
        }
        this.init();
    }

    initImpl() {
        UIUtils.startLoadingDiv(this.blockDivElement.nativeElement);
        this.skosService.getAllSchemes(VBRequestOptions.getRequestOptions(this.projectCtx)).subscribe(
            schemes => {
                //sort by show if rendering is active, uri otherwise
                ResourceUtils.sortResources(schemes, this.rendering ? SortAttribute.show : SortAttribute.value);

                for (var i = 0; i < schemes.length; i++) {
                    let active: boolean = ResourceUtils.containsNode(VBContext.getWorkingProjectCtx(this.projectCtx).getProjectPreferences().activeSchemes, schemes[i]);
                    this.list.push({ checked: active, scheme: schemes[i] });
                }
                UIUtils.stopLoadingDiv(this.blockDivElement.nativeElement);
            }
        );
    }

    onListNodeCreated(node: ARTURIResource) {
        let newItem: SchemeListItem = { checked: false, scheme: node };
        this.list.unshift(newItem);
        if (this.context == TreeListContext.addPropValue) {
            this.selectNode(newItem);
        }
    }

    onListNodeDeleted(node: ARTURIResource) {
        for (var i = 0; i < this.list.length; i++) {//Update the schemeList
            if (this.list[i].scheme.getURI() == node.getURI()) {
                if (VBContext.getWorkingProject().isValidationEnabled()) {
                    //replace the resource instead of simply change the graphs, so that the rdfResource detect the change
                    let stagedRes: ARTURIResource = this.list[i].scheme.clone();
                    stagedRes.setGraphs([new ARTURIResource(SemanticTurkey.stagingRemoveGraph + VBContext.getWorkingProject().getBaseURI())]);
                    stagedRes.setAdditionalProperty(ResAttribute.EXPLICIT, false);
                    stagedRes.setAdditionalProperty(ResAttribute.SELECTED, false);
                    this.list[i].scheme = stagedRes;
                } else {
                    this.list.splice(i, 1);
                }
                break;
            }
        }
        //update the activeSchemes if the deleted was active
        if (ResourceUtils.containsNode(VBContext.getWorkingProjectCtx().getProjectPreferences().activeSchemes, this.selectedNode)) {
            this.updateActiveSchemesPref();
        }
        this.selectedNode = null;
    }

    /**
     * Called when a scheme is clicked. Set the clicked scheme as selected
     */
    selectNode(node: SchemeListItem) {
        if (this.selectedNode != undefined) {
            this.selectedNode.deleteAdditionalProperty(ResAttribute.SELECTED);
        }
        this.selectedNode = node.scheme;
        this.selectedNode.setAdditionalProperty(ResAttribute.SELECTED, true);
        this.nodeSelected.emit(node.scheme);
    }

    //@Override
    ensureNodeVisibility(resource: ARTURIResource) {
        for (var i = 0; i < this.list.length; i++) {
            if (this.list[i].scheme.getURI() == resource.getURI()) {
                if (i >= this.nodeLimit) {
                    //update nodeLimit so that node at index i is within the range
                    let scrollStep: number = ((i - this.nodeLimit)/this.increaseRate)+1;
                    this.nodeLimit = this.nodeLimit + this.increaseRate*scrollStep;
                }
                break;
            }
        }
    }

    public activateAllScheme() {
        for (var i = 0; i < this.list.length; i++) {
            this.list[i].checked = true;
        }
        this.updateActiveSchemesPref();
    }

    public deactivateAllScheme() {
        for (var i = 0; i < this.list.length; i++) {
            this.list[i].checked = false;
        }
        this.updateActiveSchemesPref();
    }

    private updateActiveSchemesPref() {
        this.vbProp.setActiveSchemes(VBContext.getWorkingProjectCtx(this.projectCtx), this.collectCheckedSchemes());
    }

    /**
     * Collects all the schemes checked
     */
    private collectCheckedSchemes(): ARTURIResource[] {
        //collect all the active scheme
        var activeSchemes: ARTURIResource[] = [];
        for (var i = 0; i < this.list.length; i++) {
            if (this.list[i].checked) {
                activeSchemes.push(this.list[i].scheme);
            }
        }
        return activeSchemes;
    }


    private onSchemeChanged(schemes: ARTURIResource[]) {
        this.list.forEach((s: SchemeListItem) => s.checked = ResourceUtils.containsNode(schemes, s.scheme));
    }

}


class SchemeListItem {
    public checked: boolean;
    public scheme: ARTURIResource;
}