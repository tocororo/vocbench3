import { Component, Input, Output, EventEmitter } from "@angular/core";
import { AbstractPredicateObjectsListRenderer } from "./abstractPredicateObjectsListRenderer";
import { PropertyServices } from "../../services/propertyServices";
import { ResourceServices } from "../../services/resourceServices";
import { CustomFormsServices } from "../../services/customFormsServices";
import { OwlServices } from "../../services/owlServices";
import { ResViewModalServices } from "../resViewModals/resViewModalServices";
import { VBEventHandler } from "../../utils/VBEventHandler"
import { ARTResource, ARTURIResource, ARTNode, ARTPredicateObjects, ResAttribute, RDFTypesEnum } from "../../models/ARTResources";
import { RDF } from "../../models/Vocabulary"

@Component({
    selector: "types-renderer",
    templateUrl: "./predicateObjectsListRenderer.html",
})
export class TypesPartitionRenderer extends AbstractPredicateObjectsListRenderer {

    //inherited from AbstractPredicateObjectsListRenderer
    // @Input('pred-obj-list') predicateObjectList: ARTPredicateObjects[];
    // @Input() resource:ARTURIResource;
    // @Output() update = new EventEmitter();//something changed in this partition. Tells to ResView to update
    // @Output() dblclickObj: EventEmitter<ARTResource> = new EventEmitter<ARTResource>();

    rootProperty: ARTURIResource = RDF.type;
    label = "Types";
    addBtnImgTitle = "Add a type";
    addBtnImgSrc = require("../../../assets/images/class_create.png");
    removeBtnImgTitle = "Remove type";

    constructor(private propService: PropertyServices, private resourceService: ResourceServices,
        private cfService: CustomFormsServices, private owlService: OwlServices, private eventHandler: VBEventHandler,
        private rvModalService: ResViewModalServices) {
        super();
    }

    add(predicate?: ARTURIResource) {
        var propChangeable: boolean = predicate == null;
        this.rvModalService.addPropertyValue("Add a type", this.resource, this.rootProperty, propChangeable).then(
            (data: any) => {
                var prop: ARTURIResource = data.property;
                var typeClass: ARTURIResource = data.value;
                if (prop.getURI() == this.rootProperty.getURI()) { //it's adding an rdf:type
                    this.owlService.addType(<ARTURIResource>this.resource, typeClass).subscribe(
                        stResp => this.update.emit(null)
                    ) ;
                } else { //it's adding a subProperty of rdf:type
                    this.propService.addExistingPropValue(this.resource, prop, typeClass.getURI(), RDFTypesEnum.resource).subscribe(
                        stResp => {
                            this.eventHandler.typeAddedEvent.emit({resource: this.resource, type: typeClass});
                            this.update.emit(null);
                        }
                    );
                }
            },
            () => {}
        )
    }

    removePredicateObject(predicate: ARTURIResource, object: ARTNode) {
        if (predicate.getAdditionalProperty(ResAttribute.HAS_CUSTOM_RANGE) && object.isResource()) {
            this.cfService.removeReifiedResource(this.resource, predicate, object).subscribe(
                stResp => this.update.emit(null)
            );
        } else {
            if (this.rootProperty.getURI() == predicate.getURI()) { //removing rdf:type relation
                this.owlService.removeType(<ARTURIResource>this.resource, <ARTResource>object).subscribe(
                    stResp => this.update.emit(null)
                );
            } else {//predicate is some subProperty of rdf:type
                this.resourceService.removePropertyValue(this.resource, predicate, object).subscribe(
                    stResp => {
                        this.eventHandler.typeRemovedEvent.emit({resource: this.resource, type: <ARTResource>object});
                        this.update.emit(null);
                    }
                );
            }
        }
    }


}