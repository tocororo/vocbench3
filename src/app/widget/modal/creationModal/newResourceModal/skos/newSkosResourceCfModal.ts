import { Component, ViewChild, ElementRef } from "@angular/core";
import { BSModalContext } from 'ngx-modialog/plugins/bootstrap';
import { DialogRef, ModalComponent } from "ngx-modialog";
import { AbstractCustomConstructorModal } from "../abstractCustomConstructorModal";
import { CustomFormsServices } from "../../../../../services/customFormsServices";
import { BasicModalServices } from "../../../basicModal/basicModalServices";
import { BrowsingModalServices } from "../../../browsingModal/browsingModalServices";
import { ARTLiteral, ARTURIResource } from "../../../../../models/ARTResources";
import { CustomFormValue } from "../../../../../models/CustomForms";
import { SKOS } from "../../../../../models/Vocabulary";

export class NewSkosResourceCfModalData extends BSModalContext {
    constructor(
        public title: string = "Modal title",
        public cls: ARTURIResource, //class that this modal is creating
        public clsChangeable: boolean = true,
        public lang: string
    ) {
        super();
    }
}

@Component({
    selector: "new-skos-resource-cf-modal",
    templateUrl: "./newSkosResourceCfModal.html",
})
export class NewSkosResourceCfModal extends AbstractCustomConstructorModal implements ModalComponent<NewSkosResourceCfModalData> {
    context: NewSkosResourceCfModalData;

    @ViewChild("toFocus") inputToFocus: ElementRef;
    
    private viewInitialized: boolean = false; //in order to avoid ugly UI effect on the alert showed if no language is available

    //standard form
    private label: string;
    private lang: string;
    private uri: string;

    constructor(public dialog: DialogRef<NewSkosResourceCfModalData>, cfService: CustomFormsServices,
        basicModals: BasicModalServices, browsingModals: BrowsingModalServices) {
        super(cfService, basicModals, browsingModals);
        this.context = dialog.context;
    }

    ngOnInit() {
        this.lang = this.context.lang;
        this.resourceClass = this.context.cls;
        this.selectCustomForm();
    }

    ngAfterViewInit() {
        this.inputToFocus.nativeElement.focus();
        setTimeout(() => {
            this.viewInitialized = true;
        });
    }

    private onLangChange(newLang: string) {
        setTimeout(() => {
            this.lang = newLang;
        });
    }

    changeClass() {
        this.changeClassWithRoot(this.context.cls);
    }

    isStandardFormDataValid(): boolean {
        return (this.label != undefined && this.label.trim() != "" && this.lang != null);
    }

    ok(event: Event) {
        event.stopPropagation();
        event.preventDefault();

        var entryMap: any = this.collectCustomFormData();

        var returnedData: { uriResource: ARTURIResource, label: ARTLiteral, cls: ARTURIResource, cfValue: CustomFormValue } = {
            uriResource: null,
            label: new ARTLiteral(this.label, null, this.lang),
            cls: null,
            cfValue: null
        }
        //Set URI only if localName is not empty
        if (this.uri != null && this.uri.trim() != "") {
            returnedData.uriResource = new ARTURIResource(this.uri);
        }
        //set class only if not the default
        if (this.resourceClass.getURI() != this.context.cls.getURI()) {
            returnedData.cls = this.resourceClass;
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