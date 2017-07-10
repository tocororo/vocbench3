import { Component } from "@angular/core";
import { InputOutputServices } from "../../../services/inputOutputServices";
import { ExportServices } from "../../../services/exportServices";
import { BasicModalServices } from "../../../widget/modal/basicModal/basicModalServices";
import { VBEventHandler } from "../../../utils/VBEventHandler";
import { UIUtils } from "../../../utils/UIUtils";
import { VBContext } from "../../../utils/VBContext";
import { AuthorizationEvaluator } from "../../../utils/AuthorizationEvaluator";
import { RDFFormat } from "../../../models/RDFFormat";
import { TransitiveImportMethodAllowance } from "../../../models/Metadata";

@Component({
    selector: "load-data-component",
    templateUrl: "./loadDataComponent.html",
    host: { class: "pageComponent" }
})
export class LoadDataComponent {

    private baseURI: string;
    private useProjectBaseURI: boolean = true;

    private fileToUpload: File;

    private formats: RDFFormat[];
    private selectedFormat: RDFFormat;

    private importAllowances: { allowance: TransitiveImportMethodAllowance, show: string }[] = [
        { allowance: TransitiveImportMethodAllowance.web, show: "Web" },
        { allowance: TransitiveImportMethodAllowance.webFallbackToMirror, show: "Web with fallback to Ontology Mirror" },
        { allowance: TransitiveImportMethodAllowance.mirror, show: "Ontology Mirror" },
        { allowance: TransitiveImportMethodAllowance.mirrorFallbackToWeb, show: "Ontology Mirror with fallback to Web" }
    ];
    private selectedImportAllowance: TransitiveImportMethodAllowance = this.importAllowances[0].allowance;

    private validateImplicitly: boolean = false;

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
        this.baseURI = VBContext.getWorkingProject().getBaseURI();
    }

    private onBaseUriChecboxChange() {
        if (this.useProjectBaseURI) {
            this.baseURI = VBContext.getWorkingProject().getBaseURI();
        }
    }

    private fileChangeEvent(file: File) {
        this.fileToUpload = file;
        UIUtils.startLoadingDiv(UIUtils.blockDivFullScreen);
        this.inOutService.getParserFormatForFileName(file.name).subscribe(
            format => {
                UIUtils.stopLoadingDiv(UIUtils.blockDivFullScreen);
                if (format != null) {
                    for (var i = 0; i < this.formats.length; i++) {
                        if (this.formats[i].name == format) {
                            this.selectedFormat = this.formats[i];
                            return;
                        }
                    }
                }
            }
        );
    }

    private isValidationEnabled(): boolean {
        return VBContext.getWorkingProject().isValidationEnabled();
    }

    private isValidationAuthorized(): boolean {
        return AuthorizationEvaluator.isAuthorized(AuthorizationEvaluator.Actions.VALIDATION);
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
            var formatParam: RDFFormat = this.selectedFormat;
            this.inOutService.loadRDF(this.fileToUpload, this.baseURI, this.selectedImportAllowance, formatParam, this.validateImplicitly).subscribe(
                stResp => {
                    UIUtils.stopLoadingDiv(UIUtils.blockDivFullScreen);
                    this.basicModals.alert("Import data", "Data imported successfully");
                }
            );
        }
    }

}