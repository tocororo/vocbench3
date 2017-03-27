import { Component, Input, Output, EventEmitter, ViewChild, ElementRef, SimpleChanges } from "@angular/core";
import { Modal, BSModalContextBuilder } from 'angular2-modal/plugins/bootstrap';
import { OverlayConfig } from 'angular2-modal';
import { ARTNode, ARTResource, ARTURIResource, ARTPredicateObjects, ResAttribute, RDFTypesEnum } from "../models/ARTResources";
import { Deserializer } from "../utils/Deserializer";
import { UIUtils } from "../utils/UIUtils";
import { VBEventHandler } from "../utils/VBEventHandler";
import { VBPreferences } from "../utils/VBPreferences";
import { ResourceViewServices } from "../services/resourceViewServices";
import { AlignmentServices } from "../services/alignmentServices";
import { ResourceAlignmentModal, ResourceAlignmentModalData } from "../alignment/resourceAlignment/resourceAlignmentModal"

@Component({
    selector: "resource-view",
    templateUrl: "./resourceViewComponent.html",
})
export class ResourceViewComponent {

    @Input() resource: ARTResource;
    @Output() dblclickObj: EventEmitter<ARTResource> = new EventEmitter<ARTResource>();

    @ViewChild('blockDiv') blockDivElement: ElementRef;
    private viewInitialized: boolean = false;

    private showInferred = false;

    //partitions
    private resViewResponse: any = null; //to store the getResourceView response and avoid to repeat the request when user switches on/off inference
    private typesColl: ARTPredicateObjects[] = null;
    private classAxiomColl: ARTPredicateObjects[] = null;
    private topconceptofColl: ARTPredicateObjects[] = null;
    private schemesColl: ARTPredicateObjects[] = null;
    private broadersColl: ARTPredicateObjects[] = null;
    private superpropertiesColl: ARTPredicateObjects[] = null;
    private domainsColl: ARTPredicateObjects[] = null;
    private rangesColl: ARTPredicateObjects[] = null;
    private lexicalizationsColl: ARTPredicateObjects[] = null;
    private notesColl: ARTPredicateObjects[] = null;
    private membersColl: ARTPredicateObjects[] = null;
    private membersOrderedColl: ARTPredicateObjects[] = null;
    private propertiesColl: ARTPredicateObjects[] = null;
    private propertyFacets: any[] = null;
    private inverseofColl: ARTPredicateObjects[] = null;
    private labelRelationsColl: ARTPredicateObjects[] = null;

    private eventSubscriptions: any[] = [];

    constructor(private resViewService: ResourceViewServices, private alignServices: AlignmentServices,
        private eventHandler: VBEventHandler, private preferences: VBPreferences, private modal: Modal) {

        this.eventSubscriptions.push(eventHandler.resourceRenamedEvent.subscribe(
            (data: any) => this.buildResourceView(data.newResource)));
    }

    ngOnChanges(changes: SimpleChanges) {
        this.showInferred = this.preferences.getInferenceInResourceView();
        if (changes['resource'].currentValue) {
            if (this.viewInitialized) {
                this.buildResourceView(this.resource);//refresh resource view when Input resource changes
            }
        }
    }

    ngAfterViewInit() {
        this.viewInitialized = true;
        this.buildResourceView(this.resource);
    }

    ngOnDestroy() {
        this.eventHandler.unsubscribeAll(this.eventSubscriptions);
    }

    /**
     * Perform the getResourceView request and build the resource view.
     * Called when
     * - a resource is selected for the first time in a tree
     * - the selected resource changes (not in tab mode where every resource selected opens a new tab,
     *   but in splitted mode when the RV is the same and simply changes the selected resource tho describe)
     * - the resource is renamed, so it needs to refresh
     * - some partition has performed a change and emits an update event (which invokes this method, see template)
     */
    private buildResourceView(res: ARTResource) {
        UIUtils.startLoadingDiv(this.blockDivElement.nativeElement);
        this.resViewService.getResourceView(res).subscribe(
            stResp => {
                this.resViewResponse = stResp;
                this.fillPartitions();
                UIUtils.stopLoadingDiv(this.blockDivElement.nativeElement);
            },
            err => {
                UIUtils.stopLoadingDiv(this.blockDivElement.nativeElement);
            }
        );
    }

