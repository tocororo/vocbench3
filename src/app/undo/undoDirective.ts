import { Directive, EventEmitter, HostListener } from '@angular/core';
import { CommitInfo } from '../models/History';
import { UndoServices } from '../services/undoServices';
import { VBContext } from '../utils/VBContext';
import { VBEventHandler } from '../utils/VBEventHandler';
import { ToastService } from '../widget/toast/toastService';

@Directive({
    selector: '[undo]'
})
export class UndoDirective {

    constructor(private undoService: UndoServices, private toastService: ToastService, private eventHandler: VBEventHandler) {}

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
        if (commit.created != null) {
            commit.created.forEach(r => { //undo of a created resource => emit event in order to delete
                this.eventHandler.resourceDeletedEvent.emit(r);
            })
        }
        if (commit.deleted != null) {
            commit.deleted.forEach(r => { //undo of a deleted resource => emit event in order to create 
                // TODO check if the resource to recreate should be in a tree or list (how? it could be a top, a child, ...)
                // this.eventHandler.resourceCreatedEvent.emit(r);
            })
        }
        if (commit.modified != null) {
            commit.modified.forEach(r => {
                this.eventHandler.resourceUpdatedEvent.emit(r);
            })
        }

    }
}