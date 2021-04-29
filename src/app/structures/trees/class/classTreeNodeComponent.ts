import { Component, Input, QueryList, SimpleChanges, ViewChildren } from "@angular/core";
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { SharedModalServices } from 'src/app/widget/modal/sharedModal/sharedModalServices';
import { ARTURIResource, ResAttribute } from "../../../models/ARTResources";
import { ClassTreeFilter } from "../../../models/Properties";
import { OWL, RDFS } from "../../../models/Vocabulary";
import { ClassesServices } from "../../../services/classesServices";
import { VBRequestOptions } from "../../../utils/HttpManager";
import { ResourceUtils, SortAttribute } from "../../../utils/ResourceUtils";
import { TreeListContext } from "../../../utils/UIUtils";
import { VBContext } from "../../../utils/VBContext";
import { VBEventHandler } from "../../../utils/VBEventHandler";
import { BasicModalServices } from "../../../widget/modal/basicModal/basicModalServices";
import { AbstractTreeNode } from "../abstractTreeNode";

@Component({
    selector: "class-tree-node",
    templateUrl: "./classTreeNodeComponent.html",
})
export class ClassTreeNodeComponent extends AbstractTreeNode {

    //ClassTreeNodeComponent children of this Component (useful to open tree for the search)
    @ViewChildren(ClassTreeNodeComponent) viewChildrenNode: QueryList<ClassTreeNodeComponent>;

    @Input() root: boolean = false;
    @Input() filterEnabled: boolean = false;

    showInstanceNumber: boolean = false;

    constructor(private clsService: ClassesServices, eventHandler: VBEventHandler,
        basicModals: BasicModalServices, sharedModals: SharedModalServices) {
        super(eventHandler, basicModals, sharedModals);
        this.eventSubscriptions.push(eventHandler.subClassCreatedEvent.subscribe(
            (data: any) => this.onChildCreated(data.superClass, data.subClass)));
        this.eventSubscriptions.push(eventHandler.superClassAddedEvent.subscribe(
            (data: any) => this.onParentAdded(data.superClass, data.subClass)));
        this.eventSubscriptions.push(eventHandler.superClassUpdatedEvent.subscribe(
            (data: any) => {
                this.onParentRemoved(data.oldParent, data.child);
                this.onParentAdded(data.newParent, data.child);
            }
        ));
        this.eventSubscriptions.push(eventHandler.classDeletedEvent.subscribe(
            (cls: ARTURIResource) => this.onTreeNodeDeleted(cls)));
        this.eventSubscriptions.push(eventHandler.superClassRemovedEvent.subscribe(
            (data: any) => this.onParentRemoved(data.superClass, data.subClass)));
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
        super.ngOnInit();
        //show instance number only if enabled in the preferences and if the node belongs to a tree in TreePanelComponent
        this.showInstanceNumber = VBContext.getWorkingProjectCtx(this.projectCtx).getProjectPreferences().classTreePreferences.showInstancesNumber && 
            (this.context == TreeListContext.dataPanel || this.context == TreeListContext.clsIndTree);
        //expand immediately the node if it is a root and if it is owl:Thing or rdfs:Resource
        if ((this.node.getURI() == OWL.thing.getURI() || this.node.getURI() == RDFS.resource.getURI()) && 
            this.root && this.node.getAdditionalProperty(ResAttribute.MORE) == "1") {
            this.expandNode().subscribe();
        }
    }

    ngOnChanges(changes: SimpleChanges) {
        super.ngOnChanges(changes);
        if (changes['filterEnabled']) {
            this.initFilter();
        }
    }

    expandNodeImpl(): Observable<any> {
        return this.clsService.getSubClasses(this.node, this.showInstanceNumber, VBRequestOptions.getRequestOptions(this.projectCtx)).pipe(
            map(subClasses => {
                //sort by show if rendering is active, uri otherwise
                ResourceUtils.sortResources(subClasses, this.rendering ? SortAttribute.show : SortAttribute.value);
                this.children = subClasses;
                this.initFilter();
                this.open = true;
                if (this.children.length == 0) {
                    this.open = false;
                    this.node.setAdditionalProperty(ResAttribute.MORE, 0);
                }
            })
        );
    }

    /**
     * Initializes (and updates when the filter enabled changes) a "filtered" attribute in each children that tells if 
     * the child is filtered by the class tree filter
     */
    private initFilter() {
        let classTreePref = VBContext.getWorkingProjectCtx(this.projectCtx).getProjectPreferences().classTreePreferences;
        this.children.forEach(c => {
            /* child filtered if:
             * - the filter is enabled
             * - the parent (current node) has a list of filtered children
             * - the child is among the filtered children
             */
            c['filtered'] = (
                this.filterEnabled &&
                classTreePref.filter.map[this.node.getURI()] != null && 
                classTreePref.filter.map[this.node.getURI()].indexOf(c.getURI()) != -1
            )
        });
    }

    /**
     * The expand/collapse button in the class tree should be visible if:
     * the same condition of the other trees are satisfied 
     * (namely:
     *      - the node has "more" attribute true AND
     *          - "showDeprecated" is true (all children visible)
     *          - or "showDeprecated" is false (only not-deprecated children visible) but there is at least a child not-deprecated 
     * )
     * but in this case it should be taken into account also the sublcass filter. So it should be checked also that there should be
     * at least a child not filtered out (if filter is enabled) and not deprecated (if showDeprecated is false)
     */
    //@Override
    initShowExpandCollapseBtn() {
        let more: boolean = this.node.getAdditionalProperty(ResAttribute.MORE);
        if (more) { //if the more attribute is true, doesn't implies that the button is visible, the node children could be all deprecated
            if (this.children.length > 0) {
                let classTreeFilter: ClassTreeFilter = VBContext.getWorkingProjectCtx(this.projectCtx).getProjectPreferences().classTreePreferences.filter;
                let childVisible: boolean = false;
                /**
                 * childVisible if: 
                 * showDeprecated true, or child not-deprecated
                 * AND
                 * subClassFilter disabled or child not filtered
                 */
                for (var i = 0; i < this.children.length; i++) {
                    let childFiltered: boolean = classTreeFilter.map[this.node.getURI()] != null && 
                        classTreeFilter.map[this.node.getURI()].indexOf(this.children[i].getURI()) != -1;
                    if ((this.showDeprecated || !this.children[i].isDeprecated()) && (!classTreeFilter.enabled || !childFiltered)) {
                        childVisible = true;
                        break;
                    }
                }
                this.showExpandCollapseBtn = childVisible;
            } else { //no children and "more" true means that the node has not been yet expanded, so in the doubt return true
                this.showExpandCollapseBtn = true;
            }
        } else {
            this.showExpandCollapseBtn = false;
        }

    }

    //EVENT LISTENERS

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