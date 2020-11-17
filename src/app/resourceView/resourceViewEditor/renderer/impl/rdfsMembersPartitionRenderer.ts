import { Component } from "@angular/core";
import { Observable, of } from 'rxjs';
import { ModalType } from 'src/app/widget/modal/Modals';
import { ARTNode, ARTURIResource, RDFResourceRolesEnum } from "../../../../models/ARTResources";
import { ResViewPartition } from "../../../../models/ResourceView";
import { CustomFormsServices } from "../../../../services/customFormsServices";
import { PropertyServices } from "../../../../services/propertyServices";
import { ResourcesServices } from "../../../../services/resourcesServices";
import { SkosServices } from "../../../../services/skosServices";
import { VBEventHandler } from "../../../../utils/VBEventHandler";
import { BasicModalServices } from "../../../../widget/modal/basicModal/basicModalServices";
import { BrowsingModalServices } from "../../../../widget/modal/browsingModal/browsingModalServices";
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
    addBtnImgTitle = "Add member";
    addBtnImgSrc = "./assets/images/icons/actions/property_create.png";

    constructor(propService: PropertyServices, resourcesService: ResourcesServices, cfService: CustomFormsServices,
        basicModals: BasicModalServices, browsingModals: BrowsingModalServices, creationModal: CreationModalServices, 
        resViewModals: ResViewModalServices, private skosService: SkosServices, private eventHandler: VBEventHandler) {
        super(propService, resourcesService, cfService, basicModals, browsingModals, creationModal, resViewModals);
    }

    ngOnInit() {
        super.ngOnInit();
    }

    add(predicate: ARTURIResource, propChangeable: boolean) {
        if (this.resource.getRole() == RDFResourceRolesEnum.ontolexLexicalEntry) {
            this.basicModals.confirm("Add member", "It is not recommended to edit the member list from this section. There are no checks"
                + " on the rdf:_n predicate so you could compromise the integrity of the list."
                + " Do you want to continue?", ModalType.warning).then(
                confirm => {
                    this.resViewModals.addRdfsMembers(predicate, propChangeable).then(
                        (data: RdfsMembersModalReturnData) => {
                            var prop: ARTURIResource = data.property;
                            var member: ARTURIResource = data.value;
                            this.resourcesService.addValue(this.resource, prop, member).subscribe(
                                stResp =>{
                                    this.update.emit(null);
                                }
                            );
                        },
                        () => {}
                    );
                },
                cancel => {}
            );
        }
    }

    checkTypeCompliantForManualAdd(predicate: ARTURIResource, value: ARTNode): Observable<boolean> {
        return of(value instanceof ARTURIResource);
    }

    removePredicateObject(predicate: ARTURIResource, object: ARTNode) {
        //warning message only when deleting members of lexical entry
        if (this.resource.getRole() == RDFResourceRolesEnum.ontolexLexicalEntry) {
            this.basicModals.confirm("Delete member", "Deleting a single member of an ordered constituent list could compromise the integrity of the members section."
                + " If you want to edit the members, it is highly recommended to add a new constituent list from the constituents section."
                + " Do you want to confirm the deletion?", ModalType.warning).then(
                confirm => {
                    this.getRemoveFunction(predicate, object).subscribe(
                        stResp => {
                            this.update.emit();
                        }
                    );
                },
                cancel => {}
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