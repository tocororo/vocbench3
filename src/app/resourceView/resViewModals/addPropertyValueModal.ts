import { Component } from "@angular/core";
import { BSModalContext } from 'angular2-modal/plugins/bootstrap';
import { DialogRef, ModalComponent } from "angular2-modal";
import { ARTURIResource, ARTResource, RDFResourceRolesEnum } from '../../utils/ARTResources';
import { VocbenchCtx } from '../../utils/VocbenchCtx';
import { RDF, RDFS, OWL, SKOS, SKOSXL, XmlSchema } from '../../utils/Vocabulary';
import { BrowsingServices } from '../../widget/modal/browsingModal/browsingServices';
import { ManchesterServices } from "../../services/manchesterServices";

/**
 * This modal allow the user to create a property-value relation and can be open throght a ResView partition.
 * The property is passed to the modal by the calling partition and tells to the modal that it should allow to enrich
 * that property or its subProperties.
 * The modal is composed mainly by two section:
 * - in the top section is shown 
 *      - the enriching property and it is be possible to change exploring its property tree (opened in turn in an external modal)
 *      - optionally two button to switch (in the view in the second section) between a tree/list to select a resource or a 
 *        manchester expression input field.
 * - in the other section could be shown on of the following:
 *      - a tree (class, concept,...)
 *      - a list (scheme,...)
 *      - an input field for a manchester expression
 * Depending on the enriching property
 */

export class AddPropertyValueModalData extends BSModalContext {
    /**
     * @param title title of the dialog
     * @param resource resource that is going to enrich with the property-value pair. 
     *  Useful in case the modal is used to add a range to a property to know if the property is a datatype
     * @param property root property that the modal should allow to enrich
     * @param propChangeable tells whether the input property can be changed exploring the properties subtree.
     */
    constructor(
        public title: string = 'Add property value',
        public resource: ARTResource,
        public property: ARTURIResource,
        public propChangeable: boolean = true
    ) {
        super();
    }
}

@Component({
    selector: "add-property-value-modal",
    templateUrl: "./addPropertyValueModal.html",
})
export class AddPropertyValueModal implements ModalComponent<AddPropertyValueModalData> {
    context: AddPropertyValueModalData;

    private selectedResource: ARTURIResource; //the trees and lists shows only ARTURIResource at the moment
    private rootProperty: ARTURIResource; //root property of the partition that invoked this modal
    private selectedProperty: ARTURIResource;

    //attribute useful for different Tree/list components
    private scheme: ARTURIResource; //useful if the property that is it going to enrich should allow to select a skos:Concept
    //so the modal should show a concept tree focused on the current scheme
    private classForInstanceList: ARTURIResource;
    private rootsForClsIndList: ARTURIResource[];


    private manchExprEnabled: boolean = false; //useful to switch between tree selection or manchester expression input field
    private manchExpr: string;

    //datatype to show in a list in case the modal allow to add range to a datatype property
    private datatypes: ARTURIResource[] = [XmlSchema.boolean, XmlSchema.date,
    XmlSchema.dateTime, XmlSchema.float, XmlSchema.integer, XmlSchema.string];

    constructor(public dialog: DialogRef<AddPropertyValueModalData>, public manchService: ManchesterServices,
        private browsingService: BrowsingServices, private vbCtx: VocbenchCtx) {
        this.context = dialog.context;
    }

    ngOnInit() {
        this.rootProperty = this.context.property;
        this.selectedProperty = this.rootProperty;

        //scheme
        if (this.showConceptTree()) {
            this.scheme = this.vbCtx.getScheme();
        }

        //class for instance-list
        if (this.rootProperty.getURI() == SKOSXL.labelRelation.getURI()) {
            this.classForInstanceList = SKOSXL.label;
        }

        //root classes for class-individual-list
        if (this.rootProperty.getURI() == SKOS.member.getURI()) {
            this.rootsForClsIndList = [SKOS.concept, SKOS.collection];
        }

        /**
         * I wanted to exploit the range (obtained by a server request) to determine the kind of view in the modal (list, tree, manchester..)
         * E.g. if range was rdfs:Class the modal would have render a class tree, if range was skos:Concept a concept tree,
         * if skos:ConceptScheme a scheme list...
         * The problem is that skos:broader (for example) doesn't have skos:Concept as range, so I'm forced to use the rootProperty
         * to determine the view.
         */
        // this.propService.getRange(this.selectedProperty).subscribe(
        //     stResp => {
        //         console.log("stResp", stResp);
        //         var range: ARTURIResource = stResp.ranges[0];
        //         if (range.getURI() == RDFS.class.getURI()) {
        //             this.selectedPropertyRangeType = RDFResourceRolesEnum.cls;
        //         } else if (range.getURI() == SKOS.concept.getURI()) {
        //             this.selectedPropertyRangeType = RDFResourceRolesEnum.concept;
        //         } else if (range.getURI() == SKOS.conceptScheme.getURI()) {
        //             this.selectedPropertyRangeType = RDFResourceRolesEnum.conceptScheme;
        //         }
        //     }
        // );
    }

