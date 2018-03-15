import { Component, ViewChild, ViewChildren, Input, Output, EventEmitter, ElementRef, QueryList, SimpleChanges } from "@angular/core";
import { InstanceListNodeComponent } from "./instanceListNodeComponent";
import { AbstractList } from "../../abstractList";
import { ARTURIResource, ResAttribute, RDFResourceRolesEnum, ResourceUtils } from "../../../models/ARTResources";
import { SemanticTurkey } from "../../../models/Vocabulary";
import { VBEventHandler } from "../../../utils/VBEventHandler";
import { VBContext } from "../../../utils/VBContext";
import { UIUtils } from "../../../utils/UIUtils";
import { AuthorizationEvaluator } from "../../../utils/AuthorizationEvaluator";
import { ClassesServices } from "../../../services/classesServices";
import { BasicModalServices } from "../../../widget/modal/basicModal/basicModalServices";
import { SearchServices } from "../../../services/searchServices";

@Component({
    selector: "instance-list",
    templateUrl: "./instanceListComponent.html",
    host: { class: "blockingDivHost" }
})
export class InstanceListComponent extends AbstractList {
    @Input() cls: ARTURIResource;

    //InstanceListNodeComponent children of this Component (useful to select the instance during the search)
    @ViewChildren(InstanceListNodeComponent) viewChildrenNode: QueryList<InstanceListNodeComponent>;

    private pendingSearch: { pending: boolean, instance: ARTURIResource, cls: ARTURIResource } = {
        pending: false, //tells if there is a pending search waiting that children view are initialized 
        instance: null, //searched instance
        cls: null //class of the searched instance
    }

    private viewInitialized: boolean = false;//useful to avoid ngOnChanges calls initList when the view is not initialized

    private instanceLimit: number = 10000;

    list: ARTURIResource[] = [];

    constructor(private clsService: ClassesServices, private searchService: SearchServices, private basicModals: BasicModalServices, 
        eventHandler: VBEventHandler) {
        super(eventHandler);
        this.eventSubscriptions.push(eventHandler.instanceDeletedEvent.subscribe(
            (data: any) => { if (data.cls.getURI() == this.cls.getURI()) this.onListNodeDeleted(data.instance); } ));
        this.eventSubscriptions.push(eventHandler.instanceCreatedEvent.subscribe(
            (data: any) => { if (data.cls.getURI() == this.cls.getURI()) this.onListNodeCreated(data.instance); } ));
        this.eventSubscriptions.push(eventHandler.typeRemovedEvent.subscribe(
            (data: any) => this.onTypeRemoved(data.resource, data.type)));
        this.eventSubscriptions.push(eventHandler.resourceRenamedEvent.subscribe(
            (data: any) => this.onResourceRenamed(data.oldResource, data.newResource)));
    }

    ngOnChanges(changes: SimpleChanges) {
        this.selectedNode = null;
        //viewInitialized needed to prevent the initialization of the list before view is initialized
        if (this.viewInitialized) {
            if (changes['cls']) {
                if (this.cls != undefined) {
                    let numInst: number = this.cls.getAdditionalProperty(ResAttribute.NUM_INST);
                    if (this.cls.getAdditionalProperty(ResAttribute.NUM_INST) > this.instanceLimit) {
                        this.basicModals.confirm("Too much instances", "Warning: the selected class (" + this.cls.getShow() 
                            + ") has too many instances (" + numInst + "). Retrieving them all could be a very long process "
                            + "and it may slow down the server. Do you want to continue anyway?", "warning").then(
                            (confirm: any) => {
                                this.initList();
                            },
                            (cancel: any) =>  {
                                this.list = [];
                            }
                        );
                    } else {
                        this.initList();
                    }
                } else {
                    this.initList();
                }
            }
        }
    }

    ngAfterViewInit() {
        this.viewInitialized = true;
        this.initList();

        //when InstanceListNodeComponent children changes, looks for a pending search to resume
        this.viewChildrenNode.changes.subscribe(
            c => {
                if (this.pendingSearch.pending) {//there is a pending search
                    this.selectSearchedInstance(this.pendingSearch.cls, this.pendingSearch.instance);
                }
            }
        );
    }

