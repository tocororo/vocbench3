import { Component } from "@angular/core";
import { Observable, of } from "rxjs";
import { ARTNode, ARTURIResource } from "../../../../models/ARTResources";
import { ResViewPartition } from "../../../../models/ResourceView";
import { CustomFormsServices } from "../../../../services/customFormsServices";
import { OntoLexLemonServices } from "../../../../services/ontoLexLemonServices";
import { PropertyServices } from "../../../../services/propertyServices";
import { ResourcesServices } from "../../../../services/resourcesServices";
import { BasicModalServices } from "../../../../widget/modal/basicModal/basicModalServices";
import { BrowsingModalServices } from "../../../../widget/modal/browsingModal/browsingModalServices";
import { CreationModalServices } from "../../../../widget/modal/creationModal/creationModalServices";
import { ResViewModalServices } from "../../resViewModals/resViewModalServices";
import { MultiActionFunction } from "../multipleActionHelper";
import { PartitionRenderSingleRoot } from "../partitionRendererSingleRoot";

@Component({
    selector: "subterms-renderer",
    templateUrl: "../partitionRenderer.html",
})
export class SubtermsPartitionRenderer extends PartitionRenderSingleRoot {

    partition = ResViewPartition.subterms;
    addBtnImgTitle = "Add a Subterm";
    addBtnImgSrc = "./assets/images/icons/actions/objectProperty_create.png";

    constructor(propService: PropertyServices, resourcesService: ResourcesServices, cfService: CustomFormsServices,
        basicModals: BasicModalServices, browsingModals: BrowsingModalServices, creationModal: CreationModalServices,
        resViewModals: ResViewModalServices, private ontolexService: OntoLexLemonServices) {
        super(propService, resourcesService, cfService, basicModals, browsingModals, creationModal, resViewModals);
    }

    ngOnInit() {
        super.ngOnInit();
    }

    //add as top concept
    add(predicate: ARTURIResource, propChangeable: boolean) {
        this.browsingModals.browseLexicalEntryList({key:"DATA.ACTIONS.ADD_SUBTERM"}, null, true, true, false, true).then(
            (values: ARTURIResource[]|ARTURIResource) => { //array if multiple selected, one value otherwise
                let addFunctions: MultiActionFunction[] = [];
                if (values instanceof ARTURIResource) {
                    values = [values];
                }
                values.forEach((v: ARTURIResource) => {
                    addFunctions.push({
                        function: this.ontolexService.addSubterm(<ARTURIResource>this.resource, v, predicate),
                        value: v
                    });
                });
                this.addMultiple(addFunctions);
            },
            () => {}
        )
    }

    checkTypeCompliantForManualAdd(predicate: ARTURIResource, value: ARTNode): Observable<boolean> {
        return of(value instanceof ARTURIResource);
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