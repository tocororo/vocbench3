import { Component, ViewChild, ElementRef } from "@angular/core";
import { BSModalContext } from 'angular2-modal/plugins/bootstrap';
import { DialogRef, ModalComponent } from "angular2-modal";
import { AbstractCustomConstructorModal } from "./abstractCustomConstructorModal"
import { CustomFormsServices } from "../../../../services/customFormsServices"
import { BasicModalServices } from "../../basicModal/basicModalServices"
import { BrowsingModalServices } from "../../browsingModal/browsingModalServices"
import { CustomForm, FormField } from "../../../../models/CustomForms"
import { ARTLiteral, ARTURIResource, ARTResource } from "../../../../models/ARTResources"

export class NewConceptFromLabelModalData extends BSModalContext {
    constructor(
        public title: string = "Modal title",
        public xLabel: ARTResource,
        public cls: ARTURIResource, //class that this modal is creating
        public clsChangeable: boolean = true,
    ) {
        super();
    }
}

@Component({
    selector: "new-concept-from-label-modal",
    templateUrl: "./newConceptFromLabelModal.html",
})
export class NewConceptFromLabelModal extends AbstractCustomConstructorModal implements ModalComponent<NewConceptFromLabelModalData> {
    context: NewConceptFromLabelModalData;

    //standard form
    private uri: string;

    private positionList: string[] = ["Top Concept", "Child of existing Concept"];
    private position: string = this.positionList[0];
    private broader: ARTURIResource;

    private schemes: ARTURIResource[];

    constructor(public dialog: DialogRef<NewConceptFromLabelModalData>, cfService: CustomFormsServices,
        basicModals: BasicModalServices, browsingModals: BrowsingModalServices) {
        super(cfService, basicModals, browsingModals)
        this.context = dialog.context;
    }

    ngOnInit() {
        this.resourceClass = this.context.cls;
        this.selectCustomForm();
    }

    changeClass() {
        this.changeClassWithRoot(this.context.cls);
    }

    private onSchemesChanged(schemes: ARTURIResource[]) {
        this.schemes = schemes;
    }

    isStandardFormDataValid(): boolean {
        if (this.isPositionNarrower()) {
            if (this.broader == null) {
                return false;
            }
        }
        if (this.schemes == null || this.schemes.length == 0) {
            return false;
        }
        return true;
    }

    /**
     * Tells if selected position option is "Child of existing Concept", so the modal is creating a narrower.
     * Useful to show in the view the broader selection field
     */
    private isPositionNarrower(): boolean {
        return this.position == this.positionList[1];
    }

    private selectBroader() {
        this.browsingModals.browseConceptTree("Select broader").then(
            (concept: any) => {
                this.broader = concept;
            }
        )
    }

    ok(event: Event) {
        event.stopPropagation();
        event.preventDefault();

        var entryMap: any = this.collectCustomFormData();

        var returnedData: { uriResource: ARTURIResource, broader: ARTURIResource, cls: ARTURIResource, schemes: ARTURIResource[], cfId: string, cfValueMap: any} = {
            uriResource: null,
            broader: null,
            cls: this.resourceClass,
            schemes: this.schemes,
            cfId: this.customFormId,
            cfValueMap: entryMap
        }
        //Set URI only if not empty
        if (this.uri != null && this.uri.trim() != "") {
            returnedData.uriResource = new ARTURIResource(this.uri);
        }
        //set broader only if position in "Child of existing Concept"
        if (this.isPositionNarrower()) {
            returnedData.broader = this.broader;
        }
        this.dialog.close(returnedData);
    }

    cancel() {
        this.dialog.dismiss();
    }

}