import { Component, Input } from "@angular/core";
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { forkJoin, Observable } from "rxjs";
import { ModalType } from 'src/app/widget/modal/Modals';
import { Properties } from "../../models/Properties";
import { FsNamingStrategy } from "../../models/Sheet2RDF";
import { PreferencesSettingsServices } from "../../services/preferencesSettingsServices";
import { BasicModalServices } from "../../widget/modal/basicModal/basicModalServices";

@Component({
    selector: "s2rdf-settings-modal",
    templateUrl: "./sheet2rdfSettingsModal.html",
})
export class Sheet2RdfSettingsModal {
    @Input() fsNamingStrategyInput: FsNamingStrategy;

    fsNamingStrategies: FsNsStruct[] = [
        { show: "Column alphabetic index", title: "1st column => 'col_A'; 2nd column => 'col_B'", strategy: FsNamingStrategy.columnAlphabeticIndex },
        { show: "Column numeric index", title: "1st column => 'col_0'; 2nd column => 'col_1'", strategy: FsNamingStrategy.columnNumericIndex },
        { show: "Normalized header name", title: "Column header 'First header' => 'col_0_first_header", strategy: FsNamingStrategy.normalizedHeaderName }
    ];
    fsNamingStrategy: FsNsStruct;

    constructor(public activeModal: NgbActiveModal, private prefService: PreferencesSettingsServices, private basicModals: BasicModalServices) {}

    ngOnInit() {
        this.fsNamingStrategies.forEach(ns => {
            if (ns.strategy == this.fsNamingStrategyInput) {
                this.fsNamingStrategy = ns;
            }
        });
    }

    ok() {
        //check if settings are changed
        if (
            this.fsNamingStrategy.strategy != this.fsNamingStrategyInput
            // || this.useHeader != this.context.useHeader
        ) {
            this.basicModals.confirm("Sheet2RDF settings", "Warning: Changing the settings requires to re-initialize the model related to the current spreadsheet." +
                " All the changes applied to the headers will be discarder. Do you want to continue?", ModalType.warning).then(
                confirm => {
                    let updateSettingsFn: Observable<any>[] = [];
                    if (this.fsNamingStrategy.strategy != this.fsNamingStrategyInput) {
                        updateSettingsFn.push(this.prefService.setPUSetting(Properties.pref_s2rdf_fs_naming_strategy, this.fsNamingStrategy.strategy));
                    }
                    // if (this.useHeader != this.context.useHeader) {
                    //     updateSettingsFn.push(this.prefService.setPUSetting(Properties.pref_s2rdf_use_headers, this.useHeader+""));
                    // }

                    forkJoin(updateSettingsFn).subscribe(
                        resp => {
                            this.activeModal.close(this.fsNamingStrategy.strategy);
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
        this.activeModal.dismiss();
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