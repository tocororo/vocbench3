import { Component } from "@angular/core";
import { Observable } from "rxjs/Observable";
import { ARTNode, ARTURIResource } from "../../../models/ARTResources";
import { ResViewPartition } from "../../../models/ResourceView";
import { Decomp } from "../../../models/Vocabulary";
import { CustomFormsServices } from "../../../services/customFormsServices";
import { OntoLexLemonServices } from "../../../services/ontoLexLemonServices";
import { PropertyServices } from "../../../services/propertyServices";
import { ResourcesServices } from "../../../services/resourcesServices";
import { BasicModalServices } from "../../../widget/modal/basicModal/basicModalServices";
import { BrowsingModalServices } from "../../../widget/modal/browsingModal/browsingModalServices";
import { CreationModalServices } from "../../../widget/modal/creationModal/creationModalServices";
import { ResViewModalServices } from "../../resViewModals/resViewModalServices";
import { PartitionRenderSingleRoot } from "../partitionRendererSingleRoot";

@Component({
    selector: "subterms-renderer",
    templateUrl: "../partitionRenderer.html",
})
export class SubtermsPartitionRenderer extends PartitionRenderSingleRoot {

    partition = ResViewPartition.subterms;
    rootProperty: ARTURIResource = Decomp.subterm;
    label = "Subterms";
    addBtnImgTitle = "Add a Subterm";
    addBtnImgSrc = require("../../../../assets/images/icons/actions/propObject_create.png");

    constructor(propService: PropertyServices, resourcesService: ResourcesServices, cfService: CustomFormsServices,
        basicModals: BasicModalServices, browsingModals: BrowsingModalServices, creationModal: CreationModalServices,
        resViewModals: ResViewModalServices, private ontolexService: OntoLexLemonServices) {
        super(propService, resourcesService, cfService, basicModals, browsingModals, creationModal, resViewModals);
    }

    //add as top concept
    add(predicate: ARTURIResource, propChangeable: boolean) {
        this.browsingModals.browseLexicalEntryList("Add a subterm", null, true, true, false, true).then(
            (values: ARTURIResource[]) => {
                let addFunctions: Observable<any>[] = [];
                values.forEach((v: ARTURIResource) => {
                    addFunctions.push(this.ontolexService.addSubterm(<ARTURIResource>this.resource, v, predicate));
                });
                this.addMultiple(addFunctions);
            },
            () => {}
        )
    }

    checkTypeCompliantForManualAdd(predicate: ARTURIResource, value: ARTNode): Observable<boolean> {
        return Observable.of(value instanceof ARTURIResource);
    }

    removePredicateObject(predicate: ARTURIResource, object: ARTNode) {
        this.getRemoveFunction(predicate, object).subscribe(
            stResp => {
                this.update.emit()
            }
        );
    }

    getRemoveFunctionImpl(predicate: ARTURIResource, object: ARTNode): Observable<any> {
        return this.ontolexService.removeSubterm(<ARTURIResource>this.resource, <ARTURIResource>object, predicate);
    }

}