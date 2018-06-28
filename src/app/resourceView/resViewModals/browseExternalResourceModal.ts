import { Component } from "@angular/core";
import { DialogRef, ModalComponent } from "ngx-modialog";
import { BSModalContext } from 'ngx-modialog/plugins/bootstrap';
import { Observable } from "rxjs";
import { ARTURIResource, RDFResourceRolesEnum } from "../../models/ARTResources";
import { Project } from "../../models/Project";
import { RDFS, SKOS } from "../../models/Vocabulary";
import { PreferencesSettingsServices } from "../../services/preferencesSettingsServices";
import { ProjectServices } from "../../services/projectServices";
import { PropertyServices, RangeType } from "../../services/propertyServices";
import { Cookie } from "../../utils/Cookie";
import { HttpServiceContext } from "../../utils/HttpManager";
import { VBContext } from "../../utils/VBContext";
import { BasicModalServices } from "../../widget/modal/basicModal/basicModalServices";
import { BrowsingModalServices } from "../../widget/modal/browsingModal/browsingModalServices";

export class BrowseExternalResourceModalData extends BSModalContext {
    constructor(
        public title: string,
        public property: ARTURIResource,
        public propChangeable: boolean = true
    ) {
        super();
    }
}

/**
 * This modal is used to browse and select a resource belonging to an external project.
 * This is used when aligning a resource, or when enriching a property for a resource 
 * (only in this case a property is passed to the modal)
 */

@Component({
    selector: "browse-external-resource-modal",
    templateUrl: "./browseExternalResourceModal.html",
})
export class BrowseExternalResourceModal implements ModalComponent<BrowseExternalResourceModalData> {
    context: BrowseExternalResourceModalData;

    private rootProperty: ARTURIResource; //root property of the partition that invoked this modal
    private enrichingProperty: ARTURIResource;

    private projectList: Array<Project> = [];
    private project: Project;
    private schemes: ARTURIResource[]; //scheme to explore in case target project is skos(xl)
    private remoteResource: ARTURIResource;

    private activeView: RDFResourceRolesEnum;

    constructor(public dialog: DialogRef<BrowseExternalResourceModalData>, public projService: ProjectServices,
        private preferenceService: PreferencesSettingsServices, private propService: PropertyServices,
        private basicModals: BasicModalServices, private browsingModals: BrowsingModalServices) {
        this.context = dialog.context;
    }

    ngOnInit() {
        this.rootProperty = this.context.property;
        this.enrichingProperty = this.rootProperty;

        if (this.enrichingProperty != null) {
            this.checkPropertyRangeResource(this.enrichingProperty).subscribe(
                allowsResource => {
                    if (!allowsResource) {
                        this.basicModals.alert("Invalid property range", this.enrichingProperty.getShow() +
                            " range doesn't admit resources. You cannot enrich this property with a remote value", "warning");
                        this.cancel();
                    }
                }
            );
        }

        this.projService.listProjects(VBContext.getWorkingProject(), true, true).subscribe(
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
            this.onProjectChange();
        }
    }

    private restoreLastType() {
        let lastChosenType: string = Cookie.getCookie(Cookie.ALIGNMENT_LAST_CHOSEN_TYPE);
        if (lastChosenType != null) {
            this.activeView = <RDFResourceRolesEnum>lastChosenType;
        }
    }

    private onProjectChange() {
        HttpServiceContext.removeContextProject();
        HttpServiceContext.setContextProject(this.project);
        Cookie.setCookie(Cookie.ALIGNMENT_LAST_EXPLORED_PROJECT, this.project.getName());

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

    private onAlignTypeChanged() {
        Cookie.setCookie(Cookie.ALIGNMENT_LAST_CHOSEN_TYPE, this.activeView);
        this.remoteResource = null;
    }

    private changeProperty() {
        this.browsingModals.browsePropertyTree("Select a property", [this.rootProperty]).then(
            (selectedProp: ARTURIResource) => {
                if (this.enrichingProperty.getURI() != selectedProp.getURI()) {
                    this.checkPropertyRangeResource(selectedProp).subscribe(
                        allowsResource => {
                            if (allowsResource) {
                                this.enrichingProperty = selectedProp;
                            } else {
                                this.basicModals.alert("Invalid property range", selectedProp.getShow() +
                                    " range doesn't admit resources. You cannot enrich this property with a remote value", "warning");
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
        return this.propService.getRange(property).map(
            range => {
                var ranges = range.ranges;
                if (range != undefined) {
                    let rangeCollection: ARTURIResource[] = ranges.rangeCollection ? ranges.rangeCollection.resources : null;
                    if (
                        (ranges.type == RangeType.literal || ranges.type == RangeType.plainLiteral || ranges.type == RangeType.typedLiteral) ||
                        (rangeCollection != null && rangeCollection.length == 1 && rangeCollection[0].getURI() == RDFS.literal.getURI())
                    ) { //range literal
                        return false;
                    }
                }
                return true;
            }
        );
    }

    /**
     * Listener called when a resource of a tree is selected
     */
    private onResourceSelected(resource: ARTURIResource) {
        this.remoteResource = resource;
    }

    /**
     * Listener called when it's aligning concept and the scheme in the concept tree is changed
     */
    private onSchemeChanged() {
        this.remoteResource = null;
    }

    private isProjectSKOS(): boolean {
        return this.project.getModelType() == SKOS.uri;
    }

    private isOkClickable(): boolean {
        return this.remoteResource != undefined;
    }

    ok(event: Event) {
        HttpServiceContext.removeContextProject();
        event.stopPropagation();
        this.dialog.close({
            resource: this.remoteResource,
            property: this.enrichingProperty
        });
    }

    cancel() {
        HttpServiceContext.removeContextProject();
        this.dialog.dismiss();
    }

}


export class BrowseExternalResourceModalReturnData {
    resource: ARTURIResource;
    property: ARTURIResource;
}