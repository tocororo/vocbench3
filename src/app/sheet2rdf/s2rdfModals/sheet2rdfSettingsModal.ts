import { Component, Input } from "@angular/core";
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ExtensionPointID, Scope } from "src/app/models/Plugins";
import { SettingsServices } from "src/app/services/settingsServices";
import { ModalType } from 'src/app/widget/modal/Modals';
import { SettingsEnum } from "../../models/Properties";
import { FsNamingStrategy, Sheet2RdfSettings } from "../../models/Sheet2RDF";
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

    constructor(public activeModal: NgbActiveModal, private settingsService: SettingsServices, private basicModals: BasicModalServices) {}

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
            this.basicModals.confirm({key:"STATUS.WARNING"}, {key:"MESSAGES.CHANGE_S2RDF_SETTINGS_CONFIRM"}, ModalType.warning).then(
                confirm => {
                    let sheet2RdfSettings: Sheet2RdfSettings = new Sheet2RdfSettings();
                    sheet2RdfSettings.namingStrategy = this.fsNamingStrategy.strategy;
                    // sheet2RdfSettings.useHeaders = this.useHeader;
                    this.settingsService.storeSetting(ExtensionPointID.ST_CORE_ID, Scope.PROJECT_USER, SettingsEnum.sheet2rdfSettings, sheet2RdfSettings).subscribe(
                        () => {
                            this.activeModal.close(this.fsNamingStrategy.strategy);
                        }
                    )
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