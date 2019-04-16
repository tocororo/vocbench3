import { Component } from "@angular/core";
import { DialogRef, ModalComponent } from "ngx-modialog";
import { BSModalContext } from 'ngx-modialog/plugins/bootstrap';
import { FsNamingStrategy } from "../../models/Sheet2RDF";
import { BasicModalServices } from "../../widget/modal/basicModal/basicModalServices";
import { PreferencesSettingsServices } from "../../services/preferencesSettingsServices";
import { Properties } from "../../models/Properties";
import { Observable } from "rxjs";

export class Sheet2RdfSettingsModalData extends BSModalContext {
    constructor(
        // public useHeader: boolean, 
        public fsNamingStrategy: FsNamingStrategy
    ) {
        super();
    }
}

@Component({
    selector: "s2rdf-settings-modal",
    templateUrl: "./sheet2RdfSettingsModal.html",
})
export class Sheet2RdfSettingsModal implements ModalComponent<Sheet2RdfSettingsModalData> {
    context: Sheet2RdfSettingsModalData;

    // private useHeader: boolean;

    private fsNamingStrategies: FsNsStruct[] = [
        { show: "Column alphabetic index", title: "1st column => 'col_A'; 2nd column => 'col_B'", strategy: FsNamingStrategy.columnAlphabeticIndex },
        { show: "Column numeric index", title: "1st column => 'col_0'; 2nd column => 'col_1'", strategy: FsNamingStrategy.columnNumericIndex },
        { show: "Normalized header name", title: "Column header 'First header' => 'col_0_first_header", strategy: FsNamingStrategy.normalizedHeaderName }
    ];
    private fsNamingStrategy: FsNsStruct;

    constructor(public dialog: DialogRef<Sheet2RdfSettingsModalData>, private prefService: PreferencesSettingsServices, private basicModals: BasicModalServices) {
        this.context = dialog.context;
    }

    ngOnInit() {
        // this.useHeader = this.context.useHeader;
        this.fsNamingStrategies.forEach(ns => {
            if (ns.strategy == this.context.fsNamingStrategy) {
                this.fsNamingStrategy = ns;
            }
        });
    }

    ok() {
        //check if settings are changed
        if (
            this.fsNamingStrategy.strategy != this.context.fsNamingStrategy 
            // || this.useHeader != this.context.useHeader
        ) {
            this.basicModals.confirm("Sheet2RDF settings", "Warning: Changing the settings requires to re-initialize the model related to the current spreadsheet." +
                " All the changes applied to the headers will be discarder. Do you want to continue?", "warning").then(
                confirm => {
                    let updateSettingsFn: Observable<any>[] = [];
                    if (this.fsNamingStrategy.strategy != this.context.fsNamingStrategy) {
                        updateSettingsFn.push(this.prefService.setPUSetting(Properties.pref_s2rdf_fs_naming_strategy, this.fsNamingStrategy.strategy));
                    }
                    // if (this.useHeader != this.context.useHeader) {
                    //     updateSettingsFn.push(this.prefService.setPUSetting(Properties.pref_s2rdf_use_headers, this.useHeader+""));
                    // }

                    Observable.forkJoin(updateSettingsFn).subscribe(
                        resp => {
                            // this.dialog.close({ fsNamingStrategy: this.fsNamingStrategy.strategy, useHeader: this.useHeader });
                            this.dialog.close(this.fsNamingStrategy.strategy);
                        }
                    );
                },
                cancel => {
                    this.cancel();
                }
            )
        }
        
    }

    cancel() {
        this.dialog.dismiss();
    }

}

class FsNsStruct {
    show: string;
    title: string;
    strategy: FsNamingStrategy;
}

// export class Sheet2RdfSettingsModalReturnData {
//     fsNamingStrategy: FsNamingStrategy;
//     useHeader: boolean;
// }