import { Component, Input, Output, EventEmitter } from "@angular/core";
import { Observable } from "rxjs/Observable";
import { PartitionRendererMultiRoot } from "../partitionRendererMultiRoot";
import { CustomFormsServices } from "../../../services/customFormsServices";
import { ResourcesServices } from "../../../services/resourcesServices";
import { ClassesServices } from "../../../services/classesServices";
import { PropertyServices, RangeType, RangeResponse } from "../../../services/propertyServices";
import { ManchesterServices } from "../../../services/manchesterServices";
import { ARTURIResource, ARTNode, ARTBNode, RDFTypesEnum, ResAttribute, ResourceUtils } from "../../../models/ARTResources";
import { RDFS, OWL } from "../../../models/Vocabulary";
import { ResViewPartition } from "../../../models/ResourceView";
import { BrowsingModalServices } from '../../../widget/modal/browsingModal/browsingModalServices';
import { BasicModalServices } from "../../../widget/modal/basicModal/basicModalServices";
import { ResViewModalServices } from "../../resViewModals/resViewModalServices";

@Component({
    selector: "class-axiom-renderer",
    templateUrl: "../partitionRenderer.html",
})
export class ClassAxiomPartitionPartitionRenderer extends PartitionRendererMultiRoot {

    //inherited from PredObjListMultirootRenderer
    // @Input('pred-obj-list') predicateObjectList: ARTPredicateObjects[];
    // @Input() resource:ARTURIResource;
    // @Output() update = new EventEmitter();//something changed in this partition. Tells to ResView to update
    // @Output() dblclickObj: EventEmitter<ARTResource> = new EventEmitter<ARTResource>();

    partition = ResViewPartition.classaxioms;
    rootProperties: ARTURIResource[] = [
        RDFS.subClassOf, OWL.equivalentClass, OWL.disjointWith,
        OWL.complementOf, OWL.intersectionOf, OWL.unionOf, OWL.oneOf];
    knownProperties: ARTURIResource[] = [
        RDFS.subClassOf, OWL.equivalentClass, OWL.disjointWith,
        OWL.complementOf, OWL.intersectionOf, OWL.unionOf, OWL.oneOf];
    label = "Class axioms";
    addBtnImgTitle = "Add a class axiom";
    addBtnImgSrc = require("../../../../assets/images/icons/actions/class_create.png");

    constructor(resourcesService: ResourcesServices, cfService: CustomFormsServices, 
        basicModals: BasicModalServices, resViewModals: ResViewModalServices,
        private clsService: ClassesServices, private manchService: ManchesterServices,  
        private propService: PropertyServices, private browsingModals: BrowsingModalServices) {
        super(resourcesService, cfService, basicModals, resViewModals);
    }

    /**
     * Based on the property opens the proper dialog to enrich it
     * oneOf opens a modal to create a list of instances
     * intersectionOf and unionOf opens a modal to create a list of classes (or expression)
     * subClassOf, equivalentClass, disjointWith, complementOf asks the user if choose an existing class
     * (then opens a class tree modal) or to create a manchester expression (then opens a prompt modal) 
     */
    add(predicate: ARTURIResource) {
        if (!this.isKnownProperty(predicate)) {
            this.basicModals.alert("Unknown property", predicate.getShow() + " is not a class axiom known property, it cannot be handled.", "error");
            return;
        }

        //if the predicate is oneOf open a modal to create an instance list, otherwise ask the user to make a further decision
        if (predicate.getURI() == OWL.oneOf.getURI()) {
            this.createInstanceList(predicate);
        } else if (predicate.getURI() == OWL.intersectionOf.getURI() || predicate.getURI() == OWL.unionOf.getURI()) {
            this.createClassList(predicate);
        } else { //rdfs:subClassOf, owl:equivalentClass, owl:disjointWith, owl:complementOf
            //ask the user to choose to add an existing class or to add a class expression
            this.resViewModals.addPropertyValue("Add " + predicate.getShow(), this.resource, predicate, false).then(
                (data: any) => {
                    var value: any = data.value; //value can be a class or a manchester Expression
                    if (typeof value == "string") {
                        this.manchService.createRestriction(<ARTURIResource>this.resource, predicate, value).subscribe(
                            stResp => this.update.emit(null)
                        );
                    } else { //value is an ARTURIResource (a class selected from the tree)
                        if (predicate.getURI() == RDFS.subClassOf.getURI()) {
                            this.clsService.addSuperCls(<ARTURIResource>this.resource, value).subscribe(
                                stResp => this.update.emit(null)
                            );
                        } else {
                            this.resourcesService.addValue(this.resource, predicate, value).subscribe(
                                stResp => this.update.emit(null)
                            );
                        }
                    }
                },
                () => { }
            );
        }
    }

