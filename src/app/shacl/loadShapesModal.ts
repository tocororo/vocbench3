import { Component } from "@angular/core";
import { DialogRef, ModalComponent } from "ngx-modialog";
import { BSModalContext } from 'ngx-modialog/plugins/bootstrap';
import { RDFFormat } from "../models/RDFFormat";
import { InputOutputServices } from "../services/inputOutputServices";
import { ShaclServices } from "../services/shaclServices";
import { BasicModalServices } from "../widget/modal/basicModal/basicModalServices";

@Component({
    selector: "load-shapes-modal",
    templateUrl: "./loadShapesModal.html",
})
export class LoadShapesModal implements ModalComponent<BSModalContext> {
    context: BSModalContext;

    private file: File;
    private inputFormats: RDFFormat[];
    private selectedInputFormat: RDFFormat;
    private clearExisting: boolean;

    constructor(public dialog: DialogRef<BSModalContext>, private shaclService: ShaclServices, private inOutService: InputOutputServices,
        private basicModals: BasicModalServices) {
        this.context = dialog.context;
    }

    ngOnInit() {
        //Formats?
        this.inOutService.getInputRDFFormats().subscribe(
            formats => {
                this.inputFormats = formats;
                this.selectedInputFormat = this.inputFormats.find(f => f.name == "Turtle"); //init turtle
            }
        )
    }

    fileChangeEvent(file: File) {
        this.file = file;
        this.inOutService.getParserFormatForFileName(this.file.name).subscribe(
            formatName => {
                this.selectedInputFormat = this.inputFormats.find(f => f.name == formatName);
            }
        )
    }

    ok(event: Event) {

        this.shaclService.loadShapes(this.file, this.selectedInputFormat, this.clearExisting).subscribe(
            () => {
                this.basicModals.alert("Load SHACL shapes", "Shacl shapes loaded succesfully").then(
                    () => {
                        event.stopPropagation();
                        event.preventDefault();
                        this.dialog.close();
                    }
                )
            }
        );
    }

    cancel() {
        this.dialog.dismiss();
    }

}