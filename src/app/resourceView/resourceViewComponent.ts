import { Component, ElementRef, EventEmitter, Input, Output, SimpleChanges, ViewChild } from "@angular/core";
import { CollaborationModalServices } from "../collaboration/collaborationModalService";
import { ARTNode, ARTPredicateObjects, ARTResource, ARTURIResource, RDFResourceRolesEnum, ResAttribute, ResourceUtils, SortAttribute } from "../models/ARTResources";
import { Issue } from "../models/Collaboration";
import { VersionInfo } from "../models/History";
import { PropertyFacet, ResViewPartition } from "../models/ResourceView";
import { SemanticTurkey } from "../models/Vocabulary";
import { CollaborationServices } from "../services/collaborationServices";
import { ResourceViewServices } from "../services/resourceViewServices";
import { VersionsServices } from "../services/versionsServices";
import { Deserializer } from "../utils/Deserializer";
import { HttpServiceContext } from "../utils/HttpManager";
import { UIUtils } from "../utils/UIUtils";
import { VBCollaboration } from "../utils/VBCollaboration";
import { VBContext } from "../utils/VBContext";
import { VBEventHandler } from "../utils/VBEventHandler";
import { VBProperties } from "../utils/VBProperties";
import { BasicModalServices } from "../widget/modal/basicModal/basicModalServices";
import { ResViewModalServices } from "./resViewModals/resViewModalServices";

@Component({
    selector: "resource-view",
    templateUrl: "./resourceViewComponent.html",
    styles: [`
        .todo-issues { color: #337ab7 }
        .in-progress-issues { color: #f0ad4e }
        .done-issues { color: #5cb85c }`
    ]
})
export class ResourceViewComponent {

    @Input() resource: ARTResource;
    @Input() readonly: boolean = false;
    @Input() resourcePosition: string; //use to force the resource poisiton in getResourceView service
    @Output() dblclickObj: EventEmitter<ARTResource> = new EventEmitter<ARTResource>();
    @Output() update: EventEmitter<ARTResource> = new EventEmitter<ARTResource>(); //(useful to notify resourceViewTabbed that resource is updated)

    @ViewChild('blockDiv') blockDivElement: ElementRef;
    private viewInitialized: boolean = false; //in order to wait blockDiv to be ready

    private versionList: VersionInfo[];
    private activeVersion: VersionInfo;

    private showInferredPristine: boolean = false; //useful to decide whether repeat the getResourceView request once the includeInferred changes
    private showInferred: boolean = false;

    private rendering: boolean = true; //tells if the resource shown inside the partitions should be rendered

    private unknownHost: boolean = false; //tells if the resource view of the current resource failed to be fetched due to a UnknownHostException
    private unexistingResource: boolean = false; //tells if the requested resource does not exist (empty description)

    //partitions
    private resViewResponse: any = null; //to store the getResourceView response and avoid to repeat the request when user switches on/off inference
    private broadersColl: ARTPredicateObjects[] = null;
    private classAxiomColl: ARTPredicateObjects[] = null;
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
    private schemesColl: ARTPredicateObjects[] = null;
    private subPropertyChainsColl: ARTPredicateObjects[] = null;
    private subtermsColl: ARTPredicateObjects[] = null;
    private superpropertiesColl: ARTPredicateObjects[] = null;
    private topconceptofColl: ARTPredicateObjects[] = null;
    private typesColl: ARTPredicateObjects[] = null;

    private collaborationWorking: boolean = false;
    private issuesStruct: { btnClass: "" | "todo-issues" | "done-issues" | "in-progress-issues"; issues: Issue[] } = { 
        btnClass: "", issues: null
    };

    private eventSubscriptions: any[] = [];

