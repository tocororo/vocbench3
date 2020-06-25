import { Component, ElementRef, EventEmitter, Input, Output, SimpleChanges, ViewChild } from "@angular/core";
import { Observable, Subscription } from "rxjs";
import { CollaborationModalServices } from "../../collaboration/collaborationModalService";
import { ARTNode, ARTPredicateObjects, ARTResource, ARTURIResource, LocalResourcePosition, RDFResourceRolesEnum, RemoteResourcePosition, ResAttribute, ResourcePosition } from "../../models/ARTResources";
import { Issue } from "../../models/Collaboration";
import { VersionInfo } from "../../models/History";
import { Project } from "../../models/Project";
import { NotificationStatus } from "../../models/Properties";
import { PropertyFacet, ResourceViewCtx, ResViewPartition } from "../../models/ResourceView";
import { SemanticTurkey } from "../../models/Vocabulary";
import { CollaborationServices } from "../../services/collaborationServices";
import { MetadataRegistryServices } from "../../services/metadataRegistryServices";
import { ResourcesServices } from "../../services/resourcesServices";
import { ResourceViewServices } from "../../services/resourceViewServices";
import { UserNotificationServices } from "../../services/userNotificationServices";
import { VersionsServices } from "../../services/versionsServices";
import { AuthorizationEvaluator, CRUDEnum, ResourceViewAuthEvaluator } from "../../utils/AuthorizationEvaluator";
import { Deserializer } from "../../utils/Deserializer";
import { HttpServiceContext } from "../../utils/HttpManager";
import { ResourceUtils, SortAttribute } from "../../utils/ResourceUtils";
import { UIUtils } from "../../utils/UIUtils";
import { VBActionsEnum } from "../../utils/VBActions";
import { VBCollaboration } from "../../utils/VBCollaboration";
import { ProjectContext, VBContext } from "../../utils/VBContext";
import { VBEventHandler } from "../../utils/VBEventHandler";
import { VBProperties } from "../../utils/VBProperties";
import { BasicModalServices } from "../../widget/modal/basicModal/basicModalServices";
import { MultiActionFunction, MultiActionType, MultipleActionHelper } from "./renderer/multipleActionHelper";
import { ResViewModalServices } from "./resViewModals/resViewModalServices";

@Component({
    selector: "resource-view-editor",
    templateUrl: "./resourceViewEditorComponent.html",
    host: { class: "vbox" },
    styles: [`
        .todo-issues { color: #337ab7 }
        .in-progress-issues { color: #f0ad4e }
        .done-issues { color: #5cb85c }
        .panel-heading .btn.active .glyphicon { color: #4285f4; } `
    ]
})
export class ResourceViewEditorComponent {
    @Input() resource: ARTResource;
    @Input() readonly: boolean = false;
    @Input() context: ResourceViewCtx;
    @Input() projectCtx: ProjectContext;
    @Output() dblclickObj: EventEmitter<ARTResource> = new EventEmitter<ARTResource>();
    @Output() update: EventEmitter<ARTResource> = new EventEmitter<ARTResource>(); //(useful to notify resourceViewTabbed that resource is updated)

    @ViewChild('blockDiv') blockDivElement: ElementRef;
    private viewInitialized: boolean = false; //in order to wait blockDiv to be ready

    private eventSubscriptions: Subscription[] = [];

    private unknownHost: boolean = false; //tells if the resource view of the current resource failed to be fetched due to a UnknownHostException
    private unexistingResource: boolean = false; //tells if the requested resource does not exist (empty description)

    private resourcePosition: ResourcePosition;
    private resourcePositionDetails: string; //details about the resource position
    private resourcePositionLocalProj: boolean = false;

