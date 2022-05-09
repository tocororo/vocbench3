import { Component, forwardRef, Input, SimpleChanges } from "@angular/core";
import { NG_VALUE_ACCESSOR } from "@angular/forms";
import { Observable, of } from "rxjs";
import { map } from "rxjs/operators";
import { ExtensionPointID, Scope } from "src/app/models/Plugins";
import { Project } from "src/app/models/Project";
import { SettingsServices } from "src/app/services/settingsServices";
import { VBContext } from "src/app/utils/VBContext";
import { RDFResourceRolesEnum } from "../../models/ARTResources";
import { PartitionFilterPreference, SettingsEnum } from "../../models/Properties";
import { ResViewPartition, ResViewUtils } from "../../models/ResourceView";
import { ResourceUtils } from "../../utils/ResourceUtils";
import { BasicModalServices } from "../modal/basicModal/basicModalServices";
import { ModalType } from '../modal/Modals';

@Component({
    selector: "partition-filter-editor",
    templateUrl: "./partitionFilterEditor.html",
    host: { class: "vbox" },
    providers: [{
        provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => PartitionFilterEditor), multi: true,
    }]
})
export class PartitionFilterEditor {

    @Input() ctx: PartitionFilterEditorCtx = PartitionFilterEditorCtx.Default;

    /* 
    in administration pages (user, project-user), the partition filter must be initialized for the provided user or project-user pair, 
    not for the current one in VBContext (that may not even exist)
    */
    @Input() project: Project;

    private partitionFilterSetting: PartitionFilterPreference;

    /**
     * When will be provided, this map will be retrieved throught a service call
     */
    private templates: { [role: string]: ResViewPartition[] };

    rolePartitionsStructs: RolePartitionsStruct[];
    selectedRolePartitionsStruct: RolePartitionsStruct;

    constructor(private settingsService: SettingsServices, private basicModals: BasicModalServices) { }

    ngOnChanges(changes: SimpleChanges) {
        if (changes['project'] && changes['project'].currentValue) {
            this.templates = null;
            this.initPartitionFilter();
        }
    }

    private initPartitionFilter() {
        this.ensureTemplateInitialized().subscribe( //ensure that the template is initialized
            () => {
                /*
                Convert the partitionFilterSetting to a RolePartitionStruct list.
                PartitionFilterSetting is an object that lists the hidden partitions for each roles.
                RolePartitionStruct contains also other info, such as the role or partition "show" and the "checked" boolean when a partition is visible
                */
                this.rolePartitionsStructs = [];
                for (let role in this.templates) {
                    let partitionsStructs: PartitionStruct[] = [];
                    let partitions: ResViewPartition[] = this.templates[role];
                    partitions.forEach(p => {
                        //partition visible if the role has no filtered-partition listed, or the partition for the role is not present among the filtered
                        let showPartition: boolean = this.partitionFilterSetting[role] == null || this.partitionFilterSetting[role].indexOf(p) == -1;
                        partitionsStructs.push({
                            id: p,
                            labelTranslationKey: ResViewUtils.getResourceViewPartitionLabelTranslationKey(p),
                            checked: showPartition
                        });
                    });
                    this.rolePartitionsStructs.push({
                        role: { id: <RDFResourceRolesEnum>role, show: ResourceUtils.getResourceRoleLabel(<RDFResourceRolesEnum>role) },
                        partitions: partitionsStructs
                    });
                }
                this.rolePartitionsStructs.sort((p1, p2) => p1.role.show.localeCompare(p2.role.show));
                //init the selection on the first role
                this.selectedRolePartitionsStruct = this.rolePartitionsStructs[0];
            }
        );
    }

