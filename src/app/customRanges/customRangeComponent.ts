import {Component} from "@angular/core";
import {Modal, BSModalContextBuilder} from 'angular2-modal/plugins/bootstrap';
import {OverlayConfig} from 'angular2-modal';
import {CustomRangeServices} from "../services/customRangeServices";
import {ModalServices} from "../widget/modal/modalServices";
import {CustomRangePropMappingModal} from "./customRangeConfigModals/crPropMappingModal"
import {CustomRangeEditorModal, CustomRangeEditorModalData} from "./customRangeConfigModals/crEditorModal"
import {CustomRangeEntryEditorModal, CustomRangeEntryEditorModalData} from "./customRangeConfigModals/creEditorModal"
import {ARTURIResource} from "../utils/ARTResources";
import {CustomRangePropertyMapping} from "../utils/CustomRanges";

@Component({
	selector: "custom-range-component",
	templateUrl: "./customRangeComponent.html",
    host: { class : "pageComponent" }
})
export class CustomRangeComponent {
    
    private crConfigurationMap: Array<CustomRangePropertyMapping>;
    private customRangeList: Array<string>;
    private customRangeEntryList: Array<string>;
    
    private selectedCRPropMapping: CustomRangePropertyMapping;
    private selectedCR: string;
    private selectedCRE: string;
    
    constructor(private customRangeService: CustomRangeServices, private modalService: ModalServices, private modal: Modal) {}
    
    ngOnInit() {
        this.initCRConfMap();
        this.initCRList();
        this.initCREList();
    }
    
    private initCRConfMap() {
        this.customRangeService.getCustomRangeConfigMap().subscribe(
            crConfMap => { 
                this.crConfigurationMap = crConfMap;
                this.selectedCRPropMapping = null;
            }
        );
    }
    
    private initCRList() {
        this.customRangeService.getAllCustomRanges().subscribe(
            crList => {
                this.customRangeList = crList;
                this.selectedCR = null;
            }
        );
    }
    
    private initCREList() {
        this.customRangeService.getAllCustomRangeEntries().subscribe(
            creList => {
                this.customRangeEntryList = creList;
                this.selectedCRE = null;
            }
        );
    }
    
    private selectCRPropMap(crConf: CustomRangePropertyMapping) {
        if (this.selectedCRPropMapping == crConf) {
            this.selectedCRPropMapping == null;
        } else {
            this.selectedCRPropMapping = crConf;
        }
    }
    
    private selectCR(cr: string) {
        if (this.selectedCR == cr) {
            this.selectedCR == null;
        } else {
            this.selectedCR = cr;
        }
    }
    
    private selectCRE(cre: string) {
        if (this.selectedCRE == cre) {
            this.selectedCRE == null;
        } else {
            this.selectedCRE = cre;
        }
    }
    
    private createPropCRMapping() {
        const builder = new BSModalContextBuilder<any>();
        let overlayConfig: OverlayConfig = { context: builder.keyboard(null).toJSON() };
        return this.modal.open(CustomRangePropMappingModal, overlayConfig).then(
            dialog => dialog.result.then(
                res => {
                    var property: ARTURIResource = res.property;
                    var customRangeId: string = res.customRange;
                    //check if selected property has not a CustomRange already assigned
                    for (var i = 0; i < this.crConfigurationMap.length; i++) {
                        if (this.crConfigurationMap[i].getPropertyURI() == property.getURI()) {
                            //already in a mapping
                            this.modalService.alert("Denied", "A CustomRange is already assigned to " + property.getShow() +
                                ". Please, select another property, or if you want to extend the range of " + property.getShow() +
                                ", add more CustomRangeEntry to the assigned CustomRange (" + this.crConfigurationMap[i].getCustomRangeID() + ")",
                                "warning");
                            return;
                        }
                    }
                    this.customRangeService.addCustomRangeToProperty(customRangeId, property).subscribe(
                        stResp => {
                            this.initCRConfMap();
                        }
                    )
                },
                () => {}                
            )
        );
    }
    
    private removePropCRMapping() {
        this.customRangeService.removeCustomRangeFromProperty(this.selectedCRPropMapping.getPropertyURI()).subscribe(
            stResp => {
                this.initCRConfMap();
            }
        );
    }

