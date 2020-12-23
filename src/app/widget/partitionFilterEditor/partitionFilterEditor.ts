import { Component, forwardRef } from "@angular/core";
import { NG_VALUE_ACCESSOR } from "@angular/forms";
import { RDFResourceRolesEnum } from "../../models/ARTResources";
import { PartitionFilterPreference } from "../../models/Properties";
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

    /**
     * When will be provided, this map will be retrieved throught a service call
     */
    private rolePartitionMap: { [role: string]: ResViewPartition[] } = {
        [RDFResourceRolesEnum.annotationProperty]: [ResViewPartition.types, ResViewPartition.formBasedPreview, ResViewPartition.superproperties, 
            ResViewPartition.domains, ResViewPartition.ranges, ResViewPartition.lexicalizations, ResViewPartition.properties],

        [RDFResourceRolesEnum.cls]: [ResViewPartition.types, ResViewPartition.formBasedPreview, ResViewPartition.classaxioms,
            ResViewPartition.lexicalizations, ResViewPartition.properties],

        [RDFResourceRolesEnum.concept]: [ResViewPartition.types, ResViewPartition.formBasedPreview, ResViewPartition.topconceptof,
            ResViewPartition.schemes, ResViewPartition.broaders, ResViewPartition.lexicalizations, ResViewPartition.notes, ResViewPartition.properties],

        [RDFResourceRolesEnum.conceptScheme]: [ResViewPartition.types, ResViewPartition.formBasedPreview, ResViewPartition.lexicalizations,
            ResViewPartition.notes, ResViewPartition.properties],

        [RDFResourceRolesEnum.dataRange]: [ResViewPartition.types, ResViewPartition.formBasedPreview, ResViewPartition.datatypeDefinitions,
            ResViewPartition.lexicalizations, ResViewPartition.properties],

        [RDFResourceRolesEnum.datatypeProperty]: [ResViewPartition.types, ResViewPartition.formBasedPreview, ResViewPartition.equivalentProperties,
            ResViewPartition.superproperties, ResViewPartition.facets, ResViewPartition.disjointProperties, ResViewPartition.domains,
            ResViewPartition.ranges, ResViewPartition.lexicalizations, ResViewPartition.properties],

        [RDFResourceRolesEnum.individual]: [ResViewPartition.types, ResViewPartition.formBasedPreview, ResViewPartition.lexicalizations, ResViewPartition.properties],

        [RDFResourceRolesEnum.limeLexicon]: null,

        // [RDFResourceRolesEnum.mention], null,

        [RDFResourceRolesEnum.objectProperty]: [ResViewPartition.types, ResViewPartition.formBasedPreview, ResViewPartition.equivalentProperties,
            ResViewPartition.superproperties, ResViewPartition.subPropertyChains, ResViewPartition.facets, ResViewPartition.disjointProperties,
            ResViewPartition.domains, ResViewPartition.ranges, ResViewPartition.lexicalizations, ResViewPartition.properties],

        [RDFResourceRolesEnum.ontolexForm]: [ResViewPartition.types, ResViewPartition.formRepresentations, ResViewPartition.formBasedPreview,
            ResViewPartition.properties],

        [RDFResourceRolesEnum.ontolexLexicalEntry]: [ResViewPartition.types, ResViewPartition.lexicalForms, ResViewPartition.subterms,
            ResViewPartition.constituents, ResViewPartition.rdfsMembers, ResViewPartition.formBasedPreview, ResViewPartition.lexicalSenses,
            ResViewPartition.denotations, ResViewPartition.evokedLexicalConcepts, ResViewPartition.properties],

        [RDFResourceRolesEnum.ontolexLexicalSense]: [ResViewPartition.types, ResViewPartition.properties],

        [RDFResourceRolesEnum.ontology]: [ResViewPartition.types, ResViewPartition.formBasedPreview, ResViewPartition.lexicalizations,
            ResViewPartition.imports, ResViewPartition.properties],

        [RDFResourceRolesEnum.ontologyProperty]: [ResViewPartition.types, ResViewPartition.formBasedPreview, ResViewPartition.superproperties,
            ResViewPartition.domains, ResViewPartition.ranges, ResViewPartition.lexicalizations, ResViewPartition.properties],

        [RDFResourceRolesEnum.property]: [ResViewPartition.types, ResViewPartition.formBasedPreview, ResViewPartition.equivalentProperties,
            ResViewPartition.superproperties, ResViewPartition.subPropertyChains, ResViewPartition.facets, ResViewPartition.disjointProperties,
            ResViewPartition.domains, ResViewPartition.ranges, ResViewPartition.lexicalizations, ResViewPartition.properties],

        [RDFResourceRolesEnum.skosCollection]: [ResViewPartition.types, ResViewPartition.formBasedPreview, ResViewPartition.lexicalizations,
            ResViewPartition.notes, ResViewPartition.members, ResViewPartition.properties],

        [RDFResourceRolesEnum.skosOrderedCollection]: [ResViewPartition.types, ResViewPartition.formBasedPreview, ResViewPartition.lexicalizations,
            ResViewPartition.notes, ResViewPartition.membersOrdered, ResViewPartition.properties],

        [RDFResourceRolesEnum.xLabel]: [ResViewPartition.types, ResViewPartition.formBasedPreview, ResViewPartition.labelRelations,
            ResViewPartition.notes, ResViewPartition.properties]
    };

    rolePartitionsStructs: RolePartitionsStruct[];
    selectedRolePartitionsStruct: RolePartitionsStruct;

    constructor(private basicModals: BasicModalServices) {}

    ngOnInit() {
        /**
         * Initialize client-side the rolePartitionMap.
         * This is useful untill there is no service that provide the mapping between resource roles and ResourceView partitions.
         */
        for (let role in this.rolePartitionMap) {
            if (this.rolePartitionMap[role] == null) {
                //set the individual partitions (as fallback) to those roles that have no partitions specified
                this.rolePartitionMap[role] = this.rolePartitionMap[RDFResourceRolesEnum.individual]
            }
        }
    }

    /**
     * Convert the preference to a RolePartitionStruct list.
     * The preference is an object that lists the hidden partitions for each roles.
     * RolePartitionStruct contains also other info, such as the role or partition "show" and the "checked" boolean when a partition is visible
     * @param pref 
     */
    private convertPrefToRolePartitionsStruct(pref: PartitionFilterPreference): RolePartitionsStruct[] {
        let struct: RolePartitionsStruct[] = [];

        for (let role in this.rolePartitionMap) {
            let partitionsStructs: PartitionStruct[] = [];
            let partitions: ResViewPartition[] = this.rolePartitionMap[role];
            partitions.forEach(p => {
                //partition visible if the role has no filtered-partition listed, or the partition for the role is not present among the filtered
                let showPartition: boolean = pref[role] == null || pref[role].indexOf(p) == -1;
                partitionsStructs.push({ 
                    id: p,
                    labelTranslationKey: ResViewUtils.getResourceViewPartitionLabelTranslationKey(p),
                    checked: showPartition
                });
            });
            struct.push({
                role: { id: <RDFResourceRolesEnum>role, show: ResourceUtils.getResourceRoleLabel(<RDFResourceRolesEnum>role) },
                partitions: partitionsStructs
            });
        }
        return struct
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
        this.basicModals.confirm({key:"ACTIONS.ENABLE_ALL"}, {key:"MESSAGES.ENABLE_ALL_PARTITIONS_IN_ALL_TYPES_CONFIRM"}, ModalType.warning).then(
            confirm => {
                this.rolePartitionsStructs.forEach(rps => {
                    rps.partitions.forEach(p => {
                        p.checked = true;
                    });
                })
                this.updatePref();
            },
            () => {}
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
                pref[rps.role.id+""] = partitionsPref;
            }
        });
        this.propagateChange(pref)
    }



    //---- method of ControlValueAccessor and Validator interfaces ----
    /**
     * Write a new value to the element.
     */
    writeValue(obj: PartitionFilterPreference) {
        if (obj) {
            this.rolePartitionsStructs = this.convertPrefToRolePartitionsStruct(obj);
        } else {
            this.rolePartitionsStructs = this.convertPrefToRolePartitionsStruct({});
        }
        this.selectedRolePartitionsStruct = this.rolePartitionsStructs[0];
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