    /**
     * Ensures that the template is initialized: 
     * if the component is working in a administration page the template is the one set for the project (retrieved with a service call), 
     * otherwise the component is working inside a project (e.g. RV or graph settings) and the template is the one already set in the VBContext
     * Note: the template is just the mapping between resource types and RV partitions, namely the basic "skeleton" on which the filter work on (allowing to show/hide partition).
     * Such templates is a project settings, so it can be retrieved only at system level (the default) or local to a project.
     * @returns 
     */
    private ensureTemplateInitialized(): Observable<void> {
        if (this.templates != null) {
            return of(null);
        } else {
            if (this.ctx == PartitionFilterEditorCtx.Project && this.project != null) { //component used in project administration page => init template about such project
                /* init template as empty object, preventing further invokation of the following service when this method is invoked (almost) mutliple time
                (e.g. in writeValue, ngOnChanges when projects changes, ...) */
                this.templates = {};
                return this.settingsService.getSettingsForProjectAdministration(ExtensionPointID.ST_CORE_ID, Scope.PROJECT, this.project).pipe(
                    map(settings => {
                        this.templates = settings.getPropertyValue(SettingsEnum.resourceView).templates;
                    })
                );
            } else if (this.ctx == PartitionFilterEditorCtx.User) { //the template is edited in the User template editor => use the system default template
                this.templates = {};
                return this.settingsService.getSettingsDefault(ExtensionPointID.ST_CORE_ID, Scope.PROJECT, Scope.SYSTEM).pipe(
                    map(settings => {
                        this.templates = settings.getPropertyValue(SettingsEnum.resourceView).templates;
                    })
                );
            } else { //init template set in the project settings of project in VBContext
                this.templates = VBContext.getWorkingProjectCtx().getProjectSettings().resourceView.templates;
                return of(null);
            }
        }
    }

    selectRolePartitionsStruct(rps: RolePartitionsStruct) {
        this.selectedRolePartitionsStruct = rps;
    }

    /**
     * Checks/Unchecks (according the check parameter) all the partitions of the struct provided
     * @param rolePartitionsStruct 
     * @param check 
     */
    checkAll(rolePartitionsStruct: RolePartitionsStruct, check: boolean) {
        rolePartitionsStruct.partitions.forEach(p => {
            p.checked = check;
        });
        this.updatePref();
    }

    /**
     * Checks/Unchecks (according the check parameter) the same partition (the provided one) for all the roles.
     */
    checkForAllRoles(partition: ResViewPartition, check: boolean) {
        this.rolePartitionsStructs.forEach(rps => {
            rps.partitions.forEach(p => {
                if (partition == p.id) {
                    p.checked = check;
                }
            });
        });
        this.updatePref();
    }

    /**
     * Restore to visible all the partitions for all the roles
     */
    reset() {
        this.basicModals.confirm({ key: "ACTIONS.ENABLE_ALL" }, { key: "MESSAGES.ENABLE_ALL_PARTITIONS_IN_ALL_TYPES_CONFIRM" }, ModalType.warning).then(
            confirm => {
                this.rolePartitionsStructs.forEach(rps => {
                    rps.partitions.forEach(p => {
                        p.checked = true;
                    });
                });
                this.updatePref();
            },
            () => { }
        );
    }

    private updatePref() {
        let pref: PartitionFilterPreference = {};
        this.rolePartitionsStructs.forEach(rps => {
            let partitionsPref: ResViewPartition[] = [];
            rps.partitions.forEach(p => {
                if (!p.checked) {
                    partitionsPref.push(p.id);
                }
            });
            if (partitionsPref.length > 0) {
                pref[rps.role.id + ""] = partitionsPref;
            }
        });
        this.propagateChange(pref);
    }



    //---- method of ControlValueAccessor and Validator interfaces ----
    /**
     * Write a new value to the element.
     */
    writeValue(obj: PartitionFilterPreference) {
        if (obj != null) {
            this.partitionFilterSetting = obj;
        } else {
            this.partitionFilterSetting = {};
        }
        this.initPartitionFilter();
    }
    /**
     * Set the function to be called when the control receives a change event.
     */
    registerOnChange(fn: any): void {
        this.propagateChange = fn;
    }
    /**
     * Set the function to be called when the control receives a touch event. Not used.
     */
    registerOnTouched(fn: any): void { }

    //--------------------------------------------------

    // the method set in registerOnChange, it is just a placeholder for a method that takes one parameter, 
    // we use it to emit changes back to the parent
    private propagateChange = (_: any) => { };

}

class RolePartitionsStruct {
    role: RoleStruct;
    partitions: PartitionStruct[];
}
class RoleStruct {
    id: RDFResourceRolesEnum;
    show: string;
}
class PartitionStruct {
    id: ResViewPartition;
    labelTranslationKey: string;
    checked: boolean;
}

export enum PartitionFilterEditorCtx {
    User = "User", //when this editor is used inside the user partition filter editor => use the system default template
    Project = "Project", //when this editor is used inside the project-user filter editor => use the template set for project
    Default = "Default" //otherwise (e.g. ResView/Graph settings) => use the template of the current project (from settings in VBContext). Teoretically no need to specify this case.
}