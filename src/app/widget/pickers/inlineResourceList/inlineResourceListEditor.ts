import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ARTResource, ARTURIResource, RDFResourceRolesEnum, ResAttribute } from 'src/app/models/ARTResources';
import { Project } from 'src/app/models/Project';
import { ResourcesServices } from 'src/app/services/resourcesServices';
import { VBContext } from 'src/app/utils/VBContext';
import { BasicModalServices } from 'src/app/widget/modal/basicModal/basicModalServices';
import { BrowsingModalServices } from 'src/app/widget/modal/browsingModal/browsingModalServices';
import { ModalType } from 'src/app/widget/modal/Modals';

@Component({
    selector: 'inline-resource-list-editor',
    templateUrl: "inlineResourceListEditor.html",
})
export class InlineResourceListEditor {

    @Input() project: Project;
    @Input() resources: ARTURIResource[] = [];
    @Input() ordered: boolean; //specifies if order matters, if true there are edit buttons like add/move before/after
    @Input() allowDuplicates: boolean; //duplicated resources are allowed in the list (useful for example in prop chain where the same prop can be multiple times in the chain)
    @Input() role: RDFResourceRolesEnum; //currently handle only properties and classes
    @Output() changed: EventEmitter<ARTURIResource[]> = new EventEmitter();
    selectedRes: ARTURIResource;

    projectAccessed: boolean; //useful in order to disable picker (and just fill manually the field) from outside project

    constructor(private resourceService: ResourcesServices, private basicModals: BasicModalServices, private browsingModals: BrowsingModalServices) { }

    ngOnInit() {
        let workingProj: Project = VBContext.getWorkingProject();
        //project accessed (enables picking through tree/list browsing) if a project is accessed and its the current in input (if any)
        this.projectAccessed = workingProj != null && (this.project == null || workingProj.getName() == this.project.getName());

        if (this.projectAccessed && this.resources && this.resources.length > 0) {
            this.annotateResources();
        }
    }

    private annotateResources() {
        this.resourceService.getResourcesInfo(this.resources).subscribe(
            annotatedResources => {
                /**
                 * Replaces the un-annotated resources with the annotated ones
                 * Cannot assign annotatedResources directly to resources since getResourcesInfo() doesn't returns duplicates and doesn't grant order
                 */
                annotatedResources.forEach(r => {
                    this.resources.forEach((p, i, list) => {
                        if (p.equals(r)) {
                            list[i] = <ARTURIResource>r;
                        }
                    });
                    this.changed.emit(this.resources);
                });
            }
        );
    }

    selectResource(res: ARTURIResource) {
        if (this.ordered) { //if not ordered, selection has no sense since resources cannot be moved around (or added before/after another)
            if (this.selectedRes == res) {
                this.selectedRes = null;
            } else {
                this.selectedRes = res;
            }
        }
    }

    addResource(where?: "before" | "after") {
        if (!this.projectAccessed) return; //needed since I enabled event on disabled "add" menu item for allowing tooltip
        let browseResFn: Promise<ARTResource>;
        if (this.role == RDFResourceRolesEnum.cls) {
            browseResFn = this.browsingModals.browseClassTree({ key: "DATA.ACTIONS.ADD_CLASS" });
        } else if (this.role == RDFResourceRolesEnum.property) {
            browseResFn = this.browsingModals.browsePropertyTree({ key: "DATA.ACTIONS.ADD_PROPERTY" });
        } else {
            browseResFn = this.browsingModals.browseClassIndividualTree({ key: "ACTIONS.SELECT_RESOURCE"});
        }
        browseResFn.then(
            (res: ARTURIResource) => {
                if (!this.allowDuplicates && this.resources.some(r => r.equals(res))) {
                    this.basicModals.alert({ key: "STATUS.WARNING" }, { key: "Resource " + res.getShow() + " is already in the list" }, ModalType.warning);
                    return;
                }
                if (where == null) {
                    this.resources.push(res);
                } else if (where == "before") {
                    this.resources.splice(this.resources.indexOf(this.selectedRes), 0, res);
                } else if (where == "after") {
                    this.resources.splice(this.resources.indexOf(this.selectedRes) + 1, 0, res);
                }
                this.changed.emit(this.resources);
            },
            () => { }
        );
    }

    isMoveDisabled(where: "before" | "after"): boolean {
        if (this.selectedRes == null || this.resources.length == 1) {
            return true;
        }
        if (where == "after" && this.resources.indexOf(this.selectedRes) == this.resources.length) {
            return true; //selected res was the last in the list
        }
        if (where == "before" && this.resources.indexOf(this.selectedRes) == 0) {
            return true; //selected res was the first in the list
        }
        return false;
    }

    moveResource(where: "before" | "after") {
        let prevIndex = this.resources.indexOf(this.selectedRes);
        this.resources.splice(prevIndex, 1); //remove from current position
        if (where == "before") {
            this.resources.splice(prevIndex - 1, 0, this.selectedRes);
        } else { //after
            this.resources.splice(prevIndex + 1, 0, this.selectedRes);
        }
        this.changed.emit(this.resources);
    }

    removeResource(res: ARTURIResource) {
        this.resources.splice(this.resources.indexOf(res), 1);
        if (this.selectedRes == res) {
            this.selectedRes = null;
        }
        this.changed.emit(this.resources);
    }

    /**
     * Allow to edit manually the resource list
     */
    editManually() {
        let serializedResList: string = this.resources.map(p => {
            let qname = p.getAdditionalProperty(ResAttribute.QNAME);
            return qname ? qname : p.getURI();
        }).join(", ");

        this.basicModals.prompt({ key: "Edit resources list" }, null, { key: "Write the list as sequence of comma (,) separated IRIs (QNames are accepted as well)" }, serializedResList, true).then(
            (value: string) => {
                let resListStr: string = value.trim();
                if (resListStr.length != 0) {
                    if (!this.allowDuplicates) {
                        let splitted = resListStr.split(",").map(s => s.trim());
                        let withoutDuplicates = splitted.filter((s, idx, list) => list.indexOf(s) == idx);
                        resListStr = withoutDuplicates.join(",");
                    }
                    this.resourceService.validateIRIList(resListStr).subscribe(
                        validatedResources => {
                            this.resources = validatedResources;
                            this.annotateResources();
                            //change is already emitted in annotateResources
                        },
                        (err: Error) => {
                            this.basicModals.alert({ key: "STATUS.ERROR" }, { key: "Invalid resources list: " + err.message }, ModalType.warning);
                        }
                    );
                } else {
                    this.resources = [];
                    this.changed.emit(this.resources);
                }
            },
            () => { }
        );
    }

}
