import { Component } from "@angular/core";
import { Observable, of } from "rxjs";
import { CustomViewsServices } from "src/app/services/customViewsServices";
import { NewLexSenseCfModalReturnData } from "src/app/widget/modal/creationModal/newResourceModal/ontolex/newLexSenseCfModal";
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
    selector: "lexical-senses-renderer",
    templateUrl: "../partitionRenderer.html",
})
export class LexicalSensesPartitionRenderer extends PartitionRenderSingleRoot {

    partition = ResViewPartition.lexicalSenses;
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
            this.creationModals.newOntoLexSenseCf({key:"DATA.ACTIONS.ADD_LEXICAL_SENSE"}, false).then(
                (data: NewLexSenseCfModalReturnData) => {
                    let addFn: Observable<any>;
                    if (data.nature == 'reference') {
                        addFn = this.ontolexService.addLexicalization(this.resource, data.linkedResource, data.createPlain, true, data.cls, data.cfValue);
                    } else { //nature lex.concept
                        addFn = this.ontolexService.addConceptualization(this.resource, data.linkedResource, data.createPlain, true, data.cls, data.cfValue);
                    }
                    addFn.subscribe(
                        () => {
                            this.update.emit()
                        }
                    );
                },
                () => {}
            )
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
        return this.ontolexService.removeSense(<ARTResource>object, true);
    }

}