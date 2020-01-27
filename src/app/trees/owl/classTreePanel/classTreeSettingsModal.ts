import { Component } from "@angular/core";
import { DialogRef, ModalComponent } from "ngx-modialog";
import { BSModalContext } from 'ngx-modialog/plugins/bootstrap';
import { ARTURIResource, RDFResourceRolesEnum } from "../../../models/ARTResources";
import { ClassTreePreference } from "../../../models/Properties";
import { OWL, RDFS } from "../../../models/Vocabulary";
import { ClassesServices } from "../../../services/classesServices";
import { ResourcesServices } from "../../../services/resourcesServices";
import { Cookie } from "../../../utils/Cookie";
import { ResourceUtils, SortAttribute } from "../../../utils/ResourceUtils";
import { VBContext } from "../../../utils/VBContext";
import { VBProperties } from "../../../utils/VBProperties";
import { BasicModalServices } from "../../../widget/modal/basicModal/basicModalServices";
import { BrowsingModalServices } from "../../../widget/modal/browsingModal/browsingModalServices";

@Component({
    selector: "class-tree-settings-modal",
    templateUrl: "./classTreeSettingsModal.html",
})
export class ClassTreeSettingsModal implements ModalComponent<BSModalContext> {
    context: BSModalContext;

    private pristineClassPref: ClassTreePreference;

    private rootClass: ARTURIResource;
    private filterEnabled: boolean;

    private filterMapRes: FilterMapEntry[] = [];
    private selectedFilteredClass: ARTURIResource;

    private renderingClasses: boolean = false;
    private renderingFilter: boolean = false;

    private showInstNumb: boolean;

    constructor(public dialog: DialogRef<BSModalContext>, private clsService: ClassesServices, private resourceService: ResourcesServices, 
        private vbProp: VBProperties, private basicModals: BasicModalServices , private browsingModals: BrowsingModalServices) {
        this.context = dialog.context;
    }

    ngOnInit() {
        let clsTreePref: ClassTreePreference = VBContext.getWorkingProjectCtx().getProjectPreferences().classTreePreferences;
        this.pristineClassPref = JSON.parse(JSON.stringify(clsTreePref));

        //init root class
        this.resourceService.getResourceDescription(new ARTURIResource(clsTreePref.rootClassUri)).subscribe(
            res => {
                this.rootClass = <ARTURIResource>res;
            }
        );

        //init filter
        this.filterEnabled = clsTreePref.filter.enabled;
        let filteredClss: ARTURIResource[] = [];
        for (var key in clsTreePref.filter.map) {
            filteredClss.push(new ARTURIResource(key));
        }
        if (filteredClss.length > 0) {
            this.resourceService.getResourcesInfo(filteredClss).subscribe(
                resources => {
                    resources.forEach(r => {
                        this.filterMapRes.push({ cls: r, subClasses: null });
                    })
                }
            )
        }
        
        //init show instances number
        this.showInstNumb = clsTreePref.showInstancesNumber;
    }

    /**
     * ROOT CLASS HANDLERS
     */

    private changeClass() {
        this.browsingModals.browseClassTree("Select root class", [RDFS.resource]).then(
            (cls: ARTURIResource) => {
                if (Cookie.getCookie(Cookie.WARNING_CUSTOM_ROOT, VBContext.getLoggedUser().getIri()) != "false") {
                    let model: string = VBContext.getWorkingProject().getModelType();
                    if ((model == RDFS.uri && cls.getURI() != RDFS.resource.getURI()) ||
                        (cls.getURI() != RDFS.resource.getURI() && cls.getURI() != OWL.thing.getURI()) //OWL or RDFS model
                    ) {
                        let message: string = "Selecting a specific class as a root could hide newly created classes " + 
                            "that are not subclasses of the chosen root.";
                        this.basicModals.alertCheckWarning("Warning", message, Cookie.WARNING_CUSTOM_ROOT);
                    }
                }
                this.rootClass = cls;
            },
            () => {}
        );
    }

    private updateRootClass(clsURI: string) {
        let cls: ARTURIResource = new ARTURIResource(clsURI, null, RDFResourceRolesEnum.cls);
        //check if clsURI exist
        this.resourceService.getResourcePosition(cls).subscribe(
            position => {
                if (position.isLocal()) {
                    this.rootClass = cls;
                } else {
                    this.basicModals.alert("Error", "Wrong URI: no resource with URI " + cls.getNominalValue() + " exists in the current project", "error");
                    //temporarly reset the root class and the restore it (in order to trigger the change detection editable-input)
                    let oldRootClass = this.rootClass;
                    this.rootClass = null;
                    setTimeout(() => this.rootClass = oldRootClass);
                }
            }
        )
        
    }


    /**
     * FILTER MAP HANDLERS
     */

