import { Directive, HostListener } from '@angular/core';
import { CommitInfo } from '../models/History';
import { UndoServices } from '../services/undoServices';
import { VBContext } from '../utils/VBContext';
import { ToastService } from '../widget/toast/toastService';

@Directive({
    selector: '[undo]'
})
export class UndoDirective {

    constructor(private undoService: UndoServices, private toastService: ToastService) {}

    @HostListener('window:keydown', ['$event'])
    onKeyDown(e: KeyboardEvent) {
        if (e.ctrlKey && e.key == "z") {
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
                    this.toastService.show({ key: "UNDO.OPERATION_UNDONE" }, { key: "UNDO.OPERATION_UNDONE_INFO", params: { operation: operation} }, { toastClass: "bg-warning", delay: 3000 });
                }
            );
        }
    }
}