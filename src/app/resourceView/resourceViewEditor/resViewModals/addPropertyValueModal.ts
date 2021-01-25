import { Component, ElementRef, Input } from "@angular/core";
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ARTLiteral, ARTResource, ARTURIResource, RDFResourceRolesEnum, ResAttribute } from '../../../models/ARTResources';
import { OWL, RDF, RDFS, SKOS, SKOSXL } from '../../../models/Vocabulary';
import { PropertyServices, RangeType } from "../../../services/propertyServices";
import { TreeListContext, UIUtils } from "../../../utils/UIUtils";
import { VBContext } from "../../../utils/VBContext";
import { BrowsingModalServices } from '../../../widget/modal/browsingModal/browsingModalServices';

@Component({
    selector: "add-property-value-modal",
    templateUrl: "./addPropertyValueModal.html",
})
export class AddPropertyValueModal {
    @Input() title: string = 'Add property value';
    @Input() resource: ARTResource;
    @Input() property: ARTURIResource;
    @Input() propChangeable: boolean = true;
    @Input() rootPropertyInput: ARTURIResource;
    @Input() allowMultiselection: boolean = true;

    private treeListCtx: TreeListContext = TreeListContext.addPropValue;

    private rootProperty: ARTURIResource; //root property of the partition that invoked this modal
    enrichingProperty: ARTURIResource;

    private viewType: ViewType;
    private multiselection: boolean = false;

    //restrictions for trees/lists
    //attribute useful for different Tree/list components
    private schemes: ARTURIResource[]; //useful if the property that is it going to enrich should allow to select a skos:Concept
    //so the modal should show a concept tree focused on the current scheme

    private propertyType: RDFResourceRolesEnum;
    private rootsForClsIndList: ARTURIResource[];
    private rootsForClsTree: ARTURIResource[];
    private showAllClass: boolean = false;
    private defaultRootClasses: ARTURIResource[] = [RDFS.resource];

    showAspectSelector: boolean = false;
    treeListAspectSelector: AspectSelector = { show: "Existing Resource", id: 0 };
    manchExprAspectSelector: AspectSelector = { show: "Manchester Expression", id: 1 };
    dataRangeAspectSelector: AspectSelector = { show: "Enumeration", id: 2 };
    private aspectSelectors: AspectSelector[];
    selectedAspectSelector: AspectSelector = this.treeListAspectSelector;

    private showInversePropertyCheckbox: boolean = false;

    //available returned data
    private selectedResource: ARTURIResource; //the trees and lists shows only ARTURIResource at the moment
    private checkedResources: ARTURIResource[] = []; //the adding resources (in case of multiple selection)
    private manchExpr: string;
    private inverseProp: boolean = false; //for properties selection (when viewType is propertyTree and showInversePropertyCheckbox is true)
    private datarange: ARTLiteral[];

    constructor(public activeModal: NgbActiveModal, private propService: PropertyServices, 
        private browsingModals: BrowsingModalServices, private elementRef: ElementRef) {
    }

    ngOnInit() {
        this.rootProperty = this.rootPropertyInput ? this.rootPropertyInput : this.property;
        this.enrichingProperty = this.property;

        this.updateRange(this.rootProperty);
    }

    ngAfterViewInit() {
        UIUtils.setFullSizeModal(this.elementRef)
    }

    changeAspectSelector(selector: AspectSelector) {
        this.selectedAspectSelector = selector;
        //update the modal flex according the selector: if manchester expr there's no need to fill the whole window
        if (this.selectedAspectSelector == this.manchExprAspectSelector) {
            let modalContentElement: HTMLElement = this.elementRef.nativeElement.parentElement;
            modalContentElement.style.removeProperty("flex");
        } else {
            UIUtils.setFullSizeModal(this.elementRef)
        }
    }

