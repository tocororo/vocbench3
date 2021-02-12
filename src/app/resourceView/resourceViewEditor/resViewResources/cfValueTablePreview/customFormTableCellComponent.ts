import { Component, EventEmitter, Input, Output } from "@angular/core";
import { CustomFormValueTableCell, CustomFormValueTableRow } from "src/app/models/CustomForms";
import { ResourcesServices } from "src/app/services/resourcesServices";
import { AuthorizationEvaluator } from "src/app/utils/AuthorizationEvaluator";
import { VBActionsEnum } from "src/app/utils/VBActions";
import { ARTNode, ARTResource, ARTURIResource } from "../../../../models/ARTResources";

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

    constructor(private resourceService: ResourcesServices) {}

    ngOnInit() {
        this.editAllowed = AuthorizationEvaluator.isAuthorized(VBActionsEnum.resourcesUpdateTriple, this.subject) && !this.readonly;
        this.deleteAllowed = AuthorizationEvaluator.isAuthorized(VBActionsEnum.resourcesRemoveValue, this.subject) && !this.readonly;
    }

    edit() {
        //TODO
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

}