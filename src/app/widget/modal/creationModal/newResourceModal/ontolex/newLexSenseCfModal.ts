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
    selector: "new-ontolexicalization-cf-modal",
    templateUrl: "./newLexSenseCfModal.html",
})
export class NewLexSenseCfModal extends AbstractCustomConstructorModal {
    @Input() title: string;
    @Input() clsChangeable: boolean = true;


    nature: PromptedResourceNature = PromptedResourceNature.reference; //specify what is the resource to provide in the creation reference/lex.concept

    createPlainCheck: boolean = true;

    //standard form
    linkedResource: string;

    pickerRoles: RDFResourceRolesEnum[] = [RDFResourceRolesEnum.cls, RDFResourceRolesEnum.individual, RDFResourceRolesEnum.property,
        RDFResourceRolesEnum.concept, RDFResourceRolesEnum.conceptScheme, RDFResourceRolesEnum.skosCollection];

    constructor(public activeModal: NgbActiveModal, cfService: CustomFormsServices, basicModals: BasicModalServices, browsingModals: BrowsingModalServices) {
        super(cfService, basicModals, browsingModals);
    }

    ngOnInit() {
        this.resourceClass = OntoLex.lexicalSense;
        this.selectCustomForm();
    }

    changeClass() {
        this.changeClassWithRoot(OntoLex.lexicalSense);
    }

    pickLexicalConcept() {
        this.browsingModals.browseConceptTree({ key: "DATA.ACTIONS.SELECT_LEXICAL_CONCEPT" }).then(
            (res: ARTURIResource) => {
                this.linkedResource = res.getURI();
            }
        );
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
        let entryMap: any = this.collectCustomFormData();

        let returnedData: NewLexSenseCfModalReturnData = {
            linkedResource: new ARTURIResource(this.linkedResource),
            nature: this.nature,
            createPlain: this.createPlainCheck,
            cls: this.resourceClass,
            cfValue: null
        };
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

export class NewLexSenseCfModalReturnData {
    linkedResource: ARTURIResource; //lexicalEntry or reference
    nature: PromptedResourceNature;
    createPlain: boolean;
    cls: ARTURIResource;
    cfValue: CustomFormValue;
}

enum PromptedResourceNature {
    reference = "reference",
    lexConcept = "lexConcept"
}