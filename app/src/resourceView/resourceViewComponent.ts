import {Component, Input, Output, EventEmitter} from "@angular/core";
import {Modal} from 'angular2-modal/plugins/bootstrap';
import {ARTNode, ARTResource, ARTURIResource, ARTPredicateObjects, ResAttribute, RDFTypesEnum} from "../utils/ARTResources";
import {Deserializer} from "../utils/Deserializer";
import {VocbenchCtx} from "../utils/VocbenchCtx";
import {SanitizerDirective} from "../utils/directives/sanitizerDirective";
import {RdfResourceComponent} from "../widget/rdfResource/rdfResourceComponent";
import {ModalServices} from "../widget/modal/modalServices";
import {ResourceViewServices} from "../services/resourceViewServices";
import {RefactorServices} from "../services/refactorServices";
import {AlignmentServices} from "../services/alignmentServices";
import {ResourceAlignmentModal, ResourceAlignmentModalData} from "../alignment/resourceAlignment/resourceAlignmentModal"

import {TypesPartitionRenderer} from "./renderer/typesPartitionRenderer";
import {TopConceptsPartitionRenderer} from "./renderer/topConceptsPartitionRenderer";
import {SchemesPartitionRenderer} from "./renderer/schemesPartitionRenderer";
import {BroadersPartitionRenderer} from "./renderer/broadersPartitionRenderer";
import {LexicalizationsPartitionRenderer} from "./renderer/lexicalizationsPartitionRenderer";
import {PropertiesPartitionRenderer} from "./renderer/propertiesPartitionRenderer";
import {ClassAxiomPartitionPartitionRenderer} from "./renderer/classAxiomPartitionRenderer";
import {SuperPropertiesPartitionRenderer} from "./renderer/superPropertiesPartitionRenderer";
import {DomainsPartitionRenderer} from "./renderer/domainsPartitionRenderer";
import {RangesPartitionRenderer} from "./renderer/rangesPartitionRenderer";
import {PropertyFacetsPartitionRenderer} from "./renderer/propertyFacetsPartitionRenderer";

@Component({
    selector: "resource-view",
    templateUrl: "app/src/resourceView/resourceViewComponent.html",
    directives: [RdfResourceComponent, TypesPartitionRenderer, TopConceptsPartitionRenderer, SchemesPartitionRenderer,
        BroadersPartitionRenderer, LexicalizationsPartitionRenderer, PropertiesPartitionRenderer,
        SuperPropertiesPartitionRenderer, ClassAxiomPartitionPartitionRenderer, DomainsPartitionRenderer,
        RangesPartitionRenderer, PropertyFacetsPartitionRenderer, SanitizerDirective],
    providers: [ResourceViewServices, RefactorServices, AlignmentServices],
})
export class ResourceViewComponent {
    
    @Input() resource:ARTResource;
    @Output() dblclickObj: EventEmitter<ARTResource> = new EventEmitter<ARTResource>();
    
    private renameLocked = true;
    private showInferred = false;
    
    //partitions
    private typesColl: ARTURIResource[];
    private classAxiomColl: ARTPredicateObjects[];
    private topconceptofColl: ARTURIResource[];
    private schemesColl: ARTURIResource[];
    private broadersColl: ARTURIResource[];
    private superpropertiesColl: ARTURIResource[];
    private domainsColl: ARTNode[];
    private rangesColl: ARTNode[];
    private lexicalizationsColl: ARTPredicateObjects[];
    private propertiesColl: ARTPredicateObjects[];
    private propertyFacets: any[];
    private inverseofColl: ARTURIResource[];
    
	constructor(private resViewService:ResourceViewServices, private refactorService: RefactorServices, private alignServices: AlignmentServices,
        private vbCtx: VocbenchCtx, private modalService: ModalServices, private modal: Modal) {
    }
    
    ngOnChanges(changes) {
        this.showInferred = this.vbCtx.getInferenceInResourceView();
        if (changes.resource.currentValue) {
            this.buildResourceView(this.resource);//refresh resource view when Input resource changes       
        }
    }
    
    private buildResourceView(res: ARTResource) {
        document.getElementById("blockDivResView").style.display = "block";
        
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
                        this.resource = Deserializer.createURI(partition.children[0]);
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
                    } else if (partitionName == "properties") {
                        this.propertiesColl = Deserializer.createPredicateObjectsList(partition.children[0]);
                        this.propertiesColl = this.filterInferredFromPredObjList(this.propertiesColl);
                    }
                }
                document.getElementById("blockDivResView").style.display = "none"
            },
            err => { document.getElementById("blockDivResView").style.display = "none"; }
        );
    }
    
    private filterInferredFromResourceList(resourceArray: ARTNode[]): ARTNode[] {
        if (!this.showInferred) {
            for (var i = 0; i < resourceArray.length; i++) {
                if (!resourceArray[i].getAdditionalProperty(ResAttribute.EXPLICIT)) {
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
                    if (!objList[j].getAdditionalProperty(ResAttribute.EXPLICIT)) {
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
    
    /** 
     * Enable and focus the input text to rename the resource 
     */  
    private startRename(inputEl: HTMLElement) {
        inputEl.focus();
        this.renameLocked = false;
    }
    
    /**
     * Cancel the renaming of the resource and restore the original UI
     */
    private cancelRename(inputEl: HTMLInputElement) {
        //here I can cast resource to ARTURIResource (since rename is enabled only for ARTURIResource and not for ARTBNode)
        inputEl.value = (<ARTURIResource>this.resource).getLocalName();
        this.renameLocked = true;
    }
    
    /**
     * Apply the renaming of the resource and restore the original UI
     */
    private renameResource(inputEl: HTMLInputElement) {
        //here I can cast resource to ARTURIResource (since rename is enabled only for ARTURIResource and not for ARTBNode)
        this.renameLocked = true;
        var newLocalName = inputEl.value;
        if (newLocalName.trim() == "") {
            this.modalService.alert("Rename", "You have to write a valid local name", "error");
            inputEl.value = (<ARTURIResource>this.resource).getLocalName();
            return;
        }
        var newUri = (<ARTURIResource>this.resource).getBaseURI() + newLocalName;
        if ((<ARTURIResource>this.resource).getURI() != newUri) { //if the uri has changed 
            this.refactorService.changeResourceURI(<ARTURIResource>this.resource, newUri).subscribe(
                newResource => {
                    //here pass newResource instead of this.resource since this.resource is not still
                    //updated/injected from the NodeComponent that catch the rename event 
                    this.buildResourceView(newResource);
                }
            );    
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