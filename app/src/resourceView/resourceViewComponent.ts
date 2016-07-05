import {Component, Input, Output, EventEmitter, ViewChild} from "@angular/core";
import {Modal} from 'angular2-modal/plugins/bootstrap';
import {ARTNode, ARTResource, ARTURIResource, ARTPredicateObjects, ResAttribute, RDFTypesEnum} from "../utils/ARTResources";
import {Deserializer} from "../utils/Deserializer";
import {VocbenchCtx} from "../utils/VocbenchCtx";
import {VBEventHandler} from "../utils/VBEventHandler";
import {RdfResourceComponent} from "../widget/rdfResource/rdfResourceComponent";
import {ResourceRenameComponent} from "./resourceRenameComponent";
import {ResourceViewServices} from "../services/resourceViewServices";
import {AlignmentServices} from "../services/alignmentServices";
import {ResourceAlignmentModal, ResourceAlignmentModalData} from "../alignment/resourceAlignment/resourceAlignmentModal"

import {TypesPartitionRenderer} from "./renderer/typesPartitionRenderer";
import {TopConceptsPartitionRenderer} from "./renderer/topConceptsPartitionRenderer";
import {SchemesPartitionRenderer} from "./renderer/schemesPartitionRenderer";
import {BroadersPartitionRenderer} from "./renderer/broadersPartitionRenderer";
import {LexicalizationsPartitionRenderer} from "./renderer/lexicalizationsPartitionRenderer";
import {MembersPartitionRenderer} from "./renderer/membersPartitionRenderer";
import {PropertiesPartitionRenderer} from "./renderer/propertiesPartitionRenderer";
import {ClassAxiomPartitionPartitionRenderer} from "./renderer/classAxiomPartitionRenderer";
import {SuperPropertiesPartitionRenderer} from "./renderer/superPropertiesPartitionRenderer";
import {DomainsPartitionRenderer} from "./renderer/domainsPartitionRenderer";
import {RangesPartitionRenderer} from "./renderer/rangesPartitionRenderer";
import {PropertyFacetsPartitionRenderer} from "./renderer/propertyFacetsPartitionRenderer";

@Component({
    selector: "resource-view",
    templateUrl: "app/src/resourceView/resourceViewComponent.html",
    directives: [RdfResourceComponent, ResourceRenameComponent, TypesPartitionRenderer, TopConceptsPartitionRenderer, 
        SchemesPartitionRenderer, BroadersPartitionRenderer, LexicalizationsPartitionRenderer, PropertiesPartitionRenderer,
        SuperPropertiesPartitionRenderer, ClassAxiomPartitionPartitionRenderer, DomainsPartitionRenderer,
        RangesPartitionRenderer, PropertyFacetsPartitionRenderer, MembersPartitionRenderer],
    providers: [ResourceViewServices, AlignmentServices],
})
export class ResourceViewComponent {
    
    @Input() resource: ARTResource;
    @Output() dblclickObj: EventEmitter<ARTResource> = new EventEmitter<ARTResource>();
    
    @ViewChild('blockDiv') blockingDivElement;
    private viewInitialized: boolean = false;
    
    private showInferred = false;
    
    //partitions
    private typesColl: ARTURIResource[] = null;
    private classAxiomColl: ARTPredicateObjects[] = null;
    private topconceptofColl: ARTURIResource[] = null;
    private schemesColl: ARTURIResource[] = null;
    private broadersColl: ARTURIResource[] = null;
    private superpropertiesColl: ARTURIResource[] = null;
    private domainsColl: ARTNode[] = null;
    private rangesColl: ARTNode[] = null;
    private lexicalizationsColl: ARTPredicateObjects[] = null;
    private membersColl: ARTResource[] = null;
    private propertiesColl: ARTPredicateObjects[] = null;
    private propertyFacets: any[] = null;
    private inverseofColl: ARTURIResource[] = null;
    
    private eventSubscriptions = [];
    
	constructor(private resViewService:ResourceViewServices, private alignServices: AlignmentServices, private vbCtx: VocbenchCtx, 
        private eventHandler: VBEventHandler, private modal: Modal) {
            
        this.eventSubscriptions.push(eventHandler.resourceRenamedEvent.subscribe(
            data => this.buildResourceView(data.newResource)));
    }
    
    ngOnChanges(changes) {
        this.showInferred = this.vbCtx.getInferenceInResourceView();
        if (changes.resource.currentValue) {
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
    
    private buildResourceView(res: ARTResource) {
        this.blockingDivElement.nativeElement.style.display = "block";
        
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
        
        this.resViewService.getResourceView(res).subscribe(
            stResp => {
                var respResourceElement = stResp.getElementsByTagName("resource")[0];
                var respPartitions = stResp.children;

                for (var i = 0; i < respPartitions.length; i++) {
                    var partition = respPartitions[i];
                    var partitionName = partition.tagName;
                    if (partitionName == "resource") {
                        this.resource = Deserializer.createRDFResource(partition.children[0]);
                    } else if (partitionName == "types") {
                        this.typesColl = Deserializer.createURIArray(partition);
                        this.typesColl = <ARTURIResource[]>this.filterInferredFromResourceList(this.typesColl);
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
                    } else if (partitionName == "properties") {
                        this.propertiesColl = Deserializer.createPredicateObjectsList(partition.children[0]);
                        this.propertiesColl = this.filterInferredFromPredObjList(this.propertiesColl);
                    }
                }
                this.blockingDivElement.nativeElement.style.display = "none";
            },
            err => {
                this.blockingDivElement.nativeElement.style.display = "none";
            }
        );
    }
    
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
    
    private parseFacetsPartition(facetsElement) {
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
        return this.modal.open(ResourceAlignmentModal, modalData).then(
            dialog => dialog.result
        );
    }
    
    private showHideInferred() {
        this.showInferred = !this.showInferred;
        this.vbCtx.setInferenceInResourceView(this.showInferred);
        this.buildResourceView(this.resource);
    }
    
    private objectDblClick(object: ARTResource) {
        this.dblclickObj.emit(object);
    }
    
}