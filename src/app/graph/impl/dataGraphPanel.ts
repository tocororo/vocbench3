import { Component, Input, ViewChild } from "@angular/core";
import { Modal, OverlayConfig } from "ngx-modialog";
import { BSModalContextBuilder } from "ngx-modialog/plugins/bootstrap";
import { ARTURIResource, RDFResourceRolesEnum } from "../../models/ARTResources";
import { IndividualsServices } from "../../services/individualsServices";
import { ResourceUtils } from "../../utils/ResourceUtils";
import { BasicModalServices } from "../../widget/modal/basicModal/basicModalServices";
import { BrowsingModalServices } from "../../widget/modal/browsingModal/browsingModalServices";
import { AbstractGraphPanel } from "../abstractGraphPanel";
import { DataGraphSettingsModal } from "../modal/dataGraphSettingsModal";
import { Node } from "../model/Node";
import { DataGraphComponent } from "./dataGraphComponent";

@Component({
    selector: 'data-graph-panel',
    templateUrl: "./dataGraphPanel.html"
})
export class DataGraphPanel extends AbstractGraphPanel {

    @Input() role: RDFResourceRolesEnum;
    @ViewChild(DataGraphComponent) viewChildGraph: DataGraphComponent;

    constructor(basicModals: BasicModalServices, browsingModals: BrowsingModalServices, private modal: Modal, private individualService: IndividualsServices) {
        super(basicModals, browsingModals);
    }

    openSettings() {
        const builder = new BSModalContextBuilder<any>();
        let overlayConfig: OverlayConfig = { context: builder.keyboard(27).size('lg').toJSON() };
        return this.modal.open(DataGraphSettingsModal, overlayConfig).result;
    }

    addNode() {
        let browsePromise: Promise<ARTURIResource>;
        if (ResourceUtils.roleSubsumes(RDFResourceRolesEnum.property, this.role)) {
            browsePromise = this.browsingModals.browsePropertyTree("Add node")
        } else if (this.role == RDFResourceRolesEnum.cls) {
            browsePromise = this.browsingModals.browseClassTree("Add node")
        } else if (this.role == RDFResourceRolesEnum.concept) {
            browsePromise = this.browsingModals.browseConceptTree("Add node")
        } else if (this.role == RDFResourceRolesEnum.conceptScheme) {
            browsePromise = this.browsingModals.browseSchemeList("Add node")
        } else if (this.role == RDFResourceRolesEnum.dataRange) {
            browsePromise = this.browsingModals.browseDatatypeList("Add node")
        } else if (this.role == RDFResourceRolesEnum.individual) {
            browsePromise = this.browsingModals.browseClassIndividualTree("Add node")
        } else if (this.role == RDFResourceRolesEnum.limeLexicon) {
            browsePromise = this.browsingModals.browseLexiconList("Add node")
        } else if (this.role == RDFResourceRolesEnum.ontolexLexicalEntry) {
            browsePromise = this.browsingModals.browseLexicalEntryList("Add node")
        } else if (ResourceUtils.roleSubsumes(RDFResourceRolesEnum.skosCollection, this.role)) {
            browsePromise = this.browsingModals.browseCollectionTree("Add node")
        }
        browsePromise.then(
            res => {
                this.viewChildGraph.addNode(res);
            },
            () => {}
        );
    }

    isExpandEnabled(): boolean {
        return (
            this.selectedElement != null && this.selectedElement instanceof Node && this.selectedElement.res instanceof ARTURIResource &&
            (
                this.selectedElement.res.getRole() == RDFResourceRolesEnum.cls ||
                this.selectedElement.res.getRole() == RDFResourceRolesEnum.concept ||
                this.selectedElement.res.getRole() == RDFResourceRolesEnum.skosCollection ||
                ResourceUtils.roleSubsumes(RDFResourceRolesEnum.property, this.selectedElement.res.getRole())
            )
        )
    }

    expandSubResources() {
        this.viewChildGraph.expandSub();
    }
    expandSuperResources() {
        this.viewChildGraph.expandSuper();
    }

}