    constructor(private resViewService: ResourceViewServices, private versionService: VersionsServices, 
        private collaborationService: CollaborationServices, private eventHandler: VBEventHandler,
        private vbProp: VBProperties, private vbCollaboration: VBCollaboration,
        private basicModals: BasicModalServices, private resViewModals: ResViewModalServices,
        private collabModals: CollaborationModalServices) {
        this.eventSubscriptions.push(eventHandler.resourceRenamedEvent.subscribe(
            (data: any) => this.onResourceRenamed(data.oldResource, data.newResource)
        ));
        this.eventSubscriptions.push(eventHandler.resourceDeprecatedEvent.subscribe(
            (resource: ARTResource) => this.onResourceDeprecated(resource)
        ));
        this.eventSubscriptions.push(eventHandler.collaborationSystemStatusChanged.subscribe(
            (data: any) => this.onCollaborationSystemStatusChange()
        ));
    }

    ngOnChanges(changes: SimpleChanges) {
        this.showInferred = this.vbProp.getInferenceInResourceView();
        this.rendering = this.vbProp.getRenderingInResourceView();
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
    public buildResourceView(res: ARTResource) {
        this.showInferredPristine = this.showInferred;
        UIUtils.startLoadingDiv(this.blockDivElement.nativeElement);
        if (this.activeVersion != null) {
            HttpServiceContext.setContextVersion(this.activeVersion); //set temprorarly version
        }
        this.resViewService.getResourceView(res, this.showInferred, this.resourcePosition).subscribe(
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
        });
    }

