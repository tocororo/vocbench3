import { Component } from "@angular/core";
import { DialogRef, ModalComponent } from "ngx-modialog";
import { BSModalContext } from 'ngx-modialog/plugins/bootstrap';
import { ARTURIResource } from "../../models/ARTResources";
import { RDFFormat } from "../../models/RDFFormat";
import { InputOutputServices } from "../../services/inputOutputServices";
import { ShaclServices } from "../../services/shaclServices";

// export class ExtractFromShaclModalData extends BSModalContext {
//     constructor() {
//         super();
//     }
// }

@Component({
    selector: "extract-from-shacl-modal",
    templateUrl: "./extractFromShaclModal.html",
})
export class ExtractFromShaclModal implements ModalComponent<BSModalContext> {
    context: BSModalContext;

    private readonly sourceGraph: string = "From SHACL shapes graph";
    private readonly sourceUrl: string = "From SHACL shape URL";
    private readonly sourceFile: string = "From SHACL shape file";
    private sources: string[] = [this.sourceGraph, this.sourceUrl, this.sourceFile];
    private selectedSource: string;

    private cls: ARTURIResource;

    private targetShapeUri: string;

    private inputFormats: RDFFormat[];
    private filePickerAccept: string;
    private selectedInputFormat: RDFFormat;

    private shapeFile: File; //from file

    private shapeUrl: string; //from url

    constructor(public dialog: DialogRef<BSModalContext>, private shaclService: ShaclServices, private inOutService: InputOutputServices) {
        this.context = dialog.context;
    }

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
    }

    fileChangeEvent(file: File) {
        this.shapeFile = file;
        this.inOutService.getParserFormatForFileName(this.shapeFile.name).subscribe(
            formatName => {
                this.selectedInputFormat = this.inputFormats.find(f => f.name == formatName);
            }
        )
    }

    private isOkEnabled(): boolean {
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
        let targetShape: ARTURIResource;
        if (this.targetShapeUri != null) {
            targetShape = new ARTURIResource(this.targetShapeUri);
        }
        if (this.selectedSource == this.sourceFile) {
            this.shaclService.extractCFfromShapeFile(this.cls, this.shapeFile, this.selectedInputFormat, targetShape).subscribe(
                pearl => {
                    this.dialog.close(pearl);
                }
            )
        } else if (this.selectedSource == this.sourceGraph) {
            this.shaclService.extractCFfromShapesGraph(this.cls, targetShape).subscribe(
                pearl => {
                    this.dialog.close(pearl);
                }
            )
        } else if (this.selectedSource == this.sourceUrl) {
            this.shaclService.extractCFfromShapeURL(this.cls, this.shapeUrl, this.selectedInputFormat, targetShape).subscribe(
                pearl => {
                    this.dialog.close(pearl);
                }
            )
        }
    }

    cancel() {
        this.dialog.dismiss();
    }

}