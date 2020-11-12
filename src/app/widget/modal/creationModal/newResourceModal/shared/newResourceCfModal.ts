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
        return (this.uri != null && this.uri.trim() != "");
    }

    okImpl() {
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
        this.activeModal.close(returnedData);
    }

    cancel() {
        this.activeModal.dismiss();
    }

}