    /**
     * Fill all the partitions of the RV. This not requires that the RV description is fetched again from server,
     * in fact if the user switches on/off the inference, there's no need to perform a new request.
     */
    private fillPartitions() {
        //reset all partitions
        this.broadersColl = null;
        this.classAxiomColl = null;
        this.denotationsColl = null;
        this.disjointPropertiesColl = null;
        this.domainsColl = null;
        this.equivalentPropertiesColl = null;
        this.evokedLexicalConceptsColl = null;
        this.formBasedPreviewColl = null;
        this.formRepresentationsColl = null;
        this.importsColl = null;
        this.inverseofColl = null;
        this.labelRelationsColl = null;
        this.lexicalFormsColl = null;
        this.lexicalizationsColl = null;
        this.lexicalSensesColl = null;
        this.membersColl = null;
        this.membersOrderedColl = null;
        this.notesColl = null;
        this.propertiesColl = null;
        this.propertyFacets = null;
        this.rangesColl = null;
        this.schemesColl = null;
        this.subPropertyChainsColl = null;
        this.subtermsColl = null;
        this.superpropertiesColl = null;
        this.topconceptofColl = null;
        this.typesColl = null;

        var resourcePartition: any = this.resViewResponse.resource;
        this.resource = Deserializer.createRDFResource(resourcePartition);
        if (this.resource.getRole() == RDFResourceRolesEnum.mention) {
            this.readonly = true;
        }

        var broadersPartition: any = this.resViewResponse[ResViewPartition.broaders];
        if (broadersPartition != null) {
            this.broadersColl = Deserializer.createPredicateObjectsList(broadersPartition);
            this.filterInferredFromPredObjList(this.broadersColl);
            this.sortObjects(this.broadersColl);
        }

        var classAxiomsPartition: any = this.resViewResponse[ResViewPartition.classaxioms];
        if (classAxiomsPartition != null) {
            this.classAxiomColl = Deserializer.createPredicateObjectsList(classAxiomsPartition);
            this.filterInferredFromPredObjList(this.classAxiomColl);
            this.sortObjects(this.classAxiomColl);
        }

        var denotationsPartition: any = this.resViewResponse[ResViewPartition.denotations];
        if (denotationsPartition != null) {
            this.denotationsColl = Deserializer.createPredicateObjectsList(denotationsPartition);
            this.filterInferredFromPredObjList(this.denotationsColl);
            this.sortObjects(this.denotationsColl);
        }

        var disjointPropertiesPartition: any = this.resViewResponse[ResViewPartition.disjointProperties];
        if (disjointPropertiesPartition != null) {
            this.disjointPropertiesColl = Deserializer.createPredicateObjectsList(disjointPropertiesPartition);
            this.filterInferredFromPredObjList(this.disjointPropertiesColl);
            this.sortObjects(this.disjointPropertiesColl);
        }

        var domainsPartition: any = this.resViewResponse[ResViewPartition.domains];
        if (domainsPartition != null) {
            this.domainsColl = Deserializer.createPredicateObjectsList(domainsPartition);
            this.filterInferredFromPredObjList(this.domainsColl);
            this.sortObjects(this.domainsColl);
        }

        var equivalentPropertiesPartition: any = this.resViewResponse[ResViewPartition.equivalentProperties];
        if (equivalentPropertiesPartition != null) {
            this.equivalentPropertiesColl = Deserializer.createPredicateObjectsList(equivalentPropertiesPartition);
            this.filterInferredFromPredObjList(this.equivalentPropertiesColl);
            this.sortObjects(this.equivalentPropertiesColl);
        }

        var evokedLexicalConceptsPartition: any = this.resViewResponse[ResViewPartition.evokedLexicalConcepts];
        if (evokedLexicalConceptsPartition != null) {
            this.evokedLexicalConceptsColl = Deserializer.createPredicateObjectsList(evokedLexicalConceptsPartition);
            this.filterInferredFromPredObjList(this.evokedLexicalConceptsColl);
            this.sortObjects(this.evokedLexicalConceptsColl);
        }

        var facetsPartition: any = this.resViewResponse[ResViewPartition.facets];
        if (facetsPartition != null) {
            this.parseFacetsPartition(facetsPartition);
            this.filterInferredFromPredObjList(this.inverseofColl);
            this.sortObjects(this.inverseofColl);
        }

        var formBasedPreviewPartition: any = this.resViewResponse[ResViewPartition.formBasedPreview];
        if (formBasedPreviewPartition != null) {
            this.formBasedPreviewColl = Deserializer.createPredicateObjectsList(formBasedPreviewPartition);
            this.filterInferredFromPredObjList(this.formBasedPreviewColl);
            this.sortObjects(this.formBasedPreviewColl);
        }

        var formRepresentationsPartition: any = this.resViewResponse[ResViewPartition.formRepresentations];
        if (formRepresentationsPartition != null) {
            this.formRepresentationsColl = Deserializer.createPredicateObjectsList(formRepresentationsPartition);
            this.filterInferredFromPredObjList(this.formRepresentationsColl);
            this.sortObjects(this.formRepresentationsColl);
        }

        var importsPartition: any = this.resViewResponse[ResViewPartition.imports];
        if (importsPartition != null) {
            this.importsColl = Deserializer.createPredicateObjectsList(importsPartition);
            this.filterInferredFromPredObjList(this.importsColl);
            this.sortObjects(this.importsColl);
        }

        var labelRelationsPartition: any = this.resViewResponse[ResViewPartition.labelRelations];
        if (labelRelationsPartition != null) {
            this.labelRelationsColl = Deserializer.createPredicateObjectsList(labelRelationsPartition);
            this.filterInferredFromPredObjList(this.labelRelationsColl);
            this.sortObjects(this.labelRelationsColl);
        }

        var lexicalizationsPartition: any = this.resViewResponse[ResViewPartition.lexicalizations];
        if (lexicalizationsPartition != null) {
            this.lexicalizationsColl = Deserializer.createPredicateObjectsList(lexicalizationsPartition);
            this.filterInferredFromPredObjList(this.lexicalizationsColl);
            //do not sort (the sort is performed in the partition according the language)
        }

        var lexicalFormsPartition: any = this.resViewResponse[ResViewPartition.lexicalForms];
        if (lexicalFormsPartition != null) {
            this.lexicalFormsColl = Deserializer.createPredicateObjectsList(lexicalFormsPartition);
            this.filterInferredFromPredObjList(this.lexicalFormsColl);
            this.sortObjects(this.lexicalFormsColl);
        }

        var lexicalSensesPartition: any = this.resViewResponse[ResViewPartition.lexicalSenses];
        if (lexicalFormsPartition != null) {
            this.lexicalSensesColl = Deserializer.createPredicateObjectsList(lexicalSensesPartition);
            this.filterInferredFromPredObjList(this.lexicalSensesColl);
            this.sortObjects(this.lexicalSensesColl);
        }

        var membersPartition: any = this.resViewResponse[ResViewPartition.members];
        if (membersPartition != null) {
            this.membersColl = Deserializer.createPredicateObjectsList(membersPartition);
            this.filterInferredFromPredObjList(this.membersColl);
            this.sortObjects(this.membersColl);
        }

        var membersOrderedPartition: any = this.resViewResponse[ResViewPartition.membersOrdered];
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
            this.sortObjects(this.membersOrderedColl);
        }

