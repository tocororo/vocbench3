import { Component, ElementRef, ViewChild } from "@angular/core";
import { DialogRef, ModalComponent } from "ngx-modialog";
import { BSModalContext } from 'ngx-modialog/plugins/bootstrap';
import { ARTLiteral, ARTURIResource } from "../../../../../models/ARTResources";
import { CustomFormValue } from "../../../../../models/CustomForms";
import { LanguageConstraint } from "../../../../../models/LanguagesCountries";
import { CustomFormsServices } from "../../../../../services/customFormsServices";
import { BasicModalServices } from "../../../basicModal/basicModalServices";
import { BrowsingModalServices } from "../../../browsingModal/browsingModalServices";
import { AbstractCustomConstructorModal } from "../abstractCustomConstructorModal";

export class NewResourceWithLiteralCfModalData extends BSModalContext {
    constructor(
        public title: string = "Modal title",
        public cls: ARTURIResource, //class that this modal is creating an instance
        public clsChangeable: boolean = true,
        public literalLabel: string = "Label",
        public lang: string,
        public langConstraints: LanguageConstraint = {
            constrain: false, //if true, constrains the selection of language only to the passed lang
            locale: true, //if false, forbids the selection  of locales of the passed lang
        },
    ) {
        super();
    }
}

@Component({
    selector: "new-resource-lit-cf-modal",
    templateUrl: "./newResourceWithLiteralCfModal.html",
})
export class NewResourceWithLiteralCfModal extends AbstractCustomConstructorModal implements ModalComponent<NewResourceWithLiteralCfModalData> {
    context: NewResourceWithLiteralCfModalData;

    @ViewChild("toFocus") inputToFocus: ElementRef;
    
    private viewInitialized: boolean = false; //in order to avoid ugly UI effect on the alert showed if no language is available

    //standard form
    private label: string;
    private lang: string;
    private uri: string;

    constructor(public dialog: DialogRef<NewResourceWithLiteralCfModalData>, cfService: CustomFormsServices,
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

        var returnedData: NewResourceWithLiteralCfModalReturnData = {
            uriResource: null,
            literal: new ARTLiteral(this.label, null, this.lang),
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

export class NewResourceWithLiteralCfModalReturnData {
    uriResource: ARTURIResource;
    literal: ARTLiteral;
    cls: ARTURIResource;
    cfValue: CustomFormValue;
}