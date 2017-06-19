import { Component, Input, Output, EventEmitter } from "@angular/core";
import { PredObjListRenderer } from "../predicateObjectsListRenderer";
import { SkosServices } from "../../../services/skosServices";
import { ARTResource, ARTURIResource, ARTNode, ARTPredicateObjects, ResAttribute, RDFTypesEnum } from "../../../models/ARTResources";
import { SKOS } from "../../../models/Vocabulary";
import { VBEventHandler } from "../../../utils/VBEventHandler";
import { AuthorizationEvaluator } from "../../../utils/AuthorizationEvaluator";
import { PropertyServices } from "../../../services/propertyServices";
import { CustomFormsServices } from "../../../services/customFormsServices";
import { ResourcesServices } from "../../../services/resourcesServices";
import { ResViewModalServices } from "../../resViewModals/resViewModalServices";
import { BasicModalServices } from "../../../widget/modal/basicModal/basicModalServices";
import { BrowsingModalServices } from "../../../widget/modal/browsingModal/browsingModalServices";
import { CreationModalServices } from "../../../widget/modal/creationModal/creationModalServices";

@Component({
    selector: "schemes-renderer",
    templateUrl: "../predicateObjectsListRenderer.html",
})
export class SchemesPartitionRenderer extends PredObjListRenderer {

    //inherited from PredObjListRenderer
    // @Input('pred-obj-list') predicateObjectList: ARTPredicateObjects[];
    // @Input() resource:ARTURIResource;
    // @Output() update = new EventEmitter();//something changed in this partition. Tells to ResView to update
    // @Output() dblclickObj: EventEmitter<ARTResource> = new EventEmitter<ARTResource>();

    rootProperty: ARTURIResource = SKOS.inScheme;
    label = "Schemes";
    addBtnImgTitle = "Add to a ConceptScheme";
    addBtnImgSrc = require("../../../../assets/images/icons/actions/conceptScheme_create.png");
    removeBtnImgTitle = "Remove from ConceptScheme";

    constructor(propService: PropertyServices, resourcesService: ResourcesServices, cfService: CustomFormsServices,
        basicModals: BasicModalServices, browsingModals: BrowsingModalServices, creationModal: CreationModalServices,
        rvModalService: ResViewModalServices, private skosService: SkosServices, private eventHandler: VBEventHandler) {
        super(propService, resourcesService, cfService, basicModals, browsingModals, creationModal, rvModalService);
    }

    //add as top concept
    add(predicate?: ARTURIResource) {
        var propChangeable: boolean = predicate == null;
        this.rvModalService.addPropertyValue("Add Concept to a Scheme", this.resource, this.rootProperty, propChangeable).then(
            (data: any) => {
                var prop: ARTURIResource = data.property;
                var scheme: ARTURIResource = data.value;
                if (prop.getURI() == this.rootProperty.getURI()) { //it's adding a concept to a scheme with skos:inScheme
                    this.skosService.addConceptToScheme(<ARTURIResource>this.resource, scheme).subscribe(
                        stResp => this.update.emit(null)
                    );
                } else { //it's enriching a subProperty of skos:inScheme
                    this.resourcesService.addValue(this.resource, prop, scheme).subscribe(
                        stResp => {
                            //Here I should emit conceptAddedToSchemEvent but I can't since I don't know if this.resource has broader and child
                            //(to show in tree when attached). In this rare case I suppose that the user should refresh the tree
                            this.update.emit(null);
                            //emit conceptAddedToSchemEvent when supported
                        }
                    );
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
            if (this.rootProperty.getURI() == predicate.getURI()) {// removing a skos:inScheme relation
                this.skosService.removeConceptFromScheme(<ARTURIResource>this.resource, <ARTURIResource>object).subscribe(
                    data => this.update.emit(null)
                );
            } else {//predicate is some subProperty of skos:inScheme
                this.resourcesService.removeValue(this.resource, predicate, object).subscribe(
                    stResp => {
                        this.eventHandler.conceptRemovedFromSchemeEvent.emit({ concept: <ARTURIResource>this.resource, scheme: <ARTURIResource>object });
                        this.update.emit(null);
                    }
                );
            }
        }
    }

    initAddAuthorization() {
        this.addAuthorized = AuthorizationEvaluator.isAuthorized(AuthorizationEvaluator.Actions.SKOS_ADD_CONCEPT_TO_SCHEME);
    }

}