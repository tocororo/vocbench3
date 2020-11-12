import { Component, EventEmitter, HostBinding, Input, Output } from "@angular/core";
import { ARTNode, ARTResource, ARTURIResource, ResAttribute, TripleScopes } from "../../../models/ARTResources";
import { Language } from "../../../models/LanguagesCountries";
import { ResViewPartition } from "../../../models/ResourceView";

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

    @Output() delete = new EventEmitter(); //request to delete the object ("delete" action of the editable-resource or "-" button of reified-resource)
    @Output() update = new EventEmitter(); //a change has been done => request to update the RV
    @Output() edit = new EventEmitter(); //request to edit the object ("edit" action of the editable-resource)
    @Output() copyLocale = new EventEmitter<Language[]>(); //request for to copy the value to different locales ("copy to locale" action of the editable-resource)
    @Output() dblClick = new EventEmitter(); //object dbl clicked
    @Output() link: EventEmitter<ARTURIResource> = new EventEmitter(); //resource in link clicked

    @HostBinding("class.imported") importedClass: boolean = false;
    @HostBinding("class.inferred") inferredClass: boolean = false;

    private graphTitle: string;

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
     * Tells if the given object need to be rendered as reifiedResource or as simple rdfResource.
     * A resource should be rendered as reifiedResource if the predicate has custom range and the object
     * is an ARTBNode or an ARTURIResource (so a reifiable object). Otherwise, if the object is a literal
     * or the predicate has no custom range, the object should be rendered as simple rdfResource
     * @param object object of the predicate object list to render in view.
     */
    renderAsReified() {
        return (
            this.predicate.getAdditionalProperty(ResAttribute.HAS_CUSTOM_RANGE) && 
            this.object.isResource() && !this.object.getAdditionalProperty(ResAttribute.NOT_REIFIED)
        );
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
    private onLinkClick(linkRes: ARTURIResource) {
        this.link.emit(linkRes);
    }
    private onCopyLocale(locales: Language[]) {
        this.copyLocale.emit(locales);
    }

}