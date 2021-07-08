import { Component, ElementRef, ViewChild } from '@angular/core';
import { Observable } from 'rxjs';
import { ExtensionPoint, Scope, Settings } from 'src/app/models/Plugins';
import { SettingsServices } from 'src/app/services/settingsServices';
import { UIUtils } from 'src/app/utils/UIUtils';
import { BasicModalServices } from 'src/app/widget/modal/basicModal/basicModalServices';

@Component({
    selector: 'settings-mgr-config-component',
    templateUrl: './settingsMgrConfigComponent.html',
    host: { class: "pageComponent" }
})
export class SettingsMgrConfigComponent {

    @ViewChild('blockingDiv', { static: false }) private blockingDivElement: ElementRef;

    extPointMap: {[extPtId: string]: ExtensionPoint[]} = {} //map extension points with the SettingsManager implementations
    extPointIds: { id: string, shortId: string }[]; //IDs of the ext points (keys of the above map)
    selectedExtPoint: string; //identifies the selected tab
    selectedSettingsMgr: ExtensionPoint; //the SettingsManager selected among those in the selected ext point
    selectedScope: Scope; //the selected scope of the selected SettingsManager

    selectedSettings: Settings;

    constructor(private settingsService: SettingsServices, private basicModals: BasicModalServices) {}

    ngOnInit() {
        this.initSettingsManagers();
    }

    private initSettingsManagers() {
        this.settingsService.getSettingManagers().subscribe(
            settingsManagers => {
                settingsManagers.forEach(settingsMgr => {
                    if (settingsMgr.interface != null) { //settingsMgr is also an ext point
                        let settingsMgrList = this.extPointMap[settingsMgr.interface];
                        if (settingsMgrList == null) {
                            settingsMgrList = [settingsMgr];
                        } else {
                            settingsMgrList.push(settingsMgr);
                        }
                        this.extPointMap[settingsMgr.interface] = settingsMgrList;
                    } else if (settingsMgr.interfaces != null) { //settingsMgr is an implementation of an ext point
                        settingsMgr.interfaces.forEach(extPt => {
                            let settingsMgrList = this.extPointMap[extPt];
                            if (settingsMgrList == null) {
                                settingsMgrList = [settingsMgr];
                            } else {
                                settingsMgrList.push(settingsMgr);
                            }
                            this.extPointMap[extPt] = settingsMgrList;
                        })
                    } else { //simply a SettingsManager (both interface and interfaces are null)
                        this.extPointMap[settingsMgr.id] = [settingsMgr];
                    }
                })
                //collect extension points ID and their shortened version, then sort them
                this.extPointIds = Object.keys(this.extPointMap).map(extPt => { return { id: extPt, shortId: extPt.substring(extPt.lastIndexOf(".")+1)} });
                this.extPointIds.sort((ep1, ep2) => ep1.shortId.toLocaleLowerCase().localeCompare(ep2.shortId.toLocaleLowerCase()));
                //sort settings managers for every ext point
                for (let extPt in this.extPointMap) {
                    this.extPointMap[extPt].sort((sm1, sm2) => {
                        return sm1.getShortId().localeCompare(sm2.getShortId())
                    })
                }
                //init the selection of the first ext point tab
                this.selectExtensionPoint(this.extPointIds[0].id);
            }
        );
    }

    selectExtensionPoint(extPointId: string) {
        this.selectedExtPoint = extPointId;
        this.selectedSettingsMgr = null;
        this.selectedSettings = null;
    }

    selectSettingsMgr(settingsMgr: ExtensionPoint) {
        this.selectedSettingsMgr = settingsMgr;
        this.selectedSettingsMgr.settingsScopes = this.selectedSettingsMgr.settingsScopes.filter(s => s != Scope.PROJECT_GROUP); //filter PG scope since it has no default settings
        this.selectedSettings = null;
        this.selectedScope = null;
    }

    onSelectedScopeChange() {
        this.getSettings();
    }

    private getSettings() {
        let getSettingsFn: Observable<Settings>;
        if (this.selectedScope == Scope.SYSTEM) {
            getSettingsFn = this.settingsService.getSettings(this.selectedSettingsMgr.id, this.selectedScope);
        } else { //for other scopes get the default at system level
            getSettingsFn = this.settingsService.getSettingsDefault(this.selectedSettingsMgr.id, this.selectedScope, Scope.SYSTEM);
        }
        UIUtils.startLoadingDiv(this.blockingDivElement.nativeElement);
        getSettingsFn.subscribe(
            settings => {
                UIUtils.stopLoadingDiv(this.blockingDivElement.nativeElement);
                this.selectedSettings = settings;
            }
        )
    }

    applyChanges() {
        let settingsValue: any = this.selectedSettings.getPropertiesAsMap();
        let storeSettingsFn: Observable<void>;
        if (this.selectedScope == Scope.SYSTEM) {
            storeSettingsFn = this.settingsService.storeSettings(this.selectedSettingsMgr.id, this.selectedScope, settingsValue);
        } else {
            storeSettingsFn = this.settingsService.storeSettingsDefault(this.selectedSettingsMgr.id, this.selectedScope, Scope.SYSTEM, settingsValue)
        }
        storeSettingsFn.subscribe(
            () => {
                this.basicModals.alert({key:"STATUS.OPERATION_DONE"}, {key: "MESSAGES.SETTING_SAVED"});
            }
        )
    }

}