    private selectFilteredClass(cls: ARTURIResource) {
        this.selectedFilteredClass = cls;

        let filterMapEntry: FilterMapEntry = this.getFilterMapEntry(this.selectedFilteredClass);
        if (filterMapEntry.subClasses == null) { //subclasses yet initialized for the given class
            this.clsService.getSubClasses(this.selectedFilteredClass, false).subscribe(
                classes => {
                    ResourceUtils.sortResources(classes, SortAttribute.show);
                    let clsTreePref: ClassTreePreference = VBContext.getWorkingProjectCtx().getProjectPreferences().classTreePreferences;
                    let filteredSubClssPref = clsTreePref.filter.map[this.selectedFilteredClass.getURI()];
    
                    filterMapEntry.subClasses = [];
    
                    classes.forEach(c => {
                        if (filteredSubClssPref != null) { //exists a subclasses filter for the selected class
                            filterMapEntry.subClasses.push({ 
                                checked: filteredSubClssPref.indexOf(c.getURI()) == -1, //subClass not in the filter, so checked (visible)
                                disabled: c.getURI() == OWL.thing.getURI(), //owl:Thing cannot be filtered out
                                resource: c 
                            });
                        } else { //doesn't exist a subclasses filter for the selected class => every subclasses is checked
                            filterMapEntry.subClasses.push({ checked: true, disabled: c.getURI() == OWL.thing.getURI(), resource: c });
                        }
                    });
                }
            );
        }
    }

    private getFilterSubClasses(): SubClassFilterItem[] {
        if (this.selectedFilteredClass != null) {
            return this.getFilterMapEntry(this.selectedFilteredClass).subClasses;
        } else {
            return [];
        }
    }

    private addFilter() {
        this.browsingModals.browseClassTree("Select class", [RDFS.resource]).then(
            (cls: ARTURIResource) => {
                if (this.getFilterMapEntry(cls) == null) {
                    this.filterMapRes.push({ cls: cls, subClasses: null });
                } else {
                    this.basicModals.alert("Error", "A filter for class " + cls.getShow() + " already exists.", "warning");
                }
            },
            () => {}
        );
    }

    private removeFilter() {
        for (var i = 0; i < this.filterMapRes.length; i++) {
            if (this.filterMapRes[i].cls.getURI() == this.selectedFilteredClass.getURI()) {
                this.selectedFilteredClass = null;
                this.filterMapRes.splice(i, 1);
                return;
            }
        }
    }

    private checkAllClasses(checked: boolean) {
        this.getFilterMapEntry(this.selectedFilteredClass).subClasses.forEach((c: SubClassFilterItem) => {
            if (!c.disabled) {
                c.checked = checked;
            }
        });
    }

    private getFilterMapEntry(cls: ARTURIResource): FilterMapEntry {
        for (var i = 0; i < this.filterMapRes.length; i++) {
            if (this.filterMapRes[i].cls.getURI() == cls.getURI()) {
                return this.filterMapRes[i];
            }
        }
        return null;
    }

    ok(event: Event) {
        //convert filterMapRes to a map string: string[]
        let filterMap: {[key: string]: string[]} = {};
        this.filterMapRes.forEach(f => {
            let filteredSubClasses: string[] = [];
            if (f.subClasses == null) {
                //subClasses in filterMapRes not yet initialized => get it from the preference
                filteredSubClasses = VBContext.getWorkingProjectCtx().getProjectPreferences().classTreePreferences.filter.map[f.cls.getURI()];
            } else {
                for (var i = 0; i < f.subClasses.length; i++) {
                    if (!f.subClasses[i].checked) {
                        filteredSubClasses.push(f.subClasses[i].resource.getURI());
                    }
                }
            }
            filterMap[f.cls.getURI()] = filteredSubClasses;
        })
        
        //update the settings only if changed
        if (
            JSON.stringify(this.pristineClassPref.filter.map) != JSON.stringify(filterMap) ||
            this.pristineClassPref.filter.enabled != this.filterEnabled
        ) {
            this.vbProp.setClassTreeFilter({ map: filterMap, enabled: this.filterEnabled })
        }

        if (this.pristineClassPref.rootClassUri != this.rootClass.getURI()) {
            this.vbProp.setClassTreeRoot(this.rootClass.getURI());
        }

        if (this.pristineClassPref.showInstancesNumber != this.showInstNumb) {
            this.vbProp.setShowInstancesNumber(this.showInstNumb);
        }

        //only if the root class changed close the dialog (so that the class tree refresh)
        if (this.pristineClassPref.rootClassUri != this.rootClass.getURI()) {
            event.stopPropagation();
            event.preventDefault();
            this.dialog.close();
        } else {//for other changes simply dismiss the modal
            this.cancel();
        }
    }

    cancel() {
        this.dialog.dismiss();
    }

}

class FilterMapEntry {
    cls: ARTURIResource;
    subClasses: SubClassFilterItem[];
}

class SubClassFilterItem {
    checked: boolean;
    resource: ARTURIResource;
    disabled?: boolean;
}