    //partitions
    private resViewResponse: any = null; //to store the getResourceView response and avoid to repeat the request when user switches on/off inference
    private broadersColl: ARTPredicateObjects[] = null;
    private classAxiomColl: ARTPredicateObjects[] = null;
    private constituentsColl: ARTPredicateObjects[] = null;
    private datatypeDefinitionColl: ARTPredicateObjects[] = null;
    private denotationsColl: ARTPredicateObjects[] = null;
    private disjointPropertiesColl: ARTPredicateObjects[] = null;
    private domainsColl: ARTPredicateObjects[] = null;
    private equivalentPropertiesColl: ARTPredicateObjects[] = null;
    private evokedLexicalConceptsColl: ARTPredicateObjects[] = null;
    private formBasedPreviewColl: ARTPredicateObjects[] = null;
    private formRepresentationsColl: ARTPredicateObjects[] = null;
    private importsColl: ARTPredicateObjects[] = null;
    private inverseofColl: ARTPredicateObjects[] = null;
    private labelRelationsColl: ARTPredicateObjects[] = null;
    private lexicalFormsColl: ARTPredicateObjects[] = null;
    private lexicalizationsColl: ARTPredicateObjects[] = null;
    private lexicalSensesColl: ARTPredicateObjects[] = null;
    private membersColl: ARTPredicateObjects[] = null;
    private membersOrderedColl: ARTPredicateObjects[] = null;
    private notesColl: ARTPredicateObjects[] = null;
    private propertiesColl: ARTPredicateObjects[] = null;
    private propertyFacets: PropertyFacet[] = null;
    private rangesColl: ARTPredicateObjects[] = null;
    private rdfsMembersColl: ARTPredicateObjects[] = null;
    private schemesColl: ARTPredicateObjects[] = null;
    private subPropertyChainsColl: ARTPredicateObjects[] = null;
    private subtermsColl: ARTPredicateObjects[] = null;
    private superpropertiesColl: ARTPredicateObjects[] = null;
    private topconceptofColl: ARTPredicateObjects[] = null;
    private typesColl: ARTPredicateObjects[] = null;

    //top bar buttons

    private showInferredPristine: boolean = false; //useful to decide whether repeat the getResourceView request once the includeInferred changes
    private showInferred: boolean = false;

    private rendering: boolean = true; //tells if the resource shown inside the partitions should be rendered

    private valueFilterLangEnabled: boolean;

    private collaborationAvailable: boolean = false;
    private collaborationWorking: boolean = false;
    private issuesStruct: { btnClass: "" | "todo-issues" | "done-issues" | "in-progress-issues"; issues: Issue[] } = { 
        btnClass: "", issues: null
    };

    private versioningAvailable: boolean = false;
    private versionList: VersionInfo[];
    private activeVersion: VersionInfo;

    private notificationsAvailable: boolean = false;
    private isWatching: boolean;

    private settingsAvailable: boolean = true;

    constructor(private resViewService: ResourceViewServices, private versionService: VersionsServices, 
        private resourcesService: ResourcesServices, private collaborationService: CollaborationServices, 
        private metadataRegistryService: MetadataRegistryServices, private notificationsService: UserNotificationServices,
        private eventHandler: VBEventHandler, private vbProp: VBProperties, private vbCollaboration: VBCollaboration,
        private basicModals: BasicModalServices, private resViewModals: ResViewModalServices, private collabModals: CollaborationModalServices) {
        this.eventSubscriptions.push(eventHandler.resourceRenamedEvent.subscribe(
            (data: any) => this.onResourceRenamed(data.oldResource, data.newResource)
        ));
        this.eventSubscriptions.push(eventHandler.resourceDeprecatedEvent.subscribe(
            (resource: ARTResource) => this.onResourceUpdated(resource)
        ));
        this.eventSubscriptions.push(eventHandler.collaborationSystemStatusChanged.subscribe(
            () => this.onCollaborationSystemStatusChange()
        ));
        this.eventSubscriptions.push(eventHandler.notificationStatusChangedEvent.subscribe(
            () => this.initNotificationsAvailable()
        ));
        this.eventSubscriptions.push(eventHandler.resourceUpdatedEvent.subscribe(
            (resource: ARTResource) => this.onResourceUpdated(resource)
        ));
    }

