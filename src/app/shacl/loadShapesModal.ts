import { Component } from "@angular/core";
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { RDFFormat } from "../models/RDFFormat";
import { InputOutputServices } from "../services/inputOutputServices";
import { ShaclServices } from "../services/shaclServices";
import { BasicModalServices } from "../widget/modal/basicModal/basicModalServices";

@Component({
    selector: "load-shapes-modal",
    templateUrl: "./loadShapesModal.html",
})
export class LoadShapesModal {

    file: File;
    inputFormats: RDFFormat[];
    selectedInputFormat: RDFFormat;
    filePickerAccept: string;
    clearExisting: boolean;

    constructor(public activeModal: NgbActiveModal, private shaclService: ShaclServices, private inOutService: InputOutputServices,
        private basicModals: BasicModalServices) {
    }

    ngOnInit() {
        //Formats?
        this.inOutService.getInputRDFFormats().subscribe(
            formats => {
                this.inputFormats = formats;
                this.selectedInputFormat = this.inputFormats.find(f => f.name == "Turtle"); //init turtle

                let extList: string[] = []; //collects the extensions of the formats in order to provide them to the file picker
                this.inputFormats.forEach(f =>
                    f.fileExtensions.forEach(ext => {
                        extList.push("." + ext);
                    })
                );
                //remove duplicated extensions
                extList = extList.filter((item: string, pos: number) => {
                    return extList.indexOf(item) == pos;
                });
                this.filePickerAccept = extList.join(",");
            }
        );
    }

    fileChangeEvent(file: File) {
        this.file = file;
        this.inOutService.getParserFormatForFileName(this.file.name).subscribe(
            formatName => {
                this.selectedInputFormat = this.inputFormats.find(f => f.name == formatName);
            }
        );
    }

    ok() {

        this.shaclService.loadShapes(this.file, this.selectedInputFormat, this.clearExisting).subscribe(
            () => {
                this.basicModals.alert({ key: "STATUS.OPERATION_DONE" }, { key: "MESSAGES.SHACL_SHAPES_LOADED" }).then(
                    () => {
                        this.activeModal.close();
                    }
                );
            }
        );
    }

    cancel() {
        this.activeModal.dismiss();
    }

}