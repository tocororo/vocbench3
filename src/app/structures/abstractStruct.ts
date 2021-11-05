import { Directive, ElementRef, EventEmitter, Input, Output, ViewChild } from "@angular/core";
import { Subscription } from "rxjs";
import { ARTResource, ARTURIResource, RDFResourceRolesEnum, ResAttribute } from "../models/ARTResources";
import { ResourceUtils } from "../utils/ResourceUtils";
import { TreeListContext } from "../utils/UIUtils";
import { ProjectContext } from "../utils/VBContext";
import { VBEventHandler } from "../utils/VBEventHandler";

@Directive()
export abstract class AbstractStruct {

    @Input() rendering: boolean = true; //if true the nodes in the list should be rendered with the show, with the qname otherwise
    @Input() multiselection: boolean = false; //if true enabled the selection of multiple resources via checkboxes
    @Input() showDeprecated: boolean = true;
    @Input() context: TreeListContext;
    @Input() projectCtx: ProjectContext;
    @Output() nodeSelected = new EventEmitter<ARTURIResource>();
    @Output() nodeChecked = new EventEmitter<ARTURIResource[]>();

    @ViewChild('scrollableContainer') scrollableElement: ElementRef;

    /**
     * ATTRIBUTES
     */

    abstract structRole: RDFResourceRolesEnum; //declare the type of resources in the panel

    unauthorized: boolean = false; //true if user is not authorized to access the tree/list

    eventSubscriptions: Subscription[] = [];
    selectedNode: ARTURIResource;
    checkedNodes: ARTURIResource[] = [];

    /**
     * CONSTRUCTOR
     */
    protected eventHandler: VBEventHandler;
    constructor(eventHandler: VBEventHandler) {
        this.eventHandler = eventHandler;
        this.eventSubscriptions.push(eventHandler.refreshDataBroadcastEvent.subscribe(() => this.init()));
        this.eventSubscriptions.push(eventHandler.refreshTreeListEvent.subscribe((roles: RDFResourceRolesEnum[]) => {
                if (roles.indexOf(this.structRole) != -1) this.init()
        }));
        this.eventSubscriptions.push(eventHandler.resourceUpdatedEvent.subscribe(
            (res: ARTResource) => {
                if (res instanceof ARTURIResource && res.equals(this.selectedNode)) {
                    this.selectedNode = res;
                    this.selectedNode.setAdditionalProperty(ResAttribute.SELECTED, true); //restore the selected attr
                }
            }
        ))
    }

    /**
     * METHODS
     */

    ngOnDestroy() {
        this.eventSubscriptions.forEach(s => s.unsubscribe());
    }

    abstract init(): void;

    abstract setInitialStatus(): void

    onNodeSelected(node: ARTURIResource) {
        if (this.selectedNode != undefined) {
            this.selectedNode.deleteAdditionalProperty(ResAttribute.SELECTED);
        }
        this.selectedNode = node;
        this.selectedNode.setAdditionalProperty(ResAttribute.SELECTED, true);
        this.nodeSelected.emit(node);
    }

    onNodeChecked(event: { node: ARTURIResource, checked: boolean }) {
        if (event.checked) {
            this.checkedNodes.push(event.node);
        } else {
            let nodeIdx: number = ResourceUtils.indexOfNode(this.checkedNodes, event.node);
            if (nodeIdx != -1) {
                this.checkedNodes.splice(nodeIdx, 1);
            }
        }
        this.nodeChecked.emit(this.checkedNodes)
    }

}