    ngOnChanges(changes: SimpleChanges) {
        this.showInferred = this.vbProp.getInferenceInResourceView();
        this.rendering = this.vbProp.getRenderingInResourceView();
        this.valueFilterLangEnabled = VBContext.getWorkingProjectCtx(this.projectCtx).getProjectPreferences().filterValueLang.enabled;

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
     *   but in splitted mode when the RV is the same and simply changes the selected resource to describe)
     * - the resource is renamed, so it needs to refresh
     * - some partition has performed a change and emits an update event (which invokes this method, see template)
     */
    public buildResourceView(res: ARTResource) {
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
                this.unknownHost = false;
                UIUtils.stopLoadingDiv(this.blockDivElement.nativeElement);
            },
            (err: Error) => {
                if (err.name.endsWith("UnknownHostException")) {
                    this.unknownHost = true;
                }
            }
        );

        setTimeout(() => {
            this.collaborationWorking = this.vbCollaboration.isWorking();
            if (this.resource instanceof ARTURIResource && this.collaborationWorking) {
                this.initCollaboration();
            }

            this.versioningAvailable = this.projectCtx == null;
            this.collaborationAvailable = this.collaborationWorking && this.resource.isURIResource() && this.projectCtx == null;
            this.settingsAvailable = this.context != ResourceViewCtx.modal;

            this.initNotificationsAvailable();
        });
    }

    /**
     * Fill all the partitions of the RV. This not requires that the RV description is fetched again from server,
     * in fact if the user switches on/off the inference, there's no need to perform a new request.
     */
    private fillPartitions() {
        var resourcePartition: any = this.resViewResponse.resource;
        this.resource = Deserializer.createRDFResource(resourcePartition);

        this.resourcePosition = ResourcePosition.deserialize(this.resource.getAdditionalProperty(ResAttribute.RESOURCE_POSITION));
        if (
            this.resource.getRole() == RDFResourceRolesEnum.mention && //mention is also the default role (assigned when nature is empty)
            !this.resourcePosition.isLocal() //so for setting readonly to true, check also if the res position is not local
        ) {
            this.readonly = true;
        }

        if (this.resourcePosition instanceof LocalResourcePosition) {
            this.resourcePositionLocalProj = this.resourcePosition.project == VBContext.getWorkingProject().getName();
            this.resourcePositionDetails = this.resourcePosition.project;
        } else if (this.resourcePosition instanceof RemoteResourcePosition) {
            this.metadataRegistryService.getDatasetMetadata(this.resourcePosition.datasetMetadata).subscribe(
                metadata => {
                    if (metadata.title != null) {
                        this.resourcePositionDetails = metadata.title + ", " + metadata.uriSpace;
                    } else {
                        this.resourcePositionDetails = metadata.uriSpace;
                    }
                }
            );
        } //else is unknown => the UI gives the possibility to discover the dataset

        //list of partition filtered out for the role of the current described resource
        let partitionFilter: ResViewPartition[] = VBContext.getWorkingProjectCtx().getProjectPreferences().resViewPartitionFilter[this.resource.getRole()];
        if (partitionFilter == null) {
            partitionFilter = []; //to prevent error later (in partitionFilter.indexOf(partition))
        }

        this.broadersColl = this.initPartition(ResViewPartition.broaders, partitionFilter, true);
        this.classAxiomColl = this.initPartition(ResViewPartition.classaxioms, partitionFilter, true);
        this.constituentsColl = this.initPartition(ResViewPartition.constituents, partitionFilter, false); //ordered server-side
        this.datatypeDefinitionColl = this.initPartition(ResViewPartition.datatypeDefinitions, partitionFilter, true);
        this.denotationsColl = this.initPartition(ResViewPartition.denotations, partitionFilter, true);
        this.disjointPropertiesColl = this.initPartition(ResViewPartition.disjointProperties, partitionFilter, true);
        this.domainsColl = this.initPartition(ResViewPartition.domains, partitionFilter, true);
        this.equivalentPropertiesColl = this.initPartition(ResViewPartition.equivalentProperties, partitionFilter, true);
        this.evokedLexicalConceptsColl = this.initPartition(ResViewPartition.evokedLexicalConcepts, partitionFilter, true);
        this.inverseofColl = this.initFacetsPartition(ResViewPartition.facets, partitionFilter);//dedicated initialization
        this.formBasedPreviewColl = this.initPartition(ResViewPartition.formBasedPreview, partitionFilter, true);
        this.formRepresentationsColl = this.initPartition(ResViewPartition.formRepresentations, partitionFilter, true);
        this.importsColl = this.initPartition(ResViewPartition.imports, partitionFilter, true);
        this.labelRelationsColl = this.initPartition(ResViewPartition.labelRelations, partitionFilter, true);
        this.lexicalizationsColl = this.initPartition(ResViewPartition.lexicalizations, partitionFilter, false); //the sort is performed in the partition according the language
        this.lexicalFormsColl = this.initPartition(ResViewPartition.lexicalForms, partitionFilter, true);
        this.lexicalSensesColl = this.initPartition(ResViewPartition.lexicalSenses, partitionFilter, true);
        this.membersColl = this.initPartition(ResViewPartition.members, partitionFilter, true);
        this.membersOrderedColl = this.initOrderedMembersPartition(ResViewPartition.membersOrdered, partitionFilter);//dedicated initialization
        this.notesColl = this.initPartition(ResViewPartition.notes, partitionFilter, true);
        this.propertiesColl = this.initPartition(ResViewPartition.properties, partitionFilter, true);
        this.rangesColl = this.initPartition(ResViewPartition.ranges, partitionFilter, true);
        this.rdfsMembersColl = this.initPartition(ResViewPartition.rdfsMembers, partitionFilter, false); //ordered server-side
        this.schemesColl = this.initPartition(ResViewPartition.schemes, partitionFilter, true);
        this.subtermsColl = this.initPartition(ResViewPartition.subterms, partitionFilter, true);
        this.subPropertyChainsColl = this.initPartition(ResViewPartition.subPropertyChains, partitionFilter, true);
        this.superpropertiesColl = this.initPartition(ResViewPartition.superproperties, partitionFilter, true);
        this.topconceptofColl = this.initPartition(ResViewPartition.topconceptof, partitionFilter, true);
        this.typesColl = this.initPartition(ResViewPartition.types, partitionFilter, true);

        if (
            //these partitions are always returned, even when resource is not defined, so I need to check also if length == 0
            (!this.resViewResponse[ResViewPartition.lexicalizations] || this.resViewResponse[ResViewPartition.lexicalizations].length == 0) &&
            (!this.resViewResponse[ResViewPartition.properties] || this.resViewResponse[ResViewPartition.properties].length == 0) &&
            (!this.resViewResponse[ResViewPartition.types] || this.resViewResponse[ResViewPartition.types].length == 0) &&
            //partitions optional
            !this.resViewResponse[ResViewPartition.broaders] &&
            !this.resViewResponse[ResViewPartition.classaxioms] &&
            !this.resViewResponse[ResViewPartition.constituents] &&
            !this.resViewResponse[ResViewPartition.datatypeDefinitions] &&
            !this.resViewResponse[ResViewPartition.denotations] &&
            !this.resViewResponse[ResViewPartition.disjointProperties] &&
            !this.resViewResponse[ResViewPartition.domains] &&
            !this.resViewResponse[ResViewPartition.equivalentProperties] &&
            !this.resViewResponse[ResViewPartition.evokedLexicalConcepts] &&
            !this.resViewResponse[ResViewPartition.facets] &&
            !this.resViewResponse[ResViewPartition.formBasedPreview] &&
            !this.resViewResponse[ResViewPartition.formRepresentations] &&
            !this.resViewResponse[ResViewPartition.imports] &&
            !this.resViewResponse[ResViewPartition.labelRelations] &&
            !this.resViewResponse[ResViewPartition.lexicalForms] &&
            !this.resViewResponse[ResViewPartition.lexicalSenses] &&
            !this.resViewResponse[ResViewPartition.members] &&
            !this.resViewResponse[ResViewPartition.membersOrdered] &&
            !this.resViewResponse[ResViewPartition.notes] &&
            !this.resViewResponse[ResViewPartition.ranges] &&
            !this.resViewResponse[ResViewPartition.rdfsMembers] &&
            !this.resViewResponse[ResViewPartition.subPropertyChains] &&
            !this.resViewResponse[ResViewPartition.schemes] &&
            !this.resViewResponse[ResViewPartition.subterms] &&
            !this.resViewResponse[ResViewPartition.superproperties] &&
            !this.resViewResponse[ResViewPartition.topconceptof]
        ) {
            this.unexistingResource = true;
        } else {
            this.unexistingResource = false;
        }
    }

    /**
     * Initializes the poList of a partition:
     * - verifies if the partition should be showed
     * - deserializes the response
     * - filters (eventually) the object list
     * - sorts the object list
     * @param partition 
     * @param partitionFilter 
     * @param sort 
     */
    private initPartition(partition: ResViewPartition, partitionFilter: ResViewPartition[], sort: boolean): ARTPredicateObjects[] {
        let poList: ARTPredicateObjects[];
        let partitionJson: any = this.resViewResponse[partition];
        /**
         * the poList is valorized only if:
         * - the Read is authorized
         * - the partition is not filtered (in the preference)
         * - the partition is present in the response
         */
        if (
            partitionJson != null &&
            ResourceViewAuthEvaluator.isAuthorized(partition, CRUDEnum.R, this.resource) && 
            partitionFilter.indexOf(partition) == -1
        ) {
            poList = Deserializer.createPredicateObjectsList(partitionJson);
            this.filterPredObjList(poList);
            if (sort) {
                this.sortObjects(poList);
            }

            //resolve foreign URIs only for "Other properties" partition
            if (partition == ResViewPartition.properties) {
                this.resolveForeignURI(poList);
            }
        }

        return poList;
    }

    /**
     * The response of the facets partition is different from the others, so initializes it in a dedicated method.
     * 
     * @param partition this could be omitted since this method is used just for facets partition, 
     *  but it is provided anyway in order to be aligned with the initPartition method
     * @param partitionFilter 
     */
    private initFacetsPartition(partition: ResViewPartition, partitionFilter: ResViewPartition[]): ARTPredicateObjects[] {
        let poList: ARTPredicateObjects[]; //poList of inverseof 
        let facetsPartitionJson: any = this.resViewResponse[partition];
        if (
            facetsPartitionJson != null &&
            ResourceViewAuthEvaluator.isAuthorized(partition, CRUDEnum.R, this.resource) && 
            partitionFilter.indexOf(partition) == -1
        ) {
            // this.parseFacetsPartition(facetsPartitionJson);
            this.propertyFacets = [];
            for (var facetName in facetsPartitionJson) {
                if (facetName == "inverseOf") continue;
                this.propertyFacets.push({
                    name: facetName,
                    value: facetsPartitionJson[facetName].value,
                    explicit: facetsPartitionJson[facetName].explicit
                })
            }
            //parse inverseOf partition in facets
            poList = Deserializer.createPredicateObjectsList(facetsPartitionJson.inverseOf);
            this.filterPredObjList(poList);
            this.sortObjects(poList);
        }
        return poList;
    }

    /**
     * The response of the membersOrdered partition is slightly different from the others, so initializes it in a dedicated method.
     * 
     * @param partition this could be omitted since this method is used just for membersOrdered partition,
     *  but it is provided anyway in order to be aligned with the initPartition method
     * @param partitionFilter
     */
    private initOrderedMembersPartition(partition: ResViewPartition, partitionFilter: ResViewPartition[]): ARTPredicateObjects[] {
        let poList: ARTPredicateObjects[];
        let partitionJson: any = this.resViewResponse[partition];
        if (
            partitionJson != null &&
            ResourceViewAuthEvaluator.isAuthorized(partition, CRUDEnum.R, this.resource) && 
            partitionFilter.indexOf(ResViewPartition.membersOrdered) == -1
        ) {
            poList = Deserializer.createPredicateObjectsList(partitionJson);
            //the "explicit" attribute for the collection members is not declared => set the attribute based on the explicit of the collection
            for (var i = 0; i < poList.length; i++) { //for each pred-obj-list
                let collections = poList[i].getObjects();
                for (var j = 0; j < collections.length; j++) { //for each collection (member list, should be just 1)
                    if (collections[j].getAdditionalProperty(ResAttribute.EXPLICIT)) { //set member explicit only if collection is explicit
                        let members: ARTResource[] = collections[j].getAdditionalProperty(ResAttribute.MEMBERS);
                        for (var k = 0; k < members.length; k++) {
                            members[k].setAdditionalProperty(ResAttribute.EXPLICIT, true);
                        }
                    }
                }
            }
            this.filterPredObjList(poList);
            this.sortObjects(poList);
        }
        return poList;
    }

    private filterPredObjList(predObjList: ARTPredicateObjects[]) {
        this.filterInferredFromPredObjList(predObjList);
        this.filterValueLanguageFromPrefObjList(predObjList);
    }

    /**
     * Based on the showInferred param, filter out or let pass inferred information in a predicate-objects list
     */
    private filterInferredFromPredObjList(predObjList: ARTPredicateObjects[]) {
        if (!this.showInferred) {
            for (var i = 0; i < predObjList.length; i++) {
                var objList: ARTNode[] = predObjList[i].getObjects();
                for (var j = 0; j < objList.length; j++) {
                    let objGraphs: ARTURIResource[] = objList[j].getTripleGraphs();
                    if (ResourceUtils.containsNode(objGraphs, new ARTURIResource(SemanticTurkey.inferenceGraph))) {
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

    private filterValueLanguageFromPrefObjList(predObjList: ARTPredicateObjects[]) {
        //even if already initialized, get each time the value of valueFilterLangEnabled in order to detect eventual changes of the pref
        this.valueFilterLangEnabled = VBContext.getWorkingProjectCtx(this.projectCtx).getProjectPreferences().filterValueLang.enabled;
        if (this.valueFilterLangEnabled) {
            let valueFilterLanguages = VBContext.getWorkingProjectCtx(this.projectCtx).getProjectPreferences().filterValueLang.languages;
            if (valueFilterLanguages.length == 0) return;
            for (var i = 0; i < predObjList.length; i++) {
                var objList: ARTNode[] = predObjList[i].getObjects();
                for (var j = 0; j < objList.length; j++) {
                    let lang = objList[j].getAdditionalProperty(ResAttribute.LANG);
                    //remove the object if it has a language not in the languages list of the filter
                    if (lang != null && valueFilterLanguages.indexOf(lang) == -1) {
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

    private sortObjects(predObjList: ARTPredicateObjects[]) {
        //sort by show if rendering is active, uri otherwise
        let attribute: SortAttribute = this.rendering ? SortAttribute.show : SortAttribute.value;
        for (var i = 0; i < predObjList.length; i++) {
            let objList: ARTNode[] = predObjList[i].getObjects();
            ResourceUtils.sortResources(<ARTResource[]>objList, attribute);
        }
    }

    /**
     * Resolves the foreign IRIs of the given predicate object list.
     * This method iterates over the values (objects in the poList) and in case there are foreign IRIs (IRI with role mention),
     * tries to resolve them. The foreign IRIs could represent:
     * - resources in local projects (position local)
     * - resources in remote projects (position remote; currently left unresolved)
     * - URL images to display (position unknown)
     * @param pol 
     */
    private resolveForeignURI(pol: ARTPredicateObjects[]) {
        if (!AuthorizationEvaluator.isAuthorized(VBActionsEnum.resourcesGetResourcePosition)) {
            return; //if not authorized to get the resource position, do not allow foreign uri resolution
        }
        //collect foreign IRIs, namely IRI values with role mention
        let foreignResources: ARTURIResource[] = [];
        pol.forEach(po => {
            po.getObjects().forEach(o => {
                if (o instanceof ARTURIResource && o.getRole() == RDFResourceRolesEnum.mention) { //if it is a URI mention
                    foreignResources.push(o);
                }
            })
        });
        if (foreignResources.length > 0) {
            //retrieve the position of the foreign resources
            this.resourcesService.getResourcesPosition(foreignResources).subscribe(
                positionMap => {
                    //collect the foreign resources grouped by project
                    let candidateImageURLs: string[] = []; //list of foreign IRIs which position is unknown
                    let localProjectResourcesMap: { [projectName: string]: string[] } = {}; //for each local project -> list of IRI to resolve
                    for (let resIri in positionMap) {
                        let position = positionMap[resIri];
                        if (position.isLocal()) {
                            let projectName = (<LocalResourcePosition>position).project;
                            if (projectName != VBContext.getWorkingProject().getName()) {
                                if (localProjectResourcesMap[projectName] == null) {
                                    localProjectResourcesMap[projectName] = [resIri];
                                } else {
                                    localProjectResourcesMap[projectName].push(resIri);
                                }
                            }
                        } else if (position.isRemote()) {
                            //at the moment nothing to do
                        } else { //unknown => potential image URL?
                            let url = new URL(resIri); //image URL could have query params appended, getting just pathname of URL resolves the issue
                            if ((/\.(gif|jpg|jpeg|tiff|png)$/i).test(url.pathname)) {
                                candidateImageURLs.push(resIri); //is a candidate only if satisfies the regex
                            }
                        }
                    }
                    /**
                     * Resolves the local project foreign URIs
                     */
                    //prepare the service invocations for resolving the foreign URIs. One invocation for each project
                    let resolveResourcesFn: Observable<void>[] = [];
                    let resolvedResources: ARTURIResource[] = [];
                    for (let projectName in localProjectResourcesMap) {
                        let resources: ARTURIResource[] = localProjectResourcesMap[projectName].map(r => new ARTURIResource(r));
                        HttpServiceContext.setContextProject(new Project(projectName));
                        resolveResourcesFn.push(
                            this.resourcesService.getResourcesInfo(resources).map(
                                resources => {
                                    resolvedResources = resolvedResources.concat(resources);
                                }
                            ).finally(
                                () => HttpServiceContext.removeContextProject()
                            )
                        );
                    }
                    //invoke all the services, then (the resolvedResources array is filled) search and replace the values in the poList
                    Observable.forkJoin(resolveResourcesFn).subscribe(
                        () => {
                            pol.forEach(po => {
                                po.getObjects().forEach((o: ARTNode, index: number, array: ARTNode[]) => {
                                    if (o instanceof ARTURIResource && o.getRole() == RDFResourceRolesEnum.mention) {
                                        let resolved: ARTURIResource = resolvedResources.find(r => r.equals(o)); //search the values among the resolved ones
                                        if (resolved != null) { //if found, replace
                                            //replace the entire value (instead of just the attributes) for triggering the ngOnChanges in the rdf-resource component
                                            let resToReplace: ARTURIResource = <ARTURIResource>array[index].clone();
                                            resToReplace.setShow(resolved.getShow());
                                            resToReplace.setRole(resolved.getRole());
                                            resToReplace.setNature(resolved.getNature());
                                            array[index] = resToReplace; //replace
                                        }
                                    }
                                });
                            });
                        }
                    );
                    /**
                     * Resolves the images URLs
                     */
                    candidateImageURLs.forEach(url => {
                        let i = new Image();
                        i.onload = () => { //if succesfully loaded => it is an image => search and replace the values in the poList
                            pol.forEach(po => {
                                po.getObjects().forEach((o: ARTNode, index: number, array: ARTNode[]) => {
                                    if (o instanceof ARTURIResource && o.getRole() == RDFResourceRolesEnum.mention && o.getURI() == url) {
                                        let resToReplace: ARTURIResource = <ARTURIResource>array[index].clone();
                                        resToReplace.setAdditionalProperty(ResAttribute.IS_IMAGE, true);
                                        array[index] = resToReplace;
                                    }
                                });
                            });
                        }
                        i.src = url;
                    });
                }
            );
        }
    }

    /**
     * HEADING BUTTONS HANDLERS
     */

    private switchInferred() {
        this.showInferred = !this.showInferred;
        this.vbProp.setInferenceInResourceView(this.showInferred);
        if (!this.showInferredPristine) { //resource view has been initialized with showInferred to false, so repeat the request
            this.buildResourceView(this.resource);
        } else { //resource view has been initialized with showInferred to true, so there's no need to repeat the request
            UIUtils.startLoadingDiv(this.blockDivElement.nativeElement);
            this.fillPartitions();
            UIUtils.stopLoadingDiv(this.blockDivElement.nativeElement);
        }
    }

    private switchRendering() {
        this.rendering = !this.rendering;
        this.vbProp.setRenderingInResourceView(this.rendering);
    }

    private switchValueFilterLang() {
        this.valueFilterLangEnabled = !this.valueFilterLangEnabled;
        //update the preference
        let valueFilterLangPref = VBContext.getWorkingProjectCtx(this.projectCtx).getProjectPreferences().filterValueLang;
        valueFilterLangPref.enabled = this.valueFilterLangEnabled;
        this.vbProp.setValueFilterLanguages(valueFilterLangPref);
        //update the RV
        UIUtils.startLoadingDiv(this.blockDivElement.nativeElement);
        this.fillPartitions();
        UIUtils.stopLoadingDiv(this.blockDivElement.nativeElement);
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

    //NOTIFICATIONS HANDLERS
    private initNotificationsAvailable() {
        //notifications available only if the ResView is about a resource of the current project and if notifications are activated
        this.notificationsAvailable = this.projectCtx == null && VBContext.getWorkingProjectCtx(this.projectCtx).getProjectPreferences().notificationStatus != NotificationStatus.no_notifications;
        if (this.notificationsAvailable) { //in case notification are active => init the status of watching
            this.initNotificationsStatus();
        }
    }
    private initNotificationsStatus() {
        this.notificationsService.isWatching(this.resource).subscribe(
            isWatching => {
                this.isWatching = isWatching;
            }
        );
    }
    private changeNotificationStatus() {
        let notificationFn: Observable<void>;
        if (this.isWatching) {
            notificationFn = this.notificationsService.stopWatching(this.resource);
        } else {
            notificationFn = this.notificationsService.startWatching(this.resource);
        }
        notificationFn.subscribe(
            () => {
                this.isWatching = !this.isWatching;
            }
        );
    }
    
    private openSettings() {
        this.resViewModals.editSettings()
    }

    private assertInferredStatements() {
        let poLists: ARTPredicateObjects[][] = [
            this.broadersColl, this.classAxiomColl, this.constituentsColl, this.denotationsColl, this.disjointPropertiesColl,
            this.domainsColl, this.equivalentPropertiesColl, this.evokedLexicalConceptsColl, this.formBasedPreviewColl, 
            this.formRepresentationsColl, this.importsColl, this.inverseofColl, this.labelRelationsColl, this.lexicalFormsColl,
            // this.lexicalizationsColl, //lexicalizations not assertable
            this.lexicalSensesColl, this.membersColl, this.membersOrderedColl, this.notesColl,
            this.propertiesColl, this.rangesColl, this.rdfsMembersColl, this.schemesColl, this.subPropertyChainsColl,
            this.subtermsColl, this.superpropertiesColl, this.topconceptofColl, this.typesColl
        ];

        let assertFn: MultiActionFunction[] = [];
        poLists.forEach((poList: ARTPredicateObjects[]) => {
            if (poList == null) return; //predicate object list null for the current resource (partition not foreseen for the resource role)
            poList.forEach((predObjs: ARTPredicateObjects) => {
                predObjs.getObjects().forEach((obj: ARTNode) => {
                    if (ResourceUtils.isTripleInferred(obj)) {
                        assertFn.push({
                            function: this.resourcesService.addValue(this.resource, predObjs.getPredicate(), obj),
                            value: obj
                        });
                    }
                })
            })
        });
        if (assertFn.length == 0) {
            this.basicModals.alert("Assert inferred statements", "There are no inferred statements to assert", "warning");
        } else {
            let onComplete = () => { //when the assert of all the statements is completed, stop the loading and rebuild the ResView
                UIUtils.stopLoadingDiv(this.blockDivElement.nativeElement);
                this.buildResourceView(this.resource);
            }
            UIUtils.startLoadingDiv(this.blockDivElement.nativeElement);
            MultipleActionHelper.executeActions(assertFn, MultiActionType.addition, this.basicModals, null, null, onComplete);
        }
    }

    // COLLABORATION SYSTEM HANDLERS

    private initCollaboration() {
        this.collaborationService.listIssuesAssignedToResource(<ARTURIResource>this.resource).subscribe(
            issues => {
                this.issuesStruct = {
                    btnClass: "",
                    issues: null
                }
                if (issues.length > 0) {
                    /* Iterate over the issues and add the classes for styling the button of the collaboration system menu
                     * - black (no class applied) if there is no issue
                     * - green (.done-issues) if there are only closed issues
                     * - blue (.todo-issues) if there are at least one open issue
                     */
                    for (var i = 0; i < issues.length; i++) {
                        if (issues[i].getStatusId() == '10000') {
                            this.issuesStruct.btnClass = "todo-issues";
                            break;
                        } else if (issues[i].getStatusId() == '3') {
                            this.issuesStruct.btnClass = "in-progress-issues";
                        } else if (issues[i].getStatusId() == '10001') {
                            if (this.issuesStruct.btnClass != "in-progress-issues") {
                                this.issuesStruct.btnClass = "done-issues";
                            }
                        }
                    }
                    this.issuesStruct.issues = issues;
                }
            },
            (err: Error) => {
                if (this.collaborationWorking) {
                    this.basicModals.alert("Collaboration System error", "The Collaboration System seems to be configured "
                        + "but it's not working (configuration could be not valid or the server may be not reachable), "
                        + "so it will be disabled.", "error", err.stack);
                    this.vbCollaboration.setWorking(false);
                }
            }
        )
    }

    private createIssue() {
        this.collabModals.createIssue().then(
            formMap => {
                UIUtils.startLoadingDiv(this.blockDivElement.nativeElement);
                this.collaborationService.createIssue(<ARTURIResource>this.resource, formMap).subscribe(
                    stResp => {
                        UIUtils.stopLoadingDiv(this.blockDivElement.nativeElement);
                        this.initCollaboration();
                    }
                );
            },
            () => {}
        );
    }

    private assignToIssue() {
        this.collabModals.openIssueList().then(
            issue => {
                UIUtils.startLoadingDiv(this.blockDivElement.nativeElement);
                this.collaborationService.assignResourceToIssue(issue.getKey(), <ARTURIResource>this.resource).subscribe(
                    stResp => {
                        UIUtils.stopLoadingDiv(this.blockDivElement.nativeElement);
                        this.initCollaboration();
                    },
                );
            },
            () => {}
        )
    }

    private onCollaborationSystemStatusChange() {
        this.collaborationWorking = this.vbCollaboration.isWorking();
        if (this.collaborationWorking) { //status changed from notWorking to working => refresh issues lists
            this.initCollaboration();
        }
    }

    //Status bar

    private discoverDataset() {
        UIUtils.startLoadingDiv(this.blockDivElement.nativeElement);
        this.metadataRegistryService.discoverDataset(<ARTURIResource>this.resource).subscribe(
            metadataDataset => {
                UIUtils.stopLoadingDiv(this.blockDivElement.nativeElement);
                this.buildResourceView(this.resource);
            }
        )
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
                (<ARTURIResource>this.resource).setURI(newResource.getURI());
                this.buildResourceView(this.resource); //refresh the resource view in order to update the panel rdf-resource
            }
        }
    }

    private onResourceUpdated(resource: ARTResource) {
        if (this.resource.getNominalValue() == resource.getNominalValue()) {
            this.buildResourceView(this.resource);
        }
    }

}