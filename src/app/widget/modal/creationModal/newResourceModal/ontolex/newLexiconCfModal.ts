import { Component, Input } from "@angular/core";
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ARTLiteral, ARTURIResource } from "../../../../../models/ARTResources";
import { CustomFormValue } from "../../../../../models/CustomForms";
import { Lime } from "../../../../../models/Vocabulary";
import { CustomFormsServices } from "../../../../../services/customFormsServices";
import { BasicModalServices } from "../../../basicModal/basicModalServices";
import { BrowsingModalServices } from "../../../browsingModal/browsingModalServices";
import { AbstractCustomConstructorModal } from "../abstractCustomConstructorModal";

@Component({
    selector: "new-lexicon-cf-modal",
    templateUrl: "./newLexiconCfModal.html",
})
export class NewLexiconCfModal extends AbstractCustomConstructorModal {
    @Input() title: string;
    @Input() clsChangeable: boolean = false; //currently is not possible to specify the Lexicon class in the service, so disallow class change

    //standard form
    lex_title: string;
    title_lang: string;
    lang: string;
    uri: string;

    viewInitialized: boolean = false; //in order to avoid ugly UI effect on the alert showed if no language is available

    constructor(public activeModal: NgbActiveModal, cfService: CustomFormsServices,
        basicModals: BasicModalServices, browsingModals: BrowsingModalServices) {
        super(cfService, basicModals, browsingModals);
    }

    ngOnInit() {
        this.resourceClass = Lime.lexicon;
        this.selectCustomForm();
    }

    ngAfterViewInit() {
        setTimeout(() => {
            this.viewInitialized = true;
        });
    }

    changeClass() {
        this.changeClassWithRoot(Lime.lexicon);
    }

    isStandardFormDataValid(): boolean {
        return (this.lex_title != undefined && this.lex_title.trim() != "" && this.title_lang != null && this.lang != null);
    }

    okImpl() {
        var entryMap: any = this.collectCustomFormData();

        var returnedData: NewLexiconCfModalReturnData = {
            uriResource: null,
            title: new ARTLiteral(this.lex_title, null, this.title_lang),
            language: this.lang,
            cls: null,
            cfValue: null
        }
        //Set URI only if localName is not empty
        if (this.uri != null && this.uri.trim() != "") {
            returnedData.uriResource = new ARTURIResource(this.uri);
        }
        //set class only if not the default (currently disabled since is not possible to create instance of subclass of lime:Lexicon)
        // if (this.resourceClass.getURI() != Lime.lexicon.getURI()) {
        //     returnedData.cls = this.resourceClass;
        // }
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

export class NewLexiconCfModalReturnData {
    uriResource: ARTURIResource;
    title: ARTLiteral;
    cls: ARTURIResource
    language: string;
    cfValue: CustomFormValue;
}