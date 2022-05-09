import { Component } from "@angular/core";
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ExtensionPointID, Scope } from "src/app/models/Plugins";
import { SettingsServices } from "src/app/services/settingsServices";
import { VBContext } from 'src/app/utils/VBContext';
import { ModalType } from 'src/app/widget/modal/Modals';
import { SettingsEnum } from "../../models/Properties";
import { FsNamingStrategy, Sheet2RdfSettings } from "../../models/Sheet2RDF";
import { BasicModalServices } from "../../widget/modal/basicModal/basicModalServices";

@Component({
    selector: "s2rdf-settings-modal",
    templateUrl: "./sheet2rdfSettingsModal.html",
})
export class Sheet2RdfSettingsModal {

    private s2rdfSettings: Sheet2RdfSettings;

    fsNamingStrategies: FsNsStruct[] = [
        { show: "Column alphabetic index", title: "1st column => 'col_A'; 2nd column => 'col_B'", strategy: FsNamingStrategy.columnAlphabeticIndex },
        { show: "Column numeric index", title: "1st column => 'col_0'; 2nd column => 'col_1'", strategy: FsNamingStrategy.columnNumericIndex },
        { show: "Normalized header name", title: "Column header 'First header' => 'col_0_first_header", strategy: FsNamingStrategy.normalizedHeaderName }
    ];
    fsNamingStrategy: FsNsStruct;

    maxRowsTablePreview: number;

    constructor(public activeModal: NgbActiveModal, private settingsService: SettingsServices, private basicModals: BasicModalServices) { }

    ngOnInit() {
        this.s2rdfSettings = VBContext.getWorkingProjectCtx().getProjectPreferences().sheet2RdfSettings;
        this.fsNamingStrategies.forEach(ns => {
            if (ns.strategy == this.s2rdfSettings.namingStrategy) {
                this.fsNamingStrategy = ns;
            }
        });
        this.maxRowsTablePreview = this.s2rdfSettings.maxRowsTablePreview;
    }

    ok() {
        //check if settings are changed
        let namingStrategyChanged: boolean = this.fsNamingStrategy.strategy != this.s2rdfSettings.namingStrategy;
        let maxRowsChanged: boolean = this.maxRowsTablePreview != this.s2rdfSettings.maxRowsTablePreview;
        if (namingStrategyChanged || maxRowsChanged) {
            if (namingStrategyChanged) {
                this.basicModals.confirm({ key: "STATUS.WARNING" }, { key: "MESSAGES.CHANGE_S2RDF_SETTINGS_CONFIRM" }, ModalType.warning).then(
                    () => { //confirmed
                        this.updateSettingsAndClose(true);
                    },
                    () => { }
                );
            } else { //only max row changed
                this.updateSettingsAndClose(false);
            }
        } else { //nothing changed
            this.cancel();
        }
    }

    /**
     * 
     * @param requireReload if true the dialog will be closed via .close() (so sheet2rdfComponent will reload sheet)
     *  otherwise close it via .cancel (=> no reload)
     */
    private updateSettingsAndClose(requireReload: boolean) {
        this.s2rdfSettings.namingStrategy = this.fsNamingStrategy.strategy;
        this.s2rdfSettings.maxRowsTablePreview = this.maxRowsTablePreview;
        this.settingsService.storeSetting(ExtensionPointID.ST_CORE_ID, Scope.PROJECT_USER, SettingsEnum.sheet2rdfSettings, this.s2rdfSettings).subscribe(
            () => {
                if (requireReload) {
                    this.activeModal.close();
                } else {
                    this.cancel();
                }

            }
        );
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