    getPredicateToEnrich(): Observable<ARTURIResource> {
        return Observable.fromPromise(
            this.browsingModals.browsePropertyTree("Select a property", this.rootProperties).then(
                (selectedProp: any) => {
                    return selectedProp;
                },
                () => {}
            )
        );
    }

    checkTypeCompliantForManualAdd(predicate: ARTURIResource, value: ARTNode): Observable<boolean> {
        return this.propService.getRange(predicate).flatMap(
            range => {
                return Observable.of(RangeResponse.isRangeCompliant(range, value));
            }
        )
    }

    /**
     * Opens a modal to create a class list.
     * Called to enrich intersectionOf and unionOf
     */
    private createClassList(property: ARTURIResource) {
        this.resViewModals.createClassList("Add " + property.getShow()).then(
            (classes: any) => {
                if (property.getURI() == OWL.intersectionOf.getURI()) {
                    this.clsService.addIntersectionOf(<ARTURIResource>this.resource, classes).subscribe(
                        stResp => this.update.emit(null)
                    );
                } else if (property.getURI() == OWL.unionOf.getURI()) {
                    this.clsService.addUnionOf(<ARTURIResource>this.resource, classes).subscribe(
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
        this.resViewModals.createInstanceList("Add " + property.getShow()).then(
            (instances: any) => {
                this.clsService.addOneOf(<ARTURIResource>this.resource, instances).subscribe(
                    stResp => this.update.emit(null)
                );
            },
            () => { }
        );
    }

    removePredicateObject(predicate: ARTURIResource, object: ARTNode) {
        this.getRemoveFunction(predicate, object).subscribe(
            stResp => this.update.emit(null)
        );
    }

    getRemoveFunctionImpl(predicate: ARTURIResource, object: ARTNode): Observable<any> {
        if (this.isKnownProperty(predicate)) { //if it is removing a value about a root property, call the specific method
            if (predicate.getURI() == RDFS.subClassOf.getURI()) {
                if (object.isBNode()) {
                    return this.manchService.removeExpression(<ARTURIResource>this.resource, predicate, object);
                } else {
                    return this.clsService.removeSuperCls(<ARTURIResource>this.resource, <ARTURIResource>object);
                }
            } else if (predicate.getURI() == OWL.equivalentClass.getURI() || predicate.getURI() == OWL.disjointWith.getURI() ||
                predicate.getURI() == OWL.complementOf.getURI()) {
                if (object.isBNode()) {
                    return this.manchService.removeExpression(<ARTURIResource>this.resource, predicate, object);
                } else {
                    return this.resourcesService.removeValue(<ARTURIResource>this.resource, predicate, object);
                }
            } else if (predicate.getURI() == OWL.intersectionOf.getURI()) {
                return this.clsService.removeIntersectionOf(<ARTURIResource>this.resource, object);
            } else if (predicate.getURI() == OWL.unionOf.getURI()) {
                return this.clsService.removeUnionOf(<ARTURIResource>this.resource, <ARTBNode>object);
            } else if (predicate.getURI() == OWL.oneOf.getURI()) {
                return this.clsService.removeOneOf(<ARTURIResource>this.resource, <ARTBNode>object);
            }
        } else {//predicate is some subProperty of a root property
            return this.resourcesService.removeValue(this.resource, predicate, object);
        }
    }

}