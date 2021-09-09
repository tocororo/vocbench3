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
    templateUrl: "./newOntoLexicalizationCfModal.html",
})
export class NewOntoLexicalizationCfModal extends AbstractCustomConstructorModal {
    @Input() title: string;
    @Input() lexicalizationProp: ARTURIResource; //(OntoLex.senses | OntoLex.denotes | Ontolex.isDenotedBy)
    @Input() clsChangeable: boolean = true;


    /*
    - ontolex:denotes => ask for Reference; checkbox "create sense"
    - ontolex:isDenotedBy => ask for Lexical Entry; checkbox "create sense"
    - ontolex:sense => ask for Reference OR Lexical Concept; checkbox "create plain"
    */
    showReference: boolean;
    showLexEntry: boolean;

    creatingSense: boolean; //tells if the modal is used for creating a lexical sense (enriching ontolex:sense)

    scenario: CreationScenario; //specify what is the resource to provide in the creation

    createSenseCheck: boolean = true;
    createPlainCheck: boolean = true;

    //standard form
    private linkedResource: string;

    pickerRoles: RDFResourceRolesEnum[] = [RDFResourceRolesEnum.cls, RDFResourceRolesEnum.individual, RDFResourceRolesEnum.property, 
        RDFResourceRolesEnum.concept, RDFResourceRolesEnum.conceptScheme, RDFResourceRolesEnum.skosCollection];

    constructor(public activeModal: NgbActiveModal, cfService: CustomFormsServices,
        basicModals: BasicModalServices, browsingModals: BrowsingModalServices) {
        super(cfService, basicModals, browsingModals);
    }

    ngOnInit() {
        this.resourceClass = OntoLex.lexicalSense;

        if (this.lexicalizationProp.getURI() == OntoLex.denotes.getURI()) {
            this.scenario = CreationScenario.reference;
            this.showReference = true;
            this.creatingSense = false;
        } else if (this.lexicalizationProp.getURI() == OntoLex.isDenotedBy.getURI()) {
            this.scenario = CreationScenario.lexEntry;
            this.showLexEntry = true;
            this.creatingSense = false;
        } else if (this.lexicalizationProp.getURI() == OntoLex.sense.getURI()) {
            this.scenario = CreationScenario.reference;
            this.creatingSense = true;
        }

        this.selectCustomForm();
    }

    changeClass() {
        this.changeClassWithRoot(OntoLex.lexicalSense);
    }

    pickLexicalEntry() {
        this.browsingModals.browseLexicalEntryList({key:"DATA.ACTIONS.SELECT_LEXICAL_ENTRY"}).then(
            (lexEntry: ARTURIResource) => {
                this.linkedResource = lexEntry.getURI();
            }
        )
    }

    pickLexicalConcept() {
        this.browsingModals.browseConceptTree({key:"DATA.ACTIONS.SELECT_LEXICAL_ENTRY"}).then(
            (lexEntry: ARTURIResource) => {
                this.linkedResource = lexEntry.getURI();
            }
        )
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

        let returnedData: NewOntoLexicalizationCfModalReturnData = {
            linkedResource: new ARTURIResource(this.linkedResource),
            createPlain: this.createPlainCheck,
            createSense: this.createSenseCheck,
            cls: this.resourceClass,
            cfValue: null
        }
        //set class only if not the default
        if (this.resourceClass.getURI() != OntoLex.lexicalSense.getURI()) {
            returnedData.cls = this.resourceClass;
        }
        //set cfValue only if not null and only if it's creating a sense (that is a reified lexicalizaion, CF doesn't make sense for a plain lexicalization)
        if (this.creatingSense && this.customFormId != null && entryMap != null) {
            returnedData.cfValue = new CustomFormValue(this.customFormId, entryMap);
        }
        this.activeModal.close(returnedData);
    }

    cancel() {
        this.activeModal.dismiss();
    }

}

export class NewOntoLexicalizationCfModalReturnData {
    linkedResource: ARTURIResource; //lexicalEntry or reference
    createPlain: boolean;
    createSense: boolean;
    cls: ARTURIResource
    cfValue: CustomFormValue;
}

enum CreationScenario {
    reference = "reference", //ontolex:denotes and ontolex:sense
    lexEntry = "lexEntry", //ontolex:isDenotedBy
    lexConcept = "lexConcept" //ontolex:sense
}