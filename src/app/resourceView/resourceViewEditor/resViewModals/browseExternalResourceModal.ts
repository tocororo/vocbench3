import { Component, Input } from "@angular/core";
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { forkJoin, Observable } from "rxjs";
import { map } from 'rxjs/operators';
import { ModalType } from 'src/app/widget/modal/Modals';
import { ARTURIResource, RDFResourceRolesEnum } from "../../../models/ARTResources";
import { Project } from "../../../models/Project";
import { RDFS, SKOS } from "../../../models/Vocabulary";
import { PreferencesSettingsServices } from "../../../services/preferencesSettingsServices";
import { ProjectServices } from "../../../services/projectServices";
import { PropertyServices, RangeType } from "../../../services/propertyServices";
import { Cookie } from "../../../utils/Cookie";
import { HttpServiceContext } from "../../../utils/HttpManager";
import { ProjectContext, VBContext } from "../../../utils/VBContext";
import { VBProperties } from "../../../utils/VBProperties";
import { BasicModalServices } from "../../../widget/modal/basicModal/basicModalServices";
import { BrowsingModalServices } from "../../../widget/modal/browsingModal/browsingModalServices";

/**
 * This modal is used to browse and select a resource belonging to an external project.
 * This is used when aligning a resource, or when enriching a property for a resource 
 * (only in this case a property is passed to the modal)
 */

@Component({
    selector: "browse-external-resource-modal",
    templateUrl: "./browseExternalResourceModal.html",
})
export class BrowseExternalResourceModal {
    @Input() title: string;
    @Input() property: ARTURIResource;
    @Input() propChangeable: boolean = true;

    private rootProperty: ARTURIResource; //root property of the partition that invoked this modal
    enrichingProperty: ARTURIResource;

    projectList: Array<Project> = [];
    project: Project;
    private remoteProjCtx: ProjectContext;
    private schemes: ARTURIResource[]; //scheme to explore in case target project is skos(xl)
    private remoteResource: ARTURIResource;

    private activeView: RDFResourceRolesEnum;

    constructor(public activeModal: NgbActiveModal, public projService: ProjectServices,
        private preferenceService: PreferencesSettingsServices, private propService: PropertyServices, private vbProp: VBProperties,
        private basicModals: BasicModalServices, private browsingModals: BrowsingModalServices) {
    }

    ngOnInit() {
        this.rootProperty = this.property;
        this.enrichingProperty = this.rootProperty;

        if (this.enrichingProperty != null) {
            this.checkPropertyRangeResource(this.enrichingProperty).subscribe(
                allowsResource => {
                    if (!allowsResource) {
                        this.basicModals.alert({key:"STATUS.ERROR"}, {key:"MESSAGES.CANNOT_ENRICH_PROPERTY_WITH_REMOTE_RES", params:{property: this.enrichingProperty.getShow()}},
                            ModalType.warning);
                        this.cancel();
                    }
                }
            );
        }

        this.projService.listProjects(VBContext.getWorkingProject(), false, true).subscribe(
            projects => {
                //keep only the projects different from the current
                for (var i = 0; i < projects.length; i++) {
                    if (projects[i].isOpen() && projects[i].getName() != VBContext.getWorkingProject().getName()) {
                        this.projectList.push(projects[i])
                    }
                }
                this.restoreLastProject();
            }
        );
    }

    private restoreLastProject() {
        let lastExploredProject: string = Cookie.getCookie(Cookie.ALIGNMENT_LAST_EXPLORED_PROJECT);
        if (lastExploredProject != null) {
            this.projectList.forEach((p: Project) => {
                if (p.getName() == lastExploredProject) {
                    this.project = p;
                }
            });
            if (this.project != null) { //last explored project found among the available
                this.onProjectChange();
            }
        }
    }

    private restoreLastType() {
        let lastChosenType: string = Cookie.getCookie(Cookie.ALIGNMENT_LAST_CHOSEN_TYPE);
        if (lastChosenType != null) {
            this.activeView = <RDFResourceRolesEnum>lastChosenType;
        }
    }

    onProjectChange() {
        HttpServiceContext.removeContextProject();
        HttpServiceContext.setContextProject(this.project);
        Cookie.setCookie(Cookie.ALIGNMENT_LAST_EXPLORED_PROJECT, this.project.getName());

        this.remoteProjCtx = new ProjectContext(this.project);
        let initProjectCtxFn: Observable<void>[] = [
            this.vbProp.initProjectUserBindings(this.remoteProjCtx),
            this.vbProp.initUserProjectPreferences(this.remoteProjCtx),
            this.vbProp.initProjectSettings(this.remoteProjCtx)
        ];
        forkJoin(initProjectCtxFn).subscribe(
            () => {
                this.activeView = null;
                this.remoteResource = null;

                if (this.isProjectSKOS()) {
                    this.preferenceService.getActiveSchemes(this.project.getName()).subscribe(
                        schemes => {
                            this.schemes = schemes;
                            this.restoreLastType();
                        }
                    );
                } else {
                    this.restoreLastType();
                }
            }
        );
    }

    onAlignTypeChanged() {
        Cookie.setCookie(Cookie.ALIGNMENT_LAST_CHOSEN_TYPE, this.activeView);
        this.remoteResource = null;
    }

    changeProperty() {
        this.browsingModals.browsePropertyTree({key:"ACTIONS.SELECT_PROPERTY"}, [this.rootProperty]).then(
            (selectedProp: ARTURIResource) => {
                if (this.enrichingProperty.getURI() != selectedProp.getURI()) {
                    this.checkPropertyRangeResource(selectedProp).subscribe(
                        allowsResource => {
                            if (allowsResource) {
                                this.enrichingProperty = selectedProp;
                            } else {
                                this.basicModals.alert({key:"STATUS.ERROR"}, {key:"MESSAGES.CANNOT_ENRICH_PROPERTY_WITH_REMOTE_RES", params:{property: selectedProp.getShow()}},
                                    ModalType.warning);
                            }
                        }
                    );
                }
            },
            () => { }
        );
    }

    /**
     * Used for checking that an enriching property allows resources as value (not literal).
     */
    private checkPropertyRangeResource(property: ARTURIResource): Observable<boolean> {
        return this.propService.getRange(property).pipe(
            map(range => {
                var ranges = range.ranges;
                if (range != undefined) {
                    let rangeCollection: ARTURIResource[] = ranges.rangeCollection ? ranges.rangeCollection.resources : null;
                    if (
                        ranges.type == RangeType.literal ||
                        (rangeCollection != null && rangeCollection.length == 1 && rangeCollection[0].getURI() == RDFS.literal.getURI())
                    ) { //range literal
                        return false;
                    }
                }
                return true;
            })
        );
    }

    /**
     * Listener called when a resource of a tree is selected
     */
    onResourceSelected(resource: ARTURIResource) {
        this.remoteResource = resource;
    }

    /**
     * Listener called when it's aligning concept and the scheme in the concept tree is changed
     */
    onSchemeChanged() {
        this.remoteResource = null;
    }

    private isProjectSKOS(): boolean {
        return this.project.getModelType() == SKOS.uri;
    }

    isOkClickable(): boolean {
        return this.remoteResource != undefined;
    }

    ok() {
        HttpServiceContext.removeContextProject();
        this.activeModal.close({
            resource: this.remoteResource,
            property: this.enrichingProperty
        });
    }

    cancel() {
        HttpServiceContext.removeContextProject();
        this.activeModal.dismiss();
    }

}


export class BrowseExternalResourceModalReturnData {
    resource: ARTURIResource;
    property: ARTURIResource;
}