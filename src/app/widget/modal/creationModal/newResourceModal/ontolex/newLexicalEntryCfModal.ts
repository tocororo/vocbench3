import { Component, ViewChild, ElementRef } from "@angular/core";
import { BSModalContext } from 'ngx-modialog/plugins/bootstrap';
import { DialogRef, ModalComponent } from "ngx-modialog";
import { AbstractCustomConstructorModal } from "../abstractCustomConstructorModal"
import { CustomFormsServices } from "../../../../../services/customFormsServices"
import { ResourcesServices } from "../../../../../services/resourcesServices";
import { BasicModalServices } from "../../../basicModal/basicModalServices"
import { BrowsingModalServices } from "../../../browsingModal/browsingModalServices"
import { ARTLiteral, ARTURIResource } from "../../../../../models/ARTResources"
import { CustomFormValue } from "../../../../../models/CustomForms"
import { SKOS, OntoLex } from "../../../../../models/Vocabulary"
import { VBProperties } from "../../../../../utils/VBProperties";

export class NewLexicalEntryCfModalData extends BSModalContext {
    constructor(
        public title: string = "Modal title",
        public clsChangeable: boolean = true,
        public lang: string
    ) {
        super();
    }
}

@Component({
    selector: "new-lexical-entry-cf-modal",
    templateUrl: "./newLexicalEntryCfModal.html",
})
export class NewLexicalEntryCfModal extends AbstractCustomConstructorModal implements ModalComponent<NewLexicalEntryCfModalData> {
    context: NewLexicalEntryCfModalData;

    @ViewChild("toFocus") inputToFocus: ElementRef;

    private viewInitialized: boolean = false; //in order to avoid ugly UI effect on the alert showed if no language is available

    //standard form
    private label: string;
    private lang: string;
    private uri: string;

    constructor(public dialog: DialogRef<NewLexicalEntryCfModalData>, private vbProp: VBProperties, private resourceService: ResourcesServices,
        cfService: CustomFormsServices, basicModals: BasicModalServices, browsingModals: BrowsingModalServices) {
        super(cfService, basicModals, browsingModals);
        this.context = dialog.context;
    }

    ngOnInit() {
        this.lang = this.context.lang;
        this.resourceClass = OntoLex.lexicalEntry;
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
        this.changeClassWithRoot(OntoLex.lexicalEntry);
    }

    isStandardFormDataValid(): boolean {
        return (this.label != undefined && this.label.trim() != "" && this.lang != null);
    }

    ok(event: Event) {
        event.stopPropagation();
        event.preventDefault();

        var entryMap: any = this.collectCustomFormData();

        var returnedData: NewLexicalEntryCfModalReturnData = {
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
        if (this.resourceClass.getURI() != SKOS.concept.getURI()) {
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

export class NewLexicalEntryCfModalReturnData {
    uriResource: ARTURIResource;
    label: ARTLiteral;
    cls: ARTURIResource
    cfValue: CustomFormValue;
}