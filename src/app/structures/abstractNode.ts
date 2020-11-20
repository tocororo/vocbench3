import { Directive, EventEmitter, Input, Output } from "@angular/core";
import { Subscription } from "rxjs";
import { ARTResource, ARTURIResource, ResAttribute } from "../models/ARTResources";
import { TreeListContext } from "../utils/UIUtils";
import { ProjectContext } from "../utils/VBContext";
import { VBEventHandler } from "../utils/VBEventHandler";

@Directive()
export abstract class AbstractNode {

    /**
     * VIEWCHILD, INPUTS / OUTPUTS
     */

    @Input() node: ARTURIResource;
    @Input() rendering: boolean; //if true the node be rendered with the show, with the qname otherwise
    @Input() multiselection: boolean; //if true enabled the selection of multiple resources via checkboxes
    @Input() showDeprecated: boolean;
    @Input() context: TreeListContext;
    @Input() projectCtx: ProjectContext;
    @Output() nodeSelected = new EventEmitter<ARTURIResource>();
    @Output() nodeChecked = new EventEmitter<{ node: ARTURIResource, checked: boolean }>();

    eventSubscriptions: Subscription[] = [];

    /**
     * ATTRIBUTES
     */
    checked: boolean = false;

    /**
     * CONSTRUCTOR
     */
    protected eventHandler: VBEventHandler;
    constructor(eventHandler: VBEventHandler) {
        this.eventHandler = eventHandler;

        this.eventSubscriptions.push(eventHandler.resourceRenamedEvent.subscribe(
            (data: any) => this.onResourceRenamed(data.oldResource, data.newResource)));
        this.eventSubscriptions.push(eventHandler.resourceDeprecatedEvent.subscribe(
            (res: ARTResource) => this.onResourceDeprecated(res)));
    }

    /**
     * METHODS
     */

    ngOnDestroy() {
        this.eventHandler.unsubscribeAll(this.eventSubscriptions);
    }

    selectNode() {
        this.nodeSelected.emit(this.node);
    }

    onNodeCheckChange() {
        this.nodeChecked.emit({ node: this.node, checked: this.checked });
    }


    //BROADCAST EVENTS HANDLERS

    /**
     * Called when a resource is renamed in resource view.
     * This function replace the uri of the resource contained in the node if it is the resource
     * affected by the renaming.
     */
    onResourceRenamed(oldResource: ARTURIResource, newResource: ARTURIResource) {
        if (oldResource.equals(this.node)) {
            this.node.setURI(newResource.getURI());
            this.node.setAdditionalProperty(ResAttribute.QNAME, newResource.getAdditionalProperty(ResAttribute.QNAME));
            this.node.setShow(newResource.getShow());
        }
    }

    onResourceDeprecated(resource: ARTResource) {
        if (resource instanceof ARTURIResource) {
            if (resource.equals(this.node)) {
                /**
                 * Replace the resource held by this component with a clone of it and set the deprecated attribute to true.
                 * In this way the rdfResource component in the node detects the change of @Input node and updates the icon
                 * (icon is computed only during the init)
                 */
                let newNode = this.node.clone();
                newNode.setAdditionalProperty(ResAttribute.DEPRECATED, true);
                this.node = newNode;
                /**
                 * Simulate the node selection, so the selectedNode in the above components is updated.
                 * This is required since the node held by this component was just replaced, so a selection on another node 
                 * (of the tree/list) fires the onNodeSelected on the container tree/list that set to false the resource.selected property.
                 * Since the resource of this component is now different from the selectedNode in the tree/list, the selected
                 * property is not changed in the resource of this component.
                 */
                this.selectNode();
            }
        }
    }

}