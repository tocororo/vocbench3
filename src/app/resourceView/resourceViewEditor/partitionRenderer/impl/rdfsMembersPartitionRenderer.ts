import { Component } from "@angular/core";
import { Observable, of } from 'rxjs';
import { ModalType } from 'src/app/widget/modal/Modals';
import { ARTNode, ARTURIResource, RDFResourceRolesEnum } from "../../../../models/ARTResources";
import { ResViewPartition } from "../../../../models/ResourceView";
import { CustomFormsServices } from "../../../../services/customFormsServices";
import { PropertyServices } from "../../../../services/propertyServices";
import { ResourcesServices } from "../../../../services/resourcesServices";
import { BasicModalServices } from "../../../../widget/modal/basicModal/basicModalServices";
import { CreationModalServices } from "../../../../widget/modal/creationModal/creationModalServices";
import { RdfsMembersModalReturnData } from "../../resViewModals/rdfsMembersModal";
import { ResViewModalServices } from "../../resViewModals/resViewModalServices";
import { PartitionRenderSingleRoot } from "../partitionRendererSingleRoot";

@Component({
    selector: "rdfs-members-renderer",
    templateUrl: "../partitionRenderer.html",
})
export class RdfsMembersPartitionRenderer extends PartitionRenderSingleRoot {

    partition = ResViewPartition.rdfsMembers;
    addBtnImgSrc = "./assets/images/icons/actions/property_create.png";

    constructor(resourcesService: ResourcesServices, propService: PropertyServices, cfService: CustomFormsServices,
        basicModals: BasicModalServices, creationModals: CreationModalServices, resViewModals: ResViewModalServices) {
        super(resourcesService, propService, cfService, basicModals, creationModals, resViewModals);
    }

    ngOnInit() {
        super.ngOnInit();
    }

    add(predicate: ARTURIResource, propChangeable: boolean) {
        if (this.resource.getRole() == RDFResourceRolesEnum.ontolexLexicalEntry) {
            this.basicModals.confirm({ key: "DATA.ACTIONS.ADD_MEMBER" }, { key: "MESSAGES.EDIT_RDF_MEMBER_WARN_CONFIRM" }, ModalType.warning).then(
                confirm => {
                    this.resViewModals.addRdfsMembers(predicate, propChangeable).then(
                        (data: RdfsMembersModalReturnData) => {
                            let prop: ARTURIResource = data.property;
                            let member: ARTURIResource = data.value;
                            this.resourcesService.addValue(this.resource, prop, member).subscribe(
                                stResp => {
                                    this.update.emit(null);
                                }
                            );
                        },
                        () => { }
                    );
                },
                cancel => { }
            );
        }
    }

    checkTypeCompliantForManualAdd(predicate: ARTURIResource, value: ARTNode): Observable<boolean> {
        return of(value instanceof ARTURIResource);
    }

    removePredicateObject(predicate: ARTURIResource, object: ARTNode) {
        //warning message only when deleting members of lexical entry
        if (this.resource.getRole() == RDFResourceRolesEnum.ontolexLexicalEntry) {
            this.basicModals.confirm({ key: "ACTIONS.DELETE_MEMBER" }, { key: "MESSAGES.DELETE_RDF_MEMBER_WARN_CONFIRM" }, ModalType.warning).then(
                confirm => {
                    this.getRemoveFunction(predicate, object).subscribe(
                        stResp => {
                            this.update.emit();
                        }
                    );
                },
                cancel => { }
            );
        } else {
            this.getRemoveFunction(predicate, object).subscribe(
                stResp => {
                    this.update.emit();
                }
            );
        }
    }

    getRemoveFunctionImpl(predicate: ARTURIResource, object: ARTNode): Observable<any> {
        return this.resourcesService.removeValue(this.resource, predicate, object);
    }

}