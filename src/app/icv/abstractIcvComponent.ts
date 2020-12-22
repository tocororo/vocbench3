import { Component, Directive } from "@angular/core";
import { ARTNode, ARTResource, RDFResourceRolesEnum } from "../models/ARTResources";
import { BasicModalServices } from "../widget/modal/basicModal/basicModalServices";
import { ModalType } from '../widget/modal/Modals';
import { SharedModalServices } from "../widget/modal/sharedModal/sharedModalServices";

@Directive()
export abstract class AbstractIcvComponent {

    abstract checkRoles: boolean;
    abstract checkLanguages: boolean;
    rolesToCheck: RDFResourceRolesEnum[];
    protected langsToCheck: string[];

    //paging handler
    private resultsLimit: number = 100;
    private page: number = 0;
    private pageCount: number;

    protected basicModals: BasicModalServices;
    protected sharedModals: SharedModalServices;
    constructor(basicModals: BasicModalServices, sharedModals: SharedModalServices) {
        this.basicModals = basicModals;
        this.sharedModals = sharedModals;
    }

    onRolesChanged(roles: RDFResourceRolesEnum[]) {
        this.rolesToCheck = roles;
    }

    onLangsChanged(langs: string[]) {
        this.langsToCheck = langs;
    }

    /**
     * Returns true if one of the check fails
     */
    protected doPreRunCheck(): boolean {
        if (this.checkRoles) {
            if (this.rolesToCheck.length == 0) {
                this.basicModals.alert({key:"STATUS.WARNING"}, {key:"MESSAGES.MISSING_ICV_RESOURCE_TYPE"}, ModalType.warning);
                return true;
            }
        }
        if (this.checkLanguages) {
            if (this.langsToCheck.length == 0) {
                this.basicModals.alert({key:"STATUS.WARNING"}, {key:"MESSAGES.MISSING_ICV_LANGUAGE"}, ModalType.warning);
                return true;
            }
        }
    }

    protected initPaging(records: any[]) {
        this.pageCount = Math.floor(records.length / this.resultsLimit);
        if (records.length % this.resultsLimit > 0) {
            this.pageCount++;
        }
    }

    protected onResourceClick(res: ARTResource) {
        if (this.isResource(res)) {
            this.sharedModals.openResourceView(res, false);
        }
    }
    
    private isResource(res: ARTNode): boolean {
        return res.isResource();
    }

    /**
     * Listen to the "run" Icv button, check the configuration, in case it is ok execute the ICV
     */
    runIcv() {
        if (this.doPreRunCheck()) {
            return;
        }
        this.executeIcv();
    };

    /**
     * Execute the check
     */
    abstract executeIcv(): void;

}