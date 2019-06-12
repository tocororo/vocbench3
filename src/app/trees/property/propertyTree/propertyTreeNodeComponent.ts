import { Component, QueryList, ViewChildren } from "@angular/core";
import { ARTURIResource, ResAttribute } from "../../../models/ARTResources";
import { PropertyServices } from "../../../services/propertyServices";
import { ResourceUtils, SortAttribute } from "../../../utils/ResourceUtils";
import { VBEventHandler } from "../../../utils/VBEventHandler";
import { BasicModalServices } from "../../../widget/modal/basicModal/basicModalServices";
import { SharedModalServices } from "../../../widget/modal/sharedModal/sharedModalServices";
import { AbstractTreeNode } from "../../abstractTreeNode";

@Component({
    selector: "property-tree-node",
    templateUrl: "./propertyTreeNodeComponent.html",
})
export class PropertyTreeNodeComponent extends AbstractTreeNode {

    //PropertyTreeNodeComponent children of this Component (useful to open tree for the search)
    @ViewChildren(PropertyTreeNodeComponent) viewChildrenNode: QueryList<PropertyTreeNodeComponent>;

    constructor(private propService: PropertyServices, eventHandler: VBEventHandler, 
        basicModals: BasicModalServices, sharedModals: SharedModalServices) {
        super(eventHandler, basicModals, sharedModals);
        this.eventSubscriptions.push(eventHandler.subPropertyCreatedEvent.subscribe(
            (data: any) => this.onChildCreated(data.superProperty, data.subProperty)));
        this.eventSubscriptions.push(eventHandler.superPropertyAddedEvent.subscribe(
            (data: any) => this.onParentAdded(data.superProperty, data.subProperty)));
        this.eventSubscriptions.push(eventHandler.propertyDeletedEvent.subscribe(
            (property: ARTURIResource) => this.onTreeNodeDeleted(property)));
        this.eventSubscriptions.push(eventHandler.superPropertyRemovedEvent.subscribe(
            (data: any) => this.onParentRemoved(data.superProperty, data.property)));
        this.eventSubscriptions.push(eventHandler.superPropertyUpdatedEvent.subscribe(
            (data: any) => {
                this.onParentRemoved(data.oldParent, data.child);
                this.onParentAdded(data.newParent, data.child);
            }
        ));
    }

    ngOnInit() {
        super.ngOnInit();
    }

    expandNodeImpl() {
        return this.propService.getSubProperties(this.node).map(
            subProps => {
                //sort by show if rendering is active, uri otherwise
                ResourceUtils.sortResources(subProps, this.rendering ? SortAttribute.show : SortAttribute.value);
                this.children = subProps;
                this.open = true;
                if (this.children.length == 0) {
                    this.open = false;
                    this.node.setAdditionalProperty(ResAttribute.MORE, 0);
                }
            }
        );
    }

}