import { Component } from "@angular/core";
import { Observable, of } from "rxjs";
import { OntoLexLemonServices } from "src/app/services/ontoLexLemonServices";
import { NewConceptualizationCfModalReturnData } from "src/app/widget/modal/creationModal/newResourceModal/ontolex/newConceptualizationCfModal";
import { ARTNode, ARTResource, ARTURIResource } from "../../../../models/ARTResources";
import { ResViewPartition } from "../../../../models/ResourceView";
import { CustomFormsServices } from "../../../../services/customFormsServices";
import { PropertyServices } from "../../../../services/propertyServices";
import { ResourcesServices } from "../../../../services/resourcesServices";
import { BasicModalServices } from "../../../../widget/modal/basicModal/basicModalServices";
import { CreationModalServices } from "../../../../widget/modal/creationModal/creationModalServices";
import { ResViewModalServices } from "../../resViewModals/resViewModalServices";
import { PartitionRenderSingleRoot } from "../partitionRendererSingleRoot";


@Component({
    selector: "evoked-lexical-concepts-renderer",
    templateUrl: "../partitionRenderer.html",
})
export class EvokedLexicalConceptsPartitionRenderer extends PartitionRenderSingleRoot {

    partition = ResViewPartition.evokedLexicalConcepts;
    addBtnImgSrc = "./assets/images/icons/actions/objectProperty_create.png";

    constructor(resourcesService: ResourcesServices, propService: PropertyServices, cfService: CustomFormsServices,
        basicModals: BasicModalServices, creationModals: CreationModalServices, resViewModals: ResViewModalServices,
        private ontolexService: OntoLexLemonServices) {
        super(resourcesService, propService, cfService, basicModals, creationModals, resViewModals);
    }

    ngOnInit() {
        super.ngOnInit();
    }

    add(predicate: ARTURIResource, propChangeable: boolean) {
        if (predicate.getURI() == this.rootProperty.getURI()) {
            this.creationModals.newConceptualizationCf({key:"DATA.ACTIONS.ADD_CONCEPTUALIZATION"}, false, false).then(
                (data: NewConceptualizationCfModalReturnData) => {
                    this.ontolexService.addConceptualization(this.resource, data.linkedResource, true, data.createSense, data.cls, data.cfValue).subscribe(
                        () => {
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
        return this.ontolexService.removeConceptualization(this.resource, <ARTResource>object);
    }

}