import { Component } from "@angular/core";
import { ModalType } from 'src/app/widget/modal/Modals';
import { ARTURIResource, RDFResourceRolesEnum } from "../../models/ARTResources";
import { IcvServices } from "../../services/icvServices";
import { UIUtils } from "../../utils/UIUtils";
import { BasicModalServices } from "../../widget/modal/basicModal/basicModalServices";
import { SharedModalServices } from "../../widget/modal/sharedModal/sharedModalServices";
import { AbstractIcvComponent } from "../abstractIcvComponent";

@Component({
    selector: "broken-alignment",
    templateUrl: "./brokenAlignmentComponent.html",
    host: { class: "pageComponent" }
})
export class BrokenAlignmentComponent extends AbstractIcvComponent {

    checkLanguages = false;
    checkRoles = true;

    rolesUpdated: boolean = false;

    namespaces: NsCheckItem[] = [];

    private HTTP_DEFERENCIATION: { show: string, value: string } = { show: "Http dereferenciation", value: "dereference" };

    brokenRecordList: { subject: ARTURIResource, predicate: ARTURIResource, object: ARTURIResource }[];

    constructor(private icvService: IcvServices, basicModals: BasicModalServices, sharedModals: SharedModalServices) {
        super(basicModals, sharedModals);
    }

    ngAfterViewInit() {
        this.initNamespaces();
    }

    //@Override
    onRolesChanged(roles: RDFResourceRolesEnum[]) {
        this.rolesToCheck = roles;
        this.rolesUpdated = true;
    }

    initNamespaces() {
        UIUtils.startLoadingDiv(document.getElementById("blockDivIcv"));
        this.icvService.listAlignedNamespaces(this.rolesToCheck).subscribe(
            (ns: { count: number; namespace: string; locations: any [] }[]) => {
                UIUtils.stopLoadingDiv(document.getElementById("blockDivIcv"));
                this.rolesUpdated = false;
                this.namespaces = [];
                ns.forEach(n => {
                    this.namespaces.push({ 
                        namespace: n.namespace,
                        count: n.count,
                        check: true,
                        locations: n.locations,
                        resolutions: null,
                        chosenResolutionLocation: null,
                        chosenResolutionOpt: null
                    });
                })
                //init resolutions
                this.namespaces.forEach(ns => {
                    let resolutions: NsResolution = {};
                    if (ns.locations.length == 0) {
                        resolutions["remote"] = [this.HTTP_DEFERENCIATION];
                    }
                    ns.locations.forEach(nsLocation => {
                        if (nsLocation.type == "local") {
                            let option = { 
                                show: "project: '" + nsLocation.name + "'",
                                value: nsLocation.name
                            }
                            if (resolutions[nsLocation.type] == null) {
                                resolutions[nsLocation.type] = [option];
                            } else {
                                resolutions[nsLocation.type].push(option);
                            }
                        } else { //remote
                            if (nsLocation.sparqlEndpoint != null) {
                                let option = { 
                                    show: "Endpoint: " + nsLocation.sparqlEndpoint,
                                    value: nsLocation.sparqlEndpoint
                                }
                                if (resolutions[nsLocation.type] == null) {
                                    resolutions[nsLocation.type] = [option];
                                } else {
                                    resolutions[nsLocation.type].push(option);
                                }
                            } else {
                                resolutions["remote"] = [this.HTTP_DEFERENCIATION];
                            }
                            if (nsLocation.dereferenceable) {
                                if (resolutions[nsLocation.type] == null) {
                                    resolutions[nsLocation.type] = [this.HTTP_DEFERENCIATION];
                                } else {
                                    resolutions[nsLocation.type].push(this.HTTP_DEFERENCIATION);
                                }
                            }
                        }
                    });
                    ns.resolutions = resolutions;
                    ns.chosenResolutionLocation = Object.keys(resolutions)[0];
                    ns.chosenResolutionOpt = resolutions[ns.chosenResolutionLocation][0].value;
                });
            }
        );
    }

    /**
     * Run the check
     */
    executeIcv() {
        let nsParam: string[] = [];
        if (this.namespaces.length == 0) {
            this.basicModals.alert("No alignments", "There are no alignments for the selected resource type(s) on which run the ICV", ModalType.warning);
            return;
        }
        for (var i = 0; i < this.namespaces.length; i++) {
            if (this.namespaces[i].check) {
                nsParam.push(this.namespaces[i].namespace);
            }
        }
        if (nsParam.length == 0) {
            this.basicModals.alert("Missing namespaces", "You need to select at least a namespace in order to run the ICV", ModalType.warning);
            return;
        }

        let mapParam: {[ns: string]: string} = {};
        for (var i = 0; i < this.namespaces.length; i++) {
            if (this.namespaces[i].check) {
                mapParam[this.namespaces[i].namespace] = this.namespaces[i].chosenResolutionLocation + ":" + this.namespaces[i].chosenResolutionOpt;
            }
            
        }

        UIUtils.startLoadingDiv(document.getElementById("blockDivIcv"));
        this.icvService.listBrokenAlignments(mapParam, this.rolesToCheck).subscribe(
            alignments => {
                UIUtils.stopLoadingDiv(document.getElementById("blockDivIcv"));
                this.brokenRecordList = alignments;
                this.initPaging(this.brokenRecordList);
            }
        );
    
    }


    checkAllNs(check: boolean) {
        for (var i = 0; i < this.namespaces.length; i++) {
            this.namespaces[i].check = check;
        }
    }

    private objectKeys(obj: any) {
        return Object.keys(obj);
    }

}

class NsCheckItem {
    namespace: string;
    count: number;
    check: boolean;
    locations: { 
        type: "local" | "remote";
        name?: string; //in case of type local
        title?: string; //in case of type remote
        sparqlEndpoint?: string; //in case of type remote
        dereferenceable?: boolean;
    }[];
    resolutions: NsResolution;
    chosenResolutionLocation: string;
    chosenResolutionOpt: string;
}

class NsResolution {
    [key: string]: { //key is one of "local" or "remote"
        show: string, //label to show in the <select> element
        value: string //value to provide as param to the service: 
    }[];
}