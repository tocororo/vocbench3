import {Component, Input} from "angular2/core";
import {ARTURIResource} from "../utils/ARTResources";
import {Deserializer} from "../utils/Deserializer";
import {ResourceUtils} from "../utils/ResourceUtils";
import {RdfResourceComponent} from "../widget/rdfResource/rdfResourceComponent";
import {ResourceViewServices} from "../services/resourceViewServices";

@Component({
	selector: "resource-view",
	templateUrl: "app/src/resourceView/resourceViewComponent.html",
	directives: [RdfResourceComponent],
    providers: [ResourceViewServices, ResourceUtils],
})
export class ResourceViewComponent {
    
    @Input() resource:ARTURIResource;
    
    //partitions
    public typesColl;
    public topconceptofColl;
    public schemesColl;
    public broadersColl;
    public lexicalizationsColl;
    public propertiesColl;
    
	constructor(private resViewService:ResourceViewServices, private deserializer:Deserializer, private resUtils:ResourceUtils) {}
    
    ngOnChanges(changes) {
        this.buildResourceView(this.resource);
    }
    
    public addType() {
        console.log("add type to resource " + this.resource.getShow());
        alert("add type to resource " + this.resource.getShow());
    }
    
    public addAsTopConceptTo() {
        console.log("add resource " + this.resource.getShow() + " as top concept to a scheme");
        alert("add resource " + this.resource.getShow() + " as top concept to a scheme");
    }
    
    public addToScheme() {
        console.log("add resource " + this.resource.getShow() + " to a scheme");
        alert("add resource " + this.resource.getShow() + " to a scheme");
    }
    
    public addBroader() {
        console.log("add broader to resource " + this.resource.getShow());
        alert("add broader to resource " + this.resource.getShow());
    }
    
    public addLexicalization() {
        console.log("add lexicalization to resource " + this.resource.getShow());
        alert("add lexicalization to resource " + this.resource.getShow());
    }
    
    public addPropertyValue() {
        console.log("add property to resource " + this.resource.getShow());
        alert("add property to resource " + this.resource.getShow());
    }
    
    public enrichProperty(predicate: ARTURIResource) {
        console.log("add " + predicate.getShow() + " to resource " + this.resource.getShow());
        alert("add " + predicate.getShow() + " to resource " + this.resource.getShow());
    }
    
    public getAddPropImgTitle(predicate: ARTURIResource) {
        return "Add a " + predicate.getShow();
    }
    
    public getAddPropImgSrc(predicate: ARTURIResource) {
        return this.resUtils.getAddPropImageSrc(predicate);
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
                            this.renderResourcePartition(partition);
                        } else if (partitionName == "types") {
                            this.renderTypesPartition(partition);
                        } else if (partitionName == "topconceptof") {
                            this.renderTopConceptOfPartition(partition);
                        } else if (partitionName == "schemes") {
                            this.renderSchemesPartition(partition);
                        } else if (partitionName == "broaders") {
                            this.renderBroadersPartition(partition);
                        } else if (partitionName == "lexicalizations") {
                            this.renderLexicalizationsPartition(partition);
                        } else if (partitionName == "properties") {
                            this.renderPropertiesPartition(partition);
                        }
                    }
                },
                err => { 
                    alert("Error: " + err);
                    console.error(err.stack);
                }
            );
    }
    
    private renderResourcePartition(resourceElement) {
        this.resource = this.deserializer.createURI(resourceElement.children[0]);
    }

    private renderTypesPartition(typesElement) {
        this.typesColl = this.deserializer.createRDFArray(typesElement);
    }

    private renderTopConceptOfPartition(topconceptofElement) {
        this.topconceptofColl = this.deserializer.createRDFArray(topconceptofElement);
    }

    private renderSchemesPartition(schemesElement) {
        this.schemesColl = this.deserializer.createRDFArray(schemesElement);
    }

    private renderBroadersPartition(broadersElement) {
        this.broadersColl = this.deserializer.createRDFArray(broadersElement);
    }

    private renderLexicalizationsPartition(lexicalizationsElement) {
        this.lexicalizationsColl = this.deserializer.createPredicateObjectsList(lexicalizationsElement.children[0]);
    }

    private renderPropertiesPartition(propertiesElement) {
        this.propertiesColl = this.deserializer.createPredicateObjectsList(propertiesElement.children[0]);
    }
    
}