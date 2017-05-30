import { Component } from "@angular/core";
import { InputOutputServices } from "../../../services/inputOutputServices";
import { ExportServices } from "../../../services/exportServices";
import { BasicModalServices } from "../../../widget/modal/basicModal/basicModalServices";
import { VBEventHandler } from "../../../utils/VBEventHandler";
import { UIUtils } from "../../../utils/UIUtils";
import { RDFFormat } from "../../../models/RDFFormat";

@Component({
    selector: "load-data-component",
    templateUrl: "./loadDataComponent.html",
    host: { class: "pageComponent" }
})
export class LoadDataComponent {

    private baseURI: string;

    private fileToUpload: File;

    private inferFormatFromFile: boolean = true;
    private formats: RDFFormat[];
    private selectedFormat: RDFFormat;

    private selectedImportAllowance: string;

    constructor(private inOutService: InputOutputServices, private exportService: ExportServices, private basicModals: BasicModalServices) { }

    private ngOnInit() {
        this.exportService.getOutputFormats().subscribe(
            formats => {
                this.formats = formats;
                //select RDF/XML as default
                for (var i = 0; i < this.formats.length; i++) {
                    if (this.formats[i].name == "RDF/XML") {
                        this.selectedFormat = this.formats[i];
                        return;
                    }
                }
            }
        );
        this.selectedImportAllowance = "web";
    }

    private fileChangeEvent(file: File) {
        this.fileToUpload = file;
    }

    private isDataValid(): boolean {
        if (this.fileToUpload == null) {
            return false;
        } else if (this.baseURI == null || this.baseURI.trim() == "") {
            return false;
        }
    }

    private load() {
        if (this.fileToUpload == null) {
            this.basicModals.alert("Load Data", "A file is required", "warning");
        } else if (this.baseURI == null || this.baseURI.trim() == "") {
            this.basicModals.alert("Load Data", "BaseURI required", "warning");
        } else {
            UIUtils.startLoadingDiv(UIUtils.blockDivFullScreen);
            var formatParam: RDFFormat = null;
            if (!this.inferFormatFromFile) {
                formatParam = this.selectedFormat;
            }
            this.inOutService.loadRDF(this.fileToUpload, this.baseURI, this.selectedImportAllowance, formatParam).subscribe(
                stResp => {
                    UIUtils.stopLoadingDiv(UIUtils.blockDivFullScreen);
                    this.basicModals.alert("Import data", "Data imported successfully");
                }
            );
        }
    }

}