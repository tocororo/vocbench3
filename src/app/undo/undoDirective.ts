import { Directive, HostListener } from '@angular/core';
import { ARTURIResource } from '../models/ARTResources';
import { CommitInfo } from '../models/History';
import { ClassesServices } from '../services/classesServices';
import { IndividualsServices } from '../services/individualsServices';
import { OntoLexLemonServices } from '../services/ontoLexLemonServices';
import { ResourcesServices } from '../services/resourcesServices';
import { SkosServices } from '../services/skosServices';
import { UndoServices } from '../services/undoServices';
import { VBContext } from '../utils/VBContext';
import { VBEventHandler } from '../utils/VBEventHandler';
import { ToastService } from '../widget/toast/toastService';

@Directive({
    selector: '[undo]'
})
export class UndoDirective {

    constructor(private undoService: UndoServices, private resourceService: ResourcesServices, private individualService: IndividualsServices,
        private ontolexService: OntoLexLemonServices,
        private toastService: ToastService, private eventHandler: VBEventHandler) {}

    @HostListener('window:keydown', ['$event'])
    onKeyDown(e: KeyboardEvent) {
        if ((e.ctrlKey || e.metaKey) && e.key == "z") {
            this.undoHandler();
        }
    }

    private undoHandler() {
        let project = VBContext.getWorkingProject();

        //if no project is accessed, or the accessed one has undo not enabled, do nothing
        if (project == null || !project.isUndoEnabled()) return;

        //perform UNDO only if active element is not a textarea or input (with type text)
        let activeEl: Element = document.activeElement;
        let tagName: string = activeEl.tagName.toLowerCase()
        if (tagName != "textarea" && (tagName != "input" || activeEl.getAttribute("type") != "text")) {
            this.undoService.undo().subscribe(
                (commit: CommitInfo) => {
                    let operation: string = commit.operation.getShow();
                    this.toastService.show({ key: "UNDO.OPERATION_UNDONE" }, { key: "UNDO.OPERATION_UNDONE_INFO", params: { operation: operation} }, { toastClass: "bg-warning", delay: 4000 });
                    this.restoreOldStatus(commit);
                }
            );
        }
    }

    private restoreOldStatus(commit: CommitInfo) {
        let operationId: string = commit.operation.getURI();
        if (commit.created != null) {
            commit.created.forEach(r => {
                if (r instanceof ARTURIResource) {
                    //validation doesn't affect this event, the created resource will be removed
                    this.eventHandler.resourceCreatedUndoneEvent.emit(r);
                }
            })
        }
        if (commit.deleted != null) {
            if (VBContext.getWorkingProjectCtx().getProject().isValidationEnabled()) {
                //if validation enabled, undone of a delete operation is equivalent to an update, since the staged-del graph is removed => emit resource updated
                commit.deleted.forEach(r => {
                    this.resourceService.getResourceDescription(r).subscribe(
                        res => this.eventHandler.resourceUpdatedEvent.emit(res)
                    );
                })
            } else { //in case of validation disabled emit a dedicated event for each structure
                commit.deleted.forEach(r => {
                    if (operationId.endsWith("Classes/deleteClass")) {
                        //I need a service for retrieving super classes
                    } else if (operationId.endsWith("Classes/deleteInstance")) {
                        this.individualService.getNamedTypes(r).subscribe(
                            (types: ARTURIResource[]) => {
                                this.resourceService.getResourceDescription(r).subscribe(
                                    res => this.eventHandler.instanceDeletedUndoneEvent.emit({ resource: res, types: types })
                                );
                            }
                        )
                    } else if (operationId.endsWith("Datatypes/deleteDatatype")) {
                        this.resourceService.getResourceDescription(r).subscribe(
                            res => this.eventHandler.datatypeDeletedUndoneEvent.emit(<ARTURIResource>res)
                        );
                    } else if (operationId.endsWith("OntoLexLemon/deleteLexicalEntry")) {
                        this.ontolexService.getLexicalEntryLexicons(<ARTURIResource>r).subscribe(
                            (lexicons: ARTURIResource[]) => {
                                this.resourceService.getResourceDescription(r).subscribe(
                                    res => this.eventHandler.lexEntryDeletedUndoneEvent.emit({ resource: <ARTURIResource>res, lexicons: lexicons })
                                );
                            }
                        )
                    } else if (operationId.endsWith("OntoLexLemon/deleteLexicon")) {
                        this.resourceService.getResourceDescription(r).subscribe(
                            res => this.eventHandler.lexiconDeletedUndoneEvent.emit(<ARTURIResource>res)
                        );
                    } else if (operationId.endsWith("OntoLexLemon/deleteTranslationSet")) {
                        this.resourceService.getResourceDescription(r).subscribe(
                            res => this.eventHandler.translationSetDeletedUndoneEvent.emit(<ARTURIResource>res)
                        );
                    } else if (operationId.endsWith("Properties/deleteProperty")) {
                        //I need a service for retrieving super properties
                    } else if (operationId.endsWith("SKOS/deleteCollection")) {
                        //I need a service for retrieving super collections
                    } else if (operationId.endsWith("SKOS/deleteConcept")) {
                        /*
                        Here I need to check if the concept to restore should be visible, namely if it belongs to the current active scheme(s).
                        In case, I need to retrieve the broaders and emit the event
                        */
                    } else if (operationId.endsWith("SKOS/deleteConceptScheme")) {
                        this.resourceService.getResourceDescription(r).subscribe(
                            res => this.eventHandler.schemeDeletedUndoneEvent.emit(<ARTURIResource>res)
                        );
                    }
                })
            }
        }
        if (commit.modified != null) {
            commit.modified.forEach(r => {
                //need to retrieve the resource description in order to restore the annotated value into tree/list
                this.resourceService.getResourceDescription(r).subscribe(
                    res => this.eventHandler.resourceUpdatedEvent.emit(res)
                );
            })
        }

    }
}