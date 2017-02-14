import { Component, Input, Output, EventEmitter, ViewChildren, QueryList, SimpleChanges } from "@angular/core";
import { ARTURIResource, ResAttribute, RDFResourceRolesEnum } from "../../../models/ARTResources";
import { VBEventHandler } from "../../../utils/VBEventHandler";
import { PropertyServices } from "../../../services/propertyServices";
import { SearchServices } from "../../../services/searchServices";
import { ModalServices } from "../../../widget/modal/modalServices";
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
        private modalService: ModalServices, eventHandler: VBEventHandler) {
        
        super(eventHandler);

        this.eventSubscriptions.push(eventHandler.topPropertyCreatedEvent.subscribe(
            (node: ARTURIResource) => this.onTopPropertyCreated(node)));
        this.eventSubscriptions.push(eventHandler.propertyDeletedEvent.subscribe(
            (property: ARTURIResource) => this.onPropertyDeleted(property)));
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
        this.roots = [];
        this.selectedNode = null;

        this.blockDivElement.nativeElement.style.display = "block";
        /* different cases:
         * - roots provided as Input: tree is build rootet on these properties
         * - roots not provided, Input resource provided: tree roots are those properties that has types of this resource as domain
         * - type provided: initialize tree just for the given property type 
         * - no Input provided: tree roots retrieved from server without restrinction
         */
        if (this.rootProperties) {
            this.propertyService.getPropertiesInfo(this.rootProperties).subscribe(
                props => {
                    this.roots = props;
                    this.blockDivElement.nativeElement.style.display = "none";
                },
                err => { this.blockDivElement.nativeElement.style.display = "none"; }
            )
        } else if (this.resource) {
            this.propertyService.getRelevantPropertiesForResource(this.resource).subscribe(
                relevantProps => {
                    this.propertyService.getPropertiesInfo(relevantProps).subscribe(
                        props => {
                            this.roots = props;
                            this.blockDivElement.nativeElement.style.display = "none";
                        },
                        err => { this.blockDivElement.nativeElement.style.display = "none"; }
                    );
                },
                err => { this.blockDivElement.nativeElement.style.display = "none"; }
            );
        } else if (this.type == RDFResourceRolesEnum.objectProperty) {
            this.propertyService.geTopObjectProperties().subscribe(
                props => {
                    this.roots = props;
                    this.blockDivElement.nativeElement.style.display = "none";
                },
                err => { this.blockDivElement.nativeElement.style.display = "none"; }
            );
        } else if (this.type == RDFResourceRolesEnum.annotationProperty) {
            this.propertyService.getTopAnnotationProperties().subscribe(
                props => {
                    this.roots = props;
                    this.blockDivElement.nativeElement.style.display = "none";
                },
                err => { this.blockDivElement.nativeElement.style.display = "none"; }
            );
        } else if (this.type == RDFResourceRolesEnum.datatypeProperty) {
            this.propertyService.getTopDatatypeProperties().subscribe(
                props => {
                    this.roots = props;
                    this.blockDivElement.nativeElement.style.display = "none";
                },
                err => { this.blockDivElement.nativeElement.style.display = "none"; }
            );
        } else if (this.type == RDFResourceRolesEnum.ontologyProperty) {
            this.propertyService.getTopOntologyProperties().subscribe(
                props => {
                    this.roots = props;
                    this.blockDivElement.nativeElement.style.display = "none";
                },
                err => { this.blockDivElement.nativeElement.style.display = "none"; }
            );
        } else if (this.type == RDFResourceRolesEnum.property) {
            this.propertyService.getTopRDFProperties().subscribe(
                props => {
                    this.roots = props;
                    this.blockDivElement.nativeElement.style.display = "none";
                },
                err => { this.blockDivElement.nativeElement.style.display = "none"; }
            );
        } else {
            this.propertyService.getTopProperties().subscribe(
                props => {
                    this.roots = props;
                    this.blockDivElement.nativeElement.style.display = "none";
                },
                err => { this.blockDivElement.nativeElement.style.display = "none"; }
            );
        }
    }

    doSearch(searchedText: string) {
        if (searchedText.trim() == "") {
            this.modalService.alert("Search", "Please enter a valid string to search", "error");
        } else {
            this.searchService.searchResource(searchedText, [RDFResourceRolesEnum.property], true, true, "contain").subscribe(
                searchResult => {
                    if (searchResult.length == 0) {
                        this.modalService.alert("Search", "No results found for '" + searchedText + "'", "warning");
                    } else { //1 or more results
                        if (searchResult.length == 1) {
                            this.openTreeAt(searchResult[0]);
                        } else { //multiple results, ask the user which one select
                            this.modalService.selectResource("Search", searchResult.length + " results found.", searchResult).then(
                                (selectedResource: any) => {
                                    this.openTreeAt(selectedResource);
                                },
                                () => { }
                            );
                        }
                    }
                }
            );
        }
    }

    openTreeAt(node: ARTURIResource) {
        this.searchService.getPathFromRoot(node, RDFResourceRolesEnum.property).subscribe(
            path => {
                var childrenNodeComponent = this.viewChildrenNode.toArray();
                //open tree from root to node
                for (var i = 0; i < childrenNodeComponent.length; i++) {//looking for first node (root) to expand
                    if (childrenNodeComponent[i].node.getURI() == path[0].getURI()) {
                        //let the found node expand itself and the remaining path
                        path.splice(0, 1);
                        childrenNodeComponent[i].expandPath(path);
                        break;
                    }
                }
            }
        );
    }

    //EVENT LISTENERS

    private onTopPropertyCreated(property: ARTURIResource) {
        this.roots.push(property);
    }

    private onPropertyDeleted(property: ARTURIResource) {
        //check if the property to delete is a topProperty
        for (var i = 0; i < this.roots.length; i++) {
            if (this.roots[i].getURI() == property.getURI()) {
                this.roots.splice(i, 1);
                break;
            }
        }
        //reset the selected node
        this.nodeSelected.emit(undefined);
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