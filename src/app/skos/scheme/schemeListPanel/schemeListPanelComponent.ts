import {Component, Output, EventEmitter} from "@angular/core";
import {SkosServices} from "../../../services/skosServices";
import {SkosxlServices} from "../../../services/skosxlServices";
import {ModalServices} from "../../../widget/modal/modalServices";
import {ARTURIResource, ResAttribute} from "../../../utils/ARTResources";
import {VocbenchCtx} from '../../../utils/VocbenchCtx';

@Component({
	selector: "scheme-list-panel",
	templateUrl: "./schemeListPanelComponent.html",
})
export class SchemeListPanelComponent {
    
    @Output() nodeSelected = new EventEmitter<ARTURIResource>();
    
    private schemeList:ARTURIResource[];
    private activeScheme:ARTURIResource;
    private selectedScheme:ARTURIResource;
    
    private ONTO_TYPE: string;
    
    private eventSubscriptions = [];

    constructor(private skosService: SkosServices, private skosxlService: SkosxlServices, private vbCtx: VocbenchCtx, 
            private modalService: ModalServices) {
    }
    
    ngOnInit() {
        this.ONTO_TYPE = this.vbCtx.getWorkingProject().getPrettyPrintOntoType();
        this.skosService.getAllSchemesList(this.vbCtx.getContentLanguage(true)).subscribe(
            schemeList => {
                this.schemeList = schemeList;
            }
        );
        this.activeScheme = this.vbCtx.getScheme();
    }
    
    private createScheme() {
        this.modalService.newResource("Create new skos:ConceptScheme", this.vbCtx.getContentLanguage()).then(
            result => {
                if (this.ONTO_TYPE == "SKOS") {
                    this.skosService.createScheme(result.label, result.lang, result.name).subscribe(
                        newScheme => {
                            this.schemeList.push(newScheme);
                        }
                    );
                } else {//SKOSXL
                    this.skosxlService.createScheme(result.label, result.lang, result.name).subscribe(
                        newScheme => {
                            this.schemeList.push(newScheme);
                        }
                    );
                }
            },
            () => {}
        );
    }
    
    private deleteScheme() {
        if (this.ONTO_TYPE == "SKOS") {
            this.skosService.deleteScheme(this.selectedScheme).subscribe(
                stResp => this.deleteSchemeRespHandler(stResp),
                err => this.deleteNotEmptySchemeHandler()
            );
        } else { //SKOSXL
            this.skosxlService.deleteScheme(this.selectedScheme).subscribe(
                stResp => this.deleteSchemeRespHandler(stResp),
                err => this.deleteNotEmptySchemeHandler()
            );
        }
    }
    
    private deleteNotEmptySchemeHandler() {
        var retainOpt = "Retain dangling concepts";
        var deleteOpt = "Delete dangling concepts";
        this.modalService.select("Delete scheme", "The operation will produce dangling concepts" 
            + " because the scheme is not empty. What do you want to do?", [retainOpt, deleteOpt]).then(
            selection => {
                var deleteDanglingConc = selection == deleteOpt;
                if (this.ONTO_TYPE == "SKOS") {
                    this.skosService.deleteScheme(this.selectedScheme, deleteDanglingConc).subscribe(
                        stResp => this.deleteSchemeRespHandler(stResp)
                    );
                } else { //SKOSXL
                    this.skosxlService.deleteScheme(this.selectedScheme, deleteDanglingConc).subscribe(
                        stResp => this.deleteSchemeRespHandler(stResp)
                    );
                }
            },
            () => {}
        );
    }
    
    /**
     * Handles the scheme deletion
     */
    private deleteSchemeRespHandler(stResp) {
        for (var i = 0; i < this.schemeList.length; i++) {//Update the schemeList
            if (this.schemeList[i].getURI() == this.selectedScheme.getURI()) {
                this.schemeList.splice(i, 1);
                break;
            }
        }
        //reset the activeScheme if the deleted was the active one
        if (this.activeScheme != undefined && (this.selectedScheme.getURI() == this.activeScheme.getURI())) {
            this.vbCtx.removeScheme(this.vbCtx.getWorkingProject());
            this.activeScheme = null;
        }
        this.selectedScheme = null;
        this.nodeSelected.emit(undefined);
    }
    
    private activateScheme(scheme: ARTURIResource) {
        //if the scheme that is trying to activate it was already active, pass to no-scheme mode
        if (this.activeScheme != undefined && this.activeScheme.getURI() == scheme.getURI()) {
            this.activeScheme = null;
            this.vbCtx.removeScheme(this.vbCtx.getWorkingProject());
        } else {
            this.activeScheme = scheme;
            this.vbCtx.setScheme(this.activeScheme);
        }
    }
    
    private isActive(scheme: ARTURIResource) {
        return (this.activeScheme && scheme.getURI() == this.activeScheme.getURI());
    }
    
    /**
     * Called when a scheme is clicked. Set the clicked scheme as selected. Useful to select a scheme to delete
     */
    private selectScheme(scheme: ARTURIResource) {
        if (this.selectedScheme == undefined) {
            this.selectedScheme = scheme;
            this.selectedScheme.setAdditionalProperty(ResAttribute.SELECTED, true);
        } else {
            this.selectedScheme.deleteAdditionalProperty(ResAttribute.SELECTED);
            this.selectedScheme = scheme;
            this.selectedScheme.setAdditionalProperty(ResAttribute.SELECTED, true);
        }
        this.nodeSelected.emit(scheme);
    }
    
}