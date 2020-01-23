import { Component, Input, Output, EventEmitter, HostBinding } from "@angular/core";
import { ARTNode, ARTResource, ARTURIResource, ResAttribute, TripleScopes } from "../../models/ARTResources";
import { ResViewPartition, AddAction } from "../../models/ResourceView";
import { Language } from "../../models/LanguagesCountries";

@Component({
    selector: "resview-value-renderer",
    templateUrl: "./resourceViewValueRenderer.html",
    host: { class: "listItem" },
    styles: [`
        .imported {
            background-color: #ffffee
        }
        .inferred {
            background-color: #eff0ff
        }
    `]
})
export class ResourceViewValueRenderer {

    @Input() partition: ResViewPartition;
    @Input() subject: ARTResource;
    @Input() predicate: ARTURIResource;
    @Input() object: ARTNode;
    @Input() rendering: boolean;
    @Input() readonly: boolean;

    @Output() delete = new EventEmitter();
    @Output() update = new EventEmitter();
    @Output() edit = new EventEmitter();
    @Output() remove = new EventEmitter();
    @Output() copyLocale = new EventEmitter<Language[]>(); //fire a request for the renderer to copy the value to different locales
    @Output() dblClick = new EventEmitter();

    @HostBinding("class.imported") importedClass: boolean = false;
    @HostBinding("class.inferred") inferredClass: boolean = false;

    private actionRemoveTitle: string;
    private graphTitle: string;

    ngOnInit() {
        //init classes for coloring the value according the scope of the triple imported/inferred
        this.importedClass = this.object.getAdditionalProperty(ResAttribute.TRIPLE_SCOPE) == TripleScopes.imported;
        this.inferredClass = this.object.getAdditionalProperty(ResAttribute.TRIPLE_SCOPE) == TripleScopes.inferred;

        this.actionRemoveTitle = "Remove " + this.predicate.getShow();

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
     * Tells if the given object need to be rendered as reifiedResource or as simple rdfResource.
     * A resource should be rendered as reifiedResource if the predicate has custom range and the object
     * is an ARTBNode or an ARTURIResource (so a reifiable object). Otherwise, if the object is a literal
     * or the predicate has no custom range, the object should be rendered as simple rdfResource
     * @param object object of the predicate object list to render in view.
     */
    private renderAsReified() {
        return (
            this.predicate.getAdditionalProperty(ResAttribute.HAS_CUSTOM_RANGE) && 
            this.object.isResource() && !this.object.getAdditionalProperty(ResAttribute.NOT_REIFIED)
        );
    }

    private removeValue() {
        this.remove.emit();
    }


    /**
     * Events forwarding
     */

    
    /**
     * Removes an object related to the given predicate.
     * This is fired when the "-" button is clicked (near an object).
     */
    private onDelete() {
        this.delete.emit();
    }
    private onEdit() {
        this.edit.emit();
    }
    private onUpdate() {
        this.update.emit();
    }
    private onDblClick() {
        if (this.object.isResource()) {//emit double click only for resources (not for ARTLiteral that cannot be described in a ResView)
            this.dblClick.emit();
        }
    }
    private onCopyLocale(locales: Language[]) {
        this.copyLocale.emit(locales);
    }

}