    /**
     * Fill all the partitions of the RV. This not requires that the RV description is fetched again from server,
     * in fact if the user switches on/off the inference, there's no need to perform a new request.
     */
    private fillPartitions() {
        //reset all partitions
        this.typesColl = null;
        this.classAxiomColl = null;
        this.topconceptofColl = null;
        this.schemesColl = null;
        this.broadersColl = null;
        this.superpropertiesColl = null;
        this.domainsColl = null;
        this.rangesColl = null;
        this.lexicalizationsColl = null;
        this.membersColl = null;
        this.propertiesColl = null;
        this.propertyFacets = null;
        this.inverseofColl = null;
        this.labelRelationsColl = null;

        var resourcePartition: any = this.resViewResponse.resource;
        this.resource = Deserializer.createRDFResource(resourcePartition);

        var typesPartition: any = this.resViewResponse.types;
        if (typesPartition != null) {
            this.typesColl = Deserializer.createPredicateObjectsList(typesPartition);
            this.filterInferredFromPredObjList(this.typesColl);
        }

        var classAxiomsPartition: any = this.resViewResponse.classaxioms;
        if (classAxiomsPartition != null) {
            this.classAxiomColl = Deserializer.createPredicateObjectsList(classAxiomsPartition);
            this.filterInferredFromPredObjList(this.classAxiomColl);
        }

        var topConceptOfPartition: any = this.resViewResponse.topconceptof;
        if (topConceptOfPartition != null) {
            this.topconceptofColl = Deserializer.createPredicateObjectsList(topConceptOfPartition);
            this.filterInferredFromPredObjList(this.topconceptofColl);
        }

        var schemesPartition: any = this.resViewResponse.schemes;
        if (schemesPartition != null) {
            this.schemesColl = Deserializer.createPredicateObjectsList(schemesPartition);
            this.filterInferredFromPredObjList(this.schemesColl);
        }

        var broadersPartition: any = this.resViewResponse.broaders;
        if (broadersPartition != null) {
            this.broadersColl = Deserializer.createPredicateObjectsList(broadersPartition);
            this.filterInferredFromPredObjList(this.broadersColl);
        }

        var superPropertiesPartition: any = this.resViewResponse.superproperties;
        if (superPropertiesPartition != null) {
            this.superpropertiesColl = Deserializer.createPredicateObjectsList(superPropertiesPartition);
            this.filterInferredFromPredObjList(this.superpropertiesColl);
        }

        var facetsPartition: any = this.resViewResponse.facets;
        if (facetsPartition != null) {
            this.parseFacetsPartition(facetsPartition);
            this.filterInferredFromPredObjList(this.inverseofColl);
        }

        var domainsPartition: any = this.resViewResponse.domains;
        if (domainsPartition != null) {
            this.domainsColl = Deserializer.createPredicateObjectsList(domainsPartition);
            this.filterInferredFromPredObjList(this.domainsColl);
        }

        var rangesPartition: any = this.resViewResponse.ranges;
        if (rangesPartition != null) {
            this.rangesColl = Deserializer.createPredicateObjectsList(rangesPartition);
            this.filterInferredFromPredObjList(this.rangesColl);
        }

        var lexicalizationsPartition: any = this.resViewResponse.lexicalizations;
        if (lexicalizationsPartition != null) {
            this.lexicalizationsColl = Deserializer.createPredicateObjectsList(lexicalizationsPartition);
            this.filterInferredFromPredObjList(this.lexicalizationsColl);
        }

        var notesPartition: any = this.resViewResponse.notes;
        if (notesPartition != null) {
            this.notesColl = Deserializer.createPredicateObjectsList(notesPartition);
            this.filterInferredFromPredObjList(this.notesColl);
        }

        var membersPartition: any = this.resViewResponse.members;
        if (membersPartition != null) {
            this.membersColl = Deserializer.createPredicateObjectsList(membersPartition);
            this.filterInferredFromPredObjList(this.membersColl);
        }

        var membersOrderedPartition: any = this.resViewResponse.membersOrdered;
        if (membersOrderedPartition != null) {
            this.membersOrderedColl = Deserializer.createPredicateObjectsList(membersOrderedPartition);
            this.filterInferredFromPredObjList(this.membersOrderedColl);
        }

        var labelRelationsPartition: any = this.resViewResponse.labelRelations;
        if (labelRelationsPartition != null) {
            this.labelRelationsColl = Deserializer.createPredicateObjectsList(labelRelationsPartition);
            this.filterInferredFromPredObjList(this.labelRelationsColl);
        }

        var propertiesPartition: any = this.resViewResponse.properties;
        this.propertiesColl = Deserializer.createPredicateObjectsList(propertiesPartition);
        this.filterInferredFromPredObjList(this.propertiesColl);
    }

