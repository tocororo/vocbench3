import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';
import { PreferencesSettingsServices } from '../services/preferencesSettingsServices';
import { ARTURIResource, ARTResource, RDFResourceRolesEnum } from '../models/ARTResources';
import { Language, Languages } from '../models/LanguagesCountries';
import { Properties, ClassIndividualPanelSearchMode, ClassTreePreference, ResourceViewMode, SearchSettings, StringMatchMode } from '../models/Properties';
import { ProjectTableColumnStruct } from '../models/Project';
import { ExtensionPoint } from '../models/Plugins';
import { Cookie } from '../utils/Cookie';
import { VBEventHandler } from '../utils/VBEventHandler';
import { UIUtils } from '../utils/UIUtils';
import { BasicModalServices } from '../widget/modal/basicModal/basicModalServices'
import { OWL, RDFS } from '../models/Vocabulary';
import { VBContext } from './VBContext';
import { CollaborationServices } from '../services/collaborationServices';

@Injectable()
export class VBCollaboration {

    public static jiraFactoryId: string = "it.uniroma2.art.semanticturkey.plugin.impls.collaboration.JiraBackendFactory";

    /* collaboration system could be enabled and configured (both settings and preferences) but not working:
    * settings or preferences could be invalid (invalid credentials or wrong serverURL), or the server could be unreachable */
    private working: boolean = false;
    private enabled: boolean = false;
    private linked: boolean = false; //if a collaboration project is linked to the VB project
    private settingsConfigured: boolean = false;
    private preferencesConfigured: boolean = false;

    constructor(private collaborationService: CollaborationServices, private eventHandler: VBEventHandler) {}

    public initCollaborationSystem(): Observable<any> {
        this.reset();
        return this.collaborationService.getCollaborationSystemStatus(VBCollaboration.jiraFactoryId).map(
            resp => {
                this.enabled = resp.enabled;
                this.linked = resp.linked;
                this.settingsConfigured = resp.settingsConfigured;
                this.preferencesConfigured = resp.preferencesConfigured;
                if (this.preferencesConfigured && this.settingsConfigured && this.linked && this.enabled) {
                    this.working = true;
                }
            }
        );
    }

    public isSettingsConfigured(): boolean {
        return this.settingsConfigured;
    }

    public isPreferencesConfigured(): boolean {
        return this.preferencesConfigured;
    }

    public isEnabled(): boolean {
        return this.enabled;
    }

    public isWorking(): boolean {
        return this.working;
    }
    public setWorking(working: boolean) {
        this.working = working;
        this.eventHandler.collaborationSystemStatusChanged.emit();
    }

    public isLinked(): boolean {
        return this.linked;
    }
    
    public reset() {
        this.working = false;
        this.enabled = false;
        this.linked = false;
        this.settingsConfigured = false;
        this.preferencesConfigured = false;
    }

}