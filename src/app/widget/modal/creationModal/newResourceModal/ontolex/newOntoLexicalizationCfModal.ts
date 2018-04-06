import { Component } from "@angular/core";
import { BSModalContext } from 'ngx-modialog/plugins/bootstrap';
import { DialogRef, ModalComponent } from "ngx-modialog";
import { AbstractCustomConstructorModal } from "../abstractCustomConstructorModal";
import { CustomFormsServices } from "../../../../../services/customFormsServices";
import { BrowsingModalServices } from "../../../browsingModal/browsingModalServices";
import { BasicModalServices } from "../../../basicModal/basicModalServices";
import { ARTLiteral, ARTURIResource, RDFResourceRolesEnum } from "../../../../../models/ARTResources";
import { CustomFormValue } from "../../../../../models/CustomForms";
import { OntoLex } from "../../../../../models/Vocabulary";

export class NewOntoLexicalizationCfModalData extends BSModalContext {
    constructor(
        public title: string = "Modal title",
        public lexicalizationProp: ARTURIResource, //(OntoLex.senses | OntoLex.denotes | Ontolex.isDenotedBy)
        public clsChangeable: boolean = true,
    ) {
        super();
    }
}

@Component({
    selector: "new-ontolexicalization-cf-modal",
    templateUrl: "./newOntoLexicalizationCfModal.html",
})
export class NewOntoLexicalizationCfModal extends AbstractCustomConstructorModal implements ModalComponent<NewOntoLexicalizationCfModalData> {
    context: NewOntoLexicalizationCfModalData;

    //standard form
    private linkedResource: string;

    private createPlainCheck: boolean = true;
    private createSenseCheck: boolean = true;

    /**
     * true if the modal should allow to link a lexical entry to a reference (show the reference input field),
     * false if it should allow to link a resource to a lexical entry (show the lexical entry input field).
     */
    private linkToReference: boolean;
    /**
     * true if the modal should allow to create a LexicalSense (show the "create plain" checkbox),
     * false if it should allow to create a plain lexicalization (show the "create sense" checkbox).
     */
    private createSense: boolean;

    constructor(public dialog: DialogRef<NewOntoLexicalizationCfModalData>, cfService: CustomFormsServices,
        basicModals: BasicModalServices, browsingModals: BrowsingModalServices) {
        super(cfService, basicModals, browsingModals);
        this.context = dialog.context;
    }

    ngOnInit() {
        this.resourceClass = OntoLex.lexicalSense;

        if (this.context.lexicalizationProp.getURI() == OntoLex.isDenotedBy.getURI()) {
            this.linkToReference = false;
            this.createSense = false;
        } else if (this.context.lexicalizationProp.getURI() == OntoLex.sense.getURI()) {
            this.linkToReference = true;
            this.createSense = true;
        } else if (this.context.lexicalizationProp.getURI() == OntoLex.denotes.getURI()) {
            this.linkToReference = true;
            this.createSense = false;
        }

        this.selectCustomForm();
    }

    changeClass() {
        this.changeClassWithRoot(OntoLex.lexicalSense);
    }

    private pickResource(role: RDFResourceRolesEnum) {
        if (role == RDFResourceRolesEnum.cls) {
            this.browsingModals.browseClassTree("Select a Class").then(
                (selectedResource: ARTURIResource) => {
                    this.linkedResource = selectedResource.getURI();
                },
                () => { }
            );
        } else if (role == RDFResourceRolesEnum.individual) {
            this.browsingModals.browseClassIndividualTree("Select an Instance").then(
                (selectedResource: ARTURIResource) => {
                    this.linkedResource = selectedResource.getURI();
                },
                () => { }
            );
        } else if (role == RDFResourceRolesEnum.concept) {
            this.browsingModals.browseConceptTree("Select a Concept").then(
                (selectedResource: ARTURIResource) => {
                    this.linkedResource = selectedResource.getURI();
                },
                () => { }
            );
        } else if (role == RDFResourceRolesEnum.conceptScheme) {
            this.browsingModals.browseSchemeList("Select a ConceptScheme").then(
                (selectedResource: ARTURIResource) => {
                    this.linkedResource = selectedResource.getURI();
                },
                () => { }
            );
        } else if (role == RDFResourceRolesEnum.skosCollection) {
            this.browsingModals.browseCollectionTree("Select a Collection").then(
                (selectedResource: ARTURIResource) => {
                    this.linkedResource = selectedResource.getURI();
                },
                () => { }
            );
        } else if (role == RDFResourceRolesEnum.property) {
            this.browsingModals.browsePropertyTree("Select a Property").then(
                (selectedResource: ARTURIResource) => {
                    this.linkedResource = selectedResource.getURI();
                },
                () => { }
            );
        } else if (role == RDFResourceRolesEnum.ontolexLexicalEntry) {
            this.browsingModals.browseLexicalEntryList("Select a LexicalEntry", null, true).then(
                (selectedResource: ARTURIResource) => {
                    this.linkedResource = selectedResource.getURI();
                },
                () => { }
            );
        }
        
    }

    isStandardFormDataValid(): boolean {
        if (this.linkToReference) {
            return (this.linkedResource != null && this.linkedResource.trim() != "");
        } else {
            return (this.linkedResource != null && this.linkedResource.trim() != "");
        }
    }

    ok(event: Event) {
        event.stopPropagation();
        event.preventDefault();

        var entryMap: any = this.collectCustomFormData();

        var returnedData: NewOntoLexicalizationCfModalReturnData = {
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
        if (this.createSense && this.customFormId != null && entryMap != null) {
            returnedData.cfValue = new CustomFormValue(this.customFormId, entryMap);
        }
        this.dialog.close(returnedData);
    }

    cancel() {
        this.dialog.dismiss();
    }

}

export class NewOntoLexicalizationCfModalReturnData {
    linkedResource: ARTURIResource; //lexicalEntry or reference
    createPlain: boolean;
    createSense: boolean;
    cls: ARTURIResource
    cfValue: CustomFormValue;
}