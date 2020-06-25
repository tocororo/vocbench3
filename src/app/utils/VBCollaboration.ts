import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { CollaborationServices } from '../services/collaborationServices';
import { VBEventHandler } from '../utils/VBEventHandler';

@Injectable()
export class VBCollaboration {

    /* collaboration system could be enabled and configured (both settings and preferences) but not working:
    * settings or preferences could be invalid (invalid credentials or wrong serverURL), or the server could be unreachable */
    private working: boolean = false;
    private enabled: boolean = false;
    private linked: boolean = false; //if a collaboration project is linked to the VB project
    private projSettingsConfigured: boolean = false;
    private userSettingsConfigured: boolean = false;
    private backendId: string;

    constructor(private collaborationService: CollaborationServices, private eventHandler: VBEventHandler) {}

    public initCollaborationSystem(): Observable<void> {
        this.reset();
        return this.collaborationService.getCollaborationSystemStatus().map(
            resp => {
                this.enabled = resp.enabled;
                this.backendId = resp.backendId;
                this.linked = resp.linked;
                this.projSettingsConfigured = resp.projSettingsConfigured;
                this.userSettingsConfigured = resp.userSettingsConfigured;
                if (this.userSettingsConfigured && this.projSettingsConfigured && this.linked && this.enabled) {
                    this.working = true;
                }
            }
        );
    }

    public isProjSettingsConfigured(): boolean {
        return this.projSettingsConfigured;
    }

    public isUserSettingsConfigured(): boolean {
        return this.userSettingsConfigured;
    }

    public isEnabled(): boolean {
        return this.enabled;
    }

    public getBackendId(): string {
        return this.backendId;
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
        this.projSettingsConfigured = false;
        this.userSettingsConfigured = false;
        this.backendId = null;
    }

}