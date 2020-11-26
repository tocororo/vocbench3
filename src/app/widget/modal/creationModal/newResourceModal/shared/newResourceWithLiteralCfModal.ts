import { Component, Input } from "@angular/core";
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ARTLiteral, ARTURIResource } from "../../../../../models/ARTResources";
import { CustomFormValue } from "../../../../../models/CustomForms";
import { LanguageConstraint } from "../../../../../models/LanguagesCountries";
import { CustomFormsServices } from "../../../../../services/customFormsServices";
import { BasicModalServices } from "../../../basicModal/basicModalServices";
import { BrowsingModalServices } from "../../../browsingModal/browsingModalServices";
import { AbstractCustomConstructorModal } from "../abstractCustomConstructorModal";

@Component({
    selector: "new-resource-lit-cf-modal",
    templateUrl: "./newResourceWithLiteralCfModal.html",
})
export class NewResourceWithLiteralCfModal extends AbstractCustomConstructorModal {
    @Input() title: string;
    @Input() cls: ARTURIResource; //class that this modal is creating an instance
    @Input() clsChangeable: boolean = true;
    @Input() literalLabel: string = "Label";
    @Input() langConstraints: LanguageConstraint = { constrain: false, locale: true };

    viewInitialized: boolean = false; //in order to avoid ugly UI effect on the alert showed if no language is available

    //standard form
    label: string;
    @Input() lang: string;
    uri: string;

    constructor(public activeModal: NgbActiveModal, cfService: CustomFormsServices,
        basicModals: BasicModalServices, browsingModals: BrowsingModalServices) {
        super(cfService, basicModals, browsingModals);
    }

    ngOnInit() {
        this.resourceClass = this.cls;
        this.selectCustomForm();
    }

    ngAfterViewInit() {
        setTimeout(() => {
            this.viewInitialized = true;
        });
    }

    changeClass() {
        this.changeClassWithRoot(this.cls);
    }

    isStandardFormDataValid(): boolean {
        return (this.label != undefined && this.label.trim() != "" && this.lang != null);
    }

    okImpl() {
        var entryMap: any = this.collectCustomFormData();

        var returnedData: NewResourceWithLiteralCfModalReturnData = {
            uriResource: null,
            literal: new ARTLiteral(this.label, null, this.lang),
            cls: this.resourceClass,
            cfValue: null
        }
        //Set URI only if localName is not empty
        if (this.uri != null && this.uri.trim() != "") {
            returnedData.uriResource = new ARTURIResource(this.uri);
        }
        //set cfValue only if not null
        if (this.customFormId != null && entryMap != null) {
            returnedData.cfValue = new CustomFormValue(this.customFormId, entryMap);
        }
        this.activeModal.close(returnedData);
    }

    cancel() {
        this.activeModal.dismiss();
    }

}

export class NewResourceWithLiteralCfModalReturnData {
    uriResource: ARTURIResource;
    literal: ARTLiteral;
    cls: ARTURIResource;
    cfValue: CustomFormValue;
}