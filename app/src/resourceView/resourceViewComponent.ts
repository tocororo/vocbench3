import {Component, Input} from "angular2/core";
import {ARTNode, ARTURIResource, ARTPredicateObjects} from "../utils/ARTResources";
import {Deserializer} from "../utils/Deserializer";
import {RdfResourceComponent} from "../widget/rdfResource/rdfResourceComponent";
import {ResourceViewServices} from "../services/resourceViewServices";
import {RefactorServices} from "../services/refactorServices";

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
            RangesPartitionRenderer, PropertyFacetsPartitionRenderer],
    providers: [ResourceViewServices, RefactorServices],
})
export class ResourceViewComponent {
    
    @Input() resource:ARTURIResource;
    
    private renameLocked = true;
    
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
    
	constructor(private resViewService:ResourceViewServices, private refactorService: RefactorServices, 
        private deserializer:Deserializer) {
    }
    
    ngOnChanges(changes) {
        if (changes.resource.currentValue) {
            this.buildResourceView(this.resource);//refresh resource view when Input resource changes       
        }
    }
    
    private buildResourceView(res: ARTURIResource) {
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
                        this.resource = this.deserializer.createURI(partition.children[0]);
                    } else if (partitionName == "types") {
                        this.typesColl = this.deserializer.createURIArray(partition);
                    } else if (partitionName == "classaxioms") {
                        this.classAxiomColl = this.deserializer.createPredicateObjectsList(partition.children[0]);
                    } else if (partitionName == "topconceptof") {
                        this.topconceptofColl = this.deserializer.createURIArray(partition);
                    } else if (partitionName == "schemes") {
                        this.schemesColl = this.deserializer.createURIArray(partition);
                    } else if (partitionName == "broaders") {
                        this.broadersColl = this.deserializer.createURIArray(partition);
                    } else if (partitionName == "superproperties") {
                        this.superpropertiesColl = this.deserializer.createURIArray(partition);
                    } else if (partitionName == "facets") {
                        this.parseFacetsPartition(partition);
                    } else if (partitionName == "domains") {
                        this.domainsColl = this.deserializer.createRDFArray(partition);
                    } else if (partitionName == "ranges") {
                        this.rangesColl = this.deserializer.createRDFArray(partition);
                    } else if (partitionName == "lexicalizations") {
                        this.lexicalizationsColl = this.deserializer.createPredicateObjectsList(partition.children[0]);
                    } else if (partitionName == "properties") {
                        this.propertiesColl = this.deserializer.createPredicateObjectsList(partition.children[0]);
                    }
                }
            },
            err => {
                alert("Error: " + err);
                console.error(err.stack);
            },
            () => document.getElementById("blockDivResView").style.display = "none"
        );
    }
    
    private parseFacetsPartition(facetsElement) {
        //init default facets
        this.propertyFacets = [
            {name: "symmetric", explicit: this.resource.getAdditionalProperty("explicit"), value: false},
            {name: "functional", explicit: this.resource.getAdditionalProperty("explicit"), value: false},
            {name: "inverseFunctional", explicit: this.resource.getAdditionalProperty("explicit"), value: false},
            {name: "transitive", explicit: this.resource.getAdditionalProperty("explicit"), value: false},
        ];
        var facetsChildren = facetsElement.children;
        for (var i = 0; i < facetsChildren.length; i++) {
            var facetName = facetsChildren[i].tagName;
            if (facetName == "symmetric" || facetName == "functional" || facetName == "inverseFunctional" || facetName == "transitive") {
                var facet = {
                    name: facetName,
                    explicit: (facetsChildren[i].getAttribute("explicit") == "true"),
                    value: (facetsChildren[i].getAttribute("value") == "true")
                };
                //replace the default facets
                for (var j=0; j<this.propertyFacets.length; j++) {
                    if (this.propertyFacets[j].name == facetName) {
                        this.propertyFacets[j] = facet;
                        break;
                    }
                }
            } else if (facetName == "inverseof") {
                this.inverseofColl = this.deserializer.createURIArray(facetsChildren[i]);
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
        inputEl.value = this.resource.getLocalName();
        this.renameLocked = true;
    }
    
    /**
     * Apply the renaming of the resource and restore the original UI
     */
    private renameResource(inputEl: HTMLInputElement) {
        this.renameLocked = true;
        var newLocalName = inputEl.value;
        if (newLocalName.trim() == "") {
            alert("You have to write a valid local name");
            inputEl.value = this.resource.getLocalName();
            return;
        }
        var newUri = this.resource.getBaseURI() + newLocalName;
        if (this.resource.getURI() != newUri) { //if the uri has changed 
            this.refactorService.changeResourceURI(this.resource, newUri).subscribe(
                newResource => {
                    //here pass newResource instead of this.resource since this.resource is not still
                    //updated/injected from the NodeComponent that catch the rename event 
                    this.buildResourceView(newResource);
                },
                err => { 
                    alert("Error: " + err);
                    console.error(err['stack']);
                }
            );    
        }
    }
    
}