import { Component } from "@angular/core";
import { Router } from "@angular/router";
import { RDFS, OWL, SKOS, SKOSXL } from "../models/Vocabulary";
import { VBContext } from "../utils/VBContext";
import { AuthorizationEvaluator } from "../utils/AuthorizationEvaluator";

@Component({
    selector: "icv-list",
    templateUrl: "./icvListComponent.html",
    host: { class: "pageComponent" }
})
export class IcvListComponent {

    private dataModel: string;
    private lexicalizationModel: string;

    private structuralIcv: { open: boolean, list: ICVElement[] } = {
        open: true,
        list: [
            {
                name: "Dangling concepts", model: [SKOS.uri], lexicalization: [], routeName: "/Icv/DanglingConcept",
                description: "skos:Concept(s) that have no skos:broader or are not skos:topConceptOf in the skos:ConceptScheme where they belong",
                authAction: AuthorizationEvaluator.Actions.ICV_GENERIC_CONCEPT
            },
            {
                name: "Omitted topConcept", model: [SKOS.uri], lexicalization: [], routeName: "/Icv/NoTopConceptScheme",
                description: "skos:ConceptScheme(s) that have no top concept",
                authAction: AuthorizationEvaluator.Actions.ICV_GENERIC_CONCEPT
            },
            {
                name: "Concepts in no scheme", model: [SKOS.uri], lexicalization: [], routeName: "/Icv/NoSchemeConcept",
                description: "skos:Concept(s) that doesn't belong to any scheme",
                authAction: AuthorizationEvaluator.Actions.ICV_GENERIC_CONCEPT
            },
            {
                name: "TopConcept with broader", model: [SKOS.uri], lexicalization: [], routeName: "/Icv/TopConceptWithBroader",
                description: "skos:Concept(s) that are skos:topConceptOf some scheme and have some skos:broader concept",
                authAction: AuthorizationEvaluator.Actions.ICV_GENERIC_CONCEPT
            },
            {
                name: "Concepts related disjoint relations", model: [SKOS.uri], lexicalization: [], routeName: "/Icv/DisjointRelatedConcept",
                description: "skos:Concept(s) connected to another with both the skos:related and the skos:broaderTransitive "
                    + "(skos:related relation is disjoint with skos:broaderTransitive)",
                authAction: AuthorizationEvaluator.Actions.ICV_GENERIC_CONCEPT
            },
            {
                name: "Concepts exactMatch disjoint relations", model: [SKOS.uri], lexicalization: [], routeName: "/Icv/DisjointExactMatchConcept",
                description: "skos:Concept(s) connected to another with both the skos:exactMatch and one of skos:broadMatch or skos:relatedMatch "
                    + "(skos:exactMatch relation is disjoint with skos:broadMatch and skos:relatedMatch)",
                authAction: AuthorizationEvaluator.Actions.ICV_GENERIC_CONCEPT
            },
            {
                name: "Hierarchical redundancies", model: [SKOS.uri], lexicalization: [], routeName: "/Icv/HierarchicalRedundancy",
                description: "skos:Concept(s) that have redundant hierarchical relations with another concept",
                authAction: AuthorizationEvaluator.Actions.ICV_GENERIC_CONCEPT
            },
            {
                name: "Cyclic hierarchical concepts", model: [SKOS.uri], lexicalization: [], routeName: "/Icv/HierarchicalCycle",
                description: "skos:Concept(s) that compose a hierarchical cycle through the skos:narrower and skos:broader relations",
                authAction: AuthorizationEvaluator.Actions.ICV_GENERIC_CONCEPT
            },
        ]
    };

