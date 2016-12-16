import {Component, Input, Output, EventEmitter, ViewChild, ElementRef, SimpleChanges} from "@angular/core";
import {Modal, BSModalContextBuilder} from 'angular2-modal/plugins/bootstrap';
import {OverlayConfig} from 'angular2-modal';
import {ARTNode, ARTResource, ARTURIResource, ARTPredicateObjects, ResAttribute, RDFTypesEnum} from "../utils/ARTResources";
import {Deserializer} from "../utils/Deserializer";
import {VocbenchCtx} from "../utils/VocbenchCtx";
import {VBEventHandler} from "../utils/VBEventHandler";
import {ResourceViewServices} from "../services/resourceViewServices";
import {AlignmentServices} from "../services/alignmentServices";
import {ResourceAlignmentModal, ResourceAlignmentModalData} from "../alignment/resourceAlignment/resourceAlignmentModal"

@Component({
    selector: "resource-view",
    templateUrl: "./resourceViewComponent.html",
})
export class ResourceViewComponent {
    
    @Input() resource: ARTResource;
    @Output() dblclickObj: EventEmitter<ARTResource> = new EventEmitter<ARTResource>();
    
    @ViewChild('blockDiv') blockingDivElement: ElementRef;
    private viewInitialized: boolean = false;
    
    private showInferred = false;
    
    //partitions
    private resViewXmlResponse: Element = null; //to store the getResourceView response and avoid to repeat the request when user switches on/off inference
    private typesColl: ARTResource[] = null;
    private classAxiomColl: ARTPredicateObjects[] = null;
    private topconceptofColl: ARTURIResource[] = null;
    private schemesColl: ARTURIResource[] = null;
    private broadersColl: ARTURIResource[] = null;
    private superpropertiesColl: ARTURIResource[] = null;
    private domainsColl: ARTNode[] = null;
    private rangesColl: ARTNode[] = null;
    private lexicalizationsColl: ARTPredicateObjects[] = null;
    private membersColl: ARTNode[] = null;
    private membersOrderedColl: ARTNode[] = null;
    private propertiesColl: ARTPredicateObjects[] = null;
    private propertyFacets: any[] = null;
    private inverseofColl: ARTURIResource[] = null;
    private labelRelationsColl: ARTResource[] = null;
    
    private eventSubscriptions: any[] = [];
    
	constructor(private resViewService:ResourceViewServices, private alignServices: AlignmentServices, private vbCtx: VocbenchCtx, 
        private eventHandler: VBEventHandler, private modal: Modal) {
            
        this.eventSubscriptions.push(eventHandler.resourceRenamedEvent.subscribe(
            (data: any) => this.buildResourceView(data.newResource)));
    }
    
    ngOnChanges(changes: SimpleChanges) {
        this.showInferred = this.vbCtx.getInferenceInResourceView();
        if (changes['resource'].currentValue) {
            if (this.viewInitialized) {
                this.buildResourceView(this.resource);//refresh resource view when Input resource changes
            }
        }
    }
    
    ngAfterViewInit() {
        this.viewInitialized = true;
        this.buildResourceView(this.resource);
    }
    
    ngOnDestroy() {
        this.eventHandler.unsubscribeAll(this.eventSubscriptions);
    }
    
    /**
     * Perform the getResourceView request and build the resource view.
     * Called when
     * - a resource is selected for the first time in a tree
     * - the selected resource changes (not in tab mode where every resource selected opens a new tab,
     *   but in splitted mode when the RV is the same and simply changes the selected resource tho describe)
     * - the resource is renamed, so it needs to refresh
     * - some partition has performed a change and emits an update event (which invokes this method, see template)
     */
    private buildResourceView(res: ARTResource) {
        this.blockingDivElement.nativeElement.style.display = "block";
        this.resViewService.getResourceView(res).subscribe(
            stResp => {
                this.resViewXmlResponse = stResp;
                this.fillPartitions();
                this.blockingDivElement.nativeElement.style.display = "none";
            },
            err => {
                this.blockingDivElement.nativeElement.style.display = "none";
            }
        );
    }

