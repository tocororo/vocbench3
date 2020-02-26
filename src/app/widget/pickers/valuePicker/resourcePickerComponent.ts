import { Component, EventEmitter, Input, Output, SimpleChanges } from '@angular/core';
import { Observable } from 'rxjs';
import { ARTURIResource, RDFResourceRolesEnum } from '../../../models/ARTResources';
import { Project } from '../../../models/Project';
import { OntoLex, OWL, RDFS, SKOS } from '../../../models/Vocabulary';
import { ProjectServices } from '../../../services/projectServices';
import { ProjectContext, VBContext } from '../../../utils/VBContext';
import { VBProperties } from '../../../utils/VBProperties';
import { BasicModalServices } from '../../modal/basicModal/basicModalServices';
import { BrowsingModalServices } from '../../modal/browsingModal/browsingModalServices';

@Component({
    selector: 'resource-picker',
    templateUrl: './resourcePickerComponent.html',
})
export class ResourcePickerComponent {
    
    @Input() resource: ARTURIResource;
    @Input() roles: RDFResourceRolesEnum[]; //list of pickable resource roles
    @Input() disabled: boolean = false;
    @Input() editable: boolean = false; //tells if the URI can be manually edited
    @Input() allowRemote: boolean = false;
    @Input() size: string = "sm"
    @Output() resourceChanged = new EventEmitter<ARTURIResource>();

    private resourceIRI: string;

    constructor(private projectService: ProjectServices, private vbProp: VBProperties,
        private browsingModals: BrowsingModalServices, private basicModals: BasicModalServices) { }

    ngOnInit() {
        //if the input size is not valid, set default to "sm"
        if (this.size != "xs" && this.size != "sm" && this.size != "" && this.size != "lg") {
            this.size = "sm";
        }
        this.init();
    }

    ngOnChanges(changes: SimpleChanges) {
        this.init();
    }

    private init() {
        if (this.resource) {
            if (typeof this.resource == 'string') {
                this.resource = new ARTURIResource(this.resource);
                this.resourceIRI = this.resource.getNominalValue();
            } else {
                this.resourceIRI = this.resource.getNominalValue();
            }
        } else {
            this.resourceIRI = null;
        }
    }

    private onModelChanged() {
        let returnedRes: ARTURIResource;
        if (this.resource != null) {
            if (typeof this.resource == 'string') {
                this.resource = new ARTURIResource(this.resource);
            }
            returnedRes = this.resource.clone();
            returnedRes.setURI(this.resourceIRI); //if IRI has been manually changed
        } else {
            returnedRes = new ARTURIResource(this.resourceIRI);
        }
        this.resourceChanged.emit(returnedRes);
    }

    private pickLocalResource() {
        this.selectResourceType(VBContext.getWorkingProject()).subscribe(
            role => {
                if (role != null) { //role is null if user canceled the selection
                    this.openSelectionResource(role, VBContext.getWorkingProjectCtx());    
                }
            }
        )
    }

    private pickExternalResource() {
        //project selection
        this.projectService.listProjects(VBContext.getWorkingProject(), true, true).subscribe(
            projects => {
                if (projects.length == 0) {
                    this.basicModals.alert("Pick resource", "You have no granted access to any existing open project", "warning");
                    return;
                }
                let options = projects.map(p => p.getName());
                this.basicModals.select("Pick resource", "Select a project", options).then(
                    projName => {
                        //initialize the context of the selected external project
                        let externalProject: Project = projects.find(p => p.getName() == projName);
                        let externalProjectCtx: ProjectContext = new ProjectContext(externalProject);
                        let initProjectCtxFn: Observable<void>[] = [
                            this.vbProp.initProjectUserBindings(externalProjectCtx),
                            this.vbProp.initUserProjectPreferences(externalProjectCtx),
                            this.vbProp.initProjectSettings(externalProjectCtx)
                        ];
                        Observable.forkJoin(initProjectCtxFn).subscribe(
                            () => {
                                this.selectResourceType(externalProject).subscribe(
                                    role => {
                                        if (role != null) { //role is null if user canceled the selection
                                            this.openSelectionResource(role, externalProjectCtx);
                                        }
                                    }
                                );
                            }
                        );
                    },
                    () => {}
                );
            }
        )
    }

