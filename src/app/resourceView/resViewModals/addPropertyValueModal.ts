import { Component } from "@angular/core";
import { BSModalContext } from 'angular2-modal/plugins/bootstrap';
import { DialogRef, ModalComponent } from "angular2-modal";
import { ARTURIResource, ARTResource, ARTLiteral, RDFResourceRolesEnum, RDFTypesEnum, ResAttribute } from '../../models/ARTResources';
import { RDF, RDFS, OWL, SKOS, SKOSXL, XmlSchema } from '../../models/Vocabulary';
import { VBProperties } from '../../utils/VBProperties';
import { BasicModalServices } from '../../widget/modal/basicModal/basicModalServices';
import { BrowsingModalServices } from '../../widget/modal/browsingModal/browsingModalServices';
import { ManchesterServices } from "../../services/manchesterServices";
import { PropertyServices } from "../../services/propertyServices";

/**
 * This modal allow the user to create a property-value relation and can be open throght a ResView partition.
 * (NOTE: this modal allow only to create a property-value relation by picking a resource/value pre-existing, this not
 * allows to create a value, indeed it is opened only from the partition that "doesn't create",
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
 * 
 * This modal returns an object {property, value} where value could be:
 * - resource: ARTResource
 * - manchester expression: string
 * - datarange: ARTLiteral[]
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

    private rootProperty: ARTURIResource; //root property of the partition that invoked this modal
    private selectedProperty: ARTURIResource;

    private viewType: ViewType;

    //restrictions for trees/lists
    //attribute useful for different Tree/list components
    private schemes: ARTURIResource[]; //useful if the property that is it going to enrich should allow to select a skos:Concept
    //so the modal should show a concept tree focused on the current scheme
    // private classForInstanceList: ARTURIResource;
    private rootsForClsIndList: ARTURIResource[];
    private propertyType: RDFResourceRolesEnum;

    private rootsForClsTree: ARTURIResource[];

    private showAspectSelector: boolean = false;
    private treeListAspectSelector: string = "Existing Resource";
    private manchExprAspectSelector: string = "Manchester Expression";
    private dataRangeAspectSelector: string = "DataRange";
    private aspectSelectors: string[];
    private selectedAspectSelector: string = this.treeListAspectSelector;

    //available returned data
    private selectedResource: ARTURIResource; //the trees and lists shows only ARTURIResource at the moment
    private manchExpr: string;
    private datarange: ARTLiteral[];

    //datatype to show in a list in case the modal allow to add range to a datatype property
    private datatypes: ARTURIResource[] = XmlSchema.DATATYPES;

    constructor(public dialog: DialogRef<AddPropertyValueModalData>, public manchService: ManchesterServices,
        private propService: PropertyServices, private browsingModals: BrowsingModalServices, private basicModals: BasicModalServices,
        private preferences: VBProperties) {
        this.context = dialog.context;
    }

    ngOnInit() {
        this.rootProperty = this.context.property;
        this.selectedProperty = this.rootProperty;

        this.updateRange(this.rootProperty);
    }

    private changeProperty() {
        this.browsingModals.browsePropertyTree("Select a property", [this.rootProperty]).then(
            (selectedProp: any) => {
                if (this.selectedProperty.getURI() != selectedProp.getURI()) {
                    this.selectedProperty = selectedProp;
                    this.updateRange(this.selectedProperty);
                }
            },
            () => { }
        );
    }

    private updateRange(property: ARTURIResource) {
        this.updateShowAspectSelector();
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
                    var rangeCollection: ARTURIResource[] = ranges.rangeCollection.resources;
                    if (rangeCollection != null) {
                        if (rangeCollection.length == 1) {
                            var rangeClass: ARTURIResource = rangeCollection[0];
                            if (rangeClass.getURI() == RDFS.class.getURI() || rangeClass.getURI() == OWL.class.getURI()) {
                                this.viewType = "classTree";
                                let role: RDFResourceRolesEnum = this.context.resource.getRole();
                                if (role == RDFResourceRolesEnum.property || role == RDFResourceRolesEnum.annotationProperty ||
                                    role == RDFResourceRolesEnum.datatypeProperty || role == RDFResourceRolesEnum.objectProperty ||
                                    role == RDFResourceRolesEnum.ontologyProperty) {
                                    this.rootsForClsTree = [OWL.thing, RDF.property];
                                } else {
                                    this.rootsForClsTree = null;
                                }
                            } else if (rangeClass.getURI() == SKOS.concept.getURI()) {
                                this.schemes = this.preferences.getActiveSchemes();
                                this.viewType = "conceptTree";
                            } else if (rangeClass.getURI() == SKOS.conceptScheme.getURI()) {
                                this.viewType = "schemeList";
                            } else if (rangeClass.getURI() == OWL.objectProperty.getURI()) {
                                this.viewType = "propertyTree";
                                this.propertyType = RDFResourceRolesEnum.objectProperty;
                            } else if (rangeClass.getURI() == RDF.property.getURI()) {
                                this.viewType = "propertyTree";
                                this.propertyType = RDFResourceRolesEnum.property;
                            } else if (rangeClass.getURI() == SKOSXL.label.getURI()) {
                                this.viewType = "classAndIndividual";
                                this.rootsForClsIndList = rangeCollection;
                            } else if (rangeClass.getURI() == RDF.list.getURI()) {
                                this.viewType = "classAndIndividual";
                                this.rootsForClsIndList = rangeCollection;
                            } else { //default
                                this.viewType = "classAndIndividual";    
                                this.rootsForClsIndList = rangeCollection;
                            }
                        } else { //length > 1
                            this.viewType = "classAndIndividual";
                            this.rootsForClsIndList = rangeCollection;
                        }
                    }
                }
            }
        )
    }

    /**
     * Updates the showAspectSelector that determines if the interface should show the selector to switch between:
     * - tree/list view
     * - manchester expression input
     * - data range creation
     * 
     * This depends on the property that should be enriched:
     * - if it accept as value a manchester expression.
     * - if it accept a datarange as range (and the resource is a datatype property)
     * Considers only the root property of the resource view partitions
     */
    private updateShowAspectSelector() {
        //machester expression selector
        if (//partition domains
            this.rootProperty.getURI() == RDFS.domain.getURI() ||
            //partition ranges
            (this.rootProperty.getURI() == RDFS.range.getURI() &&
                this.context.resource.getRole() != RDFResourceRolesEnum.datatypeProperty) ||
            //partition class axiom
            this.rootProperty.getURI() == RDFS.subClassOf.getURI() ||
            this.rootProperty.getURI() == OWL.equivalentClass.getURI() ||
            this.rootProperty.getURI() == OWL.complementOf.getURI() ||
            this.rootProperty.getURI() == OWL.disjointWith.getURI()
        ) {
            this.showAspectSelector = true;
            this.aspectSelectors = [this.treeListAspectSelector, this.manchExprAspectSelector];
            this.selectedAspectSelector = this.aspectSelectors[0]; //select as default tree and list selector
            return;
        }
        //datarange expression selector
        if (this.rootProperty.getURI() == RDFS.range.getURI() && 
            this.context.resource.getRole() == RDFResourceRolesEnum.datatypeProperty
        ) {
            this.showAspectSelector = true;
            this.aspectSelectors = [this.treeListAspectSelector, this.dataRangeAspectSelector];
            this.selectedAspectSelector = this.aspectSelectors[0]; //select as default tree and list selector
            return;
        }

        this.showAspectSelector = false;
    }

    private onResourceSelected(resource: ARTURIResource) {
        this.selectedResource = resource;
    }

    private onDatarangeChanged(datarange: ARTLiteral[]) {
        this.datarange = datarange;
    }

    /**
     * User can click on OK button just if there is a manchester expression (in case property allows and user choose to add it)
     * or if there is a resource selected in the tree
     */
    private isOkEnabled() {
        if (this.selectedAspectSelector == this.manchExprAspectSelector) {
            return (this.manchExpr && this.manchExpr.trim() != "");
        } else if (this.selectedAspectSelector == this.dataRangeAspectSelector) {
            return (this.datarange != null && this.datarange.length > 0);
        } else {
            return this.selectedResource != null;
        }
    }

    ok(event: Event) {
        event.stopPropagation();
        event.preventDefault();
        if (this.selectedAspectSelector == this.manchExprAspectSelector) {
            this.manchService.checkExpression(this.manchExpr).subscribe(
                valid => {
                    if (valid) {
                        this.dialog.close({ property: this.selectedProperty, value: this.manchExpr });
                    } else {
                        this.basicModals.alert("Invalid Expression", "'" + this.manchExpr + "' is not a valid Manchester Expression", "error");
                    }
                }
            );
        } else if (this.selectedAspectSelector == this.dataRangeAspectSelector) {
            this.dialog.close({ property: this.selectedProperty, value: this.datarange });
        } else {
            this.selectedResource.deleteAdditionalProperty(ResAttribute.SELECTED);
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