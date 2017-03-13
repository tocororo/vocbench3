import { Component } from "@angular/core";
import { BSModalContext } from 'angular2-modal/plugins/bootstrap';
import { DialogRef, ModalComponent } from "angular2-modal";
import { ARTURIResource, ARTResource, RDFResourceRolesEnum, RDFTypesEnum } from '../../models/ARTResources';
import { RDF, RDFS, OWL, SKOS, SKOSXL, XmlSchema } from '../../models/Vocabulary';
import { VocbenchCtx } from '../../utils/VocbenchCtx';
import { BrowsingServices } from '../../widget/modal/browsingModal/browsingServices';
import { ManchesterServices } from "../../services/manchesterServices";
import { PropertyServices } from "../../services/propertyServices";

/**
 * This modal allow the user to create a property-value relation and can be open throght a ResView partition.
 * (NOTE: this modal allow only to create a property-value relation by picking a resource/value pre-existing, this not
 * allows to create a value, indeed it is opened only from the partition that "don't create",
 * e.g. notes and lexicalizations allow to create, not to pick existing label or notes)
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
 * Depending on the range of the enriching property
 */

export class AddPropertyValueModalData extends BSModalContext {
    /**
     * @param title title of the dialog
     * @param resource resource that is going to enrich with the property-value pair. 
     *  Useful, in case the modal is used to add a range to a property, to know if the property is a datatype
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

    private viewType: ViewType;

    //restrictions for trees/lists
    //attribute useful for different Tree/list components
    private scheme: ARTURIResource; //useful if the property that is it going to enrich should allow to select a skos:Concept
    //so the modal should show a concept tree focused on the current scheme
    // private classForInstanceList: ARTURIResource;
    private rootsForClsIndList: ARTURIResource[];
    private propertyType: RDFResourceRolesEnum;


    private manchExprEnabled: boolean = false; //useful to switch between tree selection or manchester expression input field
    private manchExpr: string;

    //datatype to show in a list in case the modal allow to add range to a datatype property
    private datatypes: ARTURIResource[] = [XmlSchema.boolean, XmlSchema.date,
        XmlSchema.dateTime, XmlSchema.float, XmlSchema.integer, XmlSchema.string];

    constructor(public dialog: DialogRef<AddPropertyValueModalData>, public manchService: ManchesterServices,
        private propService: PropertyServices, private browsingService: BrowsingServices, private vbCtx: VocbenchCtx) {
        this.context = dialog.context;
    }

    ngOnInit() {
        this.rootProperty = this.context.property;
        this.selectedProperty = this.rootProperty;

        this.updateRange(this.rootProperty);
    }

    private changeProperty() {
        this.browsingService.browsePropertyTree("Select a property", [this.rootProperty]).then(
            (selectedProp: any) => {
                this.selectedProperty = selectedProp;
            },
            () => { }
        );
    }

    private updateRange(property: ARTURIResource) {
        console.log("updateRange", property);
        // special hard-coded cases:
        if (this.rootProperty.getURI() == SKOS.member.getURI()) {
            /**
             * getRange of skos:member returns range "resource" without rangeCollection classes.
             * Here I allow to select only instances of Concept or Collection
             */
            this.viewType = "classAndIndividual";
            this.rootsForClsIndList = [SKOS.concept, SKOS.collection];
            return;
        } else if (this.rootProperty.getURI() == RDFS.range.getURI() && 
                this.context.resource.getRole() == RDFResourceRolesEnum.datatypeProperty) {
            /**
             * getRange of rdfs:range returns rdfs:Class as rangeCollection, but if the resource which it is
             * going to enrich is a datatype property, the allowed range should be limited to a datatype.
             * Here I allow to select only a datatype.
             */
            this.viewType = "resourceList";
            return;
        }

        this.propService.getRange(property).subscribe(
            range => {
                var ranges = range.ranges;
                var formCollection = range.formCollection; //not used, this modal allow just to pick existing resource
                console.log("range", range);

                /**
                 * range undefined (the property has a custom range that replace the classic)
                 * => default view classAndIndividual (same as ranges.type undetermined)
                 */
                if (range == undefined) {
                    this.viewType = "classAndIndividual";
                } else if (ranges.type == RDFTypesEnum.undetermined) {
                    this.viewType = "classAndIndividual";
                } else if (ranges.type == RDFTypesEnum.resource) {
                    //class, concept, conceptScheme, collection, resourcelist, instance, class individual
                    var rangeCollection: ARTURIResource[] = ranges.rangeCollection;
                    if (rangeCollection != null) {
                        if (rangeCollection.length == 1) {
                            var rangeClass: ARTURIResource = rangeCollection[0];
                            if (rangeClass.getURI() == RDFS.class.getURI() || rangeClass.getURI() == OWL.class.getURI()) {
                                this.viewType = "classTree";
                            } else if (rangeClass.getURI() == SKOS.concept.getURI()) {
                                this.scheme = this.vbCtx.getScheme();
                                this.viewType = "conceptTree";
                            } else if (rangeClass.getURI() == SKOS.conceptScheme.getURI()) {
                                this.viewType = "schemeList";
                            } else if (rangeClass.getURI() == OWL.objectProperty.getURI()) {
                                this.viewType = "propertyTree";
                                this.propertyType = RDFResourceRolesEnum.objectProperty;
                            } else if (rangeClass.getURI() == SKOSXL.label.getURI()) {
                                this.viewType = "classAndIndividual";
                                this.rootsForClsIndList = rangeCollection;
                            } else if (rangeClass.getURI() == RDF.list.getURI()) {
                                //TODO
                                /**
                                 * there should be no property belonging to a RV partition which its
                                 * range is resource and rangeCollection is rdf:List, so at the moment
                                 * I left this block empty
                                 */
                            }
                        } else { //length > 1
                            this.viewType = "classAndIndividual";
                            this.rootsForClsIndList = rangeCollection;
                        }
                    }
                    console.log("viewType", this.viewType);
                }
            }
        )
    }

    /**
     * Tells if the interface should show the selector to switch between class tree or manchester expression input.
     * This depends on the property that should be enriched, if it accept as value a manchester expression.
     * Considers only the root property of the resource view partitions
     */
    private showClassManchSelector() {
        return (
            //partition domains
            this.rootProperty.getURI() == RDFS.domain.getURI() ||
            //partition ranges
            (this.rootProperty.getURI() == RDFS.range.getURI() &&
                this.context.resource.getRole() != RDFResourceRolesEnum.datatypeProperty) ||
            //partition class axiom
            this.rootProperty.getURI() == RDFS.subClassOf.getURI() ||
            this.rootProperty.getURI() == OWL.equivalentClass.getURI() ||
            this.rootProperty.getURI() == OWL.complementOf.getURI() ||
            this.rootProperty.getURI() == OWL.disjointWith.getURI()
        );
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

type ViewType = "classTree" | 
    "conceptTree" | 
    "propertyTree" | 
    "schemeList" | 
    "resourceList" | 
    "classAndIndividual";