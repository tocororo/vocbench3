import {Component} from "@angular/core";
import {Modal} from 'angular2-modal/plugins/bootstrap';
import {CustomRangeServices} from "../services/customRangeServices";
import {ModalServices} from "../widget/modal/modalServices";
import {CustomRangePropMappingModal, CustomRangePropMappingModalData} from "./customRangeConfigModals/crPropMappingModal"
import {CustomRangeEditorModal, CustomRangeEditorModalData} from "./customRangeConfigModals/crEditorModal"
import {CustomRangeEntryEditorModal, CustomRangeEntryEditorModalData} from "./customRangeConfigModals/creEditorModal"

@Component({
	selector: "custom-range-component",
	templateUrl: "app/src/customRanges/customRangeComponent.html",
    providers: [CustomRangeServices],
    host: { class : "pageComponent" }
})
export class CustomRangeComponent {
    
    private crConfigurationMap: Array<any>; //{idCustomRange: string, property: string}
    private customRangeList: Array<string>;
    private customRangeEntryList: Array<string>;
    
    private selectedCRPropMapping: any;
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
    
    private selectCRPropMap(crConf: any) {
        this.selectedCRPropMapping = crConf;
    }
    
    private selectCR(cr: string) {
        this.selectedCR = cr;
    }
    
    private selectCRE(cre: string) {
        this.selectedCRE = cre;
    }
    
    private createPropCRMapping() {
        var modalData = new CustomRangePropMappingModalData();
        return this.modal.open(CustomRangePropMappingModal, modalData).then(
            dialog => dialog.result.then(
                res => this.initCRConfMap(),
                () => {}                
            )
        );
    }
    
    private removePropCRMapping() {
        this.customRangeService.removeCustomRangeFromProperty(this.selectedCRPropMapping.property).subscribe(
            stResp => {
                this.initCRConfMap();
            }
        );
    }
    
    private createCR() {
        var modalData = new CustomRangeEditorModalData(null, this.customRangeList);
        return this.modal.open(CustomRangeEditorModal, modalData).then(
            dialog => dialog.result.then(
                res => this.initCRList(),
                () => {}
            )
        );
    }
    
    private editCR() {
        var modalData = new CustomRangeEditorModalData(this.selectedCR);
        return this.modal.open(CustomRangeEditorModal, modalData).then(
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
        return this.modal.open(CustomRangeEntryEditorModal, modalData).then(
            dialog => dialog.result.then(
                res => this.initCREList(),
                () => {}
            )
        );
    }
    
    private editCRE() {
        var modalData = new CustomRangeEntryEditorModalData(this.selectedCRE);
        return this.modal.open(CustomRangeEntryEditorModal, modalData).then(
            dialog => dialog.result.then(
                res => {},
                () => {}
            )
        );
    }
    
    private deleteCRE() {
        this.modalService.confirm("Delete Cutom Range Entry", "You are deleting Custom Range Entry " + this.selectedCRE + 
            ". Are you sure?", "warning").then(
            confirm => {
                this.customRangeService.deleteCustomRangeEntry(this.selectedCRE).subscribe(
                    stResp => {
                        this.initCREList();
                    }
                )
            },
            () => {}
        )
    }
    
}