    private changeReplaceToPropCRMapping(checked: boolean, crProp: CustomRangePropertyMapping) {
        this.customRangeService.updateReplaceRanges(crProp.getPropertyURI(), checked).subscribe();
    }
    
    private createCR() {
        var modalData = new CustomRangeEditorModalData(null, this.customRangeList);
        const builder = new BSModalContextBuilder<CustomRangeEditorModalData>(
            modalData, undefined, CustomRangeEditorModalData
        );
        builder.size("lg").keyboard(null);
        let overlayConfig: OverlayConfig = { context: builder.toJSON() };
        return this.modal.open(CustomRangeEditorModal, overlayConfig).then(
            dialog => dialog.result.then(
                res => this.initCRList(),
                () => {}
            )
        );
    }
    
    private editCR() {
        var modalData = new CustomRangeEditorModalData(this.selectedCR);
        const builder = new BSModalContextBuilder<CustomRangeEditorModalData>(
            modalData, undefined, CustomRangeEditorModalData
        );
        builder.size("lg").keyboard(null);
        let overlayConfig: OverlayConfig = { context: builder.toJSON() };
        return this.modal.open(CustomRangeEditorModal, overlayConfig).then(
            dialog => dialog.result.then(
                res => {},
                () => {}
            )
        );
    }
    
    private deleteCR() {
        this.modalService.confirm("Delete Cutom Range", "You are deleting Custom Range " + this.selectedCR + ". Are you sure?", "warning").then(
            confirm => {
                this.customRangeService.deleteCustomRange(this.selectedCR).subscribe(
                    stResp => {
                        this.initCRConfMap();
                        this.initCRList();
                    }
                )
            },
            () => {}
        )
    }
    
    private createCRE() {
        var modalData = new CustomRangeEntryEditorModalData(null, this.customRangeEntryList);
        const builder = new BSModalContextBuilder<CustomRangeEntryEditorModalData>(
            modalData, undefined, CustomRangeEntryEditorModalData
        );
        builder.size("lg").keyboard(null);
        let overlayConfig: OverlayConfig = { context: builder.toJSON() };
        return this.modal.open(CustomRangeEntryEditorModal, overlayConfig).then(
            dialog => dialog.result.then(
                res => this.initCREList(),
                () => {}
            )
        );
    }
    
    private editCRE() {
        var modalData = new CustomRangeEntryEditorModalData(this.selectedCRE);
        const builder = new BSModalContextBuilder<CustomRangeEntryEditorModalData>(
            modalData, undefined, CustomRangeEntryEditorModalData
        );
        builder.size("lg").keyboard(null);
        let overlayConfig: OverlayConfig = { context: builder.toJSON() };
        return this.modal.open(CustomRangeEntryEditorModal, overlayConfig).then(
            dialog => dialog.result.then(
                res => {},
                () => {}
            )
        );
    }
    
    private deleteCRE() {
        this.customRangeService.isEntryLinkedToCustomRange(this.selectedCRE).subscribe(
            result => {
                if (result) { //selectedCRE belong to a CR
                    this.modalService.confirmCheck("Delete Custom Range Entry", "You are deleting a Custom Range Entry that " +
                        "belongs to one or more CustomRange(s). Are you sure?", "Delete also Custom Range(s) left empty", "warning").then(
                        (check: any) => {
                            this.customRangeService.deleteCustomRangeEntry(this.selectedCRE, check).subscribe(
                                stResp => {
                                    if (check) { //if user chooses to delete also empty CRs
                                        this.initCRConfMap();
                                        this.initCRList();
                                    }
                                    this.initCREList();
                                }
                            );
                        },
                        () => {}
                    );
                } else { //selectedCRE does not belong to any CR
                    this.modalService.confirm("Delete Custom Range Entry", "You are deleting Custom Range Entry " + this.selectedCRE + 
                        ". Are you sure?", "warning").then(
                        confirm => {
                            this.customRangeService.deleteCustomRangeEntry(this.selectedCRE).subscribe(
                                stResp => {
                                    this.initCREList();
                                }
                            );
                        },
                        () => {}
                    );
                }
            }
        )
    }
    
}