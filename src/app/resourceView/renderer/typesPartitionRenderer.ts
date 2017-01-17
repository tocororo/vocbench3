import { Component, Input, Output, EventEmitter } from "@angular/core";
import { AbstractPredicateObjectListRenderer } from "./abstractPredicateObjectListRenderer";
import { PropertyServices } from "../../services/propertyServices";
import { ResourceServices } from "../../services/resourceServices";
import { CustomRangeServices } from "../../services/customRangeServices";
import { OwlServices } from "../../services/owlServices";
import { BrowsingServices } from "../../widget/modal/browsingModal/browsingServices";
import { ResViewModalServices } from "../resViewModals/resViewModalServices";
import { VBEventHandler } from "../../utils/VBEventHandler"
import { ARTResource, ARTURIResource, ARTNode, ARTPredicateObjects, ResAttribute, RDFTypesEnum } from "../../utils/ARTResources";
import { RDF } from "../../utils/Vocabulary"

@Component({
    selector: "types-renderer",
    templateUrl: "./predicateObjectListRenderer.html",
})
export class TypesPartitionRenderer extends AbstractPredicateObjectListRenderer {

    //inherited from AbstractPredicateObjectListRenderer
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
        private crService: CustomRangeServices, private owlService: OwlServices, private browsingService: BrowsingServices,
        private eventHandler: VBEventHandler, private rvModalService: ResViewModalServices) {
        super();
    }

    add() {
        this.rvModalService.addPropertyValue("Add a type", this.resource, this.rootProperty).then(
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

    enrichProperty(predicate: ARTURIResource) {
        this.browsingService.browseClassTree("Add a " + predicate.getShow()).then(
            (selectedClass: any) => {
                if (predicate.getURI() == this.rootProperty.getURI()) {
                    this.owlService.addType(<ARTURIResource>this.resource, selectedClass).subscribe(
                        stResp => this.update.emit()
                    );
                } else { //predicate is some subProperty of rdf:type
                    this.propService.addExistingPropValue(this.resource, predicate, (<ARTResource>selectedClass).getNominalValue(), RDFTypesEnum.resource).subscribe(
                        stResp => this.update.emit(null)
                    );
                }
            },
            () => { }
        );
    }

    removePredicateObject(predicate: ARTURIResource, object: ARTNode) {
        if (predicate.getAdditionalProperty(ResAttribute.HAS_CUSTOM_RANGE) && object.isResource()) {
            this.crService.removeReifiedResource(this.resource, predicate, object).subscribe(
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