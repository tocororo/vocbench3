import { Component, Input, Output, EventEmitter } from "@angular/core";
import { Observable } from "rxjs/Observable";
import { PartitionRenderSingleRoot } from "../partitionRendererSingleRoot";
import { ManchesterServices } from "../../../services/manchesterServices";
import { ARTNode, ARTBNode, ARTResource, ARTURIResource, ResAttribute, RDFResourceRolesEnum, ARTLiteral } from "../../../models/ARTResources";
import { ResViewPartition } from "../../../models/ResourceView";
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
    templateUrl: "../partitionRenderer.html",
})
export class RangesPartitionRenderer extends PartitionRenderSingleRoot {

    //inherited from PartitionRenderSingleRoot
    // @Input('pred-obj-list') predicateObjectList: ARTPredicateObjects[];
    // @Input() resource:ARTURIResource;
    // @Output() update = new EventEmitter();//something changed in this partition. Tells to ResView to update
    // @Output() dblclickObj: EventEmitter<ARTResource> = new EventEmitter<ARTResource>();

    partition = ResViewPartition.ranges;
    rootProperty: ARTURIResource = RDFS.range;
    label = "Ranges";
    addBtnImgTitle = "Add a range";
    addBtnImgSrc = require("../../../../assets/images/icons/actions/class_create.png");
    removeBtnImgTitle = "Remove range";

    constructor(propService: PropertyServices, resourcesService: ResourcesServices, cfService: CustomFormsServices,
        basicModals: BasicModalServices, browsingModals: BrowsingModalServices, creationModal: CreationModalServices,
        resViewModals: ResViewModalServices, private manchService: ManchesterServices) {
        super(propService, resourcesService, cfService, basicModals, browsingModals, creationModal, resViewModals);
    }

    add(predicate?: ARTURIResource) {
        var propChangeable: boolean = predicate == null;
        this.resViewModals.addPropertyValue("Add a range", this.resource, this.rootProperty, propChangeable).then(
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

    checkTypeCompliantForManualAdd(predicate: ARTURIResource, value: ARTNode): Observable<boolean> {
        if (predicate.getRole() == RDFResourceRolesEnum.datatypeProperty) { //datatype property accepts literal as value
            return Observable.of(value instanceof ARTLiteral);
        } else {
            return Observable.of(value instanceof ARTURIResource);
        }
    }

    removePredicateObject(predicate: ARTURIResource, object: ARTNode) {
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
                            this.getRemoveFunction(predicate, object).subscribe(
                                stResp => this.update.emit()
                            )
                        }
                    }
                );
            }
        } else { //object instanceof ARTURIResource => object is class or datatype
            this.getRemoveFunction(predicate, object).subscribe(
                stResp => this.update.emit()
            )
        }
    }

    //@override
    removeAllValues(predicate: ARTURIResource) {
        for (var i = 0; i < this.predicateObjectList.length; i++) {
            let objList: ARTNode[] = this.predicateObjectList[i].getObjects();
            //collects all the suspicious class axioms, namely the range that are BNode
            let suspClassAxioms: ARTBNode[] = [];
            let notClassAxioms: ARTURIResource[] = [];
            for (var j = 0; j < objList.length; j++) {
                let object = objList[j];
                if (object instanceof ARTBNode) {
                    suspClassAxioms.push(object);
                } else {
                    notClassAxioms.push(<ARTURIResource>object);
                }
            }
            if (suspClassAxioms.length > 0) { //there is at least a bnode, check if it is a class axiom
                //collects the functions to do the checks
                let isClassAxiomFnArray: any[] = [];
                for (var j = 0; j < suspClassAxioms.length; j++) {
                    isClassAxiomFnArray.push(this.manchService.isClassAxiom(suspClassAxioms[j]));
                }
                let removeFnArray: any[] = [];
                //collects the remove function for all the not class axioms ranges
                for (var j = 0; j < notClassAxioms.length; j++) {
                    removeFnArray.push(this.getRemoveFunction(predicate, notClassAxioms[j]));
                }
                //collects remove function for all the suspicious class axioms ranges
                Observable.forkJoin(isClassAxiomFnArray).subscribe(
                    results => {
                        for (var j = 0; j < results.length; j++) {
                            if (results[j]) { //is class axiom
                                removeFnArray.push(this.manchService.removeExpression(<ARTURIResource>this.resource, predicate, suspClassAxioms[j]));
                            } else { //not a class axiom
                                removeFnArray.push(this.getRemoveFunction(predicate, suspClassAxioms[j]));
                            }
                        }
                        this.removeAllRicursively(removeFnArray);
                    }
                )
            } else { //all range are IRI, there's no need to check for class axioms
                let removeFnArray: any[] = [];
                for (var j = 0; j < objList.length; j++) {
                    removeFnArray.push(this.getRemoveFunction(predicate, objList[j]));
                }
                this.removeAllRicursively(removeFnArray);
            }
        }
    }

    getRemoveFunction(predicate: ARTURIResource, object: ARTNode): Observable<any> {
        if (predicate.getAdditionalProperty(ResAttribute.HAS_CUSTOM_RANGE) && object.isResource()) {
            return this.cfService.removeReifiedResource(this.resource, predicate, object);
        } else {
            if (this.rootProperty.getURI() == predicate.getURI()) { //removing rdfs:range relation
                return this.propService.removePropertyRange(<ARTURIResource>this.resource, <ARTURIResource>object);
            } else { //removing subProperty of rdfs:range
                return this.resourcesService.removeValue(this.resource, predicate, object);
            }
        }
    }

}