    private changeProperty() {
        this.browsingService.browsePropertyTree("Select a property", [this.rootProperty]).then(
            (selectedProp: any) => {
                this.selectedProperty = selectedProp;
            },
            () => { }
        );
    }

    /**
     * Tells if the interface should show the selector to switch between class tree or manchester expression input.
     * This depends on the property that should be enriched, if it accept as value a manchester expression.
     */
    private showClassManchSelector() {
        return (
            this.rootProperty.getURI() == RDFS.domain.getURI() ||
            (this.rootProperty.getURI() == RDFS.range.getURI() && this.context.resource.getRole() != RDFResourceRolesEnum.datatypeProperty) ||
            this.rootProperty.getURI() == RDFS.subClassOf.getURI() ||
            this.rootProperty.getURI() == OWL.equivalentClass.getURI() ||
            this.rootProperty.getURI() == OWL.complementOf.getURI() ||
            this.rootProperty.getURI() == OWL.disjointWith.getURI()
        );
    }

    private showClassTree(): boolean {
        if (!this.manchExprEnabled) {
            return (
                this.rootProperty.getURI() == RDF.type.getURI() ||
                this.rootProperty.getURI() == RDFS.domain.getURI() ||
                (this.rootProperty.getURI() == RDFS.range.getURI() && this.context.resource.getRole() != RDFResourceRolesEnum.datatypeProperty) ||
                this.rootProperty.getURI() == RDFS.subClassOf.getURI() ||
                this.rootProperty.getURI() == OWL.equivalentClass.getURI() ||
                this.rootProperty.getURI() == OWL.complementOf.getURI() ||
                this.rootProperty.getURI() == OWL.disjointWith.getURI()
            );
        } else {
            return false;
        }
    }
    private showPropertyTree(): boolean {
        return (this.rootProperty.getURI() == OWL.inverseOf.getURI());
    }
    private showConceptTree(): boolean {
        return (this.rootProperty.getURI() == SKOS.broader.getURI());
    }
    private showSchemeList(): boolean {
        return (this.rootProperty.getURI() == SKOS.inScheme.getURI() ||
            this.rootProperty.getURI() == SKOS.topConceptOf.getURI());
    }
    private showDatatypeList(): boolean {
        return (this.rootProperty.getURI() == RDFS.range.getURI() &&
            this.context.resource.getRole() == RDFResourceRolesEnum.datatypeProperty);
    }
    private showInstanceList(): boolean {
        return (this.rootProperty.getURI() == SKOSXL.labelRelation.getURI());
    }
    private showClsIndList(): boolean {
        return (this.rootProperty.getURI() == SKOS.member.getURI());
    }


    private onResourceSelected(resource: ARTURIResource) {
        this.selectedResource = resource;
    }

    /**
     * User can click on OK button just if there is a manchester expression (in case property allows and user choose to add it)
     * or if there is a resource selected in the tree
     */
    private isOkEnabled() {
        if (this.manchExprEnabled) {
            return (this.manchExpr && this.manchExpr.trim() != "");
        } else {
            return this.selectedResource != null;
        }
    }

    ok(event: Event) {
        event.stopPropagation();
        event.preventDefault();
        if (this.manchExprEnabled) {
            this.manchService.checkExpression(this.manchExpr).subscribe(
                stResp => {
                    this.dialog.close({ property: this.selectedProperty, value: this.manchExpr });
                }
            );
        } else {
            this.dialog.close({ property: this.selectedProperty, value: this.selectedResource });
        }
    }

    cancel() {
        this.dialog.dismiss();
    }

}