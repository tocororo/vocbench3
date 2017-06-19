import { Component, Input, Output, EventEmitter } from "@angular/core";
import { PredObjListRenderer } from "../predicateObjectsListRenderer";
import { SkosServices } from "../../../services/skosServices";
import { ARTURIResource, ARTNode, ARTPredicateObjects, ResAttribute, RDFTypesEnum } from "../../../models/ARTResources";
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
    selector: "top-concepts-renderer",
    templateUrl: "../predicateObjectsListRenderer.html",
})
export class TopConceptsPartitionRenderer extends PredObjListRenderer {

    //inherited from PredObjListRenderer
    // @Input('pred-obj-list') predicateObjectList: ARTPredicateObjects[];
    // @Input() resource: ARTURIResource;
    // @Output() update = new EventEmitter();//something changed in this partition. Tells to ResView to update
    // @Output() dblclickObj: EventEmitter<ARTURIResource> = new EventEmitter<ARTURIResource>();

    rootProperty: ARTURIResource = SKOS.topConceptOf;
    label = "Top Concept of";
    addBtnImgTitle = "Add to a skos:ConceptScheme as topConcept";
    addBtnImgSrc = require("../../../../assets/images/icons/actions/conceptScheme_create.png");
    removeBtnImgTitle = "Remove as topConcept";

    constructor(propService: PropertyServices, resourcesService: ResourcesServices, cfService: CustomFormsServices,
        basicModals: BasicModalServices, browsingModals: BrowsingModalServices, creationModal: CreationModalServices,
        rvModalService: ResViewModalServices, private skosService: SkosServices, private eventHandler: VBEventHandler) {
        super(propService, resourcesService, cfService, basicModals, browsingModals, creationModal, rvModalService);
    }

    //add as top concept
    add(predicate?: ARTURIResource) {
        var propChangeable: boolean = predicate == null;
        this.rvModalService.addPropertyValue("Set as top Concept of", this.resource, this.rootProperty, propChangeable).then(
            (data: any) => {
                var prop: ARTURIResource = data.property;
                var scheme: ARTURIResource = data.value;
                if (prop.getURI() == this.rootProperty.getURI()) { //it's adding a concept as skos:topConceptOf
                    this.skosService.addTopConcept(<ARTURIResource>this.resource, scheme).subscribe(
                        stResp => this.update.emit(null)
                    ) ;
                } else { //it's adding a subProperty of skos:topConceptOf
                    this.resourcesService.addValue(this.resource, prop, scheme).subscribe(
                        stResp => {
                            this.eventHandler.topConceptCreatedEvent.emit({concept: <ARTURIResource>this.resource, schemes: [scheme]});
                            this.update.emit(null);
                        }
                    );
                }
            },
            () => {}
        );
    }

    removePredicateObject(predicate: ARTURIResource, object: ARTNode) {
        if (predicate.getAdditionalProperty(ResAttribute.HAS_CUSTOM_RANGE) && object.isResource()) {
            this.cfService.removeReifiedResource(this.resource, predicate, object).subscribe(
                stResp => this.update.emit(null)
            );
        } else {
            if (this.rootProperty.getURI() == predicate.getURI()) { //removing skos:topConceptOf relation
                this.skosService.removeTopConcept(<ARTURIResource>this.resource, <ARTURIResource>object).subscribe(
                    stResp => this.update.emit(null)
                );
            } else {//predicate is some subProperty of skos:topConceptOf
                this.resourcesService.removeValue(this.resource, predicate, object).subscribe(
                    stResp => {
                        this.eventHandler.conceptRemovedAsTopConceptEvent.emit({concept: <ARTURIResource>this.resource, scheme: <ARTURIResource>object});
                        this.update.emit(null);
                    }
                );
            }
        }
    }

    initAddAuthorization() {
        this.addAuthorized = AuthorizationEvaluator.isAuthorized(AuthorizationEvaluator.Actions.SKOS_ADD_TOP_CONCEPT);
    }

}