import {Component} from "@angular/core";
import {BSModalContext} from 'angular2-modal/plugins/bootstrap';
import {DialogRef, ModalComponent} from "angular2-modal";
import {CustomRangeServices} from "../../services/customRangeServices";
import {RdfResourceComponent} from "../../widget/rdfResource/rdfResourceComponent";
import {BrowsingServices} from "../../widget/modal/browsingModal/browsingServices";
import {ARTURIResource} from "../../utils/ARTResources";

/**
 * Useless class with empty data
 * (I need this cause currently I don't know how to create a Custom Modal without context data)
 */
export class CustomRangePropMappingModalData extends BSModalContext {
    constructor() {
        super();
    }
}

@Component({
    selector: "cr-prop-mapping-modal",
    templateUrl: "app/src/customRanges/customRangeConfigModals/crPropMappingModal.html",
    providers: [BrowsingServices],
    directives: [RdfResourceComponent]
})
export class CustomRangePropMappingModal implements ModalComponent<CustomRangePropMappingModalData> {
    context: CustomRangePropMappingModalData;
    
    private customRangeList: Array<string>;
    private selectedProperty: ARTURIResource;
    private selectedCR: string;
    
    constructor(public dialog: DialogRef<CustomRangePropMappingModalData>, private crService: CustomRangeServices,
        private browsingService: BrowsingServices) {
        this.context = dialog.context;
    }
    
    ngOnInit() {
        this.crService.getAllCustomRanges().subscribe(
            crList => {
                this.customRangeList = crList;
            }
        );
        
        document.getElementById("toFocus").focus();
    }
    
    private selectProperty() {
        this.browsingService.browsePropertyTree("Select a property").then(
            prop => {
                this.selectedProperty = prop;
            },
            () => {}
        )
    }
    
    private selectCR(customRange: string) {
        this.selectedCR = customRange;
    }
    
    ok(event) {
        this.crService.addCustomRangeToProperty(this.selectedCR, this.selectedProperty).subscribe(
            stResp => {
                event.stopPropagation();
                this.dialog.close();
            }
        )
    }

    cancel() {
        this.dialog.dismiss();
    }
}