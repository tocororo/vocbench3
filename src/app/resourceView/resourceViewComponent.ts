import { Component, Input, Output, EventEmitter, ViewChild, ElementRef, SimpleChanges } from "@angular/core";
import { ResViewModalServices } from "./resViewModals/resViewModalServices";
import { ARTNode, ARTResource, ARTURIResource, ARTPredicateObjects, ResAttribute, ResourceUtils } from "../models/ARTResources";
import { VersionInfo } from "../models/History";
import { Deserializer } from "../utils/Deserializer";
import { UIUtils } from "../utils/UIUtils";
import { VBEventHandler } from "../utils/VBEventHandler";
import { VBProperties } from "../utils/VBProperties";
import { HttpServiceContext } from "../utils/HttpManager";
import { ResourceViewServices } from "../services/resourceViewServices";
import { VersionsServices } from "../services/versionsServices";
import { VBContext } from "../utils/VBContext";

@Component({
    selector: "resource-view",
    templateUrl: "./resourceViewComponent.html",
})
export class ResourceViewComponent {

    @Input() resource: ARTResource;
    @Input() readonly: boolean = false;
    @Output() dblclickObj: EventEmitter<ARTResource> = new EventEmitter<ARTResource>();
    @Output() update: EventEmitter<ARTResource> = new EventEmitter<ARTResource>(); //(useful to notify resourceViewTabbed that resource is updated)

    @ViewChild('blockDiv') blockDivElement: ElementRef;
    private viewInitialized: boolean = false; //in order to wait blockDiv to be ready

    private versionList: VersionInfo[];
    private activeVersion: VersionInfo;

    private showInferredPristine: boolean = false; //useful to decide whether repeat the getResourceView request once the includeInferred changes
    private showInferred: boolean = false;

    private rendering: boolean = true; //tells if the resource shown inside the partitions should be rendered

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
    private propertyFacets: { name: string, value: boolean }[] = null;
    private inverseofColl: ARTPredicateObjects[] = null;
    private labelRelationsColl: ARTPredicateObjects[] = null;

    private eventSubscriptions: any[] = [];

    constructor(private resViewService: ResourceViewServices, private versionService: VersionsServices, 
        private eventHandler: VBEventHandler, private preferences: VBProperties, private resViewModals: ResViewModalServices) {
        this.eventSubscriptions.push(eventHandler.resourceRenamedEvent.subscribe(
            (data: any) => this.onResourceRenamed(data.oldResource, data.newResource)
        ));
    }

    ngOnChanges(changes: SimpleChanges) {
        this.showInferred = this.preferences.getInferenceInResourceView();
        this.rendering = this.preferences.getRenderingInResourceView();
        if (changes['resource'] && changes['resource'].currentValue) {
            //if not the first change, avoid to refresh res view if resource is not changed
            if (!changes['resource'].firstChange) { 
                let prevRes: ARTResource = changes['resource'].previousValue;
                if (prevRes.getNominalValue() == this.resource.getNominalValue()) {
                    return;
                }
            }
            if (this.viewInitialized) {
                this.buildResourceView(this.resource);//refresh resource view when Input resource changes
            }
        }
    }

    ngOnInit() {
        this.activeVersion = VBContext.getContextVersion();
        this.readonly = this.readonly || (this.activeVersion != null || HttpServiceContext.getContextVersion() != null); //if the RV is working on an old dump version, disable the updates
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
        this.showInferredPristine = this.showInferred;
        UIUtils.startLoadingDiv(this.blockDivElement.nativeElement);
        if (this.activeVersion != null) {
            HttpServiceContext.setContextVersion(this.activeVersion); //set temprorarly version
        }
        this.resViewService.getResourceView(res, this.showInferred).subscribe(
            stResp => {
                HttpServiceContext.removeContextVersion();
                this.resViewResponse = stResp;
                this.fillPartitions();
                this.update.emit(this.resource);
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
            //response doesn't declare the "explicit" for the collection members, set the attribute based on the explicit of the collection
            for (var i = 0; i < this.membersOrderedColl.length; i++) { //for each pred-obj-list
                let collections = this.membersOrderedColl[i].getObjects();
                for (var j = 0; j < collections.length; j++) { //for each collection (member list, should be just 1)
                    if (collections[j].getAdditionalProperty(ResAttribute.EXPLICIT)) { //set member explicit only if collection is explicit
                        let members: ARTResource[] = collections[j].getAdditionalProperty(ResAttribute.MEMBERS);
                        for (var k = 0; k < members.length; k++) {
                            members[k].setAdditionalProperty(ResAttribute.EXPLICIT, true);
                        }
                    }
                }
            }
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
                    let objGraphs: ARTURIResource[] = objList[j].getGraphs();
                    if (ResourceUtils.containsNode(objGraphs, new ARTURIResource("http://semanticturkey/inference-graph"))) {
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
        var facetsName = ["functional", "inverseFunctional", "reflexive", "irreflexive", "symmetric", "asymmetric", "transitive"];
        //init default facets
        this.propertyFacets = [];
        for (var i = 0; i < facetsName.length; i++) {
            this.propertyFacets.push({ name: facetsName[i], value: false });
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

    /**
     * HEADING BUTTON HANDLERS
     */

    private switchInferred() {
        this.showInferred = !this.showInferred;
        this.preferences.setInferenceInResourceView(this.showInferred);
        if (!this.showInferredPristine) { //resource view has been initialized with showInferred to false, so repeat the request
            this.buildResourceView(this.resource);
        } else { //resource view has been initialized with showInferred to true, so there's no need to repeat the request
            this.fillPartitions();
        }
    }

    private switchRendering() {
        this.rendering = !this.rendering;
        this.preferences.setRenderingInResourceView(this.rendering);
    }

    private listVersions() {
        this.versionService.getVersions().subscribe(
            versions => {
                this.versionList = versions;
                //update the active version
                if (this.activeVersion != null) {
                    for (var i = 0; i < this.versionList.length; i++) {
                        if (this.versionList[i].versionId == this.activeVersion.versionId) {
                            this.activeVersion = this.versionList[i];
                        }
                    }
                }
            }
        );
    }

    private switchToVersion(version?: VersionInfo) {
        if (this.activeVersion != version) {
            this.activeVersion = version;
            this.buildResourceView(this.resource);
        }
        //resView is readonly if one of the temp version and the context version are not null
        this.readonly = this.activeVersion != null || VBContext.getContextVersion() != null;
    }

    private openSettings() {
        this.resViewModals.editSettings();
    }

    /**
     * EVENT LISTENERS
     */

    private objectDblClick(object: ARTResource) {
        this.dblclickObj.emit(object);
    }

    private onResourceRenamed(oldResource: ARTURIResource, newResource: ARTURIResource) {
        if (this.resource.isURIResource()) { //rename affect only URIResource
            if ((<ARTURIResource>this.resource).getURI() == oldResource.getURI()) {
                //replace uri
                (<ARTURIResource>this.resource).setURI(newResource.getURI());
                // this.buildResourceView(this.resource); //need to refresh the resource view?
            }
        }
    }

}