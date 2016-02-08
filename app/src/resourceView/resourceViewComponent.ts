import {Component, Input} from "angular2/core";
import {ARTURIResource, ARTPredicateObjects} from "../utils/ARTResources";
import {Deserializer} from "../utils/Deserializer";
import {RdfResourceComponent} from "../widget/rdfResource/rdfResourceComponent";
import {ResourceViewServices} from "../services/resourceViewServices";

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

@Component({
	selector: "resource-view",
	templateUrl: "app/src/resourceView/resourceViewComponent.html",
	directives: [RdfResourceComponent, TypesPartitionRenderer, TopConceptsPartitionRenderer, SchemesPartitionRenderer,
            BroadersPartitionRenderer, LexicalizationsPartitionRenderer, PropertiesPartitionRenderer, 
            SuperPropertiesPartitionRenderer, ClassAxiomPartitionPartitionRenderer, DomainsPartitionRenderer,
            RangesPartitionRenderer],
    providers: [ResourceViewServices],
})
export class ResourceViewComponent {
    
    @Input() resource:ARTURIResource;
    
    //partitions
    public typesColl: ARTURIResource[];
    public classAxiomColl: ARTPredicateObjects[];
    public topconceptofColl: ARTURIResource[];
    public schemesColl: ARTURIResource[];
    public broadersColl: ARTURIResource[];
    public superpropertiesColl: ARTURIResource[];
    public domainsColl: ARTURIResource[];
    public rangesColl: ARTURIResource[];
    public lexicalizationsColl: ARTPredicateObjects[];
    public propertiesColl: ARTPredicateObjects[];
    
	constructor(private resViewService:ResourceViewServices, private deserializer:Deserializer) {
    }
    
    ngOnChanges(changes) {
        this.buildResourceView(this.resource);//refresh resource view when Input resource changes
    }
    
    refresh() {
        this.buildResourceView(this.resource);//refresh resource view when a partition apply a change
    }
    
    private buildResourceView(res: ARTURIResource) {
        this.resViewService.getResourceView(res.getURI())
            .subscribe(
                stResp => {
                    var respResourceElement = stResp.getElementsByTagName("resource")[0];
                    var respPartitions = stResp.children;
                    
                    for (var i = 0; i < respPartitions.length; i++) {
                        var partition = respPartitions[i];
                        var partitionName = partition.tagName;
                        if (partitionName == "resource") {
                            this.resource = this.deserializer.createURI(partition.children[0]);
                        } else if (partitionName == "types") {
                            this.typesColl = this.deserializer.createRDFArray(partition);
                        } else if (partitionName == "classaxioms") {
                            this.classAxiomColl = this.deserializer.createPredicateObjectsList(partition.children[0]);
                        } else if (partitionName == "topconceptof") {
                            this.topconceptofColl = this.deserializer.createRDFArray(partition);
                        } else if (partitionName == "schemes") {
                            this.schemesColl = this.deserializer.createRDFArray(partition);
                        } else if (partitionName == "broaders") {
                            this.broadersColl = this.deserializer.createRDFArray(partition);
                        } else if (partitionName == "superproperties") {
                            this.superpropertiesColl = this.deserializer.createRDFArray(partition);
                        } else if (partitionName == "facets") {
                            
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
                }
            );
    }
    
}