    /**
     * Fill all the partitions of the RV. This not requires that the RV description is fetched again from server,
     * in fact if the user switches on/off the inference, there's no need to perform a new request.
     */
    private fillPartitions() {
        //reset all partitions
        this.typesColl = null;
        this.classAxiomColl = null;
        this.topconceptofColl = null;
        this.schemesColl = null;
        this.broadersColl = null;
        this.superpropertiesColl = null;
        this.domainsColl = null;
        this.rangesColl = null;
        this.lexicalizationsColl = null;
        this.membersColl = null;
        this.propertiesColl = null;
        this.propertyFacets = null;
        this.inverseofColl = null;
        this.labelRelationsColl = null;
        
        var respResourceElement: Element = this.resViewXmlResponse.getElementsByTagName("resource")[0];
        var respPartitions = this.resViewXmlResponse.children;

        for (var i = 0; i < respPartitions.length; i++) {
            var partition = respPartitions[i];
            var partitionName = partition.tagName;
            if (partitionName == "resource") {
                this.resource = Deserializer.createRDFResource(partition.children[0]);
            } else if (partitionName == "types") {
                this.typesColl = Deserializer.createResourceArray(partition);
                this.typesColl = <ARTResource[]>this.filterInferredFromResourceList(this.typesColl);
            } else if (partitionName == "classaxioms") {
                this.classAxiomColl = Deserializer.createPredicateObjectsList(partition.children[0]);
                this.classAxiomColl = this.filterInferredFromPredObjList(this.classAxiomColl);
            } else if (partitionName == "topconceptof") {
                this.topconceptofColl = Deserializer.createURIArray(partition);
                this.topconceptofColl = <ARTURIResource[]>this.filterInferredFromResourceList(this.topconceptofColl);
            } else if (partitionName == "schemes") {
                this.schemesColl = Deserializer.createURIArray(partition);
                this.schemesColl = <ARTURIResource[]>this.filterInferredFromResourceList(this.schemesColl);
            } else if (partitionName == "broaders") {
                this.broadersColl = Deserializer.createURIArray(partition);
                this.broadersColl = <ARTURIResource[]>this.filterInferredFromResourceList(this.broadersColl);
            } else if (partitionName == "superproperties") {
                this.superpropertiesColl = Deserializer.createURIArray(partition);
                this.superpropertiesColl = <ARTURIResource[]>this.filterInferredFromResourceList(this.superpropertiesColl);
            } else if (partitionName == "facets") {
                this.parseFacetsPartition(partition);
            } else if (partitionName == "domains") {
                this.domainsColl = Deserializer.createRDFArray(partition);
                this.domainsColl = <ARTURIResource[]>this.filterInferredFromResourceList(this.domainsColl);
            } else if (partitionName == "ranges") {
                this.rangesColl = Deserializer.createRDFArray(partition);
                this.rangesColl = <ARTURIResource[]>this.filterInferredFromResourceList(this.rangesColl);
            } else if (partitionName == "lexicalizations") {
                this.lexicalizationsColl = Deserializer.createPredicateObjectsList(partition.children[0]);
                this.lexicalizationsColl = this.filterInferredFromPredObjList(this.lexicalizationsColl);
            } else if (partitionName == "members") {
                this.membersColl = Deserializer.createRDFArray(partition);
                this.membersColl = this.filterInferredFromResourceList(this.membersColl);
            } else if (partitionName == "membersOrdered") {
                this.membersOrderedColl = Deserializer.createRDFArray(partition);
                this.membersOrderedColl = this.filterInferredFromResourceList(this.membersOrderedColl);
            } else if (partitionName == "labelRelations") {
                this.labelRelationsColl = Deserializer.createResourceArray(partition);
                this.labelRelationsColl = <ARTResource[]>this.filterInferredFromResourceList(this.labelRelationsColl);
            } else if (partitionName == "properties") {
                this.propertiesColl = Deserializer.createPredicateObjectsList(partition.children[0]);
                this.propertiesColl = this.filterInferredFromPredObjList(this.propertiesColl);
            }
        }
    }
    
