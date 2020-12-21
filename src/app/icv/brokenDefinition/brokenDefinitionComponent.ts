import { Component } from "@angular/core";
import { AbstractIcvComponent } from "../abstractIcvComponent";
import { BasicModalServices } from "../../widget/modal/basicModal/basicModalServices";
import { SharedModalServices } from "../../widget/modal/sharedModal/sharedModalServices";
import { BrowsingModalServices } from "../../widget/modal/browsingModal/browsingModalServices";
import { ARTURIResource } from "../../models/ARTResources";
import { SKOS } from "../../models/Vocabulary";
import { IcvServices } from "../../services/icvServices";
import { UIUtils } from "../../utils/UIUtils";

@Component({
    selector: "broken-definition-component",
    templateUrl: "./brokenDefinitionComponent.html",
    host: { class: "pageComponent" }
})
export class BrokenDefinitionComponent extends AbstractIcvComponent {

    checkLanguages = false;
    checkRoles = true;

    noteProperty: ARTURIResource = SKOS.note;

    brokenRecordList: { subject: ARTURIResource, predicate: ARTURIResource, object: ARTURIResource }[];

    constructor(private icvService: IcvServices, private browsingModals: BrowsingModalServices,
        basicModals: BasicModalServices, sharedModals: SharedModalServices) {
        super(basicModals, sharedModals);
    }

    /**
     * Run the check
     */
    executeIcv() {
        UIUtils.startLoadingDiv(document.getElementById("blockDivIcv"));
        this.icvService.listBrokenDefinitions(this.rolesToCheck, this.noteProperty).subscribe(
            records => {
                UIUtils.stopLoadingDiv(document.getElementById("blockDivIcv"));
                this.brokenRecordList = records;
                this.initPaging(this.brokenRecordList);
            }
        );
    }

    changeProperty() {
        this.browsingModals.browsePropertyTree({key:"ACTIONS.SELECT_PROPERTY"}, [SKOS.note]).then(
            property => {
                this.noteProperty = property;
            },
            () => {}
        )
    }

}