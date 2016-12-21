import {Component, Input, Output, EventEmitter} from "@angular/core";
import {ARTResource, ARTURIResource, ARTBNode, ARTNode, ARTPredicateValues, RDFTypesEnum, ResAttribute} from "../../utils/ARTResources";
import {RDFS, OWL} from "../../utils/Vocabulary";
import {ModalServices} from "../../widget/modal/modalServices";
import {BrowsingServices} from "../../widget/modal/browsingModal/browsingServices";
import {ResViewModalServices} from "../resViewModals/resViewModalServices";
import {ResourceUtils} from "../../utils/ResourceUtils";
import {PropertyServices} from "../../services/propertyServices";
import {OwlServices} from "../../services/owlServices";
import {ManchesterServices} from "../../services/manchesterServices";

@Component({
    selector: "class-axiom-renderer",
    templateUrl: "./predicateValueListRenderer.html",
})
export class ClassAxiomPartitionPartitionRenderer {
    
    @Input('pred-value-list') predicateValueList: ARTPredicateValues[];
    @Input() resource:ARTURIResource;
    @Output() update = new EventEmitter();//something changed in this partition. Tells to ResView to update
    @Output() dblclickObj: EventEmitter<ARTResource> = new EventEmitter<ARTResource>();

    private label = "Class axioms";
    private addBtnImgTitle = "Add a class axiom";
    private addBtnImgSrc = require("../../../assets/images/class_create.png");
    private removeBtnImgTitle = "Remove class axiom"; 
    
    private clsAxiomProperties = [
        RDFS.subClassOf, OWL.equivalentClass, OWL.disjointWith,
        OWL.complementOf, OWL.intersectionOf, OWL.unionOf, OWL.oneOf
    ];
    
    constructor(private propertyService:PropertyServices, private owlService:OwlServices, private manchService: ManchesterServices,
        private modalService: ModalServices, private browsingService: BrowsingServices, private resViewModalService: ResViewModalServices) {}
        
    /**
     * Based on the property opens the proper dialog to enrich it
     * oneOf opens a modal to create a list of instances
     * intersectionOf and unionOf opens a modal to create a list of classes (or expression)
     * subClassOf, equivalentClass, disjointWith, complementOf asks the user if choose an existing class
     * (then opens a class tree modal) or to create a manchester expression (then opens a prompt modal) 
     */
    private add(property: ARTURIResource) {
        //if the property is oneOf open a modal to create an instance list, otherwise ask the user to make a further decision
        if (property.getURI() == OWL.oneOf.getURI()) {
            this.createInstanceList(property);
        } else if (property.getURI() == OWL.intersectionOf.getURI() || property.getURI() == OWL.unionOf.getURI()) {
            this.createClassList(property);
        } else { //rdfs:subClassOf, owl:equivalentClass, owl:disjointWith, owl:complementOf
            //ask the user to choose to add an existing class or to add a class expression
            var existingClassOpt = "Add an existing class";
            var classExpressionOpt = "Create and add a class expression";
            this.modalService.select("Add " + property.getShow(), "Select an option", [existingClassOpt, classExpressionOpt]).then(
                (chosenOption: any) => {
                    if (chosenOption == existingClassOpt) {
                        this.addExistingClass(property);
                    } else if (chosenOption == classExpressionOpt) {
                        this.createClassExpression(property);
                    }
                },
                () => {}
            );
        }
    }
        
    /**
     * Opens a modal to browse the class tree and select a class, then executes the class axiom action.
     * Called if the user chooses to select an existing class to enrich 
     * subClassOf, equivalentClass, disjointWith, complementOf
     */
    private addExistingClass(property: ARTURIResource) {
        this.browsingService.browseClassTree("Select a class").then(
            (selectedClass: any) => {
                if (property.getURI() == RDFS.subClassOf.getURI()) {
                    this.owlService.addSuperCls(this.resource, selectedClass).subscribe(
                        stResp => this.update.emit(null)
                    );
                } else {
                    this.propertyService.addExistingPropValue(this.resource, property, selectedClass.getURI(), RDFTypesEnum.uri).subscribe(
                        stResp => this.update.emit(null)
                    );
                }
            },
            () => {}
        );
    }
    
