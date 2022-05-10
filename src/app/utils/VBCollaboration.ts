import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { CollaborationSystemStatus } from '../models/Collaboration';
import { CollaborationServices } from '../services/collaborationServices';
import { VBEventHandler } from '../utils/VBEventHandler';

@Injectable()
export class VBCollaboration {

    /* collaboration system could be enabled and configured (both settings and preferences) but not working:
    * settings or preferences could be invalid (invalid credentials or wrong serverURL), or the server could be unreachable */
    private working: boolean = false;
    private linked: boolean = false; //if a collaboration project is linked to the VB project
    private active: boolean = false;
    private projSettingsConfigured: boolean = false;
    private userSettingsConfigured: boolean = false;
    private backendId: string;

    constructor(private collaborationService: CollaborationServices, private eventHandler: VBEventHandler) {}

    public initCollaborationSystem(): Observable<void> {
        this.reset();
        return this.collaborationService.getCollaborationSystemStatus().pipe(
            map((status: CollaborationSystemStatus) => {
                this.backendId = status.backendId;
                this.linked = status.linked;
                this.active = status.csActive;
                this.projSettingsConfigured = status.projSettingsConfigured;
                this.userSettingsConfigured = status.userSettingsConfigured;
                if (this.userSettingsConfigured && this.projSettingsConfigured && this.linked) {
                    this.working = true;
                }
            })
        );
    }

    public isProjSettingsConfigured(): boolean {
        return this.projSettingsConfigured;
    }

    public isUserSettingsConfigured(): boolean {
        return this.userSettingsConfigured;
    }

    public getBackendId(): string {
        return this.backendId;
    }

    public isWorking(): boolean {
        return this.working;
    }
    public setWorking(working: boolean) {
        if (this.working != working) { //this check prevent to emit collaborationSystemStatusChanged if nothing changed
            this.working = working;
            this.eventHandler.collaborationSystemStatusChanged.emit();
        }
    }

    public isActive(): boolean {
        return this.active;
    }
    public setActive(active: boolean) {
        if (this.active != active) { //this check prevent to emit collaborationSystemStatusChanged if nothing changed
            this.active = active;
            this.collaborationService.setCollaborationSystemActive(active).subscribe(
                () => {
                    this.eventHandler.collaborationSystemStatusChanged.emit();
                }
            );
        }
    }

    public isLinked(): boolean {
        return this.linked;
    }

    public reset() {
        this.working = false;
        this.linked = false;
        this.projSettingsConfigured = false;
        this.userSettingsConfigured = false;
        this.backendId = null;
    }

}