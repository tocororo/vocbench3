import { Component, Input, Output, EventEmitter } from "@angular/core";
import { Observable } from "rxjs/Observable";
import { PartitionRenderSingleRoot } from "../partitionRendererSingleRoot";
import { SkosServices } from "../../../services/skosServices";
import { ARTResource, ARTURIResource, ARTNode, ARTPredicateObjects, ResAttribute, RDFTypesEnum } from "../../../models/ARTResources";
import { SKOS } from "../../../models/Vocabulary";
import { ResViewPartition } from "../../../models/ResourceView";
import { VBEventHandler } from "../../../utils/VBEventHandler";
import { PropertyServices } from "../../../services/propertyServices";
import { CustomFormsServices } from "../../../services/customFormsServices";
import { ResourcesServices } from "../../../services/resourcesServices";
import { ResViewModalServices } from "../../resViewModals/resViewModalServices";
import { BasicModalServices } from "../../../widget/modal/basicModal/basicModalServices";
import { BrowsingModalServices } from "../../../widget/modal/browsingModal/browsingModalServices";
import { CreationModalServices } from "../../../widget/modal/creationModal/creationModalServices";
import { UIUtils } from "../../../utils/UIUtils";

@Component({
    selector: "schemes-renderer",
    templateUrl: "../partitionRenderer.html",
})
export class SchemesPartitionRenderer extends PartitionRenderSingleRoot {

    //inherited from PartitionRenderSingleRoot
    // @Input('pred-obj-list') predicateObjectList: ARTPredicateObjects[];
    // @Input() resource:ARTURIResource;
    // @Output() update = new EventEmitter();//something changed in this partition. Tells to ResView to update
    // @Output() dblclickObj: EventEmitter<ARTResource> = new EventEmitter<ARTResource>();

    partition = ResViewPartition.schemes;
    rootProperty: ARTURIResource = SKOS.inScheme;
    label = "Schemes";
    addBtnImgTitle = "Add to a ConceptScheme";
    addBtnImgSrc = require("../../../../assets/images/icons/actions/conceptScheme_create.png");
    removeBtnImgTitle = "Remove from ConceptScheme";

    constructor(propService: PropertyServices, resourcesService: ResourcesServices, cfService: CustomFormsServices,
        basicModals: BasicModalServices, browsingModals: BrowsingModalServices, creationModal: CreationModalServices,
        resViewModals: ResViewModalServices, private skosService: SkosServices, private eventHandler: VBEventHandler) {
        super(propService, resourcesService, cfService, basicModals, browsingModals, creationModal, resViewModals);
    }

    //add as top concept
    add(predicate: ARTURIResource, propChangeable: boolean) {
        this.resViewModals.addPropertyValue("Add Concept to a Scheme", this.resource, this.rootProperty, propChangeable).then(
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

    checkTypeCompliantForManualAdd(predicate: ARTURIResource, value: ARTNode): Observable<boolean> {
        return Observable.of(value instanceof ARTURIResource);
    }

    removePredicateObject(predicate: ARTURIResource, object: ARTNode) {
        this.getRemoveFunction(predicate, object).subscribe(
            stResp => {
                if (this.rootProperty.getURI() != predicate.getURI()) {
                    //=> emits conceptRemovedFromSchemeEvent cause it has not been fired by the generic service (removeValue)
                    this.eventHandler.conceptRemovedFromSchemeEvent.emit({ concept: <ARTURIResource>this.resource, scheme: <ARTURIResource>object });
                }
                this.update.emit(null)
            }
        );
    }

    getRemoveFunctionImpl(predicate: ARTURIResource, object: ARTNode): Observable<any> {
        if (this.rootProperty.getURI() == predicate.getURI()) {// removing a skos:inScheme relation
            return this.skosService.removeConceptFromScheme(<ARTURIResource>this.resource, <ARTURIResource>object);
        } else {//predicate is some subProperty of skos:inScheme
            return this.resourcesService.removeValue(this.resource, predicate, object);
        }
    }

}