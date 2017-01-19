import { Component, Input, Output, EventEmitter } from "@angular/core";
import { AbstractPredicateValuesListRenderer } from "./abstractPerdicateValuesListRenderer";
import { CustomRangeServices } from "../../services/customRangeServices";
import { PropertyServices } from "../../services/propertyServices";
import { OwlServices } from "../../services/owlServices";
import { ManchesterServices } from "../../services/manchesterServices";
import { ARTURIResource, ARTNode, RDFTypesEnum, ResAttribute } from "../../utils/ARTResources";
import { RDFS, OWL } from "../../utils/Vocabulary";
import { ResViewModalServices } from "../resViewModals/resViewModalServices";

@Component({
    selector: "class-axiom-renderer",
    templateUrl: "./predicateValuesListRenderer.html",
})
export class ClassAxiomPartitionPartitionRenderer extends AbstractPredicateValuesListRenderer {

    //inherited from AbstractPredicateValuesListRenderer
    // @Input('pred-value-list') predicateValueList: ARTPredicateValues[];
    // @Input() resource:ARTURIResource;
    // @Output() update = new EventEmitter();//something changed in this partition. Tells to ResView to update
    // @Output() dblclickObj: EventEmitter<ARTResource> = new EventEmitter<ARTResource>();

    rootProperties: ARTURIResource[] = [
        RDFS.subClassOf, OWL.equivalentClass, OWL.disjointWith,
        OWL.complementOf, OWL.intersectionOf, OWL.unionOf, OWL.oneOf];
    label = "Class axioms";
    addBtnImgTitle = "Add a class axiom";
    addBtnImgSrc = require("../../../assets/images/class_create.png");
    removeBtnImgTitle = "Remove class axiom";

    constructor(private propertyService: PropertyServices, private owlService: OwlServices, private manchService: ManchesterServices,
        private crService: CustomRangeServices, private resViewModalService: ResViewModalServices) {
        super();
    }

    add(predicate?: ARTURIResource) {
        if (predicate == undefined) {
            alert("open modal to choose a property rooted on " + JSON.stringify(this.rootProperties));
            //based on the chosen property call enrichProperty
            // var chosenProp: ARTURIResource;
            // if (this.isRootProperty(chosenProp)) {
            //     this.enrichProperty(chosenProp);
            // } else {
            //     alert("enrichment of " + chosenProp.getShow() + " not available");
            // }
        } else {
            if (this.isRootProperty(predicate)) {
                this.enrichProperty(predicate);
            } else {
                alert("enrichment of " + predicate.getShow() + " not available");
            }
        }
    }

    /**
     * Based on the property opens the proper dialog to enrich it
     * oneOf opens a modal to create a list of instances
     * intersectionOf and unionOf opens a modal to create a list of classes (or expression)
     * subClassOf, equivalentClass, disjointWith, complementOf asks the user if choose an existing class
     * (then opens a class tree modal) or to create a manchester expression (then opens a prompt modal) 
     */
    private enrichProperty(property: ARTURIResource) {
        //if the property is oneOf open a modal to create an instance list, otherwise ask the user to make a further decision
        if (property.getURI() == OWL.oneOf.getURI()) {
            this.createInstanceList(property);
        } else if (property.getURI() == OWL.intersectionOf.getURI() || property.getURI() == OWL.unionOf.getURI()) {
            this.createClassList(property);
        } else { //rdfs:subClassOf, owl:equivalentClass, owl:disjointWith, owl:complementOf
            //ask the user to choose to add an existing class or to add a class expression
            this.resViewModalService.addPropertyValue("Add " + property.getShow(), this.resource, property, false).then(
                (data: any) => {
                    var value: any = data.value; //value can be a class or a manchester Expression
                    if (typeof value == "string") {
                        this.manchService.createRestriction(<ARTURIResource>this.resource, property, value).subscribe(
                            stResp => this.update.emit(null)
                        );
                    } else { //value is an ARTURIResource (a class selected from the tree)
                        if (property.getURI() == RDFS.subClassOf.getURI()) {
                            this.owlService.addSuperCls(<ARTURIResource>this.resource, value).subscribe(
                                stResp => this.update.emit(null)
                            );
                        } else {
                            this.propertyService.addExistingPropValue(this.resource, property, value.getURI(), RDFTypesEnum.uri).subscribe(
                                stResp => this.update.emit(null)
                            );
                        }
                    }
                },
                () => { }
            );
        }
    }

