import { Component, ElementRef, EventEmitter, Input, Output, SimpleChanges, ViewChild } from "@angular/core";
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { forkJoin, Observable, Subscription } from "rxjs";
import { finalize, map } from 'rxjs/operators';
import { ModalOptions, ModalType } from 'src/app/widget/modal/Modals';
import { CollaborationModalServices } from "../../collaboration/collaborationModalService";
import { ARTNode, ARTPredicateObjects, ARTResource, ARTURIResource, LocalResourcePosition, RDFResourceRolesEnum, RemoteResourcePosition, ResAttribute, ResourcePosition } from "../../models/ARTResources";
import { Issue } from "../../models/Collaboration";
import { VersionInfo } from "../../models/History";
import { Project } from "../../models/Project";
import { NotificationStatus, ProjectPreferences, ResourceViewProjectSettings } from "../../models/Properties";
import { PropertyFacet, ResViewPartition } from "../../models/ResourceView";
import { SemanticTurkey } from "../../models/Vocabulary";
import { CollaborationServices } from "../../services/collaborationServices";
import { MetadataRegistryServices } from "../../services/metadataRegistryServices";
import { NotificationServices } from "../../services/notificationServices";
import { ResourcesServices } from "../../services/resourcesServices";
import { ResourceViewServices } from "../../services/resourceViewServices";
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
import { AbstractResourceView } from "./abstractResourceView";
import { MultiActionFunction, MultiActionType, MultipleActionHelper } from "./renderer/multipleActionHelper";
import { TimeMachineModal } from "./timeMachine/timeMachineModal";

@Component({
    selector: "resource-view-editor",
    templateUrl: "./resourceViewEditorComponent.html",
    host: { class: "vbox" },
    styles: [`
        .todo-issues { color: #337ab7 }
        .in-progress-issues { color: #f0ad4e }
        .done-issues { color: #5cb85c }
        .generic-issues { color: #ff3300 }
        .card-header .btn.active .fas, .card-header .btn.active .far  { color: #4285f4; }
        .dropdown-header { color: black; font-size: 1.125rem; }
        a.dropdown-header:hover { background-color: #e9ecef !important; text-decoration: none; }
        .dropdown-item { padding-left: 2.5rem !important; }
        `
    ]
})
export class ResourceViewEditorComponent extends AbstractResourceView {
    @Input() resource: ARTResource;
    @Input() readonly: boolean = false;
    @Input() inModal: boolean;
    @Input() projectCtx: ProjectContext;
    @Input() atTime: Date; //java.time.ZonedDateTime
    @Output() dblclickObj: EventEmitter<ARTResource> = new EventEmitter<ARTResource>();
    @Output() update: EventEmitter<ARTResource> = new EventEmitter<ARTResource>(); //(useful to notify resourceViewTabbed that resource is updated)

    @ViewChild('blockDiv', { static: true }) blockDivElement: ElementRef;
    private viewInitialized: boolean = false; //in order to wait blockDiv to be ready

    private eventSubscriptions: Subscription[] = [];

    unknownHost: boolean = false; //tells if the resource view of the current resource failed to be fetched due to a UnknownHostException
    unexistingResource: boolean = false; //tells if the requested resource does not exist (empty description)

    resourcePosition: ResourcePosition;
    resourcePositionDetails: string; //details about the resource position
    resourcePositionLocalProj: boolean = false;

    //partitions
    private resViewResponse: any = null; //to store the getResourceView response and avoid to repeat the request when user switches on/off inference
    private resViewSections: { [key: string]: ARTPredicateObjects[] } = {
        [ResViewPartition.broaders]: null,
        [ResViewPartition.classaxioms]: null,
        [ResViewPartition.constituents]: null,
        [ResViewPartition.datatypeDefinitions]: null,
        [ResViewPartition.denotations]: null,
        [ResViewPartition.disjointProperties]: null,
        [ResViewPartition.domains]: null,
        [ResViewPartition.equivalentProperties]: null,
        [ResViewPartition.evokedLexicalConcepts]: null,
        [ResViewPartition.facets]: null,
        [ResViewPartition.formBasedPreview]: null,
        [ResViewPartition.formRepresentations]: null,
        [ResViewPartition.imports]: null,
        [ResViewPartition.labelRelations]: null,
        [ResViewPartition.lexicalForms]: null,
        [ResViewPartition.lexicalSenses]: null,
        [ResViewPartition.lexicalizations]: null,
        [ResViewPartition.members]: null,
        [ResViewPartition.membersOrdered]: null,
        [ResViewPartition.notes]: null,
        [ResViewPartition.properties]: null,
        [ResViewPartition.ranges]: null,
        [ResViewPartition.rdfsMembers]: null,
        [ResViewPartition.schemes]: null,
        [ResViewPartition.subPropertyChains]: null,
        [ResViewPartition.subterms]: null,
        [ResViewPartition.superproperties]: null,
        [ResViewPartition.topconceptof]: null,
        [ResViewPartition.types]: null,
    };
    customSections: string[];
    partitionOrder: { [key: string]: number }; //map partition->position

