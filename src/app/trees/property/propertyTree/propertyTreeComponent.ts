import { Component, Input, Output, EventEmitter, ViewChildren, QueryList, SimpleChanges } from "@angular/core";
import { ARTURIResource, ResAttribute, RDFResourceRolesEnum, ResourceUtils } from "../../../models/ARTResources";
import { VBEventHandler } from "../../../utils/VBEventHandler";
import { UIUtils } from "../../../utils/UIUtils";
import { AuthorizationEvaluator } from "../../../utils/AuthorizationEvaluator";
import { PropertyServices } from "../../../services/propertyServices";
import { SearchServices } from "../../../services/searchServices";
import { BasicModalServices } from "../../../widget/modal/basicModal/basicModalServices";
import { PropertyTreeNodeComponent } from "./propertyTreeNodeComponent";
import { AbstractTree } from "../../abstractTree";

@Component({
    selector: "property-tree",
    templateUrl: "./propertyTreeComponent.html",
    host: { class: "blockingDivHost" }
})
export class PropertyTreeComponent extends AbstractTree {
    @Input() resource: ARTURIResource;//provided to show just the properties with domain the type of the resource
    @Input() type: RDFResourceRolesEnum; //tells the type of the property to show in the tree
    @Input('roots') rootProperties: ARTURIResource[]; //in case the roots are provided to the component instead of being retrieved from server

    //PropertyTreeNodeComponent children of this Component (useful to open tree during the search)
    @ViewChildren(PropertyTreeNodeComponent) viewChildrenNode: QueryList<PropertyTreeNodeComponent>;

    constructor(private propertyService: PropertyServices, private searchService: SearchServices,
        private basicModals: BasicModalServices, eventHandler: VBEventHandler) {
        
        super(eventHandler);

        this.eventSubscriptions.push(eventHandler.topPropertyCreatedEvent.subscribe(
            (node: ARTURIResource) => this.onTopPropertyCreated(node)));
        this.eventSubscriptions.push(eventHandler.propertyDeletedEvent.subscribe(
            (property: ARTURIResource) => this.onTreeNodeDeleted(property)));
        this.eventSubscriptions.push(eventHandler.subPropertyCreatedEvent.subscribe(
            (data: any) => this.onSubPropertyCreated(data.subProperty, data.superProperty)));
        this.eventSubscriptions.push(eventHandler.superPropertyAddedEvent.subscribe(
            (data: any) => this.onSuperPropertyAdded(data.subProperty, data.superProperty)));
    }

    /**
     * Called when @Input resource changes, reinitialize the tree
     */
    ngOnChanges(changes: SimpleChanges) {
        if (changes['resource']) {
            this.initTree();
        }
    }

