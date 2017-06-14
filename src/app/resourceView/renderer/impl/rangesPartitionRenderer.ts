import { Component, Input, Output, EventEmitter } from "@angular/core";
import { AbstractPredObjListRenderer } from "../abstractPredObjListRenderer";
import { ManchesterServices } from "../../../services/manchesterServices";
import { ARTNode, ARTBNode, ARTResource, ARTURIResource, ResAttribute, RDFResourceRolesEnum } from "../../../models/ARTResources";
import { RDFS, XmlSchema } from "../../../models/Vocabulary";

import { PropertyServices } from "../../../services/propertyServices";
import { CustomFormsServices } from "../../../services/customFormsServices";
import { ResourcesServices } from "../../../services/resourcesServices";
import { ResViewModalServices } from "../../resViewModals/resViewModalServices";
import { BasicModalServices } from "../../../widget/modal/basicModal/basicModalServices";
import { BrowsingModalServices } from "../../../widget/modal/browsingModal/browsingModalServices";
import { CreationModalServices } from "../../../widget/modal/creationModal/creationModalServices";

@Component({
    selector: "ranges-renderer",
    templateUrl: "../predicateObjectsListRenderer.html",
})
export class RangesPartitionRenderer extends AbstractPredObjListRenderer {

    //inherited from AbstractPredObjListRenderer
    // @Input('pred-obj-list') predicateObjectList: ARTPredicateObjects[];
    // @Input() resource:ARTURIResource;
    // @Output() update = new EventEmitter();//something changed in this partition. Tells to ResView to update
    // @Output() dblclickObj: EventEmitter<ARTResource> = new EventEmitter<ARTResource>();

    rootProperty: ARTURIResource = RDFS.range;
    label = "Ranges";
    addBtnImgTitle = "Add a range";
    addBtnImgSrc = require("../../../../assets/images/icons/actions/class_create.png");
    removeBtnImgTitle = "Remove range";

    constructor(propService: PropertyServices, resourcesService: ResourcesServices, cfService: CustomFormsServices,
        basicModals: BasicModalServices, browsingModals: BrowsingModalServices, creationModal: CreationModalServices,
        rvModalService: ResViewModalServices, private manchService: ManchesterServices) {
        super(propService, resourcesService, cfService, basicModals, browsingModals, creationModal, rvModalService);
    }

    add(predicate?: ARTURIResource) {
        var propChangeable: boolean = predicate == null;
        this.rvModalService.addPropertyValue("Add a range", this.resource, this.rootProperty, propChangeable).then(
            (data: any) => {
                var prop: ARTURIResource = data.property;
                var value: any = data.value; //value can be a class, manchester Expression, or a datatype (if resource is a datatype prop)
                /** If the rerource is a datatype property, value could be a:
                 * - datatype (ARTURIResource)
                 * - datarange (array of ARTLiteral)
                 * Otherwise, if the resource is a object/annotation/ontologyProperty, value could be a:
                 * - resource
                 * - manchester expression
                 */
                if (this.resource.getRole() == RDFResourceRolesEnum.datatypeProperty) {
                    if (value instanceof Array) { // datarange
                        this.propService.setDataRange(<ARTURIResource>this.resource, value).subscribe(
                            stResp => this.update.emit(null)
                        )
                    } else if (value instanceof ARTURIResource) { //datatype
                        if (prop.getURI() == this.rootProperty.getURI()) { //it's using rdfs:range
                            this.propService.addPropertyRange(<ARTURIResource>this.resource, value).subscribe(
                                stResp => this.update.emit(null)
                            );
                        } else { //it's using a subProperty of rdfs:range
                            this.resourcesService.addValue(this.resource, prop, value).subscribe(
                                stResp => this.update.emit(null)
                            );
                        }
                    }
                } else {
                    if (typeof value == "string") {
                        this.manchService.createRestriction(<ARTURIResource>this.resource, prop, value).subscribe(
                            stResp => this.update.emit(null)
                        );
                    } else { //value is an ARTURIResource (a class selected from the tree)
                        if (prop.getURI() == this.rootProperty.getURI()) { //it's using rdfs:range
                            this.propService.addPropertyRange(<ARTURIResource>this.resource, value).subscribe(
                                stResp => this.update.emit(null)
                            );
                        } else { //it's using a subProperty of rdfs:range
                            this.resourcesService.addValue(this.resource, prop, value).subscribe(
                                stResp => this.update.emit(null)
                                
                            );
                        }
                    }
                }
            },
            () => { }
        )
    }

    removePredicateObject(predicate: ARTURIResource, object: ARTNode) {
        if (predicate.getAdditionalProperty(ResAttribute.HAS_CUSTOM_RANGE) && object.isResource()) {
            this.cfService.removeReifiedResource(this.resource, predicate, object).subscribe(
                stResp => this.update.emit(null)
            );
        } else {
            /**
             * An object in this partition could be:
             * - Class (type: URI, role: cls)
             * - Datatype (type: URI, role: individual)
             * - Manchester expression (type: BNode, role: cls)
             * - DataRange (type: BNode, role: dataRange)
             */
            if (object instanceof ARTBNode) { //object is manchExpr or dataRange
                if (object.getRole() == RDFResourceRolesEnum.dataRange) {
                    this.propService.removeDataranges(<ARTURIResource>this.resource, object).subscribe(
                        stResp => this.update.emit(null)
                    );
                } else { //role cls => manchester expression or simple class
                    this.manchService.isClassAxiom(object).subscribe(
                        isClassAxiom => {
                            if (isClassAxiom) {
                                this.manchService.removeExpression(<ARTURIResource>this.resource, predicate, object).subscribe(
                                    stResp => this.update.emit(null)
                                );
                            } else {
                                this.removeRangeClass(predicate, object);
                            }
                        }
                    );
                }
            } else { //object instanceof ARTURIResource => object is class or datatype
                this.removeRangeClass(predicate, <ARTResource>object);
            }
        }
    }

    private removeRangeClass(predicate: ARTURIResource, object: ARTResource) {
        if (this.rootProperty.getURI() == predicate.getURI()) { //removing rdfs:range relation
            this.propService.removePropertyRange(<ARTURIResource>this.resource, <ARTURIResource>object).subscribe(
                stResp => this.update.emit(null)
            );
        } else { //removing subProperty of rdfs:range
            this.resourcesService.removeValue(this.resource, predicate, object).subscribe(
                stResp => this.update.emit(null)
            );
        }
    }

}