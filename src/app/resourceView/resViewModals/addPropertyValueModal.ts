import { Component } from "@angular/core";
import { DialogRef, ModalComponent } from "ngx-modialog";
import { BSModalContext } from 'ngx-modialog/plugins/bootstrap';
import { ARTLiteral, ARTResource, ARTURIResource, RDFResourceRolesEnum, ResAttribute } from '../../models/ARTResources';
import { OWL, RDF, RDFS, SKOS, SKOSXL } from '../../models/Vocabulary';
import { ManchesterServices } from "../../services/manchesterServices";
import { PropertyServices, RangeType } from "../../services/propertyServices";
import { VBProperties } from '../../utils/VBProperties';
import { BasicModalServices } from '../../widget/modal/basicModal/basicModalServices';
import { BrowsingModalServices } from '../../widget/modal/browsingModal/browsingModalServices';

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
    private enrichingProperty: ARTURIResource;

    private viewType: ViewType;

    //restrictions for trees/lists
    //attribute useful for different Tree/list components
    private schemes: ARTURIResource[]; //useful if the property that is it going to enrich should allow to select a skos:Concept
    //so the modal should show a concept tree focused on the current scheme

    private propertyType: RDFResourceRolesEnum;
    private rootsForClsIndList: ARTURIResource[];
    private rootsForClsTree: ARTURIResource[];
    private showAllClass: boolean = false;
    private defaultRootClasses: ARTURIResource[] = [RDFS.resource];

    private showAspectSelector: boolean = false;
    private treeListAspectSelector: string = "Existing Resource";
    private manchExprAspectSelector: string = "Manchester Expression";
    private dataRangeAspectSelector: string = "DataRange";
    private aspectSelectors: string[];
    private selectedAspectSelector: string = this.treeListAspectSelector;

    private showInversePropertyCheckbox: boolean = false;

    //available returned data
    private selectedResource: ARTURIResource; //the trees and lists shows only ARTURIResource at the moment
    private manchExpr: string;
    private inverseProp: boolean = false;
    private datarange: ARTLiteral[];

    constructor(public dialog: DialogRef<AddPropertyValueModalData>, public manchService: ManchesterServices, private propService: PropertyServices, 
        private browsingModals: BrowsingModalServices, private basicModals: BasicModalServices, private preferences: VBProperties) {
        this.context = dialog.context;
    }

    ngOnInit() {
        this.rootProperty = this.context.property;
        this.enrichingProperty = this.rootProperty;

        this.updateRange(this.rootProperty);
    }

    private changeProperty() {
        this.browsingModals.browsePropertyTree("Select a property", [this.rootProperty]).then(
            (selectedProp: any) => {
                if (this.enrichingProperty.getURI() != selectedProp.getURI()) {
                    this.enrichingProperty = selectedProp;
                    this.updateRange(this.enrichingProperty);
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
            this.viewType = ViewType.classAndIndividual;
            this.rootsForClsIndList = [SKOS.concept, SKOS.collection];
            return;
        } else if (this.rootProperty.getURI() == RDFS.range.getURI() && 
                this.context.resource.getRole() == RDFResourceRolesEnum.datatypeProperty) {
            /**
             * getRange of rdfs:range returns rdfs:Class as rangeCollection, but if the resource which it is
             * going to enrich is a datatype property, the allowed range should be limited to a datatype.
             * Here I allow to select only a datatype.
             */
            this.viewType = ViewType.datatypeList;
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
                    this.viewType = ViewType.classAndIndividual;
                } else if (ranges.type == RangeType.undetermined) {
                    this.viewType = ViewType.classAndIndividual;
                } else if (ranges.type == RangeType.resource) {
                    //class, concept, conceptScheme, collection, resourcelist, instance, class individual
                    var rangeCollection: ARTURIResource[] = ranges.rangeCollection ? ranges.rangeCollection.resources : null;
                    if (rangeCollection != null) {
                        if (rangeCollection.length == 1) {
                            var rangeClass: ARTURIResource = rangeCollection[0];
                            if (rangeClass.getURI() == RDFS.class.getURI() || rangeClass.getURI() == OWL.class.getURI()) {
                                this.viewType = ViewType.classTree;
                                this.rootsForClsTree = null;
                            } else if (rangeClass.getURI() == SKOS.concept.getURI()) {
                                this.schemes = this.preferences.getActiveSchemes();
                                this.viewType = ViewType.conceptTree;
                            } else if (rangeClass.getURI() == SKOS.conceptScheme.getURI()) {
                                this.viewType = ViewType.schemeList;
                            } else if (rangeClass.getURI() == OWL.objectProperty.getURI()) {
                                this.viewType = ViewType.propertyTree;
                                this.propertyType = RDFResourceRolesEnum.objectProperty;
                            } else if (rangeClass.getURI() == RDF.property.getURI()) {
                                this.viewType = ViewType.propertyTree;
                                this.propertyType = RDFResourceRolesEnum.property;
                            } else if (rangeClass.getURI() == SKOSXL.label.getURI()) {
                                this.viewType = ViewType.classAndIndividual;
                                this.rootsForClsIndList = rangeCollection;
                            } else if (rangeClass.getURI() == RDF.list.getURI()) {
                                this.viewType = ViewType.classAndIndividual;
                                this.rootsForClsIndList = rangeCollection;
                            } else { //default
                                this.viewType = ViewType.classAndIndividual;
                                this.rootsForClsIndList = rangeCollection;
                            }
                        } else { //length > 1
                            this.viewType = ViewType.classAndIndividual;
                            this.rootsForClsIndList = rangeCollection;
                        }
                    } else { //no range classes
                        this.viewType = ViewType.classAndIndividual;
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
     * 
     * Updates also showInversePropertyCheckbox that is useful to show a checkbox under the property-tree
     * used to tell that the inverse of the selected property should be used.
     */
    private updateShowAspectSelector() {
        this.showAspectSelector = false;
        this.showInversePropertyCheckbox = false;

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
        }
        //datarange expression selector
        if (this.rootProperty.getURI() == RDFS.range.getURI() && 
            this.context.resource.getRole() == RDFResourceRolesEnum.datatypeProperty
        ) {
            this.showAspectSelector = true;
            this.aspectSelectors = [this.treeListAspectSelector, this.dataRangeAspectSelector];
            this.selectedAspectSelector = this.aspectSelectors[0]; //select as default tree and list selector
        }
        //predicated for property relations that allows "inverse..."
        if (
            this.rootProperty.getURI() == OWL.propertyDisjointWith.getURI() ||
            this.rootProperty.getURI() == OWL.equivalentProperty.getURI() ||
            this.rootProperty.getURI() == RDFS.subPropertyOf.getURI() ||
            this.rootProperty.getURI() == OWL.inverseOf.getURI()
        ) {
            this.showInversePropertyCheckbox = true;
        }
    }

    private onResourceSelected(resource: ARTURIResource) {
        this.selectedResource = resource;
    }

    private onPropertySelected(resource: ARTURIResource) {
        //Inverse Property checbox is enabled only for object properties, for other properties set it unchecked and disable it
        if (resource.getRole() != RDFResourceRolesEnum.objectProperty) {
            this.inverseProp = false;
        }
        this.onResourceSelected(resource);
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
                        let returnedData: AddPropertyValueModalReturnData = {
                            property: this.enrichingProperty,
                            value: this.manchExpr,
                        }
                        this.dialog.close(returnedData);
                    } else {
                        this.basicModals.alert("Invalid Expression", "'" + this.manchExpr + "' is not a valid Manchester Expression", "error");
                    }
                }
            );
        } else if (this.selectedAspectSelector == this.dataRangeAspectSelector) {
            let returnedData: AddPropertyValueModalReturnData = {
                property: this.enrichingProperty,
                value: this.datarange,
            }
            this.dialog.close(returnedData);
        } else { //treeListAspectSelector
            this.selectedResource.deleteAdditionalProperty(ResAttribute.SELECTED);
            let returnedData: AddPropertyValueModalReturnData = {
                property: this.enrichingProperty,
                value: this.selectedResource,
            }
            if (this.showInversePropertyCheckbox) {
                returnedData.inverseProperty = this.inverseProp;
            }
            this.dialog.close(returnedData);
        }
    }

    cancel() {
        this.dialog.dismiss();
    }

}

export class AddPropertyValueModalReturnData {
    property: ARTURIResource;
    value: any;
    inverseProperty?: boolean;
}

enum ViewType {
    classTree = "classTree",
    conceptTree = "conceptTree",
    propertyTree = "propertyTree", 
    schemeList = "schemeList", 
    datatypeList = "datatypeList",
    classAndIndividual = "classAndIndividual"
}