    initTree() {
        if (!AuthorizationEvaluator.isAuthorized(AuthorizationEvaluator.Actions.PROPERTIES_GET_PROPERTY_TAXONOMY)) {
            return;
        }

        this.roots = [];
        this.selectedNode = null;
        this.rootLimit = this.initialRoots;

        UIUtils.startLoadingDiv(this.blockDivElement.nativeElement);

        //sort by show if rendering is active, uri otherwise
        let orderAttribute: "show" | "value" = this.rendering ? "show" : "value";

        /* different cases:
         * - roots provided as Input: tree is build rootet on these properties
         * - roots not provided, Input resource provided: tree roots are those properties that has types of this resource as domain
         * - type provided: initialize tree just for the given property type 
         * - no Input provided: tree roots retrieved from server without restrinction
         */
        if (this.rootProperties) {
            this.propertyService.getPropertiesInfo(this.rootProperties).subscribe(
                props => {
                    ResourceUtils.sortResources(props, orderAttribute);
                    this.roots = props;
                    UIUtils.stopLoadingDiv(this.blockDivElement.nativeElement);
                },
                err => { UIUtils.stopLoadingDiv(this.blockDivElement.nativeElement); }
            )
        } else if (this.resource) {
            this.propertyService.getRelevantPropertiesForResource(this.resource).subscribe(
                relevantProps => {
                    this.propertyService.getPropertiesInfo(relevantProps).subscribe(
                        props => {
                            ResourceUtils.sortResources(props, orderAttribute);
                            this.roots = props;
                            UIUtils.stopLoadingDiv(this.blockDivElement.nativeElement);
                        },
                        err => { UIUtils.stopLoadingDiv(this.blockDivElement.nativeElement); }
                    );
                },
                err => { UIUtils.stopLoadingDiv(this.blockDivElement.nativeElement); }
            );
        } else if (this.type == RDFResourceRolesEnum.objectProperty) {
            this.propertyService.getTopObjectProperties().subscribe(
                props => {
                    ResourceUtils.sortResources(props, orderAttribute);
                    this.roots = props;
                    UIUtils.stopLoadingDiv(this.blockDivElement.nativeElement);
                },
                err => { UIUtils.stopLoadingDiv(this.blockDivElement.nativeElement); }
            );
        } else if (this.type == RDFResourceRolesEnum.annotationProperty) {
            this.propertyService.getTopAnnotationProperties().subscribe(
                props => {
                    ResourceUtils.sortResources(props, orderAttribute);
                    this.roots = props;
                    UIUtils.stopLoadingDiv(this.blockDivElement.nativeElement);
                },
                err => { UIUtils.stopLoadingDiv(this.blockDivElement.nativeElement); }
            );
        } else if (this.type == RDFResourceRolesEnum.datatypeProperty) {
            this.propertyService.getTopDatatypeProperties().subscribe(
                props => {
                    ResourceUtils.sortResources(props, orderAttribute);
                    this.roots = props;
                    UIUtils.stopLoadingDiv(this.blockDivElement.nativeElement);
                },
                err => { UIUtils.stopLoadingDiv(this.blockDivElement.nativeElement); }
            );
        } else if (this.type == RDFResourceRolesEnum.ontologyProperty) {
            this.propertyService.getTopOntologyProperties().subscribe(
                props => {
                    ResourceUtils.sortResources(props, orderAttribute);
                    this.roots = props;
                    UIUtils.stopLoadingDiv(this.blockDivElement.nativeElement);
                },
                err => { UIUtils.stopLoadingDiv(this.blockDivElement.nativeElement); }
            );
        } else if (this.type == RDFResourceRolesEnum.property) {
            this.propertyService.getTopRDFProperties().subscribe(
                props => {
                    ResourceUtils.sortResources(props, orderAttribute);
                    this.roots = props;
                    UIUtils.stopLoadingDiv(this.blockDivElement.nativeElement);
                },
                err => { UIUtils.stopLoadingDiv(this.blockDivElement.nativeElement); }
            );
        } else {
            this.propertyService.getTopProperties().subscribe(
                props => {
                    ResourceUtils.sortResources(props, orderAttribute);
                    this.roots = props;
                    UIUtils.stopLoadingDiv(this.blockDivElement.nativeElement);
                },
                err => { UIUtils.stopLoadingDiv(this.blockDivElement.nativeElement); }
            );
        }
    }

    openTreeAt(node: ARTURIResource) {
        this.searchService.getPathFromRoot(node, RDFResourceRolesEnum.property).subscribe(
            path => {
                if (path.length == 0) {
                    this.basicModals.alert("Search", "Node " + node.getShow() + " is not reachable in the current tree");
                    return;
                };
                
                //open tree from root to node

                //first ensure that the first element of the path is not excluded by the paging mechanism
                this.ensureRootVisibility(path[0]);

                setTimeout( //apply timeout in order to wait that the children node is rendered (in case the visibile roots have been increased)
                    () => {
                        var childrenNodeComponent = this.viewChildrenNode.toArray();
                        for (var i = 0; i < childrenNodeComponent.length; i++) {//looking for first node (root) to expand
                            if (childrenNodeComponent[i].node.getURI() == path[0].getURI()) {
                                //let the found node expand itself and the remaining path
                                path.splice(0, 1);
                                childrenNodeComponent[i].expandPath(path);
                                return;
                            }
                        }
                        //if this line is reached it means that the first node of the path has not been found
                        this.basicModals.alert("Search", "Node " + node.getShow() + " is not reachable in the current tree");
                    }
                );
            }
        );
    }

    //EVENT LISTENERS

    private onTopPropertyCreated(property: ARTURIResource) {
        this.roots.push(property);
    }

    private onSubPropertyCreated(subProperty: ARTURIResource, superProperty: ARTURIResource) {
        //if the subProperty was a root property, should be removed from the root array (propertyTree)
        //check if the property to delete is a topProperty
        for (var i = 0; i < this.roots.length; i++) {
            if (this.roots[i].getURI() == subProperty.getURI()) {
                this.roots.splice(i, 1);
                break;
            }
        }
    }

    private onSuperPropertyAdded(subProperty: ARTURIResource, superProperty: ARTURIResource) {
        //if the superProperty is a root property add subProperty to its children
        for (var i = 0; i < this.roots.length; i++) {
            if (this.roots[i].getURI() == superProperty.getURI()) {
                this.roots[i].getAdditionalProperty(ResAttribute.CHILDREN).push(subProperty);
                this.roots[i].setAdditionalProperty(ResAttribute.MORE, 1);
                break;
            }
        }
    }

}