import {Component, Input} from "angular2/core";
import {ARTURIResource, ARTNode} from "../utils/ARTResources";
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
        alert("add type to resource " + this.resource.getShow());
    }
    
    public deleteType(type: ARTURIResource) {
        alert("delete type " + type.getShow() + " to " + this.resource.getShow());
    }
    
    public addAsTopConceptTo() {
        alert("add resource " + this.resource.getShow() + " as top concept to a scheme");
    }
    
    public removeAsTopConcept(scheme: ARTURIResource) {
        alert("deleting " + this.resource.getShow() + " as top concept of " + scheme.getShow());
    }
    
    public addToScheme() {
        alert("add resource " + this.resource.getShow() + " to a scheme");
    }
    
    public removeFromScheme(scheme: ARTURIResource) {
        alert("deleting " + this.resource.getShow() + " as from scheme " + scheme.getShow());
    }
    
    public addBroader() {
        alert("add broader to resource " + this.resource.getShow());
    }
    
    public removeBroader(broader: ARTURIResource) {
        alert("remove broader " + broader.getShow() + " to resource " + this.resource.getShow());
    }
    
    public addLexicalization() {
        alert("add lexicalization to resource " + this.resource.getShow());
    }
    
    public addPropertyValue() {
        alert("add property to resource " + this.resource.getShow());
    }
    
    public removePredicateObject(predicate: ARTURIResource, object: ARTNode) {
        alert("remove triple " + this.resource.getShow() + " " + predicate.getShow() + " " + object.getShow());
    }
    
    public enrichProperty(predicate: ARTURIResource) {
        alert("add " + predicate.getShow() + " to resource " + this.resource.getShow());
    }
    
    public getAddPropImgTitle(predicate: ARTURIResource) {
        return "Add a " + predicate.getShow();
    }
    
    public getRemovePropImgTitle(predicate: ARTURIResource) {
        return "Remove " + predicate.getShow();
    }
    
    public getAddPropImgSrc(predicate: ARTURIResource) {
        return this.resUtils.getActionPropImageSrc(predicate, "create");
    }
    
    public getRemovePropImgSrc(predicate: ARTURIResource) {
        return this.resUtils.getActionPropImageSrc(predicate, "delete");
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