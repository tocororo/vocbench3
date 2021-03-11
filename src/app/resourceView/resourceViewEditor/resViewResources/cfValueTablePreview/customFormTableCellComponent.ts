import { Component, EventEmitter, Input, Output } from "@angular/core";
import { Observable } from "rxjs";
import { CustomForm, CustomFormValue, CustomFormValueTableCell, CustomFormValueTableRow } from "src/app/models/CustomForms";
import { CustomFormsServices } from "src/app/services/customFormsServices";
import { PropertyServices } from "src/app/services/propertyServices";
import { ResourcesServices } from "src/app/services/resourcesServices";
import { AuthorizationEvaluator } from "src/app/utils/AuthorizationEvaluator";
import { VBActionsEnum } from "src/app/utils/VBActions";
import { BasicModalServices } from "src/app/widget/modal/basicModal/basicModalServices";
import { CreationModalServices } from "src/app/widget/modal/creationModal/creationModalServices";
import { ARTLiteral, ARTNode, ARTResource, ARTURIResource, ResAttribute } from "../../../../models/ARTResources";
import { EnrichmentType, PropertyEnrichmentHelper, PropertyEnrichmentInfo } from "../../renderer/propertyEnrichmentHelper";
import { AddPropertyValueModalReturnData } from "../../resViewModals/addPropertyValueModal";
import { ResViewModalServices } from "../../resViewModals/resViewModalServices";

@Component({
    selector: "cf-table-cell",
    templateUrl: "./customFormTableCellComponent.html",
})
export class CustomFormTableCellComponent {

    @Input() readonly: boolean;
    @Input() rendering: boolean;
    @Input() subject: ARTResource; //described resource
    @Input() cell: CustomFormValueTableCell;

    @Output() update = new EventEmitter(); //a change has been done => request to update the RV
    @Output() dblClick: EventEmitter<ARTResource> = new EventEmitter(); //object dbl clicked

    editAllowed: boolean;
    deleteAllowed: boolean;

    constructor(private resourceService: ResourcesServices, private propService: PropertyServices, private cfService: CustomFormsServices,
        private basicModals: BasicModalServices, private creationModals: CreationModalServices, private resViewModals: ResViewModalServices) {}

    ngOnInit() {
        this.editAllowed = AuthorizationEvaluator.isAuthorized(VBActionsEnum.resourcesUpdateTriple, this.subject, this.cell.value) && !this.readonly;
        this.deleteAllowed = AuthorizationEvaluator.isAuthorized(VBActionsEnum.resourcesRemoveValue, this.subject, this.cell.value) && !this.readonly;
    }

    edit() {
        PropertyEnrichmentHelper.getPropertyEnrichmentInfo(this.cell.pred, this.propService, this.basicModals).subscribe(
            (data: PropertyEnrichmentInfo) => {
                if (data.type == EnrichmentType.resource) {
                    this.enrichWithResource(this.cell.pred);
                } else if (data.type == EnrichmentType.literal) {
                    this.enrichWithTypedLiteral(this.cell.pred, data.allowedDatatypes, data.dataRanges);
                } else if (data.type == EnrichmentType.customForm) {
                    this.enrichWithCustomForm(this.cell.pred, data.form);
                }
            }
        )
    }

    private enrichWithResource(predicate: ARTURIResource) {
        this.resViewModals.addPropertyValue({key: "ACTIONS.EDIT_X", params:{x: predicate.getShow()}}, this.subject, predicate, false).then(
            (data: AddPropertyValueModalReturnData) => {
                let newValue: ARTURIResource = data.value[0];
                this.resourceService.updateTriple(this.subject, predicate, this.cell.value, newValue).subscribe(
                    () => {
                        this.update.emit();
                    }
                )
            },
            () => { }
        )
    }

    private enrichWithTypedLiteral(predicate: ARTURIResource, allowedDatatypes?: ARTURIResource[], dataRanges?: (ARTLiteral[])[]) {
        this.creationModals.newTypedLiteral({key: "ACTIONS.EDIT_X", params:{x: predicate.getShow()}}, predicate, allowedDatatypes, dataRanges, false, true).then(
            (literals: ARTLiteral[]) => {
                let newValue: ARTLiteral = literals[0];
                this.resourceService.updateTriple(this.subject, predicate, this.cell.value, newValue).subscribe(
                    () => {
                        this.update.emit();
                    }
                )
            },
            () => { }
        );
    }

    public enrichWithCustomForm(predicate: ARTURIResource, form: CustomForm) {
        this.resViewModals.enrichCustomForm({key: "ACTIONS.EDIT_X", params:{x: predicate.getShow()}}, form.getId()).then(
            (entryMap: any) => {
                //update of cf value doesn't exist, so first delete, then add
                let deleteFn: Observable<any> = this.resourceService.removeValue(this.subject, predicate, this.cell.value);
                if (predicate.getAdditionalProperty(ResAttribute.HAS_CUSTOM_RANGE) && this.cell.value.isResource()) {
                    //probably a reified resource generated through CF
                    deleteFn = this.cfService.removeReifiedResource(this.subject, predicate, this.cell.value);
                }
                deleteFn.subscribe(
                    () => {
                        let cfValue: CustomFormValue = new CustomFormValue(form.getId(), entryMap);
                        this.resourceService.addValue(this.subject, predicate, cfValue).subscribe(
                            () => {
                                this.update.emit();
                            }
                        )        
                    }
                )
            },
            () => { }
        )
    }

    delete() {
        this.resourceService.removeValue(this.subject, this.cell.pred, this.cell.value).subscribe(
            () => {
                this.update.emit();
            }
        )
    }

    valueDblClick(value: ARTNode) {
        if (value instanceof ARTResource) {
            this.dblClick.emit(value);
        }
    }

    linkClick(linkRes: ARTURIResource) {
        this.dblClick.emit(linkRes);
    }

}