    changeProperty() {
        this.browsingModals.browsePropertyTree({key:"DATA.ACTIONS.SELECT_PROPERTY"}, [this.rootProperty]).then(
            (selectedProp: any) => {
                if (!this.enrichingProperty.equals(selectedProp)) {
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
        if (this.rootProperty.equals(SKOS.member)) {
            /**
             * getRange of skos:member returns range "resource" without rangeCollection classes.
             * Here I allow to select only instances of Concept or Collection
             */
            this.viewType = ViewType.classAndIndividual;
            this.rootsForClsIndList = [SKOS.concept, SKOS.collection];
            return;
        } else if (this.rootProperty.equals(RDFS.range) && this.resource.getRole() == RDFResourceRolesEnum.datatypeProperty) {
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
                            if (rangeClass.equals(RDFS.class) || rangeClass.equals(OWL.class)) {
                                this.viewType = ViewType.classTree;
                                this.rootsForClsTree = null;
                            } else if (rangeClass.equals(SKOS.concept)) {
                                this.schemes = VBContext.getWorkingProjectCtx().getProjectPreferences().activeSchemes;
                                this.viewType = ViewType.conceptTree;
                            } else if (rangeClass.equals(SKOS.conceptScheme)) {
                                this.viewType = ViewType.schemeList;
                            } else if (rangeClass.equals(OWL.objectProperty)) {
                                this.viewType = ViewType.propertyTree;
                                this.propertyType = RDFResourceRolesEnum.objectProperty;
                            } else if (rangeClass.equals(RDF.property)) {
                                this.viewType = ViewType.propertyTree;
                                this.propertyType = RDFResourceRolesEnum.property;
                            } else if (rangeClass.equals(SKOSXL.label)) {
                                this.viewType = ViewType.classAndIndividual;
                                this.rootsForClsIndList = rangeCollection;
                            } else if (rangeClass.equals(RDF.list)) {
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
        if (this.resource.getRole() == RDFResourceRolesEnum.datatypeProperty && this.enrichingProperty.equals(RDFS.range)) {
            this.treeListAspectSelector.show = "Existing Datatype"; //in case of setting the range of a datatype property
        } else {
            this.treeListAspectSelector.show = "Existing Resource";
        }

        this.showAspectSelector = false;
        this.showInversePropertyCheckbox = false;

        //machester expression selector
        if (//partition domains
            this.rootProperty.equals(RDFS.domain) ||
            //partition ranges
            (this.rootProperty.equals(RDFS.range) && this.resource.getRole() != RDFResourceRolesEnum.datatypeProperty) ||
            //partition class axiom
            this.rootProperty.equals(RDFS.subClassOf) || this.rootProperty.equals(OWL.equivalentClass) ||
            this.rootProperty.equals(OWL.complementOf) || this.rootProperty.equals(OWL.disjointWith)
        ) {
            this.showAspectSelector = true;
            this.aspectSelectors = [this.treeListAspectSelector, this.manchExprAspectSelector];
            this.selectedAspectSelector = this.aspectSelectors[0]; //select as default tree and list selector
        }
        //datarange expression selector
        if (this.rootProperty.equals(RDFS.range) && this.resource.getRole() == RDFResourceRolesEnum.datatypeProperty
        ) {
            this.showAspectSelector = true;
            this.aspectSelectors = [this.treeListAspectSelector, this.dataRangeAspectSelector];
            this.selectedAspectSelector = this.aspectSelectors[0]; //select as default tree and list selector
        }
        //predicated for property relations that allows "inverse..."
        if (
            this.rootProperty.equals(OWL.propertyDisjointWith) || this.rootProperty.equals(OWL.equivalentProperty) ||
            this.rootProperty.equals(RDFS.subPropertyOf) || this.rootProperty.equals(OWL.inverseOf)
        ) {
            this.showInversePropertyCheckbox = true;
        }
    }

    onResourceSelected(resource: ARTURIResource) {
        this.selectedResource = resource;
    }

    onPropertySelected(resource: ARTURIResource) {
        this.onResourceSelected(resource);
        //Inverse Property checbox is enabled only for object properties, for other properties set it unchecked and disable it
        if (resource != null && resource.getRole() != RDFResourceRolesEnum.objectProperty) {
            this.inverseProp = false;
        }
    }

    /**
     * Inverse Property flag should be enabled only when the selectedResource in an ObjectProperty
     * or, in multiselection mode, when all the checkedResources are ObjectProperty
     */
    isInversePropertyCheckboxEnabled() {
        let enabled: boolean;
        if (this.multiselection) {
            let notObjProp: boolean = false;
            this.checkedResources.forEach((r: ARTURIResource) => { if (r.getRole() != RDFResourceRolesEnum.objectProperty) notObjProp = true; });
            enabled = !notObjProp;
        } else {
            enabled = this.selectedResource != null && this.selectedResource.getRole() == RDFResourceRolesEnum.objectProperty;
        }
        if (!enabled) {
            this.inverseProp = false;
        }
        return enabled;
    }

    onConceptTreeSchemeChange() {
        this.selectedResource = null;
    }

    onMultiselectionChange(multiselection: boolean) {
        this.multiselection = multiselection;
        this.inverseProp = false; //reset inverseProp flag
    }

    /**
     * User can click on OK button just if there is a manchester expression (in case property allows and user choose to add it)
     * or if there is a resource selected in the tree
     */
    isOkEnabled() {
        if (this.selectedAspectSelector == this.manchExprAspectSelector) {
            return (this.manchExpr && this.manchExpr.trim() != "");
        } else if (this.selectedAspectSelector == this.dataRangeAspectSelector) {
            return (this.datarange != null && this.datarange.length > 0);
        } else {
            if (this.multiselection) {
                return this.checkedResources.length > 0;
            } else {
                return this.selectedResource != null;
            }
        }
    }

    ok() {
        if (this.selectedAspectSelector == this.manchExprAspectSelector) {
            let returnedData: AddPropertyValueModalReturnData = {
                property: this.enrichingProperty,
                value: this.manchExpr,
            }
            this.activeModal.close(returnedData);
        } else if (this.selectedAspectSelector == this.dataRangeAspectSelector) {
            let returnedData: AddPropertyValueModalReturnData = {
                property: this.enrichingProperty,
                value: this.datarange,
            }
            this.activeModal.close(returnedData);
        } else { //treeListAspectSelector
            let values: ARTURIResource[]; //selected resource or checked resources
            if (this.multiselection) {
                values = this.checkedResources;
            } else {
                this.selectedResource.deleteAdditionalProperty(ResAttribute.SELECTED);
                values = [this.selectedResource];
            }
            let returnedData: AddPropertyValueModalReturnData = {
                property: this.enrichingProperty,
                value: values
            }
            if (this.showInversePropertyCheckbox) {
                returnedData.inverseProperty = this.inverseProp;
            }
            this.activeModal.close(returnedData);
        }
    }

    cancel() {
        this.activeModal.dismiss();
    }

}

class AspectSelector {
    show: string;
    id: number;
}

export class AddPropertyValueModalReturnData {
    property: ARTURIResource;
    value: any; //string in case of manchester expr || ARTLiteral[] if dataRange || ARTURIResource[] in other cases
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