    private propertyFacets: PropertyFacet[] = null;

    //top bar buttons

    private showInferredPristine: boolean = false; //useful to decide whether repeat the getResourceView request once the includeInferred changes
    showInferred: boolean = false;

    rendering: boolean = true; //tells if the resource shown inside the partitions should be rendered

    valueFilterLangEnabled: boolean;

    collaborationAvailable: boolean = false;
    private issuesStruct: { btnClass: string; issues: Issue[] } = { 
        btnClass: "", issues: null
    };

    //time machine/versioning
    timeActionsEnabled: boolean = false; //tells if the "clock" icon (for versioning and time machine) should be visible 
        //hidden if the @Input() projectCtx or atTime != null, namely RV showing external resource, or showing a resource at a different time)
    timeMachineAvailable: boolean = false; //tells if the conditions for the time machine are satisfied (history enabled)
    versionList: VersionInfo[];
    private activeVersion: VersionInfo;

    notificationsAvailable: boolean = false;
    private isWatching: boolean;

    settingsAvailable: boolean = true;

    constructor(resViewService: ResourceViewServices, modalService: NgbModal, 
        private versionService: VersionsServices, private resourcesService: ResourcesServices, private collaborationService: CollaborationServices, 
        private metadataRegistryService: MetadataRegistryServices, private notificationsService: NotificationServices,
        private eventHandler: VBEventHandler, private vbProp: VBProperties, private vbCollaboration: VBCollaboration,
        private basicModals: BasicModalServices, private collabModals: CollaborationModalServices) {
        super(resViewService, modalService);
        this.eventSubscriptions.push(this.eventHandler.resourceRenamedEvent.subscribe(
            (data: any) => this.onResourceRenamed(data.oldResource, data.newResource)
        ));
        this.eventSubscriptions.push(this.eventHandler.resourceDeprecatedEvent.subscribe(
            (resource: ARTResource) => this.onResourceUpdated(resource)
        ));
        this.eventSubscriptions.push(this.eventHandler.collaborationSystemStatusChanged.subscribe(
            () => this.onCollaborationSystemStatusChange()
        ));
        this.eventSubscriptions.push(this.eventHandler.notificationStatusChangedEvent.subscribe(
            () => this.initNotificationsAvailable()
        ));
        this.eventSubscriptions.push(this.eventHandler.resourceUpdatedEvent.subscribe(
            (resource: ARTResource) => this.onResourceUpdated(resource)
        ));
    }

    ngOnChanges(changes: SimpleChanges) {
        let projPref: ProjectPreferences = VBContext.getWorkingProjectCtx(this.projectCtx).getProjectPreferences();
        this.showInferred = projPref.resViewPreferences.inference;
        this.rendering = projPref.resViewPreferences.rendering;
        this.valueFilterLangEnabled = projPref.filterValueLang.enabled;

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
        if (changes['atTime'] && changes['atTime'].currentValue && !changes['atTime'].firstChange) {
            this.buildResourceView(this.resource);
        }
    }

    ngOnInit() {
        this.activeVersion = VBContext.getContextVersion(); //set globally from Versioning page
        this.readonly = this.readonly || (this.activeVersion != null || HttpServiceContext.getContextVersion() != null) || this.atTime != null; //if the RV is working on an old dump version, disable the updates

        this.initVersions();
    }

