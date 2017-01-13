import { Component, Input, Output, EventEmitter } from "@angular/core";
import { AbstractPredicateObjectListRenderer } from "./abstractPredicateObjectListRenderer";
import { PropertyServices } from "../../services/propertyServices";
import { ResourceServices } from "../../services/resourceServices";
import { CustomRangeServices } from "../../services/customRangeServices";
import { ManchesterServices } from "../../services/manchesterServices";
import { ResViewModalServices } from "../resViewModals/resViewModalServices";
import { ARTNode, ARTURIResource, ResAttribute, RDFTypesEnum } from "../../utils/ARTResources";
import { RDFS } from "../../utils/Vocabulary";

@Component({
    selector: "domains-renderer",
    templateUrl: "./predicateObjectListRenderer.html",
})
export class DomainsPartitionRenderer extends AbstractPredicateObjectListRenderer {

    //inherited from AbstractPredicateObjectListRenderer
    // @Input('pred-obj-list') predicateObjectList: ARTPredicateObjects[];
    // @Input() resource:ARTURIResource;
    // @Output() update = new EventEmitter();//something changed in this partition. Tells to ResView to update
    // @Output() dblclickObj: EventEmitter<ARTResource> = new EventEmitter<ARTResource>();

    rootProperty: ARTURIResource = RDFS.domain;
    label = "Domains";
    addBtnImgTitle = "Add a domain";
    addBtnImgSrc = require("../../../assets/images/class_create.png");
    removeBtnImgTitle = "Remove domain";

    constructor(propService: PropertyServices, resourceService: ResourceServices, crService: CustomRangeServices,
        private manchService: ManchesterServices, private rvModalService: ResViewModalServices) {
        super(propService, resourceService, crService);
    }

    add() {
        this.rvModalService.addPropertyValue("Add a domain", this.resource, [this.rootProperty]).then(
            (data: any) => {
                var prop: ARTURIResource = data.property;
                var value: any = data.value; //value can be a class or a manchester Expression
                
                if (typeof value == "string") {
                    this.manchService.createRestriction(<ARTURIResource>this.resource, prop, value).subscribe(
                        stResp => this.update.emit(null)
                    );
                } else { //value is an ARTURIResource (a class selected from the tree)
                    if (prop.getURI() == this.rootProperty.getURI()) { //it's using an rdfs:domain
                        this.propService.addPropertyDomain(<ARTURIResource>this.resource, value).subscribe(
                            stResp => this.update.emit(null)
                        );
                    } else { //it's using a subProperty of rdfs:domain
                        this.propService.addExistingPropValue(this.resource, prop, value.getURI(), RDFTypesEnum.resource).subscribe(
                            stResp => {
                                this.update.emit(null);
                            }
                        );
                    }
                }
            },
            () => {}
        )
    }

    enrichProperty(predicate: ARTURIResource) {
        this.rvModalService.addPropertyValue("Add " + predicate.getShow(), this.resource, [predicate], false).then(
            (data: any) => {
                var value: any = data.value; //value can be a class or a manchester Expression
                if (typeof value == "string") {
                    this.manchService.createRestriction(<ARTURIResource>this.resource, predicate, value).subscribe(
                        stResp => this.update.emit(null)
                    );
                } else { //value is an ARTURIResource (a class selected from the tree)
                    if (predicate.getURI() == this.rootProperty.getURI()) { //it's using an rdfs:domain
                        this.propService.addPropertyDomain(<ARTURIResource>this.resource, value).subscribe(
                            stResp => this.update.emit(null)
                        );
                    } else { //it's using a subProperty of rdfs:domain
                        this.propService.addExistingPropValue(this.resource, predicate, value.getURI(), RDFTypesEnum.resource).subscribe(
                            stResp => {
                                this.update.emit(null);
                            }
                        );
                    }
                }
            },
            () => {}
        );
    }

    removePredicateObject(predicate: ARTURIResource, object: ARTNode) {
        if (predicate.getAdditionalProperty(ResAttribute.HAS_CUSTOM_RANGE) && object.isResource()) {
            this.crService.removeReifiedResource(this.resource, predicate, object).subscribe(
                stResp => this.update.emit(null)
            );
        } else {
            if (object.getShow().startsWith("(") && object.getShow().startsWith(")") && object.isBNode()) { //class axiom
                this.manchService.removeExpression(<ARTURIResource>this.resource, predicate, object).subscribe(
                    stResp => this.update.emit(null)
                );
            } else { //removing a domain class
                if (this.rootProperty.getURI() == predicate.getURI()) { //removing rdfs:domain relation
                    this.propService.removePropertyDomain(<ARTURIResource>this.resource, <ARTURIResource>object).subscribe(
                        stResp => this.update.emit(null)
                    );
                } else { //removing subProperty of rdfs:domain
                    this.resourceService.removePropertyValue(this.resource, predicate, object).subscribe(
                        stResp => this.update.emit(null)
                    );
                }
            }
        }
    }

}