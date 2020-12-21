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
import { BrowsingModalServices } from "../../../../widget/modal/browsingModal/browsingModalServices";
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
    addBtnImgTitle = "Add constituent";
    addBtnImgSrc = "./assets/images/icons/actions/objectProperty_create.png";

    constructor(propService: PropertyServices, resourcesService: ResourcesServices, cfService: CustomFormsServices,
        basicModals: BasicModalServices, browsingModals: BrowsingModalServices, creationModal: CreationModalServices, 
        resViewModals: ResViewModalServices, private ontolexService: OntoLexLemonServices) {
        super(propService, resourcesService, cfService, basicModals, browsingModals, creationModal, resViewModals);
    }

    ngOnInit() {
        super.ngOnInit();
    }

    add(predicate: ARTURIResource, propChangeable: boolean) {
        this.resViewModals.createConstituentList({key:"ACTIONS.CREATE_CONSTITUENTS_LIST"}).then(
            (data: ConstituentListCreatorModalReturnData) => {
                this.ontolexService.setLexicalEntryConstituents(<ARTURIResource>this.resource, data.list, data.ordered).subscribe(
                    () => {
                        this.update.emit();
                    }
                )
            },
            () => {}
        );
    }

    checkTypeCompliantForManualAdd(predicate: ARTURIResource, value: ARTNode): Observable<boolean> {
        return of(value instanceof ARTURIResource);
    }

    removePredicateObject(predicate: ARTURIResource, object: ARTNode) {
        this.basicModals.confirm({key:"ACTIONS.DELETE_CONSTITUENT"}, "Deleting a single constituent could compromise the integrity of the constituents section."
            + " If you want to edit the constituents of the LexicalEntry, it is highly recommended to use the add procedure which will replace the current constituent list."
            + " Do you want to confirm the deletion?", ModalType.warning).then(
            () => {
                this.getRemoveFunction(predicate, object).subscribe(
                    stResp => {
                        this.update.emit();
                    }
                );
            },
            () => {}
        );
    }

    getRemoveFunctionImpl(predicate: ARTURIResource, object: ARTNode): Observable<any> {
        return this.resourcesService.removeValue(<ARTURIResource>this.resource, predicate, object);
    }

}