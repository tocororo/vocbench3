import {Component, Input, Output, EventEmitter} from "angular2/core";
import {ARTResource, ARTURIResource, ARTBNode, ARTNode, ARTPredicateObjects} from "../../utils/ARTResources";
import {RDFS, OWL} from "../../utils/Vocabulary";
import {RdfResourceComponent} from "../../widget/rdfResource/rdfResourceComponent";
import {ModalServices} from "../../widget/modal/modalServices";
import {BrowsingServices} from "../../widget/modal/browsingModal/browsingServices";
import {ResourceUtils} from "../../utils/ResourceUtils";
import {RDFTypesEnum} from "../../utils/Enums";
import {PropertyServices} from "../../services/propertyServices";
import {OwlServices} from "../../services/owlServices";
import {ManchesterServices} from "../../services/manchesterServices";

@Component({
	selector: "class-axiom-renderer",
	templateUrl: "app/src/resourceView/renderer/classAxiomPartitionRenderer.html",
	directives: [RdfResourceComponent],
    providers: [OwlServices, PropertyServices, ManchesterServices],
})
export class ClassAxiomPartitionPartitionRenderer {
    
    @Input('pred-obj-list') predicateObjectList: ARTPredicateObjects[];
    @Input() resource:ARTURIResource;
    @Output() update = new EventEmitter();//something changed in this partition. Tells to ResView to update
    
    private clsAxiomProperties = [
        RDFS.subClassOf, OWL.equivalentClass, OWL.disjointWith,
        OWL.complementOf, OWL.intersectionOf, OWL.unionOf, OWL.oneOf
    ];
    
    constructor(private propertyService:PropertyServices, private owlService:OwlServices, private manchService: ManchesterServices,
        private modalService: ModalServices, private browsingService: BrowsingServices) {}
        
    private add(property: ARTURIResource) {
        //if the property is oneOf open a modal to create an instance list, otherwise ask the user to make a further decision
        if (property.getURI() == OWL.oneOf.getURI()) {
            this.createInstanceList(property);
        } else { 
            this.chooseAction(property);
        }
    }
        
    /**
     * Based on the property open a dialog to choose action to do between
     * add existing class
     * create and add class expression
     * create and add class list
     */
    private chooseAction(property: ARTURIResource) {
        var existingClassOpt = "Add an existing class";
        var classListOpt = "Create and add a class list";
        var classExpressionOpt = "Create and add a class expression";
        
        var propUri = property.getURI();
        if (propUri == RDFS.subClassOf.getURI() || propUri == OWL.equivalentClass.getURI() || 
                propUri == OWL.disjointWith.getURI() || propUri == OWL.complementOf.getURI()) {
            this.modalService.select("Add " + property.getShow(), "Select an option", [existingClassOpt, classExpressionOpt]).then(
                chosenOption => {
                    if (chosenOption == existingClassOpt) {
                        this.addExistingClass(property);
                    } else if (chosenOption == classExpressionOpt) {
                        this.createClassExpression(property);
                    }
                }
            );
        } else if (propUri == OWL.intersectionOf.getURI() || propUri == OWL.unionOf.getURI()) {
            this.modalService.select("Add " + property.getShow(), "Select an option", [classListOpt, classExpressionOpt]).then(
                chosenOption => {
                    if (chosenOption == classListOpt) {
                        this.createClassList(property);
                    } else if (chosenOption == classExpressionOpt) {
                        this.createClassExpression(property);
                    }
                }
            );
        }
    }
    
    /**
     * Opens a modal to browse the class tree and select a class, then executes the class axiom action
     */
    private addExistingClass(property: ARTURIResource) {
        this.browsingService.browseClassTree("Select a class").then(
            selectedClass => {
                if (property.getURI() == RDFS.subClassOf.getURI()) {
                    this.owlService.addSuperCls(this.resource, selectedClass).subscribe(
                        stResp => this.update.emit(null),
                        err => {}
                    );
                } else {
                    this.propertyService.addExistingPropValue(this.resource, property, selectedClass.getURI(), RDFTypesEnum.uri).subscribe(
                        stResp => this.update.emit(null),
                        err => {}
                    );
                }
            }
        );
    }
    
