import {Component, Input, ReflectiveInjector, provide} from "angular2/core";
import {ARTNode, ARTURIResource, ARTPredicateObjects} from "../utils/ARTResources";
import {Deserializer} from "../utils/Deserializer";
import {RDFTypesEnum} from "../utils/Enums";
import {SanitizerDirective} from "../utils/directives/sanitizerDirective";
import {RdfResourceComponent} from "../widget/rdfResource/rdfResourceComponent";
import {ModalServices} from "../widget/modal/modalServices";
import {ResourceViewServices} from "../services/resourceViewServices";
import {RefactorServices} from "../services/refactorServices";
import {AlignmentServices} from "../services/alignmentServices";
import {Modal, ModalConfig, ModalDialogInstance, ICustomModal} from 'angular2-modal/angular2-modal';
import {ResourceAlignmentModal, ResourceAlignmentModalContent} from "../alignment/resourceAlignment/resourceAlignmentModal"

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
        private alignServices: AlignmentServices, private modalService: ModalServices, private modal: Modal) {
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
                        this.resource = Deserializer.createURI(partition.children[0]);
                    } else if (partitionName == "types") {
                        this.typesColl = Deserializer.createURIArray(partition);
                    } else if (partitionName == "classaxioms") {
                        this.classAxiomColl = Deserializer.createPredicateObjectsList(partition.children[0]);
                    } else if (partitionName == "topconceptof") {
                        this.topconceptofColl = Deserializer.createURIArray(partition);
                    } else if (partitionName == "schemes") {
                        this.schemesColl = Deserializer.createURIArray(partition);
                    } else if (partitionName == "broaders") {
                        this.broadersColl = Deserializer.createURIArray(partition);
                    } else if (partitionName == "superproperties") {
                        this.superpropertiesColl = Deserializer.createURIArray(partition);
                    } else if (partitionName == "facets") {
                        this.parseFacetsPartition(partition);
                    } else if (partitionName == "domains") {
                        this.domainsColl = Deserializer.createRDFArray(partition);
                    } else if (partitionName == "ranges") {
                        this.rangesColl = Deserializer.createRDFArray(partition);
                    } else if (partitionName == "lexicalizations") {
                        this.lexicalizationsColl = Deserializer.createPredicateObjectsList(partition.children[0]);
                    } else if (partitionName == "properties") {
                        this.propertiesColl = Deserializer.createPredicateObjectsList(partition.children[0]);
                    }
                }
            },
            err => { },
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
            this.modalService.alert("Rename", "You have to write a valid local name", "error");
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
                err => { }
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
        var modalContent = new ResourceAlignmentModalContent(this.resource);
        let resolvedBindings = ReflectiveInjector.resolve(
            [provide(ICustomModal, {useValue: modalContent})]),
            dialog = this.modal.open(
                <any>ResourceAlignmentModal,
                resolvedBindings,
                new ModalConfig(null, true, null, "modal-dialog")
        );
        return dialog.then(resultPromise => resultPromise.result);
    }
    
}