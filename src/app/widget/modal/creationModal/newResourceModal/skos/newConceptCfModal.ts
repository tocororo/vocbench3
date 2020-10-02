import { Component, ElementRef, ViewChild } from "@angular/core";
import { DialogRef, ModalComponent } from "ngx-modialog";
import { BSModalContext } from 'ngx-modialog/plugins/bootstrap';
import { ARTLiteral, ARTURIResource } from "../../../../../models/ARTResources";
import { CustomFormValue } from "../../../../../models/CustomForms";
import { SKOS } from "../../../../../models/Vocabulary";
import { CustomFormsServices } from "../../../../../services/customFormsServices";
import { ResourcesServices } from "../../../../../services/resourcesServices";
import { VBContext } from "../../../../../utils/VBContext";
import { BasicModalServices } from "../../../basicModal/basicModalServices";
import { BrowsingModalServices } from "../../../browsingModal/browsingModalServices";
import { AbstractCustomConstructorModal } from "../abstractCustomConstructorModal";

export class NewConceptCfModalData extends BSModalContext {
    constructor(
        public title: string = "Modal title",
        public broader: ARTURIResource,
        public schemes: ARTURIResource[],
        public cls: ARTURIResource,
        public clsChangeable: boolean = true,
        public lang: string
    ) {
        super();
    }
}

@Component({
    selector: "new-concept-cf-modal",
    templateUrl: "./newConceptCfModal.html",
})
export class NewConceptCfModal extends AbstractCustomConstructorModal implements ModalComponent<NewConceptCfModalData> {
    context: NewConceptCfModalData;

    @ViewChild("toFocus") inputToFocus: ElementRef;

    private viewInitialized: boolean = false; //in order to avoid ugly UI effect on the alert showed if no language is available

    private broaderProp: ARTURIResource = SKOS.broader;

    //standard form
    private label: string;
    private lang: string;
    private uri: string;
    private schemes: ARTURIResource[];

    constructor(public dialog: DialogRef<NewConceptCfModalData>, private resourceService: ResourcesServices,
        cfService: CustomFormsServices, basicModals: BasicModalServices, browsingModals: BrowsingModalServices) {
        super(cfService, basicModals, browsingModals);
        this.context = dialog.context;
    }

    ngOnInit() {
        this.lang = this.context.lang;
        this.resourceClass = this.context.cls ? this.context.cls : SKOS.concept;
        this.selectCustomForm();

        if (this.context.broader) {
            let broaderPropUri = VBContext.getWorkingProjectCtx().getProjectPreferences().conceptTreePreferences.baseBroaderUri;
            if (broaderPropUri != SKOS.broader.getURI()) {
                this.resourceService.getResourceDescription(new ARTURIResource(broaderPropUri)).subscribe(
                    res => {
                        this.broaderProp = <ARTURIResource>res;
                    }
                );
            }
        }
    }

    ngAfterViewInit() {
        this.inputToFocus.nativeElement.focus();
        setTimeout(() => {
            this.viewInitialized = true;
        });
    }

    private onSchemesChanged(schemes: ARTURIResource[]) {
        this.schemes = schemes;
    }

    changeClass() {
        this.changeClassWithRoot(SKOS.concept);
    }

    private changeBroaderProp() {
        this.browsingModals.browsePropertyTree("Change property", [SKOS.broader]).then(
            (selectedProp: ARTURIResource) => {
                this.broaderProp = selectedProp;
            },
            () => { }
        );
    }

    isStandardFormDataValid(): boolean {
        return (this.label != undefined && this.label.trim() != "" && this.lang != null &&
            this.schemes != null && this.schemes.length > 0);
    }

    okImpl(event: Event) {
        event.stopPropagation();
        event.preventDefault();

        var entryMap: any = this.collectCustomFormData();

        var returnedData: NewConceptCfModalReturnData = {
            uriResource: null,
            label: new ARTLiteral(this.label, null, this.lang),
            cls: this.resourceClass,
            broaderProp: null,
            schemes: this.schemes,
            cfValue: null
        }
        //Set URI only if localName is not empty
        if (this.uri != null && this.uri.trim() != "") {
            returnedData.uriResource = new ARTURIResource(this.uri);
        }
        //set broaderProp only if not the default
        if (this.broaderProp.getURI() != SKOS.broader.getURI()) {
            returnedData.broaderProp = this.broaderProp;
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

export class NewConceptCfModalReturnData {
    uriResource: ARTURIResource;
    label: ARTLiteral;
    cls: ARTURIResource
    broaderProp: ARTURIResource;
    schemes: ARTURIResource[];
    cfValue: CustomFormValue;
}