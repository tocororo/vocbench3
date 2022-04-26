import { Component, EventEmitter, Input, Output, ViewChild } from "@angular/core";
import { CustomViewRenderedValue, UpdateMode } from "src/app/models/CustomViews";
import { ResViewPartition } from "src/app/models/ResourceView";
import { CRUDEnum, ResourceViewAuthEvaluator } from "src/app/utils/AuthorizationEvaluator";
import { NTriplesUtil } from "src/app/utils/ResourceUtils";
import { BasicModalServices } from "src/app/widget/modal/basicModal/basicModalServices";
import { ModalType } from "src/app/widget/modal/Modals";
import { LiteralPickerComponent } from "src/app/widget/pickers/valuePicker/literalPickerComponent";
import { ResourcePickerComponent, ResourcePickerConfig } from "src/app/widget/pickers/valuePicker/resourcePickerComponent";
import { ARTLiteral, ARTNode, ARTResource, ARTURIResource, RDFResourceRolesEnum, RDFTypesEnum } from "../../../../models/ARTResources";

@Component({
    selector: "cv-value-renderer",
    templateUrl: "./cvValueRendererComponent.html",
})
export class CvValueRendererComponent {

    @Input() readonly: boolean;
    @Input() rendering: boolean;
    @Input() subject: ARTResource; //described resource
    @Input() value: CustomViewRenderedValue;
    @Input() partition: ResViewPartition;

    /* useful for render the edit/delete actions in different way:
    - in single value: both edit and delete are visible in a dropdown menu
    - in vector: only edit is visible, the deletion of single value of a table is not allowed (currently) since I don't know the property which the value is attached to
    */
    @Input() context: CvValueRendererCtx = CvValueRendererCtx.single_value;

    //this is an hack for using the resource and literal pickers logic inside this component (I added the picker components in the template as hidden elements)
    @ViewChild(ResourcePickerComponent) resPicker: ResourcePickerComponent;
    resPickerConf: ResourcePickerConfig;

    @ViewChild(LiteralPickerComponent) litPicker: LiteralPickerComponent;
    litPickerDatatypes: ARTURIResource[];

    @Output() update: EventEmitter<{old: ARTNode, new: ARTNode}> = new EventEmitter(); //a change has been done => request to update the RV
    @Output() delete: EventEmitter<void> = new EventEmitter(); //require a deletion of the current value to the parent component
    @Output() dblClick: EventEmitter<void> = new EventEmitter(); //object dbl clicked

    editInProgress: boolean = false;
    resourceStringValue: string;
    resourceStringValuePristine: string;

    editAuthorized: boolean = true;
    deleteAuthorized: boolean = true;

    constructor(private basicModals: BasicModalServices) { }

    ngOnInit() {
        if (this.value.updateInfo.updateMode == UpdateMode.picker) {
            if (this.value.updateInfo.valueType == RDFTypesEnum.resource && this.value.updateInfo.classes != null) {
                this.resPickerConf = { roles: [RDFResourceRolesEnum.individual], classes: this.value.updateInfo.classes.map(c => NTriplesUtil.parseURI(c)) };
            } else if (this.value.updateInfo.valueType == RDFTypesEnum.literal && this.value.updateInfo.datatype != null) {
                this.litPickerDatatypes = [NTriplesUtil.parseURI(this.value.updateInfo.datatype)];
            }
        }

        //edit authorized if update mode is provided and edit capabilities are granted
        this.editAuthorized = this.value.updateInfo.updateMode != UpdateMode.none && 
            ResourceViewAuthEvaluator.isAuthorized(this.partition, CRUDEnum.U, this.subject, this.value.resource) && !this.readonly;
        this.deleteAuthorized = ResourceViewAuthEvaluator.isAuthorized(this.partition, CRUDEnum.D, this.subject, this.value.resource) && !this.readonly;
    }

    edit() {
        if (this.value.updateInfo.updateMode == UpdateMode.inline) {
            this.editInline();
        } else if (this.value.updateInfo.updateMode == UpdateMode.picker) {
            if (this.value.updateInfo.valueType == RDFTypesEnum.resource) {
                this.resPicker.pickLocalResource();
            } else if (this.value.updateInfo.valueType == RDFTypesEnum.literal) {
                this.litPicker.pickLiteral();
            }
        } else { //widget (cannot be "none", since this option disables edit button)
            this.editInline(); //TODO this edit is temporarly, what to do here?
        }
    }

    editInline() {
        this.editInProgress = true;
        this.resourceStringValue = this.value.resource.toNT();//default string value (in the follow if-else override it eventually)
        this.resourceStringValuePristine = this.resourceStringValue;
    }
    confirmEdit() {
        if (this.resourceStringValue != this.resourceStringValuePristine) { //apply edit only if the representation is changed
            try {
                let newValue: ARTNode = NTriplesUtil.parseNode(this.resourceStringValue);
                this.update.emit({ old: this.value.resource, new: newValue });
            } catch (error) {
                this.basicModals.alert({ key: "STATUS.INVALID_VALUE" }, { key: this.resourceStringValue + " is not a valid NT value" }, ModalType.warning);
            }
        }
    }
    cancelEdit() {
        this.editInProgress = false;
    }

    onResourcePicked(res: ARTResource) {
        this.update.emit({ old: this.value.resource, new: res });
    }
    onLiteralPicked(lit: ARTLiteral) {
        this.update.emit({ old: this.value.resource, new: lit });
    }

    deleteHandler() {
        this.delete.emit();
    }

    valueDblClick() {
        if (this.value.resource instanceof ARTResource) {
            this.dblClick.emit();
        }
    }

}

export enum CvValueRendererCtx {
    single_value = "single_value",
    vector = "vector"
}