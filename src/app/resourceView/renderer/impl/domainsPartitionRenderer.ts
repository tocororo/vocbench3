import { Component, Input, Output, EventEmitter } from "@angular/core";
import { PredObjListRenderer } from "../predicateObjectsListRenderer";
import { ManchesterServices } from "../../../services/manchesterServices";
import { ARTNode, ARTBNode, ARTResource, ARTURIResource, ResAttribute } from "../../../models/ARTResources";
import { RDFS } from "../../../models/Vocabulary";

import { PropertyServices } from "../../../services/propertyServices";
import { CustomFormsServices } from "../../../services/customFormsServices";
import { ResourcesServices } from "../../../services/resourcesServices";
import { ResViewModalServices } from "../../resViewModals/resViewModalServices";
import { BasicModalServices } from "../../../widget/modal/basicModal/basicModalServices";
import { BrowsingModalServices } from "../../../widget/modal/browsingModal/browsingModalServices";
import { CreationModalServices } from "../../../widget/modal/creationModal/creationModalServices";

@Component({
    selector: "domains-renderer",
    templateUrl: "../predicateObjectsListRenderer.html",
})
export class DomainsPartitionRenderer extends PredObjListRenderer {

    //inherited from PredObjListRenderer
    // @Input('pred-obj-list') predicateObjectList: ARTPredicateObjects[];
    // @Input() resource:ARTURIResource;
    // @Output() update = new EventEmitter();//something changed in this partition. Tells to ResView to update
    // @Output() dblclickObj: EventEmitter<ARTResource> = new EventEmitter<ARTResource>();

    rootProperty: ARTURIResource = RDFS.domain;
    label = "Domains";
    addBtnImgTitle = "Add a domain";
    addBtnImgSrc = require("../../../../assets/images/icons/actions/class_create.png");
    removeBtnImgTitle = "Remove domain";

    constructor(propService: PropertyServices, resourcesService: ResourcesServices, cfService: CustomFormsServices,
        basicModals: BasicModalServices, browsingModals: BrowsingModalServices, creationModal: CreationModalServices,
        rvModalService: ResViewModalServices, private manchService: ManchesterServices) {
        super(propService, resourcesService, cfService, basicModals, browsingModals, creationModal, rvModalService);
    }

    add(predicate?: ARTURIResource) {
        var propChangeable: boolean = predicate == null;
        this.rvModalService.addPropertyValue("Add a domain", this.resource, this.rootProperty, propChangeable).then(
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
                        this.resourcesService.addValue(this.resource, prop, value).subscribe(
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

    removePredicateObject(predicate: ARTURIResource, object: ARTNode) {
        if (predicate.getAdditionalProperty(ResAttribute.HAS_CUSTOM_RANGE) && object.isResource()) {
            this.cfService.removeReifiedResource(this.resource, predicate, object).subscribe(
                stResp => this.update.emit(null)
            );
        } else {
            /**
             * An object in this partition could be:
             * - Class (type: URI or BNode, isClassAxiom: false)
             * - Manchester expression (type: BNode, isClassAxiom: true)
             */
            if (object instanceof ARTBNode) { //class axiom
                this.manchService.isClassAxiom(object).subscribe(
                    isClassAxiom => {
                        if (isClassAxiom) {
                            this.manchService.removeExpression(<ARTURIResource>this.resource, predicate, object).subscribe(
                                stResp => this.update.emit(null)
                            );
                        } else {
                            this.removeDomainClass(predicate, object);
                        }
                    }
                )
            } else { //removing a domain class
                this.removeDomainClass(predicate, <ARTResource>object);   
            }
        }
    }

    private removeDomainClass(predicate: ARTURIResource, object: ARTResource) {
        if (this.rootProperty.getURI() == predicate.getURI()) { //removing rdfs:domain relation
            this.propService.removePropertyDomain(<ARTURIResource>this.resource, <ARTURIResource>object).subscribe(
                stResp => this.update.emit(null)
            );
        } else { //removing subProperty of rdfs:domain
            this.resourcesService.removeValue(this.resource, predicate, object).subscribe(
                stResp => this.update.emit(null)
            );
        }
    }

}