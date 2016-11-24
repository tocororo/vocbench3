import {Component} from "@angular/core";
import {BSModalContext} from 'angular2-modal/plugins/bootstrap';
import {DialogRef, ModalComponent} from "angular2-modal";
import {CustomRangeServices} from "../../services/customRangeServices";
import {BrowsingServices} from "../../widget/modal/browsingModal/browsingServices";
import {ARTURIResource} from "../../utils/ARTResources";

@Component({
    selector: "cr-prop-mapping-modal",
    templateUrl: "./crPropMappingModal.html",
})
export class CustomRangePropMappingModal implements ModalComponent<BSModalContext> {
    context: BSModalContext;
    
    private customRangeList: Array<string>;
    private selectedProperty: ARTURIResource;
    private selectedCR: string;
    
    constructor(public dialog: DialogRef<BSModalContext>, private crService: CustomRangeServices,
        private browsingService: BrowsingServices) {
        this.context = dialog.context;
    }
    
    ngOnInit() {
        this.crService.getAllCustomRanges().subscribe(
            crList => {
                this.customRangeList = crList;
            }
        );
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