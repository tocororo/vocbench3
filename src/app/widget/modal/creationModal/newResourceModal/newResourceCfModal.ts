import { Component } from "@angular/core";
import { BSModalContext } from 'ngx-modialog/plugins/bootstrap';
import { DialogRef, ModalComponent } from "ngx-modialog";
import { AbstractCustomConstructorModal } from "./abstractCustomConstructorModal";
import { CustomFormsServices } from "../../../../services/customFormsServices";
import { BrowsingModalServices } from "../../browsingModal/browsingModalServices";
import { BasicModalServices } from "../../basicModal/basicModalServices";
import { ARTLiteral, ARTURIResource } from "../../../../models/ARTResources";
import { CustomFormValue } from "../../../../models/CustomForms";

export class NewResourceCfModalData extends BSModalContext {
    constructor(
        public title: string = "Modal title",
        public cls: ARTURIResource, //class that this modal is creating
        public clsChangeable: boolean = true,
    ) {
        super();
    }
}

@Component({
    selector: "new-resource-cf-modal",
    templateUrl: "./newResourceCfModal.html",
})
export class NewResourceCfModal extends AbstractCustomConstructorModal implements ModalComponent<NewResourceCfModalData> {
    context: NewResourceCfModalData;

    //standard form
    private uri: string;

    constructor(public dialog: DialogRef<NewResourceCfModalData>, cfService: CustomFormsServices,
        basicModals: BasicModalServices, browsingModals: BrowsingModalServices) {
        super(cfService, basicModals, browsingModals);
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
        return (this.uri != null && this.uri.trim() != "");
    }

    ok(event: Event) {
        event.stopPropagation();
        event.preventDefault();

        var entryMap: any = this.collectCustomFormData();

        var returnedData: { uriResource: ARTURIResource, cls: ARTURIResource, cfValue: CustomFormValue } = {
            uriResource: new ARTURIResource(this.uri),
            cls: this.resourceClass,
            cfValue: null
        }
        //set cfValue only if not null
        if (this.customFormId != null && entryMap != null) {
            returnedData.cfValue = new CustomFormValue(this.customFormId, entryMap);
        }
        this.dialog.close(returnedData);
    }

    cancel() {
        this.dialog.dismiss();
    }

}