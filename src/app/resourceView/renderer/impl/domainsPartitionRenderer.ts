import { Component, Input, Output, EventEmitter } from "@angular/core";
import { Observable } from "rxjs/Observable";
import { PartitionRenderSingleRoot } from "../partitionRendererSingleRoot";
import { ManchesterServices } from "../../../services/manchesterServices";
import { ARTNode, ARTBNode, ARTResource, ARTURIResource, ResAttribute } from "../../../models/ARTResources";
import { RDFS } from "../../../models/Vocabulary";
import { ResViewPartition } from "../../../models/ResourceView";
import { PropertyServices } from "../../../services/propertyServices";
import { CustomFormsServices } from "../../../services/customFormsServices";
import { ResourcesServices } from "../../../services/resourcesServices";
import { ResViewModalServices } from "../../resViewModals/resViewModalServices";
import { BasicModalServices } from "../../../widget/modal/basicModal/basicModalServices";
import { BrowsingModalServices } from "../../../widget/modal/browsingModal/browsingModalServices";
import { CreationModalServices } from "../../../widget/modal/creationModal/creationModalServices";

@Component({
    selector: "domains-renderer",
    templateUrl: "../partitionRenderer.html",
})
export class DomainsPartitionRenderer extends PartitionRenderSingleRoot {

    partition = ResViewPartition.domains;
    rootProperty: ARTURIResource = RDFS.domain;
    label = "Domains";
    addBtnImgTitle = "Add a domain";
    addBtnImgSrc = require("../../../../assets/images/icons/actions/class_create.png");

    constructor(propService: PropertyServices, resourcesService: ResourcesServices, cfService: CustomFormsServices,
        basicModals: BasicModalServices, browsingModals: BrowsingModalServices, creationModal: CreationModalServices,
        resViewModals: ResViewModalServices, private manchService: ManchesterServices) {
        super(propService, resourcesService, cfService, basicModals, browsingModals, creationModal, resViewModals);
    }

    add(predicate: ARTURIResource, propChangeable: boolean) {
        this.resViewModals.addPropertyValue("Add a domain", this.resource, predicate, propChangeable).then(
            (data: any) => {
                let prop: ARTURIResource = data.property;
                let value: any = data.value; //value can be class(es) or a manchester Expression
                
                if (typeof value == "string") {
                    this.manchService.createRestriction(<ARTURIResource>this.resource, prop, value).subscribe(
                        stResp => this.update.emit(null)
                    );
                } else { //value is ARTURIResource[] (class(es) selected from the tree)
                    let addFunctions: Observable<any>[] = [];
                    if (prop.getURI() == this.rootProperty.getURI()) { //it's using an rdfs:domain
                        value.forEach((v: ARTURIResource) => {
                            addFunctions.push(this.propService.addPropertyDomain(<ARTURIResource>this.resource, v));
                        });
                    } else { //it's using a subProperty of rdfs:domain
                        value.forEach((v: ARTURIResource) => {
                            addFunctions.push(this.resourcesService.addValue(this.resource, prop, v));
                        });
                    }
                    this.addMultiple(addFunctions);
                }
            },
            () => {}
        )
    }

    checkTypeCompliantForManualAdd(predicate: ARTURIResource, value: ARTNode): Observable<boolean> {
        return Observable.of(value instanceof ARTURIResource);
    }

    removePredicateObject(predicate: ARTURIResource, object: ARTNode) {
        /**
         * An object in this partition could be:
         * - Class (type: URI or BNode, isClassAxiom: false)
         * - Manchester expression (type: BNode, isClassAxiom: true)
         */
        if (object instanceof ARTBNode) { //maybe a class axiom
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
            )
        } else { //removing a domain class
            this.getRemoveFunction(predicate, object).subscribe(
                stResp => this.update.emit()
            )
        }
    }

    //@override
    removeAllValues(predicate: ARTURIResource) {
        for (var i = 0; i < this.predicateObjectList.length; i++) {
            let objList: ARTNode[] = this.predicateObjectList[i].getObjects();
            //collects all the suspicious class axioms, namely the domains that are BNode
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
                //collects the remove function for all the not class axioms domains
                for (var j = 0; j < notClassAxioms.length; j++) {
                    removeFnArray.push(this.getRemoveFunction(predicate, notClassAxioms[j]));
                }
                //collects remove function for all the suspicious class axioms domains
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

    getRemoveFunctionImpl(predicate: ARTURIResource, object: ARTNode): Observable<any> {
        if (this.rootProperty.getURI() == predicate.getURI()) { //removing rdfs:domain relation
            return this.propService.removePropertyDomain(<ARTURIResource>this.resource, <ARTURIResource>object);
        } else { //removing subProperty of rdfs:domain
            return this.resourcesService.removeValue(this.resource, predicate, object);
        }
    }

}