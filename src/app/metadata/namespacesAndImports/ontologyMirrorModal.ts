import { Component, ElementRef, ViewChild } from "@angular/core";
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { OntoManagerServices } from "../../services/ontoManagerServices";
import { AuthorizationEvaluator } from "../../utils/AuthorizationEvaluator";
import { UIUtils } from "../../utils/UIUtils";
import { VBActionsEnum } from "../../utils/VBActions";
import { BasicModalServices } from "../../widget/modal/basicModal/basicModalServices";

@Component({
    selector: "onto-mirror-modal",
    templateUrl: "./ontologyMirrorModal.html",
})
export class OntologyMirrorModal {

    @ViewChild('blockingDiv', { static: true }) public blockingDivElement: ElementRef;
    
    mirrorList: { file: string, baseURI: string }[]; //array of {file: string, namespace: string}

    private changed: boolean = false;

    constructor(public activeModal: NgbActiveModal, private ontoMgrService: OntoManagerServices, private basicModals: BasicModalServices) {}

    ngOnInit() {
        this.refreshOntoMirror();
    }

    private refreshOntoMirror() {
        this.ontoMgrService.getOntologyMirror().subscribe(
            mirrors => {
                this.mirrorList = mirrors;
            }
        );
    }

    /**
     * Opens a modal in order to update the mirror by providing a new baseURI
     * @param mirror an ontology mirror entry, an object {file: string, namespace: string}
     */
    private updateMirrorFromWebWithUri(mirror: { file: string, baseURI: string }) {
        this.basicModals.prompt({key:"ACTIONS.UPDATE_ONTO_MIRROR_FROM_WEB"}, { value: "BaseURI" }).then(
            (newBaseURI: any) => {
                UIUtils.startLoadingDiv(this.blockingDivElement.nativeElement);
                this.ontoMgrService.updateOntologyMirrorEntry("updateFromBaseURI", newBaseURI, mirror.file).subscribe(
                    stResp => {
                        UIUtils.stopLoadingDiv(this.blockingDivElement.nativeElement);
                        this.refreshOntoMirror();
                    }
                );
            },
            () => { }
        );
    }

    /**
     * Opens a modal in order to update the mirror by providing an URL
     * @param mirror an ontology mirror entry, an object {file: string, namespace: string}
     */
    private updateMirrorFromWebFromAltUrl(mirror: { file: string, baseURI: string }) {
        this.basicModals.prompt({key:"ACTIONS.UPDATE_ONTO_MIRROR_FROM_ALT_URL"}, { value: "URL" }).then(
            (url: any) => {
                UIUtils.startLoadingDiv(this.blockingDivElement.nativeElement);
                this.ontoMgrService.updateOntologyMirrorEntry("updateFromAlternativeURL", mirror.baseURI, mirror.file, url).subscribe(
                    stResp => {
                        UIUtils.stopLoadingDiv(this.blockingDivElement.nativeElement);
                        this.refreshOntoMirror();
                    }
                );
            },
            () => { }
        );
    }

    /**
     * Opens a modal in order to update the mirror by providing a local file
     * @param mirror an ontology mirror entry, an object {file: string, namespace: string}
     */
    private updateMirrorFromLocalFile(mirror: { file: string, baseURI: string }) {
        this.basicModals.selectFile({ key: "METADATA.NAMESPACES_AND_IMPORTS.ONTOLOGY_MIRROR_MANAGER.UPDATE_MIRROR" }, null, ".rdf, .owl, .xml, .ttl, .nt, .n3").then(
            (file: any) => {
                UIUtils.startLoadingDiv(this.blockingDivElement.nativeElement);
                this.ontoMgrService.updateOntologyMirrorEntry("updateFromFile", mirror.baseURI, mirror.file, null, file).subscribe(
                    stResp => {
                        UIUtils.stopLoadingDiv(this.blockingDivElement.nativeElement);
                    }
                )
            },
            () => { }
        );
    }

    /**
     * Deletes an ontology mirror stored on server
     * @param mirror an ontology mirror entry, an object {file: string, namespace: string}
     */
    private deleteOntoMirror(mirror: { file: string, baseURI: string }) {
        this.ontoMgrService.deleteOntologyMirrorEntry(mirror.baseURI, mirror.file).subscribe(
            () => {
                this.changed = true;
                this.refreshOntoMirror();
            }
        );
    }

    ok() {
        this.activeModal.close(this.changed);
    }


    private isUpdateMirrorAuthorized(): boolean {
        return AuthorizationEvaluator.isAuthorized(VBActionsEnum.ontManagerUpdateOntologyMirror);
    }
    private isDeleteMirrorAuthorized(): boolean {
        return AuthorizationEvaluator.isAuthorized(VBActionsEnum.ontManagerDeleteOntologyMirror);
    }

}