        var notesPartition: any = this.resViewResponse[ResViewPartition.notes];
        if (notesPartition != null) {
            this.notesColl = Deserializer.createPredicateObjectsList(notesPartition);
            this.filterInferredFromPredObjList(this.notesColl);
            this.sortObjects(this.notesColl);
        }

        var propertiesPartition: any = this.resViewResponse[ResViewPartition.properties];
        this.propertiesColl = Deserializer.createPredicateObjectsList(propertiesPartition);
        this.filterInferredFromPredObjList(this.propertiesColl);
        this.sortObjects(this.propertiesColl);

        var rangesPartition: any = this.resViewResponse[ResViewPartition.ranges];
        if (rangesPartition != null) {
            this.rangesColl = Deserializer.createPredicateObjectsList(rangesPartition);
            this.filterInferredFromPredObjList(this.rangesColl);
            this.sortObjects(this.rangesColl);
        }

        var schemesPartition: any = this.resViewResponse[ResViewPartition.schemes];
        if (schemesPartition != null) {
            this.schemesColl = Deserializer.createPredicateObjectsList(schemesPartition);
            this.filterInferredFromPredObjList(this.schemesColl);
            this.sortObjects(this.schemesColl);
        }

        var subPropertyChainsPartition: any = this.resViewResponse[ResViewPartition.subPropertyChains];
        if (subPropertyChainsPartition != null) {
            this.subPropertyChainsColl = Deserializer.createPredicateObjectsList(subPropertyChainsPartition);
            this.filterInferredFromPredObjList(this.subPropertyChainsColl);
            this.sortObjects(this.subPropertyChainsColl);
        }

        var subtermsPartition: any = this.resViewResponse[ResViewPartition.subterms];
        if (subtermsPartition != null) {
            this.subtermsColl = Deserializer.createPredicateObjectsList(subtermsPartition);
            this.filterInferredFromPredObjList(this.subtermsColl);
            this.sortObjects(this.subtermsColl);
        }

        var superPropertiesPartition: any = this.resViewResponse[ResViewPartition.superproperties];
        if (superPropertiesPartition != null) {
            this.superpropertiesColl = Deserializer.createPredicateObjectsList(superPropertiesPartition);
            this.filterInferredFromPredObjList(this.superpropertiesColl);
            this.sortObjects(this.superpropertiesColl);
        }

        var topConceptOfPartition: any = this.resViewResponse[ResViewPartition.topconceptof];
        if (topConceptOfPartition != null) {
            this.topconceptofColl = Deserializer.createPredicateObjectsList(topConceptOfPartition);
            this.filterInferredFromPredObjList(this.topconceptofColl);
            this.sortObjects(this.topconceptofColl);
        }

        var typesPartition: any = this.resViewResponse[ResViewPartition.types];
        if (typesPartition != null) {
            this.typesColl = Deserializer.createPredicateObjectsList(typesPartition);
            this.filterInferredFromPredObjList(this.typesColl);
            this.sortObjects(this.typesColl);
        }

