import { Component } from "@angular/core";
import { BasicModalServices } from "../widget/modal/basicModal/basicModalServices";
import { SharedModalServices } from "../widget/modal/sharedModal/sharedModalServices";
import { ARTNode, ARTResource, RDFResourceRolesEnum } from "../models/ARTResources";

@Component({
    selector: "abstract-icv-component",
    template: "",
    host: { class: "pageComponent" }
})
export abstract class AbstractIcvComponent {

    abstract checkRoles: boolean;
    abstract checkLanguages: boolean;
    protected rolesToCheck: RDFResourceRolesEnum[];
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

    private onRolesChanged(roles: RDFResourceRolesEnum[]) {
        this.rolesToCheck = roles;
    }

    private onLangsChanged(langs: string[]) {
        this.langsToCheck = langs;
    }

    /**
     * Returns true if one of the check fails
     */
    protected doPreRunCheck(): boolean {
        if (this.checkRoles) {
            if (this.rolesToCheck.length == 0) {
                this.basicModals.alert("Missing resource type", "You need to select at least a resource type in order to run the ICV", "warning");
                return true;
            }
        }
        if (this.checkLanguages) {
            if (this.langsToCheck.length == 0) {
                this.basicModals.alert("Missing language", "You need to select at least a language in order to run the ICV", "warning");
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
    private runIcv() {
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