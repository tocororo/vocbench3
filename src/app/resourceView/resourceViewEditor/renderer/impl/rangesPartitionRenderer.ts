import { Component } from "@angular/core";
import { forkJoin, Observable, of } from "rxjs";
import { ARTBNode, ARTLiteral, ARTNode, ARTURIResource, RDFResourceRolesEnum } from "../../../../models/ARTResources";
import { ResViewPartition } from "../../../../models/ResourceView";
import { CustomFormsServices } from "../../../../services/customFormsServices";
import { ManchesterServices } from "../../../../services/manchesterServices";
import { PropertyServices } from "../../../../services/propertyServices";
import { ResourcesServices } from "../../../../services/resourcesServices";
import { BasicModalServices } from "../../../../widget/modal/basicModal/basicModalServices";
import { BrowsingModalServices } from "../../../../widget/modal/browsingModal/browsingModalServices";
import { CreationModalServices } from "../../../../widget/modal/creationModal/creationModalServices";
import { ResViewModalServices } from "../../resViewModals/resViewModalServices";
import { MultiActionFunction } from "../multipleActionHelper";
import { PartitionRenderSingleRoot } from "../partitionRendererSingleRoot";

@Component({
    selector: "ranges-renderer",
    templateUrl: "../partitionRenderer.html",
})
export class RangesPartitionRenderer extends PartitionRenderSingleRoot {

    partition = ResViewPartition.ranges;
    addBtnImgTitle = "Add a range";
    addBtnImgSrc = "./assets/images/icons/actions/cls_create.png";

    constructor(propService: PropertyServices, resourcesService: ResourcesServices, cfService: CustomFormsServices,
        basicModals: BasicModalServices, browsingModals: BrowsingModalServices, creationModal: CreationModalServices,
        resViewModals: ResViewModalServices, private manchService: ManchesterServices) {
        super(propService, resourcesService, cfService, basicModals, browsingModals, creationModal, resViewModals);
    }

    ngOnInit() {
        super.ngOnInit();
    }

    add(predicate: ARTURIResource, propChangeable: boolean) {
        this.resViewModals.addPropertyValue({key:"ACTIONS.ADD_RANGE"}, this.resource, predicate, propChangeable).then(
            (data: any) => {
                let prop: ARTURIResource = data.property;
                let value: any = data.value; //value can be a class, manchester Expression, or a datatype (if resource is a datatype prop)
                /** If the rerource is a datatype property, value could be a:
                 * - datatype (ARTURIResource[])
                 * - datarange (ARTLiteral[])
                 */
                if (this.resource.getRole() == RDFResourceRolesEnum.datatypeProperty) {
                    if (value instanceof Array) {
                        let addFunctions: MultiActionFunction[] = [];

                        if (value[0] instanceof ARTLiteral) { //datarange
                            this.propService.setDataRange(<ARTURIResource>this.resource, value).subscribe(
                                stResp => this.update.emit(null)
                            );
                        } else { //instance of ARTURIResource => datatype
                            if (prop.getURI() == this.rootProperty.getURI()) { //it's using rdfs:range
                                value.forEach((v: ARTURIResource) => {
                                    addFunctions.push({
                                        function: this.propService.addPropertyRange(<ARTURIResource>this.resource, v),
                                        value: v
                                    });
                                });
                            } else { //it's using a subProperty of rdfs:range
                                value.forEach((v: ARTURIResource) => {
                                    addFunctions.push({
                                        function: this.resourcesService.addValue(this.resource, prop, v),
                                        value: v
                                    });
                                });
                            }
                            this.addMultiple(addFunctions);
                        }
                    }
                }
                /** Otherwise, if the resource is a object/annotation/ontologyProperty, value could be a:
                 * - resource
                 * - manchester expression
                 */
                else {
                    if (typeof value == "string") {
                        this.manchService.createRestriction(<ARTURIResource>this.resource, prop, value).subscribe(
                            stResp => this.update.emit(null)
                        );
                    } else { //value is ARTURIResource[] (class(es) selected from the tree)
                        let addFunctions: MultiActionFunction[] = [];
                        if (prop.getURI() == this.rootProperty.getURI()) { //it's using rdfs:range
                            value.forEach((v: ARTURIResource) => {
                                addFunctions.push({
                                    function: this.propService.addPropertyRange(<ARTURIResource>this.resource, v),
                                    value: v
                                });
                            });
                        } else { //it's using a subProperty of rdfs:range
                            value.forEach((v: ARTURIResource) => {
                                addFunctions.push({
                                    function: this.resourcesService.addValue(this.resource, prop, v),
                                    value: v
                                });
                            });
                        }
                        this.addMultiple(addFunctions);
                    }
                }
            },
            () => { }
        )
    }

    checkTypeCompliantForManualAdd(predicate: ARTURIResource, value: ARTNode): Observable<boolean> {
        if (predicate.getRole() == RDFResourceRolesEnum.datatypeProperty) { //datatype property accepts literal as value
            return of(value instanceof ARTLiteral);
        } else {
            return of(value instanceof ARTURIResource);
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
                forkJoin(isClassAxiomFnArray).subscribe(
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

    getRemoveFunctionImpl(predicate: ARTURIResource, object: ARTNode): Observable<any> {
        if (this.rootProperty.getURI() == predicate.getURI()) { //removing rdfs:range relation
            return this.propService.removePropertyRange(<ARTURIResource>this.resource, <ARTURIResource>object);
        } else { //removing subProperty of rdfs:range
            return this.resourcesService.removeValue(this.resource, predicate, object);
        }
    }

}