    ngAfterViewInit() {
        this.viewInitialized = true;
        this.buildResourceView(this.resource);
    }

    ngOnDestroy() {
        this.eventSubscriptions.forEach(s => s.unsubscribe());
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
        let getResViewFn: Observable<any> = this.resViewService.getResourceView(res, this.showInferred);
        if (this.atTime != null) {
            getResViewFn = this.resViewService.getResourceViewAtTime(<ARTURIResource>res, this.atTime); //cast safe since atTime is provided only if res is IRI
        }
        getResViewFn.subscribe(
            stResp => {
                HttpServiceContext.removeContextVersion();
                this.resViewResponse = stResp;
                this.fillPartitions();
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
            this.updateCollaborationStatus();
            if (this.collaborationAvailable) {
                this.initCollaboration();
            }
            this.timeActionsEnabled = !this.inModal && this.projectCtx == null && this.atTime == null;
            this.settingsAvailable = !this.inModal; //settings available only if RV is shown in data page (not in modal)

            this.initNotificationsAvailable();
        });
    }

    /**
     * Fill all the partitions of the RV. This not requires that the RV description is fetched again from server,
     * in fact if the user switches on/off the inference, there's no need to perform a new request.
     */
    private fillPartitions() {
        let resourcePartition: any = this.resViewResponse.resource;
        this.resource = Deserializer.createRDFResource(resourcePartition);
        this.update.emit(this.resource);

        if (VBContext.getWorkingProject().isValidationEnabled()) {
            this.pendingValidation.emit(ResourceUtils.isResourceInStaging(this.resource));
        }

        this.resourcePosition = ResourcePosition.deserialize(this.resource.getAdditionalProperty(ResAttribute.RESOURCE_POSITION));
        if (
            this.resource.getRole() == RDFResourceRolesEnum.mention && //mention is also the default role (assigned when nature is empty)
            !this.resourcePosition.isLocal() //so for setting readonly to true, check also if the res position is not local
        ) {
            this.readonly = true;
        }

        //time machine available on local IRI resource and in projects with history enabled (no need to check projectCtx, since if it is provided, clock button is already hidden via timeActionsEnabled)
        this.timeMachineAvailable = this.resource.isURIResource() && this.resourcePosition.isLocal() && 
            VBContext.getWorkingProject().isHistoryEnabled() &&
            VBContext.getWorkingProjectCtx().getProjectSettings().timeMachineEnabled;

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
        let partitionFilter: ResViewPartition[] = VBContext.getWorkingProjectCtx().getProjectPreferences().resViewPreferences.resViewPartitionFilter[this.resource.getRole()];
        if (partitionFilter == null) {
            partitionFilter = []; //to prevent error later (in partitionFilter.indexOf(partition))
        }

        this.resViewSections[ResViewPartition.broaders] = this.initPartition(ResViewPartition.broaders, partitionFilter, true);
        this.resViewSections[ResViewPartition.classaxioms] = this.initPartition(ResViewPartition.classaxioms, partitionFilter, true);
        this.resViewSections[ResViewPartition.constituents] = this.initPartition(ResViewPartition.constituents, partitionFilter, false); //ordered server-side
        this.resViewSections[ResViewPartition.datatypeDefinitions] = this.initPartition(ResViewPartition.datatypeDefinitions, partitionFilter, true);
        this.resViewSections[ResViewPartition.denotations] = this.initPartition(ResViewPartition.denotations, partitionFilter, true);
        this.resViewSections[ResViewPartition.disjointProperties] = this.initPartition(ResViewPartition.disjointProperties, partitionFilter, true);
        this.resViewSections[ResViewPartition.domains] = this.initPartition(ResViewPartition.domains, partitionFilter, true);
        this.resViewSections[ResViewPartition.equivalentProperties] = this.initPartition(ResViewPartition.equivalentProperties, partitionFilter, true);
        this.resViewSections[ResViewPartition.evokedLexicalConcepts] = this.initPartition(ResViewPartition.evokedLexicalConcepts, partitionFilter, true);
        this.resViewSections[ResViewPartition.facets] = this.initFacetsPartition(ResViewPartition.facets, partitionFilter);//dedicated initialization
        this.resViewSections[ResViewPartition.formBasedPreview] = this.initPartition(ResViewPartition.formBasedPreview, partitionFilter, true);
        this.resViewSections[ResViewPartition.formRepresentations] = this.initPartition(ResViewPartition.formRepresentations, partitionFilter, true);
        this.resViewSections[ResViewPartition.imports] = this.initPartition(ResViewPartition.imports, partitionFilter, true);
        this.resViewSections[ResViewPartition.labelRelations] = this.initPartition(ResViewPartition.labelRelations, partitionFilter, true);
        this.resViewSections[ResViewPartition.lexicalForms] = this.initPartition(ResViewPartition.lexicalForms, partitionFilter, true);
        this.resViewSections[ResViewPartition.lexicalSenses] = this.initPartition(ResViewPartition.lexicalSenses, partitionFilter, true);
        this.resViewSections[ResViewPartition.lexicalizations] = this.initPartition(ResViewPartition.lexicalizations, partitionFilter, false); //the sort is performed in the partition according the language
        this.resViewSections[ResViewPartition.members] = this.initPartition(ResViewPartition.members, partitionFilter, true);
        this.resViewSections[ResViewPartition.membersOrdered] = this.initOrderedMembersPartition(ResViewPartition.membersOrdered, partitionFilter);//dedicated initialization
        this.resViewSections[ResViewPartition.notes] = this.initPartition(ResViewPartition.notes, partitionFilter, true);
        this.resViewSections[ResViewPartition.properties] = this.initPartition(ResViewPartition.properties, partitionFilter, true);
        this.resViewSections[ResViewPartition.ranges] = this.initPartition(ResViewPartition.ranges, partitionFilter, true);
        this.resViewSections[ResViewPartition.rdfsMembers] = this.initPartition(ResViewPartition.rdfsMembers, partitionFilter, false); //ordered server-side
        this.resViewSections[ResViewPartition.schemes] = this.initPartition(ResViewPartition.schemes, partitionFilter, true);
        this.resViewSections[ResViewPartition.subterms] = this.initPartition(ResViewPartition.subterms, partitionFilter, true);
        this.resViewSections[ResViewPartition.subPropertyChains] = this.initPartition(ResViewPartition.subPropertyChains, partitionFilter, true);
        this.resViewSections[ResViewPartition.superproperties] = this.initPartition(ResViewPartition.superproperties, partitionFilter, true);
        this.resViewSections[ResViewPartition.topconceptof] = this.initPartition(ResViewPartition.topconceptof, partitionFilter, true);
        this.resViewSections[ResViewPartition.types] = this.initPartition(ResViewPartition.types, partitionFilter, true);

        let rvSettings: ResourceViewProjectSettings = VBContext.getWorkingProjectCtx().getProjectSettings().resourceView;
        this.partitionOrder = {};
        if (rvSettings.templates) {
            let templateForRole: ResViewPartition[] = rvSettings.templates[this.resource.getRole()];
            if (templateForRole != null) {
                for (let i = 0; i < templateForRole.length; i++) {
                    this.partitionOrder[templateForRole[i]] = i;
                }
            }
        }
        if (Object.keys(this.partitionOrder).length == 0) { //template not provided => init a default
            [
                ResViewPartition.types, ResViewPartition.classaxioms, ResViewPartition.topconceptof, ResViewPartition.schemes,
                ResViewPartition.broaders,ResViewPartition.superproperties, ResViewPartition.equivalentProperties, 
                ResViewPartition.disjointProperties, ResViewPartition.subPropertyChains, ResViewPartition.constituents,
                ResViewPartition.subterms, ResViewPartition.domains, ResViewPartition.ranges, ResViewPartition.facets,
                ResViewPartition.datatypeDefinitions, ResViewPartition.lexicalizations, ResViewPartition.lexicalForms,
                ResViewPartition.lexicalSenses, ResViewPartition.denotations, ResViewPartition.evokedLexicalConcepts, 
                ResViewPartition.notes, ResViewPartition.members, ResViewPartition.membersOrdered, ResViewPartition.labelRelations,
                ResViewPartition.formRepresentations, ResViewPartition.formBasedPreview, ResViewPartition.imports,
                ResViewPartition.rdfsMembers, ResViewPartition.properties
            ].forEach((partition, idx) => {
                this.partitionOrder[partition] = idx;
            })
        }
        if (rvSettings.customSections) {
            this.customSections = Object.keys(rvSettings.customSections);
            this.customSections.forEach(section => {
                this.resViewSections[section] = this.initPartition(<ResViewPartition>section, partitionFilter, true);
            })
        }

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
        //The poList is parsed only if the partition is present in the response.
        let partitionJson: any = this.resViewResponse[partition];
        if (partitionJson != null) {
            let poList = Deserializer.createPredicateObjectsList(partitionJson);

            //if the there is a value under validation emit a pendingValidation event
            if (VBContext.getWorkingProject().isValidationEnabled()) {
                if (poList.some(po => po.getObjects().some(obj => ResourceUtils.isTripleInStaging(obj)))) {
                    this.pendingValidation.emit(true);
                }
            }

            /** If:
             * - the Read is authorized
             * - the partition is not filtered (in the preference)
             * it is processed and returned
             */
            if (ResourceViewAuthEvaluator.isAuthorized(partition, CRUDEnum.R, this.resource) && partitionFilter.indexOf(partition) == -1) {
                this.filterPredObjList(poList);
                if (sort) {
                    this.sortObjects(poList);
                }
                //resolve foreign URIs only for "Other properties" partition
                if (partition == ResViewPartition.properties) {
                    this.resolveForeignURI(poList);
                }
                return poList;
            } else {
                return null;
            }
        } else {
            return null;
        }
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
            for (let facetName in facetsPartitionJson) {
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
            for (let i = 0; i < poList.length; i++) { //for each pred-obj-list
                let collections = poList[i].getObjects();
                for (let j = 0; j < collections.length; j++) { //for each collection (member list, should be just 1)
                    if (collections[j].getAdditionalProperty(ResAttribute.EXPLICIT)) { //set member explicit only if collection is explicit
                        let members: ARTResource[] = collections[j].getAdditionalProperty(ResAttribute.MEMBERS);
                        for (let k = 0; k < members.length; k++) {
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
        this.filterDeprecatedValues(predObjList);
    }

    /**
     * Based on the showInferred param, filter out or let pass inferred information in a predicate-objects list
     */
    private filterInferredFromPredObjList(predObjList: ARTPredicateObjects[]) {
        if (!this.showInferred) {
            for (let i = 0; i < predObjList.length; i++) {
                let objList: ARTNode[] = predObjList[i].getObjects();
                for (let j = 0; j < objList.length; j++) {
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
            for (let i = 0; i < predObjList.length; i++) {
                let objList: ARTNode[] = predObjList[i].getObjects();
                for (let j = 0; j < objList.length; j++) {
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

    private filterDeprecatedValues(predObjList: ARTPredicateObjects[]) {
        let showDeprecated = VBContext.getWorkingProjectCtx(this.projectCtx).getProjectPreferences().resViewPreferences.showDeprecated;
        if (!showDeprecated) {
            for (let i = 0; i < predObjList.length; i++) {
                let objList: ARTNode[] = predObjList[i].getObjects();
                for (let j = 0; j < objList.length; j++) {
                    let obj = objList[j];
                    if (obj instanceof ARTResource && obj.isDeprecated()) {
                        //remove the object if it is deprecated
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
        for (let i = 0; i < predObjList.length; i++) {
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
                            this.resourcesService.getResourcesInfo(resources).pipe(
                                finalize(() => HttpServiceContext.removeContextProject()),
                                map(resources => {
                                    resolvedResources = resolvedResources.concat(<ARTURIResource[]>resources);
                                })
                            )
                        );
                    }
                    //invoke all the services, then (the resolvedResources array is filled) search and replace the values in the poList
                    forkJoin(resolveResourcesFn).subscribe(
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

    switchInferred() {
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

    switchRendering() {
        this.rendering = !this.rendering;
        this.vbProp.setRenderingInResourceView(this.rendering);
    }

    switchValueFilterLang() {
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

    //TIME ACTIONS

    initVersions() {
        this.versionList = VBContext.getWorkingProjectCtx(this.projectCtx).resViewCtx.versions;
        if (this.versionList == null) {
            this.versionService.getVersions().subscribe(
                versions => {
                    this.versionList = versions;
                    VBContext.getWorkingProjectCtx(this.projectCtx).resViewCtx.versions = this.versionList; //cache/share the version into the RV ctx
                    //update the active version
                    if (this.activeVersion != null) {
                        this.activeVersion = this.versionList.find(v => v.versionId == this.activeVersion.versionId);
                    }
                }
            );
        }
    }

    switchToVersion(version?: VersionInfo) {
        if (this.activeVersion != version) {
            this.activeVersion = version;
            this.buildResourceView(this.resource);
        }
        //resView is readonly if one of the temp version and the context version are not null
        this.readonly = this.activeVersion != null || VBContext.getContextVersion() != null;
    }

    timeMachine() {
        const modalRef: NgbModalRef = this.modalService.open(TimeMachineModal, new ModalOptions('full'));
        modalRef.componentInstance.resource = this.resource;
    }

    //NOTIFICATIONS HANDLERS
    private initNotificationsAvailable() {
        //notifications available only if the ResView is about an IRI of the current project and if notifications are activated
        this.notificationsAvailable = this.projectCtx == null && this.resource instanceof ARTURIResource &&
            VBContext.getWorkingProjectCtx(this.projectCtx).getProjectPreferences().notificationStatus != NotificationStatus.no_notifications;
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
    changeNotificationStatus() {
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
    
    assertInferredStatements() {
        let assertFn: MultiActionFunction[] = [];
        for (let p in this.resViewSections) {
            if (p == ResViewPartition.lexicalizations) continue; //lexicalizations not assertable
            let poList: ARTPredicateObjects[] = this.resViewSections[p]
            if (poList == null) continue; //predicate object list null for the current resource (partition not foreseen for the resource role)
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
        }
        
        if (assertFn.length == 0) {
            this.basicModals.alert({key:"STATUS.WARNING"}, {key:"MESSAGES.NO_INFERRED_STATEMENTS_TO_ASSERT"}, ModalType.warning);
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
                     * - black (no class applied) if there are no issues
                     * - green (.done-issues) if there are only closed issues
                     * - blue (.todo-issues) if there is at least one open issue
                     * - orange (.in-progress-issues) if there is at least in-progress issues and no todo
                     * - red (.generic-issues) if there are at least one issue but no status is known
                     */
                    for (let i of issues) {
                        if (i.getStatusId() == '10000') {
                            this.issuesStruct.btnClass = "todo-issues";
                            break;
                        } else if (i.getStatusId() == '3') {
                            this.issuesStruct.btnClass = "in-progress-issues";
                        } else if (i.getStatusId() == '10001') {
                            if (this.issuesStruct.btnClass != "in-progress-issues") {
                                this.issuesStruct.btnClass = "done-issues";
                            }
                        }
                    }
                    if (this.issuesStruct.btnClass == "") { //there are issue but with statusId not known
                        this.issuesStruct.btnClass = "generic-issues";
                    }
                    this.issuesStruct.issues = issues;
                }
            },
            (err: Error) => {
                if (this.collaborationAvailable) {
                    this.basicModals.alert({key:"STATUS.ERROR"}, {key:"MESSAGES.COLLABORATION_SYS_CONFIGURED_BUT_NOT_WORKING"}, ModalType.error, err.stack);
                    this.vbCollaboration.setWorking(false);
                }
            }
        )
    }

    createIssue() {
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

    assignToIssue() {
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

    unassignIssue(issue: Issue) {
        this.collaborationService.removeResourceFromIssue(issue.getId(), <ARTURIResource>this.resource).subscribe( //cast is safe (cs available only for IRI)
            () => {
                this.initCollaboration();
            }
        )
    }

    private onCollaborationSystemStatusChange() {
        this.updateCollaborationStatus();
        if (this.collaborationAvailable) { //status changed, now CS is available => refresh issues lists
            this.initCollaboration();
        }
    }

    private updateCollaborationStatus() {
        this.collaborationAvailable = this.resource instanceof ARTURIResource && this.vbCollaboration.isWorking() && this.vbCollaboration.isActive() && this.projectCtx == null;
    }

    //Status bar

    discoverDataset() {
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

    objectDblClick(object: ARTResource) {
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
        if (this.resource.equals(resource)) {
            this.buildResourceView(this.resource);
        }
    }

}