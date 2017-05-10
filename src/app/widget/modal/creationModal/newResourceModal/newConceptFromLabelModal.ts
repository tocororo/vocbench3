import { Component, ViewChild, ElementRef } from "@angular/core";
import { BSModalContext } from 'angular2-modal/plugins/bootstrap';
import { DialogRef, ModalComponent } from "angular2-modal";
import { AbstractCustomConstructorModal } from "./abstractCustomConstructorModal"
import { CustomFormsServices } from "../../../../services/customFormsServices"
import { BasicModalServices } from "../../basicModal/basicModalServices"
import { BrowsingModalServices } from "../../browsingModal/browsingModalServices"
import { CustomForm, FormField } from "../../../../models/CustomForms"
import { ARTLiteral, ARTURIResource, ARTResource } from "../../../../models/ARTResources"

export class NewConceptFromLabelModalData extends BSModalContext {
    constructor(
        public title: string = "Modal title",
        public xLabel: ARTResource,
        public cls: ARTURIResource, //class that this modal is creating
        public clsChangeable: boolean = true,
    ) {
        super();
    }
}

@Component({
    selector: "new-concept-from-label-modal",
    templateUrl: "./newConceptFromLabelModal.html",
})
export class NewConceptFromLabelModal extends AbstractCustomConstructorModal implements ModalComponent<NewConceptFromLabelModalData> {
    context: NewConceptFromLabelModalData;

    //standard form
    private uri: string;

    constructor(public dialog: DialogRef<NewConceptFromLabelModalData>, cfService: CustomFormsServices,
        basicModals: BasicModalServices, browsingModals: BrowsingModalServices) {
        super(cfService, basicModals, browsingModals)
        this.context = dialog.context;
    }

    ngOnInit() {
        this.resourceClass = this.context.cls;
        this.selectCustomForm();
    }

    changeClass() {
        this.changeClassWithRoot(this.context.cls);
    }

    isStandardFormDataValid(): boolean {
        //there is no standard form field (the only field standard is the xLabel to move that is given and not changeable)
        return true;
    }

    ok(event: Event) {
        event.stopPropagation();
        event.preventDefault();

        var entryMap: any = this.collectCustomFormData();

        var returnedData: { uriResource: ARTURIResource, cls: ARTURIResource, cfId: string, cfValueMap: any} = {
            uriResource: null,
            cls: this.resourceClass,
            cfId: this.customFormId,
            cfValueMap: entryMap
        }
        //Set URI only if not empty
        if (this.uri != null && this.uri.trim() != "") {
            returnedData.uriResource = new ARTURIResource(this.uri);
        }
        this.dialog.close(returnedData);
    }

    cancel() {
        this.dialog.dismiss();
    }

}