    /**
     * Opens a prompt modal to write a class expression in manchester syntax
     * Called if the user chooses to create a manchester expression to enrich 
     * subClassOf, equivalentClass, disjointWith, complementOf
     */
    private createClassExpression(property: ARTURIResource) {
        this.modalService.prompt("Class Expression (Manchester Syntax)").then(
            (manchExpr: any) => {
                this.manchService.checkExpression(manchExpr).subscribe(
                    stResp => {
                        this.manchService.createRestriction(this.resource, property, manchExpr).subscribe(
                            stResp => this.update.emit(null)
                        );
                    }
                )
            },
            () => {}
        );
    }
    
    /**
     * Opens a modal to create a class list.
     * Called to enrich intersectionOf and unionOf
     */
    private createClassList(property: ARTURIResource) {
        this.resViewModalService.createClassList("Add " + property.getShow()).then(
            (classes: any) => {
                if (property.getURI() == OWL.intersectionOf.getURI()) {
                    this.owlService.addIntersectionOf(this.resource, classes).subscribe(
                        stResp => this.update.emit(null)
                    );    
                } else if (property.getURI() == OWL.unionOf.getURI()) {
                    this.owlService.addUnionOf(this.resource, classes).subscribe(
                        stResp => this.update.emit(null)
                    );
                }
            },
            () => {}
        );
    }
    
    /**
     * Opens a modal to create an instance list
     * Called to enrich oneOf
     */
    private createInstanceList(property: ARTURIResource) {
        this.resViewModalService.createInstanceList("Add " + property.getShow()).then(
            (instances: any) => {
                this.owlService.addOneOf(this.resource, instances).subscribe(
                    stResp => this.update.emit(null)
                );
            },
            () => {}
        );
    }
    
    /**
     * Removes a class axiom.
     * Depending on the property and the type of the object calls the proper service 
     */
    private removePredicateObject(predicate: ARTURIResource, object: ARTNode) {
        if (predicate.getURI() == RDFS.subClassOf.getURI()) {
            if (object.isBNode()) {
                this.manchService.removeExpression(this.resource, predicate, object).subscribe(
                    stResp => this.update.emit(null)
                )
            } else {
                this.owlService.removeSuperCls(this.resource, <ARTURIResource>object).subscribe(
                    stResp => this.update.emit(null)
                );
            }
        } else if (predicate.getURI() == OWL.equivalentClass.getURI() || predicate.getURI() == OWL.disjointWith.getURI() ||
                predicate.getURI() == OWL.complementOf.getURI()) {
            if (object.isBNode()) {
                this.manchService.removeExpression(this.resource, predicate, object).subscribe(
                    stResp => this.update.emit(null)
                )
            } else {
                this.propertyService.removePropValue(this.resource, predicate, object.getNominalValue(), null, RDFTypesEnum.uri).subscribe(
                    stResp => this.update.emit(null)
                );
            }
        } else if (predicate.getURI() == OWL.intersectionOf.getURI()) {
            this.owlService.removeIntersectionOf(this.resource, object).subscribe(
                stResp => this.update.emit(null)
            );
        } else if (predicate.getURI() == OWL.unionOf.getURI()) {
            this.owlService.removeUnionOf(this.resource, object).subscribe(
                stResp => this.update.emit(null)
            );
        } else if (predicate.getURI() == OWL.oneOf.getURI()) {
            this.owlService.removeOneOf(this.resource, object).subscribe(
                stResp => this.update.emit(null)
            );
        }
    }
    
    private objectDblClick(obj: ARTResource) {
        this.dblclickObj.emit(obj);//clicked object (class) can be a URIResource or BNode (collection of classes)
    }
    
    /**
     * Tells if the given object need to be rendered as reifiedResource or as simple rdfResource.
     * A resource should be rendered as reifiedResource if the predicate has custom range and the object
     * is an ARTBNode or an ARTURIResource (so a reifiable object). Otherwise, if the object is a literal
     * or the predicate has no custom range, the object should be rendered as simple rdfResource
     * @param object object of the predicate object list to render in view.
     */
    private renderAsReified(predicate: ARTURIResource, object: ARTNode) {
        return (predicate.getAdditionalProperty(ResAttribute.HAS_CUSTOM_RANGE) && object.isResource());
    }
    
    private getAddPropImgTitle(predicate: ARTURIResource) {
        return "Add a " + predicate.getShow();
    }
    
    private getRemovePropImgTitle(predicate: ARTURIResource) {
        return "Remove " + predicate.getShow();
    }
    
}