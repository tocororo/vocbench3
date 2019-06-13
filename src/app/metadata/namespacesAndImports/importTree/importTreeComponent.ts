import { Component, Input, Output, EventEmitter, SimpleChanges } from "@angular/core";
import { OntologyImport } from "../../../models/Metadata"

@Component({
    selector: "import-tree",
    templateUrl: "./importTreeComponent.html"
})
export class ImportTreeComponent {
    @Input() imports: OntologyImport[];
    @Output() nodeRemoved = new EventEmitter<OntologyImport>();
    @Output() update = new EventEmitter();

    constructor() { }

    ngOnChanges(changes: SimpleChanges) {
        if (changes['imports'] && changes['imports'].currentValue) {
            for (var i = 0; i < this.imports.length; i++) {
                this.imports[i]['root'] = true;
            }
        }
    }

    private onNodeRemoved(node: OntologyImport) {
        this.nodeRemoved.emit(node);
    }

    private onUpdate() {
        this.update.emit();
    }

}