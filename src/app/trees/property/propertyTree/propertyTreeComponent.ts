import { Component, Input, QueryList, SimpleChanges, ViewChildren } from "@angular/core";
import { ARTURIResource, RDFResourceRolesEnum } from "../../../models/ARTResources";
import { RDFS } from "../../../models/Vocabulary";
import { PropertyServices } from "../../../services/propertyServices";
import { SearchServices } from "../../../services/searchServices";
import { AuthorizationEvaluator } from "../../../utils/AuthorizationEvaluator";
import { ResourceUtils, SortAttribute } from "../../../utils/ResourceUtils";
import { UIUtils } from "../../../utils/UIUtils";
import { VBActionsEnum } from "../../../utils/VBActions";
import { VBEventHandler } from "../../../utils/VBEventHandler";
import { BasicModalServices } from "../../../widget/modal/basicModal/basicModalServices";
import { SharedModalServices } from "../../../widget/modal/sharedModal/sharedModalServices";
import { AbstractTree } from "../../abstractTree";
import { PropertyTreeNodeComponent } from "./propertyTreeNodeComponent";

@Component({
    selector: "property-tree",
    templateUrl: "./propertyTreeComponent.html",
    host: { class: "treeListComponent" }
})
export class PropertyTreeComponent extends AbstractTree {
    @Input() resource: ARTURIResource;//provided to show just the properties with domain the type of the resource
    @Input() type: RDFResourceRolesEnum; //tells the type of the property to show in the tree
    @Input('roots') rootProperties: ARTURIResource[]; //in case the roots are provided to the component instead of being retrieved from server

    //PropertyTreeNodeComponent children of this Component (useful to open tree during the search)
    @ViewChildren(PropertyTreeNodeComponent) viewChildrenNode: QueryList<PropertyTreeNodeComponent>;

    structRole = RDFResourceRolesEnum.property;

    constructor(private propertyService: PropertyServices, private searchService: SearchServices,
        eventHandler: VBEventHandler, basicModals: BasicModalServices, sharedModals: SharedModalServices) {
        
        super(eventHandler, basicModals, sharedModals);

        this.eventSubscriptions.push(eventHandler.topPropertyCreatedEvent.subscribe(
            (node: ARTURIResource) => this.onTopPropertyCreated(node)));
        this.eventSubscriptions.push(eventHandler.propertyDeletedEvent.subscribe(
            (property: ARTURIResource) => this.onTreeNodeDeleted(property)));
    }

    /**
     * Called when @Input resource changes, reinitialize the tree
     */
    ngOnChanges(changes: SimpleChanges) {
        if (changes['resource']) {
            this.init();
        }
    }

    initImpl() {
        if (!AuthorizationEvaluator.isAuthorized(VBActionsEnum.propertiesGetPropertyTaxonomy)) {
            return;
        }

        UIUtils.startLoadingDiv(this.blockDivElement.nativeElement);

        //sort by show if rendering is active, uri otherwise
        let orderAttribute: SortAttribute = this.rendering ? SortAttribute.show : SortAttribute.value;

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
                    //add (hardcode) rdfs:comment if not present
                    let commentFound: boolean = false;
                    relevantProps.forEach(p => {
                        if (p.equals(RDFS.comment)) {
                            commentFound = true;
                        }
                    })
                    if (!commentFound) {
                        relevantProps.push(RDFS.comment);
                    }
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
            this.propertyService.getTopProperties().subscribe(
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
                    this.onTreeNodeNotFound(node);
                    return;
                };
                
                //open tree from root to node

                //first ensure that the first element of the path is not excluded by the paging mechanism
                this.ensureRootVisibility(path[0], path);

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
                        this.onTreeNodeNotFound(node);
                    }
                );
            }
        );
    }

    //EVENT LISTENERS

    private onTopPropertyCreated(property: ARTURIResource) {
        this.roots.unshift(property);
    }

}