    /**
     * Based on the showInferred param, filter out or let pass inferred information in a predicate-objects list
     */
    private filterInferredFromPredObjList(predObjList: ARTPredicateObjects[]) {
        if (!this.showInferred) {
            for (var i = 0; i < predObjList.length; i++) {
                var objList: ARTNode[] = predObjList[i].getObjects();
                for (var j = 0; j < objList.length; j++) {
                    if (objList[j].getAdditionalProperty(ResAttribute.GRAPHS).includes("http://semanticturkey/inference-graph")) {
                        objList.splice(j, 1);
                        j--;
                    }
                }
                //after filtering the objects list, if the predicate has no more objects, remove it from predObjList
                if (objList.length == 0) {
                    predObjList.splice(i, 1);
                    i--;
                }
            }
        }
    }

    /**
     * Facets partition has a structure different from the other (object list and predicate-object list),
     * so it requires a parser ad hoc (doesn't use the parsers in Deserializer)
     */
    private parseFacetsPartition(facetsPartition: any) {
        var facetsName = ["functional", "inverseFunctional", "symmetric", "transitive"];
        //init default facets
        this.propertyFacets = [];
        for (var i = 0; i < facetsName.length; i++) {
            this.propertyFacets.push({ name: facetsName[i], explicit: this.resource.getAdditionalProperty(ResAttribute.EXPLICIT), value: false });
        }
        //look for facets in resource view
        for (var i = 0; i < facetsName.length; i++) {
            var specificFacetPartition = facetsPartition[facetsName[i]];
            if (specificFacetPartition != undefined) {
                var facet = { name: facetsName[i], explicit: specificFacetPartition.explicit, value: specificFacetPartition.value };
                //replace the default facets
                for (var j = 0; j < this.propertyFacets.length; j++) {
                    if (this.propertyFacets[j].name == facetsName[i]) {
                        this.propertyFacets[j] = facet;
                        break;
                    }
                }
            }
        }
        //parse inverseOf partition in facets
        this.inverseofColl = Deserializer.createPredicateObjectsList(facetsPartition.inverseOf);
    }

    private alignResource() {
        this.openAlignmentModal().then(
            (data: any) => {
                this.alignServices.addAlignment(this.resource, data.property, data.object).subscribe(
                    stResp => { this.buildResourceView(this.resource); }
                );
            },
            () => { }
        );
    }

    /**
     * Opens a modal to create an alignment.
     * @return an object containing "property" and "object", namely the mapping property and the 
     * aligned object
     */
    private openAlignmentModal() {
        var modalData = new ResourceAlignmentModalData(this.resource);
        const builder = new BSModalContextBuilder<ResourceAlignmentModalData>(
            modalData, undefined, ResourceAlignmentModalData
        );
        let overlayConfig: OverlayConfig = { context: builder.keyboard(null).toJSON() };
        return this.modal.open(ResourceAlignmentModal, overlayConfig).then(
            dialog => dialog.result
        );
    }

    private showHideInferred() {
        this.showInferred = !this.showInferred;
        this.preferences.setInferenceInResourceView(this.showInferred);
        this.fillPartitions();
    }

    private objectDblClick(object: ARTResource) {
        this.dblclickObj.emit(object);
    }

}