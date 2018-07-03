import { Component, EventEmitter, Input, Output, SimpleChanges } from '@angular/core';
import { ARTURIResource, RDFResourceRolesEnum } from '../../../models/ARTResources';
import { OntoLex, SKOS } from '../../../models/Vocabulary';
import { ResourcesServices } from '../../../services/resourcesServices';
import { UIUtils } from '../../../utils/UIUtils';
import { VBContext } from '../../../utils/VBContext';
import { VBProperties } from '../../../utils/VBProperties';
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
    @Output() resourceChanged = new EventEmitter<ARTURIResource>();

    private resourceIRI: string;

    private menuAsButton: boolean = false; //if there is just a role => do not show a dropdown menu, just a button
    private btnImageSrc: string;
    
    constructor(private resourceService: ResourcesServices, private browsingModals: BrowsingModalServices, private vbProp: VBProperties) { }

    ngOnInit() {
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
        if (this.roles != null && this.roles.length == 1) {
            this.menuAsButton = true;
            this.btnImageSrc = UIUtils.getRoleImageSrc(this.roles[0]);
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

    private pickResource(role: RDFResourceRolesEnum) {
        if (role == null) { //called from UI in case there is just one role in roles array
            role = this.roles[0];
        }
        if (role == RDFResourceRolesEnum.cls) {
            this.browsingModals.browseClassTree("Select a Class").then(
                (selectedResource: ARTURIResource) => {
                    this.updatePickedResource(selectedResource);
                },
                () => { }
            );
        } else if (role == RDFResourceRolesEnum.individual) {
            this.browsingModals.browseClassIndividualTree("Select an Instance").then(
                (selectedResource: ARTURIResource) => {
                    this.updatePickedResource(selectedResource);
                },
                () => { }
            );
        } else if (role == RDFResourceRolesEnum.concept) {
            this.browsingModals.browseConceptTree("Select a Concept", this.vbProp.getActiveSchemes(), true).then(
                (selectedResource: ARTURIResource) => {
                    this.updatePickedResource(selectedResource);
                },
                () => { }
            );
        } else if (role == RDFResourceRolesEnum.conceptScheme) {
            this.browsingModals.browseSchemeList("Select a ConceptScheme").then(
                (selectedResource: ARTURIResource) => {
                    this.updatePickedResource(selectedResource);
                },
                () => { }
            );
        } else if (role == RDFResourceRolesEnum.skosCollection) {
            this.browsingModals.browseCollectionTree("Select a Collection").then(
                (selectedResource: ARTURIResource) => {
                    this.updatePickedResource(selectedResource);
                },
                () => { }
            );
        } else if (role == RDFResourceRolesEnum.property) {
            this.browsingModals.browsePropertyTree("Select a Property").then(
                (selectedResource: ARTURIResource) => {
                    this.updatePickedResource(selectedResource);
                },
                () => { }
            );
        } else if (role == RDFResourceRolesEnum.ontolexLexicalEntry) {
            this.browsingModals.browseLexicalEntryList("Select a LexicalEntry", this.vbProp.getActiveLexicon(), true, true).then(
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
    private pickableRole(role: RDFResourceRolesEnum) {
        let modelType: string = VBContext.getWorkingProject().getModelType();
        

        if (this.roles != null && this.roles.length != 0) {
            return this.roles.indexOf(role) != -1;
        } else {
            // if roles array is not provided, allow selection of all roles compliant with the model type
            if (role == RDFResourceRolesEnum.ontolexLexicalEntry) {
                return modelType == OntoLex.uri;
            } else if (role == RDFResourceRolesEnum.concept || role == RDFResourceRolesEnum.conceptScheme || role == RDFResourceRolesEnum.skosCollection) {
                return modelType == SKOS.uri;
            }
            return true; 
        }
    }

}