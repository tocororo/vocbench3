import { ChangeDetectorRef, Component } from "@angular/core";
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ModalType } from 'src/app/widget/modal/Modals';
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
export class ClassTreeSettingsModal {

    private pristineClassPref: ClassTreePreference;

    rootClass: ARTURIResource;
    filterEnabled: boolean;

    filterMapRes: FilterMapEntry[] = [];
    selectedFilteredClass: ARTURIResource;

    renderingClasses: boolean = false;
    renderingFilter: boolean = false;

    showInstNumb: boolean;

    constructor(public activeModal: NgbActiveModal, private clsService: ClassesServices, private resourceService: ResourcesServices,
        private vbProp: VBProperties, private basicModals: BasicModalServices, private browsingModals: BrowsingModalServices, private changeDetectorRef: ChangeDetectorRef) { }

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
        for (let key in clsTreePref.filter.map) {
            filteredClss.push(new ARTURIResource(key));
        }
        if (filteredClss.length > 0) {
            this.resourceService.getResourcesInfo(filteredClss).subscribe(
                resources => {
                    resources.forEach(r => {
                        this.filterMapRes.push({ cls: <ARTURIResource>r, subClasses: null });
                    });
                }
            );
        }

        //init show instances number
        this.showInstNumb = clsTreePref.showInstancesNumber;
    }

    /**
     * ROOT CLASS HANDLERS
     */

    changeClass() {
        this.browsingModals.browseClassTree({ key: "DATA.ACTIONS.SELECT_ROOT_CLASS" }, [RDFS.resource]).then(
            (cls: ARTURIResource) => {
                let model: string = VBContext.getWorkingProject().getModelType();
                if (
                    (model == RDFS.uri && cls.getURI() != RDFS.resource.getURI()) ||
                    (cls.getURI() != RDFS.resource.getURI() && cls.getURI() != OWL.thing.getURI()) //OWL or RDFS model
                ) {
                    this.basicModals.alertCheckCookie({ key: "STATUS.WARNING" }, { key: "MESSAGES.CHANGE_CLASS_TREE_ROOT_WARN" }, Cookie.WARNING_CUSTOM_ROOT, ModalType.warning);
                }
                this.rootClass = cls;
            },
            () => { }
        );
    }

    updateRootClass(clsURI: string) {
        let cls: ARTURIResource = new ARTURIResource(clsURI, null, RDFResourceRolesEnum.cls);
        //check if clsURI exist
        this.resourceService.getResourcePosition(cls).subscribe(
            position => {
                if (position.isLocal()) {
                    this.rootClass = cls;
                } else {
                    this.basicModals.alert({ key: "STATUS.ERROR" }, { key: "MESSAGES.NOT_EXISTING_RESOURCE_URI", params: { uri: cls.getNominalValue() } }, ModalType.error);
                    //temporarly reset the root class and the restore it (in order to trigger the change detection editable-input)
                    let oldRootClass = this.rootClass;
                    this.rootClass = null;
                    this.changeDetectorRef.detectChanges();
                    this.rootClass = oldRootClass;
                }
            }
        );

    }


    /**
     * FILTER MAP HANDLERS
     */

    selectFilteredClass(cls: ARTURIResource) {
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

    getFilterSubClasses(): SubClassFilterItem[] {
        if (this.selectedFilteredClass != null) {
            return this.getFilterMapEntry(this.selectedFilteredClass).subClasses;
        } else {
            return [];
        }
    }

    addFilter() {
        this.browsingModals.browseClassTree({ key: "DATA.ACTIONS.SELECT_CLASS" }, [RDFS.resource]).then(
            (cls: ARTURIResource) => {
                if (this.getFilterMapEntry(cls) == null) {
                    this.filterMapRes.push({ cls: cls, subClasses: null });
                } else {
                    this.basicModals.alert({ key: "STATUS.ERROR" }, { key: "MESSAGES.ALREADY_EXISTING_FILTER_FOR_CLASS" }, ModalType.warning);
                }
            },
            () => { }
        );
    }

    removeFilter() {
        for (let i = 0; i < this.filterMapRes.length; i++) {
            if (this.filterMapRes[i].cls.getURI() == this.selectedFilteredClass.getURI()) {
                this.selectedFilteredClass = null;
                this.filterMapRes.splice(i, 1);
                return;
            }
        }
    }

    checkAllClasses(checked: boolean) {
        this.getFilterMapEntry(this.selectedFilteredClass).subClasses.forEach((c: SubClassFilterItem) => {
            if (!c.disabled) {
                c.checked = checked;
            }
        });
    }

    private getFilterMapEntry(cls: ARTURIResource): FilterMapEntry {
        for (let i = 0; i < this.filterMapRes.length; i++) {
            if (this.filterMapRes[i].cls.getURI() == cls.getURI()) {
                return this.filterMapRes[i];
            }
        }
        return null;
    }

    ok() {
        //convert filterMapRes to a map string: string[]
        let filterMap: { [key: string]: string[] } = {};
        this.filterMapRes.forEach(f => {
            let filteredSubClasses: string[] = [];
            if (f.subClasses == null) {
                //subClasses in filterMapRes not yet initialized => get it from the preference
                filteredSubClasses = VBContext.getWorkingProjectCtx().getProjectPreferences().classTreePreferences.filter.map[f.cls.getURI()];
            } else {
                for (let i = 0; i < f.subClasses.length; i++) {
                    if (!f.subClasses[i].checked) {
                        filteredSubClasses.push(f.subClasses[i].resource.getURI());
                    }
                }
            }
            filterMap[f.cls.getURI()] = filteredSubClasses;
        });

        //check if settings are changed
        let changed: boolean = JSON.stringify(this.pristineClassPref.filter.map) != JSON.stringify(filterMap) ||
            this.pristineClassPref.filter.enabled != this.filterEnabled ||
            this.pristineClassPref.rootClassUri != this.rootClass.getURI() ||
            this.pristineClassPref.showInstancesNumber != this.showInstNumb;

        //only if the preferences changed close the dialog (so that the class tree refresh), otherwise cancel
        if (changed) {
            let clsTreePrefs: ClassTreePreference = new ClassTreePreference(VBContext.getWorkingProject());
            clsTreePrefs.filter = { map: filterMap, enabled: this.filterEnabled };
            clsTreePrefs.rootClassUri = this.rootClass.getURI();
            clsTreePrefs.showInstancesNumber = this.showInstNumb;
            this.vbProp.setClassTreePreferences(clsTreePrefs).subscribe();
            this.activeModal.close();
        } else { //for other changes simply dismiss the modal
            this.cancel();
        }
    }

    cancel() {
        this.activeModal.dismiss();
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