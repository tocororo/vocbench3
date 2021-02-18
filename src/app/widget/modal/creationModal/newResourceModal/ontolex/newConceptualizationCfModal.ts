import { Component, Input } from "@angular/core";
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ARTURIResource, RDFResourceRolesEnum } from "../../../../../models/ARTResources";
import { CustomFormValue } from "../../../../../models/CustomForms";
import { OntoLex } from "../../../../../models/Vocabulary";
import { CustomFormsServices } from "../../../../../services/customFormsServices";
import { BasicModalServices } from "../../../basicModal/basicModalServices";
import { BrowsingModalServices } from "../../../browsingModal/browsingModalServices";
import { AbstractCustomConstructorModal } from "../abstractCustomConstructorModal";

@Component({
    selector: "new-conceptualization-cf-modal",
    templateUrl: "./newConceptualizationCfModal.html",
})
export class NewConceptualizationCfModal extends AbstractCustomConstructorModal {
    @Input() title: string;
    @Input() clsChangeable: boolean = true;

    //standard form
    private linkedResource: string;
    pickerRoles: RDFResourceRolesEnum[] = [RDFResourceRolesEnum.concept];

    createPlainCheck: boolean = true;

    constructor(public activeModal: NgbActiveModal, cfService: CustomFormsServices,
        basicModals: BasicModalServices, browsingModals: BrowsingModalServices) {
        super(cfService, basicModals, browsingModals);
    }

    ngOnInit() {
        this.resourceClass = OntoLex.lexicalSense;
        this.selectCustomForm();
    }

    changeClass() {
        this.changeClassWithRoot(OntoLex.lexicalSense);
    }

    updateLinkedRes(res: ARTURIResource) {
        if (res != null) {
            this.linkedResource = res.getURI();
        } else {
            this.linkedResource = null;
        }
    }

    isStandardFormDataValid(): boolean {
        return (this.linkedResource != null && this.linkedResource.trim() != "");
    }

    okImpl() {
        var entryMap: any = this.collectCustomFormData();

        var returnedData: NewConceptualizationCfModalReturnData = {
            linkedResource: new ARTURIResource(this.linkedResource),
            createPlain: this.createPlainCheck,
            cls: this.resourceClass,
            cfValue: null
        }
        //set class only if not the default
        if (this.resourceClass.getURI() != OntoLex.lexicalSense.getURI()) {
            returnedData.cls = this.resourceClass;
        }
        //set cfValue only if not null and only if it's creating a sense (that is a reified lexicalizaion, CF doesn't make sense for a plain lexicalization)
        if (this.customFormId != null && entryMap != null) {
            returnedData.cfValue = new CustomFormValue(this.customFormId, entryMap);
        }
        this.activeModal.close(returnedData);
    }

    cancel() {
        this.activeModal.dismiss();
    }

}

export class NewConceptualizationCfModalReturnData {
    linkedResource: ARTURIResource; //lexicalEntry or reference
    createPlain: boolean;
    cls: ARTURIResource
    cfValue: CustomFormValue;
}