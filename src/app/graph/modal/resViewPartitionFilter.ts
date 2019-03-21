import { Component } from "@angular/core";
import { RDFResourceRolesEnum } from "../../models/ARTResources";
import { ResViewPartitionFilterPreference } from "../../models/Properties";
import { ResViewPartition, ResViewUtils } from "../../models/ResourceView";
import { ResourceUtils } from "../../utils/ResourceUtils";
import { VBProperties } from "../../utils/VBProperties";
import { BasicModalServices } from "../../widget/modal/basicModal/basicModalServices";

@Component({
    selector: "rv-partition-filter",
    templateUrl: "./resViewPartitionFilter.html"
})
export class ResViewPartitionFilter {

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

        [RDFResourceRolesEnum.dataRange]: null,

        [RDFResourceRolesEnum.datatypeProperty]: [ResViewPartition.types, ResViewPartition.formBasedPreview, ResViewPartition.equivalentProperties,
            ResViewPartition.superproperties, ResViewPartition.facets, ResViewPartition.disjointProperties, ResViewPartition.domains,
            ResViewPartition.ranges, ResViewPartition.lexicalizations, ResViewPartition.properties],

        [RDFResourceRolesEnum.individual]: [ResViewPartition.types, ResViewPartition.formBasedPreview, ResViewPartition.lexicalizations, ResViewPartition.properties],

        [RDFResourceRolesEnum.limeLexicon]: null,

        // [RDFResourceRolesEnum.mention, null, //prevent expansion for mention?

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

    private rolePartitionsStructs: RolePartitionsStruct[];
    private selectedRolePartitionsStruct: RolePartitionsStruct;
    private selectedPartition: PartitionStruct;

    constructor(private vbProp: VBProperties, private basicModals: BasicModalServices) {}

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

        this.convertPrefToRolePartitionsStruct(this.vbProp.getResourceViewPartitionsFilter());
        this.selectedRolePartitionsStruct = this.rolePartitionsStructs[0];
    }

    /**
     * Convert the preference to a RolePartitionStruct list.
     * The preference is an object that lists the hidden partitions for each roles.
     * RolePartitionStruct contains also other info, such as the role or partition "show" and the "checked" boolean when a partition is visible
     * @param pref 
     */
    private convertPrefToRolePartitionsStruct(pref: ResViewPartitionFilterPreference) {
        this.rolePartitionsStructs = [];

        for (let role in this.rolePartitionMap) {
            let partitionsStructs: PartitionStruct[] = [];
            let partitions: ResViewPartition[] = this.rolePartitionMap[role];
            partitions.forEach(p => {
                //partition visible if the role has no filtered-partition listed, or the partition for the role is not present among the filtered
                let showPartition: boolean = pref[role] == null || pref[role].indexOf(p) == -1;
                partitionsStructs.push({ 
                    id: p,
                    show: ResViewUtils.getResourceViewPartitionLabel(p),
                    checked: showPartition
                });
            });

            this.rolePartitionsStructs.push({
                role: { id: <RDFResourceRolesEnum>role, show: ResourceUtils.getResourceRoleLabel(<RDFResourceRolesEnum>role) },
                partitions: partitionsStructs
            });
        }
    }

    private selectRolePartitionsStruct(rps: RolePartitionsStruct) {
        this.selectedRolePartitionsStruct = rps;
        this.selectedPartition = null;
    }

    private selectPartition(partition: PartitionStruct) {
        if (this.selectedPartition == partition) {
            this.selectedPartition = null;
        } else {
            this.selectedPartition = partition;    
        }
    }

    /**
     * Checks/Unchecks (according the check parameter) all the partitions of the struct provided
     * @param rolePartitionsStruct 
     * @param check 
     */
    private checkAll(rolePartitionsStruct: RolePartitionsStruct, check: boolean) {
        rolePartitionsStruct.partitions.forEach(p => {
            p.checked = check;
        });
        this.updatePref();
    }

    private areAllUnchecked(rolePartitionsStruct: RolePartitionsStruct) {
        let allUnchecked: boolean = true;
        rolePartitionsStruct.partitions.forEach(p => {
            if (p.checked) {
                allUnchecked = false;
            }
        });
        return allUnchecked;
    }

    /**
     * Checks/Unchecks (according the check parameter) the same partition (the selected one) for all the roles.
     * The button that invokes this method should be enable only if there is a selectedPartition.
     * @param check 
     */
    private checkInAllRoles(check: boolean) {
        let partition: ResViewPartition = this.selectedPartition.id;
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
    private reset() {
        this.basicModals.confirm("Reset filter", "The partition filter will be reset for all the available roles. Are you sure?", "warning").then(
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
        let pref: ResViewPartitionFilterPreference = {};
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
        this.vbProp.setResourceViewPartitionFilter(pref);
    }

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
    show: string;
    checked: boolean;
}