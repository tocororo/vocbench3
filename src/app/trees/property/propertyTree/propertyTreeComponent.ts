import { Component, Input, Output, EventEmitter, ElementRef, ViewChildren, ViewChild, QueryList, SimpleChanges } from "@angular/core";
import { ARTURIResource, ResAttribute, RDFResourceRolesEnum } from "../../../utils/ARTResources";
import { VBEventHandler } from "../../../utils/VBEventHandler";
import { PropertyServices } from "../../../services/propertyServices";
import { SearchServices } from "../../../services/searchServices";
import { ModalServices } from "../../../widget/modal/modalServices";
import { PropertyTreeNodeComponent } from "./propertyTreeNodeComponent";

@Component({
    selector: "property-tree",
    templateUrl: "./propertyTreeComponent.html",
    host: { class: "blockingDivHost" }
})
export class PropertyTreeComponent {
    @Input() resource: ARTURIResource;//provided to show just the properties with domain the type of the resource
    @Input() hideSearch: boolean = false;
    @Output() nodeSelected = new EventEmitter<ARTURIResource>();

    //PropertyTreeNodeComponent children of this Component (useful to open tree during the search)
    @ViewChildren(PropertyTreeNodeComponent) viewChildrenNode: QueryList<PropertyTreeNodeComponent>;

    //get the element in the view referenced with #blockDivTree
    @ViewChild('blockDivTree') public blockDivElement: ElementRef;

    private roots: ARTURIResource[];
    private selectedNode: ARTURIResource;

    private eventSubscriptions: any[] = [];

    constructor(private propertyService: PropertyServices, private searchService: SearchServices,
        private modalService: ModalServices, private eventHandler: VBEventHandler) {
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
     * Here I use ngAfterViewInit instead of ngOnInit because I need to wait that
     * the view #blockDivTree is initialized
     */
    ngAfterViewInit() {
        /* Following check needed to avoid to call 2 times the service if the @Input resource is provided:
         * - 1st time in ngOnChanges when resource is binded (so changes value)
         * - 2nd time here in ngAfterViewInit
         * I cannot resolve by deleting this method since if @Input resource is not provided at all,
         * ngOnChanges is not called, so neither initTree */
        //TODO check if I can delete this 
        if (this.roots == undefined) {
            this.initTree();
        }
    }

    /**
     * Called when @Input resource changes, reinitialize the tree
     */
    ngOnChanges(changes: SimpleChanges) {
        if (changes['resource']) {
            this.roots = []; //so ngOnInit will not be called a 2nd time
            this.initTree();
        }
    }

    initTree() {
        this.selectedNode = null;

        this.blockDivElement.nativeElement.style.display = "block";

        if (this.resource) {
            this.propertyService.getRelevantPropertiesForResource(this.resource).subscribe(
                relevantProps => {
                    this.propertyService.getPropertiesInfo(relevantProps).subscribe(
                        topProperties => {
                            this.roots = topProperties;
                            this.blockDivElement.nativeElement.style.display = "none";
                        },
                        err => { this.blockDivElement.nativeElement.style.display = "none"; }
                    );
                },
                err => { this.blockDivElement.nativeElement.style.display = "none"; }
            );
        } else {
            this.propertyService.getTopProperties().subscribe(
                topProperties => {
                    this.roots = topProperties;
                    this.blockDivElement.nativeElement.style.display = "none";
                },
                err => { this.blockDivElement.nativeElement.style.display = "none"; }
            );
        }
    }

    ngOnDestroy() {
        this.eventHandler.unsubscribeAll(this.eventSubscriptions);
    }

    private doSearch(searchedText: string) {
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

    /**
     * Handles the keydown event in search text field (when enter key is pressed execute the search)
     */
    private searchKeyHandler(key: number, searchedText: string) {
        if (key == 13) {
            this.doSearch(searchedText);
        }
    }

    public openTreeAt(node: ARTURIResource) {
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

    //Listeners to node expansion start/end. Simply show/hide the loading div
    private onNodeExpandStart() {
        this.blockDivElement.nativeElement.style.display = "block";
    }
    private onNodeExpandEnd() {
        this.blockDivElement.nativeElement.style.display = "none";
    }

    //EVENT LISTENERS

    private onNodeSelected(node: ARTURIResource) {
        if (this.selectedNode != undefined) {
            this.selectedNode.deleteAdditionalProperty(ResAttribute.SELECTED);
        }
        this.selectedNode = node;
        this.selectedNode.setAdditionalProperty(ResAttribute.SELECTED, true);
        this.nodeSelected.emit(node);
    }

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