import { Component, Input, Output, EventEmitter, SimpleChanges } from "@angular/core";

@Component({
    selector: "import-tree",
    templateUrl: "./importTreeComponent.html"
})
export class ImportTreeComponent {
    @Input() imports: {id: string, status: string, imports: any[]}[];
    @Output() nodeRemoved = new EventEmitter<{id: string, status: string, imports: any[]}>();

    constructor() { }

    ngOnChanges(changes: SimpleChanges) {
        if (changes['imports'] && changes['imports'].currentValue) {
            for (var i = 0; i < this.imports.length; i++) {
                this.imports[i]['root'] = true;
            }
        }
    }

    private onNodeRemoved(node: {id: string, status: string, imports: any[]}) {
        this.nodeRemoved.emit(node);
    }

    //EVENT LISTENERS

    // private onClassDeleted(cls: ARTURIResource) {
    //     //check if the class to delete is a root
    //     for (var i = 0; i < this.roots.length; i++) {
    //         if (this.roots[i].getURI() == cls.getURI()) {
    //             this.roots.splice(i, 1);
    //             break;
    //         }
    //     }
    //     //reset the selected node
    //     this.nodeSelected.emit(undefined);
    // }

}