    private labelIcv: { open: boolean, list: ICVElement[] } = {
        open: true,
        list: [
            {
                name: "No skos:prefLabel resources", model: [], lexicalization: [SKOS.uri], routeName: "/Icv/NoLabelResource",
                description: "skos:Concept(s) or skos:ConceptScheme(s) that don't have any skos:prefLabel",
                authAction: AuthorizationEvaluator.Actions.ICV_GENERIC_RESOURCE
            },
            {
                name: "No skosxl:prefLabel resources", model: [], lexicalization: [SKOSXL.uri], routeName: "/Icv/NoLabelResource",
                description: "skos:Concept(s) or skos:ConceptScheme(s) that don't have any skosxl:prefLabel",
                authAction: AuthorizationEvaluator.Actions.ICV_GENERIC_RESOURCE
            },
            {
                name: "No mandatory label resources", model: [], lexicalization: [],
                routeName: "/Icv/NoMandatoryLabelResource",
                description: "Resources that don't have any label in the given languages",
                authAction: AuthorizationEvaluator.Actions.ICV_GENERIC_RESOURCE
            },
            {
                name: "Only alternative label resources", model: [], lexicalization: [SKOS.uri, SKOSXL.uri], routeName: "/Icv/OnlyAltLabelResource",
                description: "Resources that have an alternative label but not a preferred in the same language",
                authAction: AuthorizationEvaluator.Actions.ICV_GENERIC_RESOURCE
            },
            {
                name: "No language tag label resources", model: [], lexicalization: [],
                routeName: "/Icv/NoLangLabelResource", description: "Resources that have a label without language tag",
                authAction: AuthorizationEvaluator.Actions.ICV_GENERIC_RESOURCE
            },
            {
                name: "Overlapped label resources", model: [], lexicalization: [], routeName: "/Icv/OverlappedLabelResource",
                description: "Resources that have the same label in the same language duplicated as pref, alt or hidden label",
                authAction: AuthorizationEvaluator.Actions.ICV_GENERIC_RESOURCE
            },
            {
                name: "Conflictual label resources", model: [], lexicalization: [SKOS.uri, SKOSXL.uri], routeName: "/Icv/ConflictualLabelResource",
                description: "Resources or, specifically, concepts in the same scheme, that have the same preferred label in the same language",
                authAction: AuthorizationEvaluator.Actions.ICV_GENERIC_RESOURCE
            },
            {
                name: "Extra whitespace label resources", model: [], lexicalization: [],
                routeName: "/Icv/ExtraSpaceLabelResource", description: "Resources that have some extra whitespace in a label",
                authAction: AuthorizationEvaluator.Actions.ICV_GENERIC_RESOURCE
            },
            {
                name: "Multiple preferred labels resources", model: [], lexicalization: [SKOS.uri, SKOSXL.uri],
                routeName: "/Icv/MutliplePrefLabelResource", description: "Resources that have multiple preferred labels in the same language",
                authAction: AuthorizationEvaluator.Actions.ICV_GENERIC_RESOURCE
            },
            // {
            //     name: "skosxl:Label without skos:literalForm", lexicalizationModel: [SKOSXL.uri],
            //     description: "skosxl:Label(s) that don't specify a literal form"
            // },
            {
                name: "Dangling skosxl:Label(s)", model: [], lexicalization: [SKOSXL.uri], routeName: "/Icv/DanglingXLabel",
                description: "skosxl:Label(s) that are not linked with any skos:Concept",
                authAction: AuthorizationEvaluator.Actions.ICV_DANGLING_XLABEL
            }
        ]
    };

    private genericIcv: { open: boolean, list: ICVElement[] } = {
        open: true,
        list: [
            {
                name: "No definition resources", model: [SKOS.uri], lexicalization: [], routeName: "/Icv/NoDefinitionResource",
                description: "Resources that don't have any skos definition in the given language(s)",
                authAction: AuthorizationEvaluator.Actions.ICV_GENERIC_RESOURCE
            },
            {
                name: "Broken alignments", model: [], lexicalization: [], routeName: "/Icv/BrokenAlignment",
                description: "Alignment where the object resource doesn't exist or is deprecated",
                authAction: AuthorizationEvaluator.Actions.ICV_GENERIC_RESOURCE
            },
            {
                name: "Broken definitions", model: [], lexicalization: [], routeName: "/Icv/BrokenDefinition",
                description: "Definitions of resources  where the object resource doesn't exist or is deprecated",
                authAction: AuthorizationEvaluator.Actions.ICV_GENERIC_RESOURCE
            },
            {
                name: "Invalid URI local resources", model: [], lexicalization: [], routeName: "/Icv/InvalidURI",
                description: "Locally defined resources whith syntactically invalid URI",
                authAction: AuthorizationEvaluator.Actions.ICV_GENERIC_RESOURCE
            }
        ]
    };

    constructor(private router: Router) { }

    ngOnInit() {
        this.lexicalizationModel = VBContext.getWorkingProject().getLexicalizationModelType();
        this.dataModel = VBContext.getWorkingProject().getModelType();
    }

    /**
     * Listener of the "Go" button. It redirect to the page of the requested ICV.
     */
    private goToIcv(icvStruct: any) {
        if (icvStruct.routeName == undefined) {
            alert(icvStruct.name + " still not available");
            return;
        }
        if (icvStruct.param) {
            this.router.navigate([icvStruct.routeName, icvStruct.param]);
        } else {
            this.router.navigate([icvStruct.routeName]);
        }
    }

    private isIcvAuthorized(icv: ICVElement): boolean {
        return AuthorizationEvaluator.isAuthorized(icv.authAction);
    }

    /**
     * Changes the open attribute of the icv structure, so that in the UI the panel expands/collapses
     */
    private togglePanel(icvStruct: any) {
        icvStruct.open = !icvStruct.open;
    }

    /**
     * Returns true if the given icv lexicalizationModel is the same of the current project lexicalizationModel.
     * Useful to show/hide the icv.
     */
    private isCompatibleWithProject(icvStruct: ICVElement): boolean {
        return (
            (icvStruct.lexicalization.length == 0 || icvStruct.lexicalization.indexOf(this.lexicalizationModel) != -1) &&
            (icvStruct.model.length == 0 || icvStruct.model.indexOf(this.dataModel) != -1)
        );
    }

}

class ICVElement {
    name: string;
    model: string[]; //restricts the compatibility of the icv with the data model
    lexicalization: string[]; //restricts the compatibility of the icv with the lexicalization model
    routeName: string;
    description: string;
    authAction: number;
}