    /**
     * Opens a modal to create a class list.
     * Called to enrich intersectionOf and unionOf
     */
    private createClassList(property: ARTURIResource) {
        this.resViewModalService.createClassList("Add " + property.getShow()).then(
            (classes: any) => {
                if (property.getURI() == OWL.intersectionOf.getURI()) {
                    this.owlService.addIntersectionOf(<ARTURIResource>this.resource, classes).subscribe(
                        stResp => this.update.emit(null)
                    );
                } else if (property.getURI() == OWL.unionOf.getURI()) {
                    this.owlService.addUnionOf(<ARTURIResource>this.resource, classes).subscribe(
                        stResp => this.update.emit(null)
                    );
                }
            },
            () => { }
        );
    }

    /**
     * Opens a modal to create an instance list
     * Called to enrich oneOf
     */
    private createInstanceList(property: ARTURIResource) {
        this.resViewModalService.createInstanceList("Add " + property.getShow()).then(
            (instances: any) => {
                this.owlService.addOneOf(<ARTURIResource>this.resource, instances).subscribe(
                    stResp => this.update.emit(null)
                );
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
            //if it is removing a value about a root property, call the specific method
            if (this.isRootProperty(predicate)) {
                this.removeObjectForRootProperty(predicate, object);
            } else {//predicate is some subProperty of a root property
                alert("remove of value for " + predicate.getShow() + " not available");
            }
        }
    }

    /**
     * Removes a class axiom.
     * Depending on the property and the type of the object calls the proper service 
     */
    private removeObjectForRootProperty(predicate: ARTURIResource, object: ARTNode) {
        if (predicate.getURI() == RDFS.subClassOf.getURI()) {
            if (object.isBNode()) {
                this.manchService.removeExpression(<ARTURIResource>this.resource, predicate, object).subscribe(
                    stResp => this.update.emit(null)
                )
            } else {
                this.owlService.removeSuperCls(<ARTURIResource>this.resource, <ARTURIResource>object).subscribe(
                    stResp => this.update.emit(null)
                );
            }
        } else if (predicate.getURI() == OWL.equivalentClass.getURI() || predicate.getURI() == OWL.disjointWith.getURI() ||
            predicate.getURI() == OWL.complementOf.getURI()) {
            if (object.isBNode()) {
                this.manchService.removeExpression(<ARTURIResource>this.resource, predicate, object).subscribe(
                    stResp => this.update.emit(null)
                )
            } else {
                this.propertyService.removePropValue(<ARTURIResource>this.resource, predicate, object.getNominalValue(), null, RDFTypesEnum.uri).subscribe(
                    stResp => this.update.emit(null)
                );
            }
        } else if (predicate.getURI() == OWL.intersectionOf.getURI()) {
            this.owlService.removeIntersectionOf(<ARTURIResource>this.resource, object).subscribe(
                stResp => this.update.emit(null)
            );
        } else if (predicate.getURI() == OWL.unionOf.getURI()) {
            this.owlService.removeUnionOf(<ARTURIResource>this.resource, object).subscribe(
                stResp => this.update.emit(null)
            );
        } else if (predicate.getURI() == OWL.oneOf.getURI()) {
            this.owlService.removeOneOf(<ARTURIResource>this.resource, object).subscribe(
                stResp => this.update.emit(null)
            );
        }
    }

}