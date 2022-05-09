import { Component, Input } from "@angular/core";
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ARTURIResource } from "../../../../../models/ARTResources";
import { CustomFormValue } from "../../../../../models/CustomForms";
import { OWL, RDFS } from "../../../../../models/Vocabulary";
import { CustomFormsServices } from "../../../../../services/customFormsServices";
import { BasicModalServices } from "../../../basicModal/basicModalServices";
import { BrowsingModalServices } from "../../../browsingModal/browsingModalServices";
import { AbstractCustomConstructorModal } from "../abstractCustomConstructorModal";

@Component({
    selector: "new-resource-cf-modal",
    templateUrl: "./newResourceCfModal.html",
})
export class NewResourceCfModal extends AbstractCustomConstructorModal {
    @Input() title: string;
    @Input() cls: ARTURIResource; //class that this modal is creating
    @Input() clsChangeable: boolean = true;
    @Input() uriOptional: boolean; //if true the URI is optional and the resource URI will be generated randomically

    //standard form
    uri: string;

    constructor(public activeModal: NgbActiveModal, cfService: CustomFormsServices,
        basicModals: BasicModalServices, browsingModals: BrowsingModalServices) {
        super(cfService, basicModals, browsingModals);
    }

    ngOnInit() {
        this.resourceClass = this.cls;
        this.selectCustomForm();
    }

    changeClass() {
        let cls: ARTURIResource = this.cls;
        if (cls.getURI() == OWL.class.getURI()) {
            cls = RDFS.class;
        }
        this.changeClassWithRoot(cls);
    }

    isStandardFormDataValid(): boolean {
        /* 
        standard form valid if:
        - uri is valid whereas is mandatory
        - uri is optional 
        - the URI field is override by the custom form (attr hideStdResField)
        */
        return (this.uri != null && this.uri.trim() != "") || this.uriOptional || this.hideStdResField;
    }

    okImpl() {
        let entryMap: any = this.collectCustomFormData();

        let returnedData: NewResourceCfModalReturnData = {
            uriResource: null,
            cls: this.resourceClass,
            cfValue: null
        };
        //Set URI only if localName is not empty (this case is possible only if uriOptional is false)
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

export interface NewResourceCfModalReturnData {
    uriResource: ARTURIResource;
    cls: ARTURIResource;
    cfValue?: CustomFormValue
}