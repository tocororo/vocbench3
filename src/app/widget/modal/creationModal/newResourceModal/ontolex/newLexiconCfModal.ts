import { Component, ViewChild, ElementRef } from "@angular/core";
import { BSModalContext } from 'ngx-modialog/plugins/bootstrap';
import { DialogRef, ModalComponent } from "ngx-modialog";
import { AbstractCustomConstructorModal } from "../abstractCustomConstructorModal";
import { CustomFormsServices } from "../../../../../services/customFormsServices";
import { BrowsingModalServices } from "../../../browsingModal/browsingModalServices";
import { BasicModalServices } from "../../../basicModal/basicModalServices";
import { ARTLiteral, ARTURIResource } from "../../../../../models/ARTResources";
import { CustomFormValue } from "../../../../../models/CustomForms";
import { OWL, RDFS, Lime } from "../../../../../models/Vocabulary";

export class NewLexiconCfModalData extends BSModalContext {
    constructor(
        public title: string = "Modal title",
        public clsChangeable: boolean = false, //currently is not possible to specify the Lexicon class in the service, so disallow class change
    ) {
        super();
    }
}

@Component({
    selector: "new-lexicon-cf-modal",
    templateUrl: "./newLexiconCfModal.html",
})
export class NewLexiconCfModal extends AbstractCustomConstructorModal implements ModalComponent<NewLexiconCfModalData> {
    context: NewLexiconCfModalData;

    @ViewChild("toFocus") inputToFocus: ElementRef;

    //standard form
    private title: string;
    private title_lang: string;
    private lang: string;
    private uri: string;

    private viewInitialized: boolean = false; //in order to avoid ugly UI effect on the alert showed if no language is available

    constructor(public dialog: DialogRef<NewLexiconCfModalData>, cfService: CustomFormsServices,
        basicModals: BasicModalServices, browsingModals: BrowsingModalServices) {
        super(cfService, basicModals, browsingModals);
        this.context = dialog.context;
    }

    ngOnInit() {
        this.resourceClass = Lime.lexicon;
        this.selectCustomForm();
    }

    ngAfterViewInit() {
        this.inputToFocus.nativeElement.focus();
        setTimeout(() => {
            this.viewInitialized = true;
        });
    }

    private onTitleLangChange(newLang: string) {
        setTimeout(() => {
            this.title_lang = newLang;
        });
    }

    private onLangChange(newLang: string) {
        setTimeout(() => {
            this.lang = newLang;
        });
    }

    changeClass() {
        this.changeClassWithRoot(Lime.lexicon);
    }

    isStandardFormDataValid(): boolean {
        return (this.title != undefined && this.title.trim() != "" && this.title_lang != null && this.lang != null);
    }

    ok(event: Event) {
        event.stopPropagation();
        event.preventDefault();

        var entryMap: any = this.collectCustomFormData();

        var returnedData: NewLexiconCfModalReturnData = {
            uriResource: null,
            title: new ARTLiteral(this.title, null, this.title_lang),
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
        
        this.dialog.close(returnedData);

    }

    cancel() {
        this.dialog.dismiss();
    }

}

export class NewLexiconCfModalReturnData {
    uriResource: ARTURIResource;
    title: ARTLiteral;
    cls: ARTURIResource
    language: string;
    cfValue: CustomFormValue;
}