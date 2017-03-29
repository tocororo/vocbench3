import { Component, Input, Output, EventEmitter, ViewChildren, ViewChild, QueryList, ElementRef } from "@angular/core";
import { ARTURIResource, ResAttribute, ResourceUtils } from "../../../models/ARTResources";
import { OWL } from "../../../models/Vocabulary";
import { VBEventHandler } from "../../../utils/VBEventHandler";
import { OwlServices } from "../../../services/owlServices";
import { ClassesServices } from "../../../services/classesServices";
import { AbstractTreeNode } from "../../abstractTreeNode";

@Component({
    selector: "class-tree-node",
    templateUrl: "./classTreeNodeComponent.html",
})
export class ClassTreeNodeComponent extends AbstractTreeNode {

    //ClassTreeNodeComponent children of this Component (useful to open tree for the search)
    @ViewChildren(ClassTreeNodeComponent) viewChildrenNode: QueryList<ClassTreeNodeComponent>;

    constructor(private owlService: OwlServices, private clsService: ClassesServices, eventHandler: VBEventHandler) {
        super(eventHandler);
        this.eventSubscriptions.push(eventHandler.subClassCreatedEvent.subscribe(
            (data: any) => this.onSubClassCreated(data.subClass, data.superClass)));
        this.eventSubscriptions.push(eventHandler.superClassAddedEvent.subscribe(
            (data: any) => this.onSuperClassAdded(data.subClass, data.superClass)));
        this.eventSubscriptions.push(eventHandler.classDeletedEvent.subscribe(
            (cls: ARTURIResource) => this.onClassDeleted(cls)));
        this.eventSubscriptions.push(eventHandler.subClassRemovedEvent.subscribe(
            (data: any) => this.onSubClassRemoved(data.cls, data.subClass)));
        this.eventSubscriptions.push(eventHandler.resourceRenamedEvent.subscribe(
            (data: any) => this.onResourceRenamed(data.oldResource, data.newResource)));
        this.eventSubscriptions.push(eventHandler.instanceDeletedEvent.subscribe(
            (data: any) => this.onInstanceDeleted(data.cls)));
        this.eventSubscriptions.push(eventHandler.instanceCreatedEvent.subscribe(
            (data: any) => this.onInstanceCreated(data.cls)));
        this.eventSubscriptions.push(eventHandler.typeRemovedEvent.subscribe(
            (data: any) => this.onInstanceDeleted(data.type)));
        this.eventSubscriptions.push(eventHandler.typeAddedEvent.subscribe(
            (data: any) => this.onInstanceCreated(data.type)));
    }

    ngOnInit() {
        if (this.node.getURI() == OWL.thing.getURI() && this.node.getAdditionalProperty(ResAttribute.MORE) == "1") {
            this.expandNode();
        }
    }

    /**
	 * Function called when "+" button is clicked.
	 * Gets a node as parameter and retrieve with an http call the subClass of the node,
	 * then expands the subtree div.
	 */
    expandNode() {
        this.nodeExpandStart.emit();
        this.clsService.getSubClasses(this.node).subscribe(
            subClasses => {
                //sort by show if rendering is active, uri otherwise
                let attribute: "show" | "value" = this.rendering ? "show" : "value";
                ResourceUtils.sortResources(subClasses, attribute);
                this.node.setAdditionalProperty(ResAttribute.CHILDREN, subClasses); //append the retrieved node as child of the expanded node
                this.node.setAdditionalProperty(ResAttribute.OPEN, true);
                this.nodeExpandEnd.emit();
            }
        );
    }


    //EVENT LISTENERS

    private onClassDeleted(cls: ARTURIResource) {
        var children = this.node.getAdditionalProperty(ResAttribute.CHILDREN);
        for (var i = 0; i < children.length; i++) {
            if (children[i].getURI() == cls.getURI()) {
                children.splice(i, 1);
                //if node has no more children change info of node so the UI will update
                if (children.length == 0) {
                    this.node.setAdditionalProperty(ResAttribute.MORE, 0);
                    this.node.setAdditionalProperty(ResAttribute.OPEN, false);
                }
                break;
            }
        }
    }

    private onSubClassCreated(subClass: ARTURIResource, superClass: ARTURIResource) {
        //add the new class as children only if the parent is the current class
        if (this.node.getURI() == superClass.getURI()) {
            this.node.getAdditionalProperty(ResAttribute.CHILDREN).push(subClass);
            this.node.setAdditionalProperty(ResAttribute.MORE, 1);
            this.node.setAdditionalProperty(ResAttribute.OPEN, true);
        }
    }

    private onSuperClassAdded(subClass: ARTURIResource, superClass: ARTURIResource) {
        if (this.node.getURI() == superClass.getURI()) {//if the superClass is the current node
            this.node.setAdditionalProperty(ResAttribute.MORE, 1); //update more
            //if it was open add the subClass to the visible children
            if (this.node.getAdditionalProperty(ResAttribute.OPEN)) {
                this.node.getAdditionalProperty(ResAttribute.CHILDREN).push(subClass);
            }
        }
    }

    private onSubClassRemoved(cls: ARTURIResource, subClass: ARTURIResource) {
        if (cls.getURI() == this.node.getURI()) {
            this.onClassDeleted(subClass);
        }
    }

    //decrease numInst property when an instance of the current class is deleted
    private onInstanceDeleted(cls: ARTURIResource) {
        if (this.node.getURI() == cls.getURI()) {
            var numInst = this.node.getAdditionalProperty(ResAttribute.NUM_INST);
            this.node.setAdditionalProperty(ResAttribute.NUM_INST, numInst - 1);
        }
    }

    //increase numInst property when an instance of the current class is created
    private onInstanceCreated(cls: ARTURIResource) {
        if (this.node.getURI() == cls.getURI()) {
            var numInst = this.node.getAdditionalProperty(ResAttribute.NUM_INST);
            this.node.setAdditionalProperty(ResAttribute.NUM_INST, numInst + 1);
        }
    }

}