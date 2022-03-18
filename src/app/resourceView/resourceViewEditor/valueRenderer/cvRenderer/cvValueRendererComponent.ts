import { Component, EventEmitter, Input, Output, ViewChild } from "@angular/core";
import { CustomViewRenderedValue, UpdateMode } from "src/app/models/CustomViews";
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

    //this is an hack for using the resource and literal pickers logic inside this component (I added the picker components in the template as hidden elements)
    @ViewChild(ResourcePickerComponent) resPicker: ResourcePickerComponent;
    resPickerConf: ResourcePickerConfig;

    @ViewChild(LiteralPickerComponent) litPicker: LiteralPickerComponent;
    litPickerDatatypes: ARTURIResource[];

    @Output() update = new EventEmitter(); //a change has been done => request to update the RV
    @Output() dblClick: EventEmitter<void> = new EventEmitter(); //object dbl clicked

    editInProgress: boolean = false;
    resourceStringValue: string;
    resourceStringValuePristine: string;


    constructor(private basicModals: BasicModalServices) { }

    ngOnInit() {
        if (this.value.updateInfo.updateMode == UpdateMode.picker) {
            if (this.value.updateInfo.valueType == RDFTypesEnum.resource && this.value.updateInfo.classes != null) {
                this.resPickerConf = { roles: [RDFResourceRolesEnum.individual], classes: this.value.updateInfo.classes.map(c => NTriplesUtil.parseURI(c)) }
            } else if (this.value.updateInfo.valueType == RDFTypesEnum.literal && this.value.updateInfo.datatype != null) {
                this.litPickerDatatypes = [NTriplesUtil.parseURI(this.value.updateInfo.datatype)];
            }
        }
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
                console.log("emit an event to parent for requiring update of", this.value.resource, "with", newValue);
            } catch (error) {
                this.basicModals.alert({ key: "STATUS.INVALID_VALUE" }, { key: this.resourceStringValue + " is not a valid NT value" }, ModalType.warning);
                return;
            }
        }
    }
    cancelEdit() {
        this.editInProgress = false;
    }

    onResourcePicked(res: ARTResource) {
        console.log("emit an event to parent for requiring update of", this.value.resource, "with", res);
    }
    onLiteralPicked(lit: ARTLiteral) {
        console.log("emit an event to parent for requiring update of", this.value.resource, "with", lit);
    }

    valueDblClick() {
        if (this.value.resource instanceof ARTResource) {
            this.dblClick.emit();
        }
    }

}