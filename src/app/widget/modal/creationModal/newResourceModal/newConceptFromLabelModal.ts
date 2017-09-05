import { Component, ViewChild, ElementRef } from "@angular/core";
import { BSModalContext } from 'angular2-modal/plugins/bootstrap';
import { DialogRef, ModalComponent } from "angular2-modal";
import { AbstractCustomConstructorModal } from "./abstractCustomConstructorModal";
import { CustomFormsServices } from "../../../../services/customFormsServices";
import { SkosServices } from "../../../../services/skosServices";
import { BasicModalServices } from "../../basicModal/basicModalServices";
import { BrowsingModalServices } from "../../browsingModal/browsingModalServices";
import { CustomForm, FormField } from "../../../../models/CustomForms";
import { ARTLiteral, ARTURIResource, ARTResource } from "../../../../models/ARTResources";
import { VBProperties } from "../../../../utils/VBProperties";

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

    private positionList: string[] = [SpawnPosition.AS_TOP_CONCEPT, SpawnPosition.AS_NARROWER, SpawnPosition.AS_SIBLING];
    private position: string = this.positionList[0];
    //param for position: AS_NARROWER
    private broader: ARTURIResource;
    //param for position: AS_SIBLING
    private sibling: ARTURIResource;
    private siblingBroaders: ARTURIResource[];
    private selectedSiblingBroader: ARTURIResource;
    private multipleSiblingBroaders: boolean;

    private schemes: ARTURIResource[];

    constructor(public dialog: DialogRef<NewConceptFromLabelModalData>, private skosService: SkosServices, private vbProp: VBProperties,
        cfService: CustomFormsServices, basicModals: BasicModalServices, browsingModals: BrowsingModalServices) {
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
        if (this.isPositionSibling()) {
            if (this.sibling == null || (this.multipleSiblingBroaders && this.selectedSiblingBroader == null)) {
                return false;
            }
        }
        if (this.schemes == null || this.schemes.length == 0) {
            return false;
        }
        return true;
    }

    //when position select changes, reset the parameters for broader/sibling...
    private onPositionChange() {
        this.broader = null;
        this.sibling = null;
        this.siblingBroaders = null;
        this.selectedSiblingBroader = null;
        this.multipleSiblingBroaders = false;
    }

    /**
     * Tells if selected position option is "Child of existing Concept", so the modal is creating a narrower.
     * Useful to show in the view the broader selection field
     */
    private isPositionNarrower(): boolean {
        return this.position == SpawnPosition.AS_NARROWER;
    }

    private selectBroader() {
        this.browsingModals.browseConceptTree("Select broader").then(
            (concept: any) => {
                this.broader = concept;
            },
            () => {}
        )
    }

    /**
     * Tells if selected position option is "Sibling of existing Concept", so the modal is creating a sibling.
     * Useful to show in the view the sibling selection field
     */
    private isPositionSibling(): boolean {
        return this.position == SpawnPosition.AS_SIBLING;
    }

    private selectSibling() {
        this.browsingModals.browseConceptTree("Select sibling").then(
            (concept: any) => {
                this.sibling = concept;
                //check if sibling has multiple broader
                this.skosService.getBroaderConcepts(this.sibling, this.vbProp.getActiveSchemes()).subscribe(
                    broaders => {
                        if (broaders.length == 0) { //sibling is top concept
                            this.selectedSiblingBroader = null;
                        } else if (broaders.length == 1) { //just one broader
                            this.selectedSiblingBroader = broaders[0];
                        } else { //multiple broaders
                            this.multipleSiblingBroaders = true;
                            this.siblingBroaders = broaders;
                            this.selectedSiblingBroader = null;
                        }
                    }
                )
            },
            () => {}
        )
    }

    ok(event: Event) {
        event.stopPropagation();
        event.preventDefault();

        var entryMap: any = this.collectCustomFormData();

        var returnedData: { uriResource: ARTURIResource, broader: ARTURIResource, cls: ARTURIResource, schemes: ARTURIResource[], cfId: string, cfValueMap: any} = {
            uriResource: null,
            broader: null,
            cls: null,
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
        if (this.isPositionSibling()) {
            returnedData.broader = this.selectedSiblingBroader;
        }
        //set class only if not the default
        if (this.resourceClass.getURI() != this.context.cls.getURI()) {
            returnedData.cls = this.resourceClass;
        }
        this.dialog.close(returnedData);
    }

    cancel() {
        this.dialog.dismiss();
    }

}

class SpawnPosition {
    public static AS_TOP_CONCEPT: string = "Top Concept";
    public static AS_NARROWER: string = "Child of existing Concept";
    public static AS_SIBLING: string = "Sibling of existing Concept";
}