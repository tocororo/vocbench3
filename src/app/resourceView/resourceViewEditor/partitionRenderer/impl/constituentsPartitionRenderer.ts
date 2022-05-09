import { Component } from "@angular/core";
import { Observable, of } from 'rxjs';
import { ModalType } from 'src/app/widget/modal/Modals';
import { ARTNode, ARTURIResource } from "../../../../models/ARTResources";
import { ResViewPartition } from "../../../../models/ResourceView";
import { CustomFormsServices } from "../../../../services/customFormsServices";
import { OntoLexLemonServices } from "../../../../services/ontoLexLemonServices";
import { PropertyServices } from "../../../../services/propertyServices";
import { ResourcesServices } from "../../../../services/resourcesServices";
import { BasicModalServices } from "../../../../widget/modal/basicModal/basicModalServices";
import { CreationModalServices } from "../../../../widget/modal/creationModal/creationModalServices";
import { ConstituentListCreatorModalReturnData } from "../../resViewModals/constituentListCreatorModal";
import { ResViewModalServices } from "../../resViewModals/resViewModalServices";
import { PartitionRenderSingleRoot } from "../partitionRendererSingleRoot";

@Component({
    selector: "constituents-renderer",
    templateUrl: "../partitionRenderer.html",
})
export class ConstituentsPartitionRenderer extends PartitionRenderSingleRoot {

    partition = ResViewPartition.constituents;
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
        this.resViewModals.createConstituentList({ key: "DATA.ACTIONS.CREATE_CONSTITUENTS_LIST" }).then(
            (data: ConstituentListCreatorModalReturnData) => {
                this.ontolexService.setLexicalEntryConstituents(<ARTURIResource>this.resource, data.list, data.ordered).subscribe(
                    () => {
                        this.update.emit();
                    }
                );
            },
            () => { }
        );
    }

    checkTypeCompliantForManualAdd(predicate: ARTURIResource, value: ARTNode): Observable<boolean> {
        return of(value instanceof ARTURIResource);
    }

    removePredicateObject(predicate: ARTURIResource, object: ARTNode) {
        this.basicModals.confirm({ key: "DATA.ACTIONS.DELETE_CONSTITUENT" }, { key: "MESSAGES.DELETE_CONSTITUENT_WARN_CONFIRM" }, ModalType.warning).then(
            () => {
                this.getRemoveFunction(predicate, object).subscribe(
                    stResp => {
                        this.update.emit();
                    }
                );
            },
            () => { }
        );
    }

    getRemoveFunctionImpl(predicate: ARTURIResource, object: ARTNode): Observable<any> {
        return this.resourcesService.removeValue(<ARTURIResource>this.resource, predicate, object);
    }

}