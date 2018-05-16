import { Component, ElementRef, ViewChild } from "@angular/core";
import { DialogRef, ModalComponent } from "ngx-modialog";
import { BSModalContext } from 'ngx-modialog/plugins/bootstrap';
import { OntoManagerServices } from "../../../../services/ontoManagerServices";
import { AuthorizationEvaluator } from "../../../../utils/AuthorizationEvaluator";
import { UIUtils } from "../../../../utils/UIUtils";
import { BasicModalServices } from "../../../../widget/modal/basicModal/basicModalServices";

@Component({
    selector: "onto-mirror-modal",
    templateUrl: "./ontologyMirrorModal.html",
})
export class OntologyMirrorModal implements ModalComponent<BSModalContext> {
    context: BSModalContext;

    @ViewChild('blockingDiv') public blockingDivElement: ElementRef;
    
    private mirrorList: { file: string, baseURI: string }[]; //array of {file: string, namespace: string}

    private changed: boolean = false;

    constructor(public dialog: DialogRef<BSModalContext>, private ontoMgrService: OntoManagerServices, private basicModals: BasicModalServices) {
        this.context = dialog.context;
    }

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
        this.basicModals.prompt("Update ontology mirror from web", "BaseURI").then(
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
        this.basicModals.prompt("Update ontology mirror from web", "URL").then(
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
        this.basicModals.selectFile("Update mirror", null, null, null, ".rdf, .owl, .xml, .ttl, .nt, .n3").then(
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
            stReps => {
                this.changed = true;
                this.refreshOntoMirror();
            }
        );
    }

    ok(event: Event) {
        event.stopPropagation();
        event.preventDefault();
        this.dialog.close(this.changed);
    }


    private isUpdateMirrorAuthorized(): boolean {
        return AuthorizationEvaluator.isAuthorized(AuthorizationEvaluator.Actions.ONT_MANAGER_UPDATE_ONTOLOGY_MIRROR);
    }
    private isDeleteMirrorAuthorized(): boolean {
        return AuthorizationEvaluator.isAuthorized(AuthorizationEvaluator.Actions.ONT_MANAGER_DELETE_ONTOLOGY_MIRROR);
    }

}