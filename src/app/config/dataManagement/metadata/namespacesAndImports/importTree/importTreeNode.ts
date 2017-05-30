import { Component, Input, Output, EventEmitter } from "@angular/core";

@Component({
    selector: "import-tree-node",
    templateUrl: "./importTreeNode.html",
})
export class ImportTreeNodeComponent {
    @Input() import: {id: string, status: string, imports: any[]};
    @Output() nodeRemoved = new EventEmitter<{id: string, status: string, imports: any[]}>();

    private open: boolean = true;

    constructor() {}

    private removeImport() {
        this.nodeRemoved.emit(this.import);
    }

    private onNodeRemoved(node: {id: string, status: string, imports: any[]}) {
        this.nodeRemoved.emit(node);
    }

}