    /**
     * Opens a prompt modal to write a class expression in manchester syntax
     */
    private createClassExpression(property: ARTURIResource) {
        this.modalService.prompt("Class Expression (Manchester Syntax)").then(
            manchExpr => {
                this.manchService.checkExpression(manchExpr).subscribe(
                    stResp => {
                        this.manchService.createRestriction(this.resource, property, manchExpr).subscribe(
                            stResp => this.update.emit(null),
                            err => {}    
                        );
                    },
                    err => {}
                )
            }
        );
    }
    
    /**
     * Opens a modal to create a class list
     */
    private createClassList(property: ARTURIResource) {
        alert("Opening modal to create list of classes for property " + 
            property.getShow() + " and resource " + this.resource.getShow());
    }
    
    /**
     * Opens a modal to create an instance list
     */
    private createInstanceList(property: ARTURIResource) {
        alert("Opening modal to create list of instances for property " + 
            property.getShow() + " and resource " + this.resource.getShow());
    }
    
    private removePredicateObject(predicate: ARTURIResource, object: ARTNode) {
        if (object.isBNode()) {
            this.manchService.removeExpression(this.resource, predicate, object).subscribe(
                stResp => this.update.emit(null),
                err => {}
            )
        } else {
            switch (predicate.getURI()) {
                case RDFS.subClassOf.getURI():
                    this.owlService.removeSuperCls(this.resource, <ARTURIResource>object).subscribe(
                        stResp => this.update.emit(null),
                        err => {}
                    );
                    break;
                case OWL.equivalentClass.getURI():
                    this.propertyService.removePropValue(this.resource, predicate, object.getNominalValue(), null, RDFTypesEnum.uri).subscribe(
                        stResp => this.update.emit(null),
                        err => {}
                    );
                    break;
                case OWL.disjointWith.getURI():
                    this.propertyService.removePropValue(this.resource, predicate, object.getNominalValue(), null, RDFTypesEnum.uri).subscribe(
                        stResp => this.update.emit(null),
                        err => {}
                    );
                    break;
                case OWL.complementOf.getURI():
                    this.propertyService.removePropValue(this.resource, predicate, object.getNominalValue(), null, RDFTypesEnum.uri).subscribe(
                        stResp => this.update.emit(null),
                        err => {}
                    );
                    break;
                //intersectionOf and unionOf cannot have object as ARTURIResource,
                //they can have only list of ARTURIResource or manchester expression as object,
                //so this cases are reachable? 
                case OWL.intersectionOf.getURI():
                    this.owlService.removeIntersectionOf(this.resource, object).subscribe(
                        stResp => this.update.emit(null),
                        err => {}
                    );
                    break;
                case OWL.unionOf.getURI():
                    this.owlService.removeUnionOf(this.resource, object).subscribe(
                        stResp => this.update.emit(null),
                        err => {}
                    );
                    break;
                //oneOf cannot have object as ARTURIResource,
                //it can have only list of ARTURIResource, so this case is reachable? 
                case OWL.oneOf.getURI():
                    this.owlService.removeOneOf(this.resource, object).subscribe(
                        stResp => this.update.emit(null),
                        err => {}
                    );
                    break;
            }
        }
    }
    
    
    private getAddPropImgTitle(predicate: ARTURIResource) {
        return "Add a " + predicate.getShow();
    }
    
    private getRemovePropImgTitle(predicate: ARTURIResource) {
        return "Remove " + predicate.getShow();
    }
    
    private getAddPropImgSrc(predicate: ARTURIResource) {
        return ResourceUtils.getActionPropImageSrc(predicate, "create");
    }
    
    private getRemovePropImgSrc(predicate: ARTURIResource) {
        return ResourceUtils.getActionPropImageSrc(predicate, "delete");
    }
    
}