        if (
            //partitions of individual, so this are always returned, also when resource is not defined, I need to check also if lenght == 0
            (this.lexicalizationsColl == null || this.lexicalizationsColl.length == 0) &&
            (this.propertiesColl == null || this.propertiesColl.length == 0) &&
            (this.typesColl == null || this.typesColl.length == 0) &&
            //partitions optional
            this.broadersColl == null &&
            this.classAxiomColl == null &&
            this.denotationsColl == null &&
            this.disjointPropertiesColl == null &&
            this.domainsColl == null &&
            this.equivalentPropertiesColl == null &&
            this.evokedLexicalConceptsColl == null &&
            this.formBasedPreviewColl == null &&
            this.formRepresentationsColl == null && 
            this.importsColl == null &&
            this.inverseofColl == null &&
            this.labelRelationsColl == null &&
            this.lexicalFormsColl == null &&
            this.lexicalSensesColl == null &&
            this.membersColl == null &&
            this.membersOrderedColl == null &&
            this.notesColl == null &&
            this.propertyFacets == null &&
            this.rangesColl == null &&
            this.subPropertyChainsColl == null &&
            this.schemesColl == null &&
            this.subtermsColl == null &&
            this.superpropertiesColl == null &&
            this.topconceptofColl == null
        ) {
            this.unexistingResource = true;
        } else {
            this.unexistingResource = false;
        }
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

    private sortObjects(predObjList: ARTPredicateObjects[]) {
        //sort by show if rendering is active, uri otherwise
        let attribute: SortAttribute = this.rendering ? SortAttribute.show : SortAttribute.value;
        for (var i = 0; i < predObjList.length; i++) {
            let objList: ARTNode[] = predObjList[i].getObjects();
            ResourceUtils.sortResources(<ARTResource[]>objList, attribute);
        }
    }

    /**
     * Facets partition has a structure different from the other (object list and predicate-object list),
     * so it requires a parser ad hoc (doesn't use the parsers in Deserializer)
     */
    private parseFacetsPartition(facetsPartition: any) {
        this.propertyFacets = [];
        for (var facetName in facetsPartition) {
            if (facetName == "inverseOf") continue;
            this.propertyFacets.push({
                name: facetName,
                value: facetsPartition[facetName].value,
                explicit: facetsPartition[facetName].explicit
            })
        }
        //parse inverseOf partition in facets
        this.inverseofColl = Deserializer.createPredicateObjectsList(facetsPartition.inverseOf);
    }

    /**
     * HEADING BUTTON HANDLERS
     */

    private switchInferred() {
        this.showInferred = !this.showInferred;
        this.vbProp.setInferenceInResourceView(this.showInferred);
        if (!this.showInferredPristine) { //resource view has been initialized with showInferred to false, so repeat the request
            this.buildResourceView(this.resource);
        } else { //resource view has been initialized with showInferred to true, so there's no need to repeat the request
            this.fillPartitions();
        }
    }

    private switchRendering() {
        this.rendering = !this.rendering;
        this.vbProp.setRenderingInResourceView(this.rendering);
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
                        if (issues[i].getStatus() == 'To Do') {
                            this.issuesStruct.btnClass = "todo-issues";
                            break;
                        } else if (issues[i].getStatus() == 'In Progress') {
                            this.issuesStruct.btnClass = "in-progress-issues";
                        } else if (issues[i].getStatus() == 'Done') {
                            if (this.issuesStruct.btnClass != "in-progress-issues") {
                                this.issuesStruct.btnClass = "done-issues";
                            }
                        }
                    }
                    this.issuesStruct.issues = issues;
                }
            },
            err => {
                if (err.name.endsWith("ConnectException")) {
                    if (this.collaborationWorking) {
                        this.basicModals.alert("Collaboration System error", "The Collaboration System seems to be configured "
                            + "but it's not working (configuration could be not valid or the server may be not reachable), "
                            + "so it will be disabled.", "error");
                        this.vbCollaboration.setWorking(false);
                    }
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
                    }
                );
            }
        )
    }

    private onCollaborationSystemStatusChange() {
        this.collaborationWorking = this.vbCollaboration.isWorking();
        if (this.collaborationWorking) { //status changed from notWorking to working => refresh issues lists
            this.initCollaboration();
        }
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

    private onResourceDeprecated(resource: ARTResource) {
        if (this.resource.getNominalValue() == resource.getNominalValue()) {
            this.buildResourceView(this.resource);
        }
    }

}