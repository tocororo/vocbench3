import { Component, Input, ViewChild } from "@angular/core";
import { ARTURIResource, RDFResourceRolesEnum } from "../../models/ARTResources";
import { IndividualsServices } from "../../services/individualsServices";
import { ResourceUtils } from "../../utils/ResourceUtils";
import { BasicModalServices } from "../../widget/modal/basicModal/basicModalServices";
import { BrowsingModalServices } from "../../widget/modal/browsingModal/browsingModalServices";
import { AbstractGraphPanel } from "../abstractGraphPanel";
import { DataGraphSettingsModal } from "../modal/dataGraphSettingsModal";
import { Node } from "../model/Node";
import { DataGraphComponent } from "./dataGraphComponent";
import { DataGraphContext } from "../../models/Graphs";
import { Link } from "../model/Link";
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { ModalOptions } from 'src/app/widget/modal/Modals';


@Component({
    selector: 'data-graph-panel',
    templateUrl: "./dataGraphPanel.html"
})
export class DataGraphPanel extends AbstractGraphPanel {

    @Input() role: RDFResourceRolesEnum;
    @Input() context: DataGraphContext;
    @ViewChild(DataGraphComponent) viewChildGraph: DataGraphComponent;
    
    constructor(basicModals: BasicModalServices, browsingModals: BrowsingModalServices, private modalService: NgbModal, private individualService: IndividualsServices) {
        super(basicModals, browsingModals);
    }

    openSettings() {
        const modalRef: NgbModalRef = this.modalService.open(DataGraphSettingsModal, new ModalOptions('lg'));
        return modalRef.result;
    }

    addNode() {
        let browsePromise: Promise<ARTURIResource>;
        if (ResourceUtils.roleSubsumes(RDFResourceRolesEnum.property, this.role)) {
            browsePromise = this.browsingModals.browsePropertyTree({key:"ACTIONS.ADD_NODE"})
        } else if (this.role == RDFResourceRolesEnum.cls) {
            browsePromise = this.browsingModals.browseClassTree({key:"ACTIONS.ADD_NODE"})
        } else if (this.role == RDFResourceRolesEnum.concept) {
            browsePromise = this.browsingModals.browseConceptTree({key:"ACTIONS.ADD_NODE"})
        } else if (this.role == RDFResourceRolesEnum.conceptScheme) {
            browsePromise = this.browsingModals.browseSchemeList({key:"ACTIONS.ADD_NODE"})
        } else if (this.role == RDFResourceRolesEnum.dataRange) {
            browsePromise = this.browsingModals.browseDatatypeList({key:"ACTIONS.ADD_NODE"})
        } else if (this.role == RDFResourceRolesEnum.individual) {
            browsePromise = this.browsingModals.browseClassIndividualTree({key:"ACTIONS.ADD_NODE"})
        } else if (this.role == RDFResourceRolesEnum.limeLexicon) {
            browsePromise = this.browsingModals.browseLexiconList({key:"ACTIONS.ADD_NODE"})
        } else if (this.role == RDFResourceRolesEnum.ontolexLexicalEntry) {
            browsePromise = this.browsingModals.browseLexicalEntryList({key:"ACTIONS.ADD_NODE"})
        } else if (ResourceUtils.roleSubsumes(RDFResourceRolesEnum.skosCollection, this.role)) {
            browsePromise = this.browsingModals.browseCollectionTree({key:"ACTIONS.ADD_NODE"})
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