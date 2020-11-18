import { Component, Input } from "@angular/core";
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ARTLiteral, ARTURIResource } from "../../../../../models/ARTResources";
import { CustomFormValue } from "../../../../../models/CustomForms";
import { SKOS } from "../../../../../models/Vocabulary";
import { CustomFormsServices } from "../../../../../services/customFormsServices";
import { ResourcesServices } from "../../../../../services/resourcesServices";
import { VBContext } from "../../../../../utils/VBContext";
import { BasicModalServices } from "../../../basicModal/basicModalServices";
import { BrowsingModalServices } from "../../../browsingModal/browsingModalServices";
import { AbstractCustomConstructorModal } from "../abstractCustomConstructorModal";

@Component({
    selector: "new-concept-cf-modal",
    templateUrl: "./newConceptCfModal.html",
})
export class NewConceptCfModal extends AbstractCustomConstructorModal {

    @Input() title: string = "Modal title";
    @Input() broader: ARTURIResource;
    @Input() schemes: ARTURIResource[]; //in standard form
    @Input() cls: ARTURIResource;
    @Input() clsChangeable: boolean = true;
    @Input() lang: string;  //in standard form

    viewInitialized: boolean = false; //in order to avoid ugly UI effect on the alert showed if no language is available

    private broaderProp: ARTURIResource = SKOS.broader;

    //standard form
    label: string;
    uri: string;

    constructor(public activeModal: NgbActiveModal, private resourceService: ResourcesServices,
        cfService: CustomFormsServices, basicModals: BasicModalServices, browsingModals: BrowsingModalServices) {
        super(cfService, basicModals, browsingModals);
    }

    ngOnInit() {
        this.resourceClass = this.cls ? this.cls : SKOS.concept;
        this.selectCustomForm();

        if (this.broader) {
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
        setTimeout(() => {
            this.viewInitialized = true;
        });
    }

    onSchemesChanged(schemes: ARTURIResource[]) {
        this.schemes = schemes;
    }

    changeClass() {
        this.changeClassWithRoot(SKOS.concept);
    }

    changeBroaderProp() {
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

    okImpl() {
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
        
        this.activeModal.close(returnedData);
    }

    cancel() {
        this.activeModal.dismiss();
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