    /**
     * Based on the showInferred param, filter out or let pass inferred information in an object list
     */
    private filterInferredFromResourceList(resourceArray: ARTNode[]): ARTNode[] {
        if (!this.showInferred) {
            for (var i = 0; i < resourceArray.length; i++) {
                if (resourceArray[i].getAdditionalProperty(ResAttribute.GRAPHS).includes("http://semanticturkey/inference-graph")) {
                    resourceArray.splice(i, 1);
                    i--;
                }
            }
        }
        return resourceArray;
    }
    
    /**
     * Based on the showInferred param, filter out or let pass inferred information in a predicate-object list
     */
    private filterInferredFromPredObjList(predObjList: ARTPredicateObjects[]): ARTPredicateObjects[] {
        if (!this.showInferred) {
            for (var i = 0; i < predObjList.length; i++) {
                var objList: ARTNode[] = predObjList[i].getObjects();
                for (var j = 0; j < objList.length; j++) {
                    if (objList[j].getAdditionalProperty(ResAttribute.GRAPHS).includes("http://semanticturkey/inference-graph")) {
                        objList.splice(j, 1);
                        j--;
                    }
                }
                //after filtering the objects list, if the predicate has no more objects, remove it from predObjList
                if (objList.length == 0) {
                    predObjList.splice(i, 1);
                    i--;
                }
            }
        }
        return predObjList;
    }
    
    /**
     * Facets partition has a structure different from the other (object list and predicate-object list),
     * so it requires a parser ad hoc (doesn't use the parsers in Deserializer)
     */
    private parseFacetsPartition(facetsElement: Element) {
        //init default facets
        this.propertyFacets = [
            {name: "symmetric", explicit: this.resource.getAdditionalProperty(ResAttribute.EXPLICIT), value: false},
            {name: "functional", explicit: this.resource.getAdditionalProperty(ResAttribute.EXPLICIT), value: false},
            {name: "inverseFunctional", explicit: this.resource.getAdditionalProperty(ResAttribute.EXPLICIT), value: false},
            {name: "transitive", explicit: this.resource.getAdditionalProperty(ResAttribute.EXPLICIT), value: false},
        ];
        var facetsChildren = facetsElement.children;
        for (var i = 0; i < facetsChildren.length; i++) {
            var facetName = facetsChildren[i].tagName;
            if (facetName == "symmetric" || facetName == "functional" || facetName == "inverseFunctional" || facetName == "transitive") {
                var facet = {
                    name: facetName,
                    explicit: (facetsChildren[i].getAttribute(ResAttribute.EXPLICIT) == "true"),
                    value: (facetsChildren[i].getAttribute("value") == "true")
                };
                //replace the default facets
                for (var j = 0; j < this.propertyFacets.length; j++) {
                    if (this.propertyFacets[j].name == facetName) {
                        this.propertyFacets[j] = facet;
                        break;
                    }
                }
            } else if (facetName == "inverseof") {
                this.inverseofColl = Deserializer.createURIArray(facetsChildren[i]);
            }
        }
    }
    
    private alignResource() {
        this.openAlignmentModal().then(
            data => {
                this.alignServices.addAlignment(this.resource, data.property, data.object).subscribe(
                    stResp => { this.buildResourceView(this.resource); }
                );
            },
            () => {}
        );
    }
    
    /**
     * Opens a modal to create an alignment.
     * @return an object containing "property" and "object", namely the mapping property and the 
     * aligned object
     */
    private openAlignmentModal() {
        var modalData = new ResourceAlignmentModalData(this.resource);
        const builder = new BSModalContextBuilder<ResourceAlignmentModalData>(
            modalData, undefined, ResourceAlignmentModalData
        );
        let overlayConfig: OverlayConfig = { context: builder.keyboard(null).toJSON() };
        return this.modal.open(ResourceAlignmentModal, overlayConfig).then(
            dialog => dialog.result
        );
    }
    
    private showHideInferred() {
        this.showInferred = !this.showInferred;
        this.vbCtx.setInferenceInResourceView(this.showInferred);
        this.fillPartitions();
    }
    
    private objectDblClick(object: ARTResource) {
        this.dblclickObj.emit(object);
    }
    
}