    initList() {
        if (!AuthorizationEvaluator.isAuthorized(AuthorizationEvaluator.Actions.CLASSES_GET_INSTANCES)) {
            return;
        }

        this.selectedNode = null;
        this.list = [];
        this.nodeLimit = this.initialNodes;

        if (this.cls != undefined) {
            UIUtils.startLoadingDiv(this.blockDivElement.nativeElement);
            this.clsService.getInstances(this.cls).subscribe(
                instances => {
                    //sort by show if rendering is active, uri otherwise
                    let attribute: "show" | "value" = this.rendering ? "show" : "value";
                    ResourceUtils.sortResources(instances, attribute);
                    this.list = instances;
                    //if there is some pending instance search and the searched instance is of the same type of the current class
                    if (this.pendingSearch.pending && this.cls.getURI() == this.pendingSearch.cls.getURI()) {
                        this.selectSearchedInstance(this.cls, this.pendingSearch.instance);
                    }
                    UIUtils.stopLoadingDiv(this.blockDivElement.nativeElement);
                }
            );
        }
    }

    selectNode(node: ARTURIResource) {
        if (this.selectedNode != undefined) {
            this.selectedNode.deleteAdditionalProperty(ResAttribute.SELECTED);
        }
        this.selectedNode = node;
        this.selectedNode.setAdditionalProperty(ResAttribute.SELECTED, true);
        this.nodeSelected.emit(node);
    }

    /**
     * cls is useful when the instance list is inside the classTreePanel and so this component need to 
     * be in sync with the class selected in the tree
     */
    public selectSearchedInstance(cls: ARTURIResource, instance: ARTURIResource) {
        //In the tree, input cls has still not been bound or not changed (cls has been bound previously with a different type) 
        if (this.cls == undefined || cls.getURI() != this.cls.getURI()) {//save the pending search
            this.pendingSearch.pending = true;
            this.pendingSearch.instance = instance;
            this.pendingSearch.cls = cls;
        } else if (this.cls.getURI() == cls.getURI()) { //Input cls has already bound and it is the type of the searched instance
            this.openListAt(instance);
        }
    }

    openListAt(node: ARTURIResource) {
        this.ensureNodeVisibility(node);

        setTimeout( //apply timeout in order to wait that the children node is rendered (in case the openPages has been increased)
            () => {
                //then iterate over the visible instanceListNodes and select the searched
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

    //EVENT LISTENERS
    onListNodeDeleted(node: ARTURIResource) {
        for (var i = 0; i < this.list.length; i++) {
            if (this.list[i].getURI() == node.getURI()) {
                if (VBContext.getWorkingProject().isValidationEnabled()) {
                    //replace the resource instead of simply change the graphs, so that the rdfResource detect the change
                    let stagedRes: ARTURIResource = this.list[i].clone();
                    stagedRes.setGraphs([new ARTURIResource(SemanticTurkey.stagingRemoveGraph + VBContext.getWorkingProject().getBaseURI())]);
                    stagedRes.setAdditionalProperty(ResAttribute.EXPLICIT, false);
                    stagedRes.setAdditionalProperty(ResAttribute.SELECTED, false);
                    this.list[i] = stagedRes;
                } else {
                    this.list.splice(i, 1);
                }
                break;
            }
        }
    }

    onListNodeCreated(node: ARTURIResource) {
        this.list.unshift(node);
    }

    private onTypeRemoved(instance: ARTURIResource, cls: ARTURIResource) {
        //check of cls not undefined is required if instance list has never been initialized with an @Input class
        if (this.cls && this.cls.getURI() == cls.getURI()) {
            for (var i = 0; i < this.list.length; i++) {
                if (this.list[i].getURI() == instance.getURI()) {
                    this.list.splice(i, 1);
                    break;
                }
            }
        }
    }

    private onResourceRenamed(oldResource: ARTURIResource, newResource: ARTURIResource) {
        for (var i = 0; i < this.list.length; i++) {
            if (oldResource.getURI() == this.list[i].getURI()) {
                this.list[i][ResAttribute.SHOW] = newResource.getShow();
                this.list[i]['uri'] = newResource.getURI();
            }
        }
    }

}