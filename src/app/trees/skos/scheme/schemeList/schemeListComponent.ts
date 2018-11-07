import { Component, QueryList, ViewChildren } from "@angular/core";
import { ARTURIResource, ResAttribute, ResourceUtils, SortAttribute } from "../../../../models/ARTResources";
import { SemanticTurkey } from "../../../../models/Vocabulary";
import { SearchServices } from "../../../../services/searchServices";
import { SkosServices } from "../../../../services/skosServices";
import { AuthorizationEvaluator } from "../../../../utils/AuthorizationEvaluator";
import { UIUtils } from "../../../../utils/UIUtils";
import { VBContext } from "../../../../utils/VBContext";
import { VBEventHandler } from "../../../../utils/VBEventHandler";
import { VBProperties } from "../../../../utils/VBProperties";
import { BasicModalServices } from "../../../../widget/modal/basicModal/basicModalServices";
import { AbstractList } from "../../../abstractList";
import { SchemeListNodeComponent } from "./schemeListNodeComponent";

@Component({
    selector: "scheme-list",
    templateUrl: "./schemeListComponent.html",
    host: { class: "treeListComponent" }
})
export class SchemeListComponent extends AbstractList {

    @ViewChildren(SchemeListNodeComponent) viewChildrenNode: QueryList<SchemeListNodeComponent>;

    list: SchemeListItem[];

    constructor(private skosService: SkosServices, private searchService: SearchServices, private vbProp: VBProperties,
        private basicModals: BasicModalServices, eventHandler: VBEventHandler) {
        super(eventHandler);
        this.eventSubscriptions.push(eventHandler.schemeCreatedEvent.subscribe((node: ARTURIResource) => this.onListNodeCreated(node)));
        this.eventSubscriptions.push(eventHandler.schemeDeletedEvent.subscribe((node: ARTURIResource) => this.onListNodeDeleted(node)));
        //handler when active schemes is changed programmatically when a searched concept belong to a non active scheme
        this.eventSubscriptions.push(eventHandler.schemeChangedEvent.subscribe(
            (schemes: ARTURIResource[]) => {
                this.list.forEach((s: SchemeListItem) => s.checked = ResourceUtils.containsNode(schemes, s.scheme));
            }
        ));
    }

    ngOnInit() {
        if (!AuthorizationEvaluator.isAuthorized(AuthorizationEvaluator.Actions.SKOS_GET_SCHEMES)) {
            return;
        }
        this.init();
    }

    initImpl() {
        UIUtils.startLoadingDiv(this.blockDivElement.nativeElement);
        this.skosService.getAllSchemes().subscribe(
            schemes => {
                //sort by show if rendering is active, uri otherwise
                ResourceUtils.sortResources(schemes, this.rendering ? SortAttribute.show : SortAttribute.value);

                for (var i = 0; i < schemes.length; i++) {
                    let active: boolean = this.vbProp.isActiveScheme(schemes[i]);
                    this.list.push({ checked: active, scheme: schemes[i] });
                }
                UIUtils.stopLoadingDiv(this.blockDivElement.nativeElement);
            }
        );
    }

    onListNodeCreated(node: ARTURIResource) {
        this.list.unshift({ checked: false, scheme: node });
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
        if (this.vbProp.isActiveScheme(this.selectedNode)) {
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

    openListAt(node: ARTURIResource) {
        this.ensureNodeVisibility(node);
        setTimeout( //apply timeout in order to wait that the children node is rendered (in case the openPages has been increased)
            () => {
                var childrenNodeComponent = this.viewChildrenNode.toArray();
                for (var i = 0; i < childrenNodeComponent.length; i++) {
                    if (childrenNodeComponent[i].node.getURI() == node.getURI()) {
                        childrenNodeComponent[i].ensureVisible();
                        if (!childrenNodeComponent[i].node.getAdditionalProperty(ResAttribute.SELECTED)) {
                            childrenNodeComponent[i].selectNode();
                        }
                        break;
                    }
                }
            }
        );
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
        this.vbProp.setActiveSchemes(this.collectCheckedSchemes());
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

}


class SchemeListItem {
    public checked: boolean;
    public scheme: ARTURIResource;
}