    private selectResourceType(project: Project): Observable<RDFResourceRolesEnum> {
        let resourceTypes: {[key: string]: RDFResourceRolesEnum} = {
            "Class": RDFResourceRolesEnum.cls,
            "Individual": RDFResourceRolesEnum.individual,
            "Concept": RDFResourceRolesEnum.concept,
            "ConceptScheme": RDFResourceRolesEnum.conceptScheme,
            "Collection": RDFResourceRolesEnum.skosCollection,
            "Property": RDFResourceRolesEnum.property,
            "Lexicon": RDFResourceRolesEnum.limeLexicon,
            "LexicalEntry": RDFResourceRolesEnum.ontolexLexicalEntry
        };
        let options: string[] = [];
        for (let key in resourceTypes) {
            if (this.isRolePickable(resourceTypes[key], project)) {
                options.push(key);
            }
        }
        if (options.length == 1) {
            return Observable.of(resourceTypes[options[0]]);
        } else {
            return Observable.fromPromise(
                this.basicModals.select("Pick resource", "Select the type of resource to pick", options).then(
                    (role: string) => {
                        return resourceTypes[role];
                    },
                    () => {
                        return null;
                    }
                )
            ); 
        }
    }

    private openSelectionResource(role: RDFResourceRolesEnum, projectCtx: ProjectContext) {
        if (role == RDFResourceRolesEnum.cls) {
            this.browsingModals.browseClassTree("Select a Class", null, projectCtx).then(
                (selectedResource: ARTURIResource) => {
                    this.updatePickedResource(selectedResource);
                },
                () => { }
            );
        } else if (role == RDFResourceRolesEnum.individual) {
            this.browsingModals.browseClassIndividualTree("Select an Instance", projectCtx).then(
                (selectedResource: ARTURIResource) => {
                    this.updatePickedResource(selectedResource);
                },
                () => { }
            );
        } else if (role == RDFResourceRolesEnum.concept) {
            let activeSchemes: ARTURIResource[] = projectCtx.getProjectPreferences().activeSchemes;
            this.browsingModals.browseConceptTree("Select a Concept", activeSchemes, true, projectCtx).then(
                (selectedResource: ARTURIResource) => {
                    this.updatePickedResource(selectedResource);
                },
                () => { }
            );
        } else if (role == RDFResourceRolesEnum.conceptScheme) {
            this.browsingModals.browseSchemeList("Select a ConceptScheme", projectCtx).then(
                (selectedResource: ARTURIResource) => {
                    this.updatePickedResource(selectedResource);
                },
                () => { }
            );
        } else if (role == RDFResourceRolesEnum.skosCollection) {
            this.browsingModals.browseCollectionTree("Select a Collection", projectCtx).then(
                (selectedResource: ARTURIResource) => {
                    this.updatePickedResource(selectedResource);
                },
                () => { }
            );
        } else if (role == RDFResourceRolesEnum.property) {
            this.browsingModals.browsePropertyTree("Select a Property", null, null, projectCtx).then(
                (selectedResource: ARTURIResource) => {
                    this.updatePickedResource(selectedResource);
                },
                () => { }
            );
        } else if (role == RDFResourceRolesEnum.limeLexicon) {
            this.browsingModals.browseLexiconList("Select a Lexicon", projectCtx).then(
                (selectedResource: ARTURIResource) => {
                    this.updatePickedResource(selectedResource);
                },
                () => { }
            );
        } else if (role == RDFResourceRolesEnum.ontolexLexicalEntry) {
            this.browsingModals.browseLexicalEntryList("Select a LexicalEntry", null, true, false, false, false, projectCtx).then(
                (selectedResource: ARTURIResource) => {
                    this.updatePickedResource(selectedResource);
                },
                () => { }
            );
        }
        //Other type of resource will be added when necessary
    }

    private updatePickedResource(resource: ARTURIResource) {
        this.resource = resource;
        this.resourceIRI = resource.getURI();
        this.onModelChanged();
    }

    /**
     * Tells if the component should allow to pick resource for the given role
     * @param role 
     */
    private isRolePickable(role: RDFResourceRolesEnum, project: Project) {
        let modelType: string = project.getModelType();
        if (this.roles != null && this.roles.length != 0) {
            return this.roles.indexOf(role) != -1;
        } else { // if roles array is not provided, allow selection of all roles compliant with the model type
            if (modelType == OntoLex.uri) { //ontolex project allows selection of all type of resource
                return true;
            } else if (modelType == RDFS.uri || modelType == OWL.uri) {
                return role == RDFResourceRolesEnum.cls || role == RDFResourceRolesEnum.individual || role == RDFResourceRolesEnum.property;
            } else if (modelType == SKOS.uri) {
                return role == RDFResourceRolesEnum.cls || role == RDFResourceRolesEnum.individual || role == RDFResourceRolesEnum.property || 
                    role == RDFResourceRolesEnum.concept || role == RDFResourceRolesEnum.conceptScheme || role == RDFResourceRolesEnum.skosCollection;
            }
            return true; 
        }
    }

}