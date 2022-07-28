import { Component, EventEmitter, HostBinding, Input, Output } from "@angular/core";
import { ARTNode, ARTResource, ARTURIResource, ResAttribute, TripleScopes } from "../../../models/ARTResources";
import { Language } from "../../../models/LanguagesCountries";
import { ResViewPartition } from "../../../models/ResourceView";

@Component({
    selector: "resview-value-renderer",
    templateUrl: "./resourceViewValueRenderer.html",
    host: { class: "listItem d-flex align-items-center" },
})
export class ResourceViewValueRenderer {

    @Input() partition: ResViewPartition;
    @Input() subject: ARTResource;
    @Input() predicate: ARTURIResource;
    @Input() object: ARTNode;
    @Input() rendering: boolean;
    @Input() readonly: boolean;

    @Output() delete = new EventEmitter(); //request to delete the object ("delete" action of the editable-resource or "-" button of reified-resource)
    @Output() update = new EventEmitter(); //a change has been done => request to update the RV
    @Output() edit = new EventEmitter(); //request to edit the object ("edit" action of the editable-resource)
    @Output() copyLocale = new EventEmitter<Language[]>(); //request for to copy the value to different locales ("copy to locale" action of the editable-resource)
    @Output() dblClick: EventEmitter<ARTResource> = new EventEmitter(); //object dbl clicked

    @HostBinding("class.imported") importedClass: boolean = false;
    @HostBinding("class.inferred") inferredClass: boolean = false;

    graphTitle: string;

    ngOnInit() {
        //init classes for coloring the value according the scope of the triple imported/inferred
        this.importedClass = this.object.getAdditionalProperty(ResAttribute.TRIPLE_SCOPE) == TripleScopes.imported;
        this.inferredClass = this.object.getAdditionalProperty(ResAttribute.TRIPLE_SCOPE) == TripleScopes.inferred;

        //init the tooltip for the triple graphs
        let graphs: ARTURIResource[] = this.object.getTripleGraphs();
        if (graphs.length == 1) {
            this.graphTitle = "Graph: " + graphs[0].getURI();
        } else if (graphs.length > 1) {
            this.graphTitle = "Graphs:";
            graphs.forEach(g => {
                this.graphTitle += "\n"+g.getURI();
            });
        }
    }

    /**
     * Events forwarding
     */

    
    /**
     * Removes an object related to the given predicate.
     * This is fired when the "-" button is clicked (near an object).
     */
    onDelete() {
        this.delete.emit();
    }
    onEdit() {
        this.edit.emit();
    }
    onUpdate() {
        this.update.emit();
    }
    onDblClick(obj: ARTResource) {
        this.dblClick.emit(obj);
    }
    onCopyLocale(locales: Language[]) {
        this.copyLocale.emit(locales);
    }

}