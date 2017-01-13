import {Component, Input, Output, EventEmitter} from "@angular/core";
import { AbstractPredicateObjectListRenderer } from "./abstractPredicateObjectListRenderer";
import { PropertyServices } from "../../services/propertyServices";
import { ResourceServices } from "../../services/resourceServices";
import { CustomRangeServices } from "../../services/customRangeServices";
import { ManchesterServices } from "../../services/manchesterServices";
import { ResViewModalServices } from "../resViewModals/resViewModalServices";
import { ARTNode, ARTURIResource, ResAttribute, RDFTypesEnum, RDFResourceRolesEnum } from "../../utils/ARTResources";
import {RDFS, XmlSchema} from "../../utils/Vocabulary";

@Component({
	selector: "ranges-renderer",
	templateUrl: "./predicateObjectListRenderer.html",
})
export class RangesPartitionRenderer extends AbstractPredicateObjectListRenderer {
    
    //inherited from AbstractPredicateObjectListRenderer
    // @Input('pred-obj-list') predicateObjectList: ARTPredicateObjects[];
    // @Input() resource:ARTURIResource;
    // @Output() update = new EventEmitter();//something changed in this partition. Tells to ResView to update
    // @Output() dblclickObj: EventEmitter<ARTResource> = new EventEmitter<ARTResource>();

    rootProperty: ARTURIResource = RDFS.range;
    label = "Ranges";
    addBtnImgTitle = "Add a range";
    addBtnImgSrc = require("../../../assets/images/class_create.png");
    removeBtnImgTitle = "Remove range"; 
    
    constructor(propService: PropertyServices, resourceService: ResourceServices, crService: CustomRangeServices,
        private manchService: ManchesterServices, private rvModalService: ResViewModalServices) {
        super(propService, resourceService, crService); 
    }

    add() {
        this.rvModalService.addPropertyValue("Add a range", this.resource, [this.rootProperty]).then(
            (data: any) => {
                var prop: ARTURIResource = data.property;
                var value: any = data.value; //value can be a class, manchester Expression, or a datatype (if resource is a datatype prop)
                
                if (typeof value == "string") {
                    this.manchService.createRestriction(<ARTURIResource>this.resource, prop, value).subscribe(
                        stResp => this.update.emit(null)
                    );
                } else { //value is an ARTURIResource (a class selected from the tree or a datatype)
                    if (prop.getURI() == this.rootProperty.getURI()) { //it's using rdfs:range
                        this.propService.addPropertyRange(<ARTURIResource>this.resource, value).subscribe(
                            stResp => this.update.emit(null)
                        );
                    } else { //it's using a subProperty of rdfs:range
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
                var value: any = data.value; //value can be a class, manchester Expression, or a datatype (if resource is a datatype prop)
                if (typeof value == "string") {
                    this.manchService.createRestriction(<ARTURIResource>this.resource, predicate, value).subscribe(
                        stResp => this.update.emit(null)
                    );
                } else { //value is an ARTURIResource (a class selected from the tree or a datatype)
                    if (predicate.getURI() == this.rootProperty.getURI()) { //it's using rdfs:range
                        this.propService.addPropertyRange(<ARTURIResource>this.resource, value).subscribe(
                            stResp => this.update.emit(null)
                        );
                    } else { //it's using a subProperty of rdfs:range
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
            } else { //removing a range class or datatype
                if (this.rootProperty.getURI() == predicate.getURI()) { //removing rdfs:range relation
                    this.propService.removePropertyRange(<ARTURIResource>this.resource, <ARTURIResource>object).subscribe(
                        stResp => this.update.emit(null)
                    );
                } else { //removing subProperty of rdfs:range
                    this.resourceService.removePropertyValue(this.resource, predicate, object).subscribe(
                        stResp => this.update.emit(null)
                    );
                }
            }
        }
    }
    
    /**
     * Returns true if the current described resource is a datatype property. Useful to
     * render the add function as simple button ("add existing class") or as dropbdown list with two choices
     * "add existing class" or "Create and add class expression" 
     */
    // isDatatypeProperty(): boolean {
    //     return this.resource.getRole() == RDFResourceRolesEnum.datatypeProperty;
    // }
    
    // private addExistingClass() {
    //     this.browsingService.browseClassTree("Select a range class").then(
    //         (selectedClass: any) => {
    //             this.propService.addPropertyRange(this.resource, selectedClass).subscribe(
    //                 stResp => this.update.emit(null)
    //             );
    //         },
    //         () => {}
    //     );
    // }
    
    // private addClassExpression() {
    //     this.modalService.prompt("Class Expression (Manchester Syntax)").then(
    //         (manchExpr: any) => {
    //             this.manchService.checkExpression(manchExpr).subscribe(
    //                 stResp => {
    //                     this.manchService.createRestriction(this.resource, RDFS.range, manchExpr).subscribe(
    //                         stResp => this.update.emit(null)
    //                     );
    //                 }
    //             )
    //         },
    //         () => {}
    //     );
    // }
    
    // /**
    //  * Invokable just for datatype properties
    //  */
    // private addRangeDatatype() {
    //     var datatypes: Array<ARTURIResource> = [XmlSchema.boolean, XmlSchema.date,
    //         XmlSchema.dateTime, XmlSchema.float, XmlSchema.integer, XmlSchema.string]; 
            
    //     this.modalService.selectResource("Select range datatype", null, datatypes).then(
    //         (selection: any) => {
    //             this.propService.addPropertyRange(this.resource, selection).subscribe(
    //                 stResp => this.update.emit(null)
    //             )
    //         },
    //         () => {}
    //     );
    // }
    
    // private remove(range: ARTNode) {
    //     if (range.isBNode()) {
    //         this.manchService.removeExpression(this.resource, RDFS.range, range).subscribe(
    //             stResp => this.update.emit(null)
    //         )
    //     } else {
    //         this.propService.removePropertyRange(this.resource, <ARTURIResource>range).subscribe(
    //             stResp => {
    //                 this.update.emit(null);
    //             }
    //         );
    //     }
    // }
    
}