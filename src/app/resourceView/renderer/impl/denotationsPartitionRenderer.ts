import { Component } from "@angular/core";
import { Observable } from "rxjs/Observable";
import { ARTNode, ARTResource, ARTURIResource } from "../../../models/ARTResources";
import { ResViewPartition } from "../../../models/ResourceView";
import { OntoLex } from "../../../models/Vocabulary";
import { CustomFormsServices } from "../../../services/customFormsServices";
import { OntoLexLemonServices } from "../../../services/ontoLexLemonServices";
import { PropertyServices } from "../../../services/propertyServices";
import { ResourcesServices } from "../../../services/resourcesServices";
import { BasicModalServices } from "../../../widget/modal/basicModal/basicModalServices";
import { BrowsingModalServices } from "../../../widget/modal/browsingModal/browsingModalServices";
import { CreationModalServices } from "../../../widget/modal/creationModal/creationModalServices";
import { NewOntoLexicalizationCfModalReturnData } from "../../../widget/modal/creationModal/newResourceModal/ontolex/newOntoLexicalizationCfModal";
import { ResViewModalServices } from "../../resViewModals/resViewModalServices";
import { PartitionRenderSingleRoot } from "../partitionRendererSingleRoot";


@Component({
    selector: "denotations-renderer",
    templateUrl: "../partitionRenderer.html",
})
export class DenotationsPartitionRenderer extends PartitionRenderSingleRoot {

    //inherited from partitionRendererSingleRoot
    // @Input('pred-obj-list') predicateObjectList: ARTPredicateObjects[];
    // @Input() resource:ARTURIResource;
    // @Output() update = new EventEmitter();//something changed in this partition. Tells to ResView to update
    // @Output() dblclickObj: EventEmitter<ARTURIResource> = new EventEmitter<ARTURIResource>();

    partition = ResViewPartition.denotations;
    rootProperty: ARTURIResource = OntoLex.denotes;
    addBtnImgTitle = "Add denotation";
    addBtnImgSrc = require("../../../../assets/images/icons/actions/objectProperty_create.png");

    constructor(propService: PropertyServices, resourcesService: ResourcesServices, cfService: CustomFormsServices,
        basicModals: BasicModalServices, browsingModals: BrowsingModalServices, creationModal: CreationModalServices, 
        resViewModals: ResViewModalServices, private ontolexService: OntoLexLemonServices) {
        super(propService, resourcesService, cfService, basicModals, browsingModals, creationModal, resViewModals);
    }

    add(predicate: ARTURIResource, propChangeable: boolean) {
        if (predicate.getURI() == this.rootProperty.getURI()) {
            this.creationModals.newOntoLexicalizationCf("Add a denotation", this.rootProperty, false).then(
                (data: NewOntoLexicalizationCfModalReturnData) => {
                    this.ontolexService.addLexicalization(this.resource, data.linkedResource, data.createPlain, data.createSense, data.cls, data.cfValue).subscribe(
                        stResp => {
                            this.update.emit()
                        }
                    );
                },
                () => {}
            );
        } else {
            this.enrichProperty(predicate);
        }
    }

    //not used since this partition doesn't allow manual add operation
    checkTypeCompliantForManualAdd(predicate: ARTURIResource, value: ARTNode): Observable<boolean> {
        return Observable.of(true);
    }

    removePredicateObject(predicate: ARTURIResource, object: ARTNode) {
        this.getRemoveFunction(predicate, object).subscribe(
            stResp => {
                this.update.emit(null);
            }
        );
    }

    getRemoveFunctionImpl(predicate: ARTURIResource, object: ARTNode): Observable<any> {
        return this.ontolexService.removePlainLexicalization(this.resource, <ARTResource>object);
    }

}