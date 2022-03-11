import { Component } from "@angular/core";
import { Observable, of } from "rxjs";
import { CustomViewsServices } from "src/app/services/customViewsServices";
import { ARTNode, ARTResource, ARTURIResource } from "../../../../models/ARTResources";
import { ResViewPartition } from "../../../../models/ResourceView";
import { CustomFormsServices } from "../../../../services/customFormsServices";
import { OntoLexLemonServices } from "../../../../services/ontoLexLemonServices";
import { PropertyServices } from "../../../../services/propertyServices";
import { ResourcesServices } from "../../../../services/resourcesServices";
import { BasicModalServices } from "../../../../widget/modal/basicModal/basicModalServices";
import { CreationModalServices } from "../../../../widget/modal/creationModal/creationModalServices";
import { NewOntoLexicalizationCfModalReturnData } from "../../../../widget/modal/creationModal/newResourceModal/ontolex/newOntoLexicalizationCfModal";
import { ResViewModalServices } from "../../resViewModals/resViewModalServices";
import { PartitionRenderSingleRoot } from "../partitionRendererSingleRoot";


@Component({
    selector: "denotations-renderer",
    templateUrl: "../partitionRenderer.html",
})
export class DenotationsPartitionRenderer extends PartitionRenderSingleRoot {

    partition = ResViewPartition.denotations;
    addBtnImgSrc = "./assets/images/icons/actions/objectProperty_create.png";

    constructor(resourcesService: ResourcesServices, propService: PropertyServices, cfService: CustomFormsServices, cvService: CustomViewsServices,
        basicModals: BasicModalServices, creationModals: CreationModalServices, resViewModals: ResViewModalServices,
        private ontolexService: OntoLexLemonServices) {
        super(resourcesService, propService, cfService, cvService, basicModals, creationModals, resViewModals);
    }

    ngOnInit() {
        super.ngOnInit();
    }

    add(predicate: ARTURIResource, propChangeable: boolean) {
        if (predicate.getURI() == this.rootProperty.getURI()) {
            this.creationModals.newOntoLexicalizationCf({key:"DATA.ACTIONS.ADD_DENOTATION"}, this.rootProperty, false).then(
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
        return of(true);
    }

    removePredicateObject(predicate: ARTURIResource, object: ARTNode) {
        this.getRemoveFunction(predicate, object).subscribe(
            stResp => {
                this.update.emit(null);
            }
        );
    }

    getRemoveFunctionImpl(predicate: ARTURIResource, object: ARTNode): Observable<any> {
        return this.ontolexService.removeLexicalization(this.resource, <ARTResource>object);
    }

}