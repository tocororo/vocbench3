import { Component } from "@angular/core";
import { DialogRef, ModalComponent } from "ngx-modialog";
import { BSModalContext } from 'ngx-modialog/plugins/bootstrap';
import { PatternStruct } from "../../models/ResourceMetadata";
import { BasicModalServices } from "../../widget/modal/basicModal/basicModalServices";

export class ImportPatternModalData extends BSModalContext {
    constructor(public title: string, public existingPatterns: PatternStruct[]) {
        super();
    }
}

@Component({
    selector: "import-pattern-modal",
    templateUrl: "./importPatternModal.html",
})
export class ImportPatternModal implements ModalComponent<ImportPatternModalData> {
    context: ImportPatternModalData;

    private name: string;
    private file: File;

    constructor(public dialog: DialogRef<ImportPatternModalData>, private basicModals: BasicModalServices) {
        this.context = dialog.context;
    }

    fileChangeEvent(file: File) {
        this.file = file;
    }

    private isDataValid(): boolean {
        return this.file != null && this.name != null && this.name.trim() != "";
    }

    ok() {
        if (this.context.existingPatterns.some(p => p.name == this.name)) {
            this.basicModals.alert("Metadata Pattern already existing", "A Metadata Pattern with the same already exists. Please change the name and retry", "warning");
            return;
        }
        this.dialog.close({ file: this.file, name: this.name });
    }

    cancel() {
        this.dialog.dismiss();
    }



}