import { Component, EventEmitter, Input, Output, SimpleChanges } from '@angular/core';
import { forkJoin, from, Observable, of } from 'rxjs';
import { ARTURIResource, RDFResourceRolesEnum } from '../../../models/ARTResources';
import { Project } from '../../../models/Project';
import { OntoLex, OWL, RDFS, SKOS } from '../../../models/Vocabulary';
import { ProjectServices } from '../../../services/projectServices';
import { ProjectContext, VBContext } from '../../../utils/VBContext';
import { VBProperties } from '../../../utils/VBProperties';
import { BasicModalServices } from '../../modal/basicModal/basicModalServices';
import { BrowsingModalServices } from '../../modal/browsingModal/browsingModalServices';
import { ModalType } from '../../modal/Modals';

@Component({
    selector: 'resource-picker',
    templateUrl: './resourcePickerComponent.html',
})
export class ResourcePickerComponent {
    
    @Input() resource: ARTURIResource;
    
    @Input() disabled: boolean = false;
    @Input() editable: boolean = false; //tells if the URI can be manually edited
    @Input() size: string;

    @Input() config: ResourcePickerConfig;
    @Output() resourceChanged = new EventEmitter<ARTURIResource>();

    inputGroupClass: string = "input-group";
    resourceIRI: string;

    constructor(private projectService: ProjectServices, private vbProp: VBProperties,
        private browsingModals: BrowsingModalServices, private basicModals: BasicModalServices) { }

    ngOnInit() {
        //if the input size is not valid, set default to "sm"
        if (this.size == "sm" || this.size == "md" || this.size == "lg") {
            this.inputGroupClass += " input-group-" + this.size;
        }

        let defaultConfig = new ResourcePickerConfig();
        if (this.config == null) {
            this.config = defaultConfig;
        } else { //merge provided config (it could be incomplete) with the default values
            this.config.allowLocal = this.config.allowLocal != null ? this.config.allowLocal : defaultConfig.allowLocal;
            this.config.allowRemote = this.config.allowRemote != null ? this.config.allowRemote : defaultConfig.allowRemote;
            this.config.projects = this.config.projects != null ? this.config.projects : defaultConfig.projects;
            this.config.roles = this.config.roles != null ? this.config.roles : defaultConfig.roles;
            this.config.classes = this.config.classes != null ? this.config.classes : defaultConfig.classes;
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

    onModelChanged() {
        let returnedRes: ARTURIResource;
        if (this.resource != null) {
            if (typeof this.resource == 'string') {
                this.resource = new ARTURIResource(this.resource);
            }
            returnedRes = this.resource.clone();
            returnedRes.setURI(this.resourceIRI); //if IRI has been manually changed
        } else if (this.resourceIRI != null && this.resourceIRI.trim() != "") {
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
                if (this.config.projects != null) { //if project limits are provided, filter the projects list
                    projects = projects.filter(p => this.config.projects.indexOf(p.getName()) != -1)
                }
                
                if (projects.length == 0) {
                    this.basicModals.alert("Pick resource", "You have no granted access to any existing open project", ModalType.warning);
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
                        forkJoin(initProjectCtxFn).subscribe(
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
            "AnnotationProperty": RDFResourceRolesEnum.annotationProperty,
            "DatatypeProperty": RDFResourceRolesEnum.datatypeProperty,
            "ObjectProperty": RDFResourceRolesEnum.objectProperty,
            "OntologyProperty": RDFResourceRolesEnum.ontologyProperty,
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
            return of(resourceTypes[options[0]]);
        } else {
            return from(
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
            this.browsingModals.browseClassIndividualTree("Select an Instance", this.config.classes, projectCtx).then(
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
        } else if (role == RDFResourceRolesEnum.property || role == RDFResourceRolesEnum.annotationProperty || 
            role == RDFResourceRolesEnum.datatypeProperty || role == RDFResourceRolesEnum.objectProperty || role == RDFResourceRolesEnum.ontologyProperty) {
            let propType: RDFResourceRolesEnum = (role != RDFResourceRolesEnum.property) ? role : null; //specify a property type only if it's not the generic "property"
            this.browsingModals.browsePropertyTree("Select a Property", null, null, propType, projectCtx).then(
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
        if (this.config.roles != null && this.config.roles.length != 0) {
            return this.config.roles.indexOf(role) != -1;
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

export class ResourcePickerConfig {
    allowLocal?: boolean = true; //if true, the picker allows the selection of resources from the current project
    allowRemote?: boolean = false; //if true, the picker allows the selection of resources from an external project
    projects?: string[]; //if provided, the resource selection from remote project is limited to the given list (only when allowRemote is true)
    roles?: RDFResourceRolesEnum[]; //if provided, the resource selection is restricted to the given roles
    classes?: ARTURIResource[]; //if provided (works only if there are no roles restrictions or if it allows to select individual)
}