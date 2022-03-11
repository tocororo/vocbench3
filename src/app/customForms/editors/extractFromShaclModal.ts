import { Component } from "@angular/core";
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ARTURIResource } from "../../models/ARTResources";
import { RDFFormat } from "../../models/RDFFormat";
import { InputOutputServices } from "../../services/inputOutputServices";
import { ShaclServices } from "../../services/shaclServices";
import { VBContext } from "../../utils/VBContext";

@Component({
    selector: "extract-from-shacl-modal",
    templateUrl: "./extractFromShaclModal.html",
})
export class ExtractFromShaclModal {
    readonly sourceGraph: string = "From SHACL shapes graph";
    readonly sourceUrl: string = "From SHACL shape URL";
    readonly sourceFile: string = "From SHACL shape file";
    sources: string[];
    selectedSource: string;

    cls: ARTURIResource;

    private inputFormats: RDFFormat[];
    private filePickerAccept: string;
    private selectedInputFormat: RDFFormat;

    private shapeFile: File; //from file

    private shapeUrl: string; //from url

    constructor(public activeModal: NgbActiveModal, private shaclService: ShaclServices, private inOutService: InputOutputServices) {}

    ngOnInit() {
        this.inOutService.getInputRDFFormats().subscribe(
            formats => {
                this.inputFormats = formats;
                // this.selectedInputFormat = this.inputFormats.find(f => f.name == "Turtle"); //init turtle

                //collects the extensions of the formats in order to provide them to the file picker
                this.filePickerAccept = this.inputFormats
                    .map(f => "." + f.defaultFileExtension) //collect the extensions
                    .filter((item: string, pos: number, list) => { //remove duplicates
                        return list.indexOf(item) == pos;
                    })
                    .join(","); //join with comma separator
            }
        );

        if (VBContext.getWorkingProject().isShaclEnabled()) {
            this.sources = [this.sourceGraph, this.sourceUrl, this.sourceFile];
        } else {
            this.sources = [this.sourceUrl, this.sourceFile];
        }
    }

    fileChangeEvent(file: File) {
        this.shapeFile = file;
        this.inOutService.getParserFormatForFileName(this.shapeFile.name).subscribe(
            formatName => {
                this.selectedInputFormat = this.inputFormats.find(f => f.name == formatName);
            }
        )
    }

    isOkEnabled(): boolean {
        if (this.selectedSource == this.sourceFile) {
            return this.cls != null && this.shapeFile != null;
        } else if (this.selectedSource == this.sourceGraph) {
            return this.cls != null;
        } else if (this.selectedSource == this.sourceUrl) {
            return this.cls != null && this.shapeUrl != null;
        }
        return false;
    }

    ok() {
        if (this.selectedSource == this.sourceFile) {
            this.shaclService.extractCFfromShapeFile(this.cls, this.shapeFile, this.selectedInputFormat).subscribe(
                pearl => {
                    this.activeModal.close(pearl);
                }
            )
        } else if (this.selectedSource == this.sourceGraph) {
            this.shaclService.extractCFfromShapesGraph(this.cls).subscribe(
                pearl => {
                    this.activeModal.close(pearl);
                }
            )
        } else if (this.selectedSource == this.sourceUrl) {
            this.shaclService.extractCFfromShapeURL(this.cls, this.shapeUrl, this.selectedInputFormat).subscribe(
                pearl => {
                    this.activeModal.close(pearl);
                }
            )
        }
    }

    cancel() {
        this.activeModal.dismiss();
    }

}