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
                description: "skos:Concept(s) connected to another with both the skos:related and the skos:broaderTransitive "
                    + "(skos:related relation is disjoint with skos:broaderTransitive)",
                authAction: AuthorizationEvaluator.Actions.ICV_GENERIC_CONCEPT
            },
            // {
            //     name: "Hierarchical redundancy", lexicalizationModel: [SKOS.uri, SKOSXL.uri], routeName: "/Icv/HierarchicalRedundancy",
            //     description: "skos:Concept(s) that have redundant hierarchical relations"
            // },
            // {
            //     name: "Cyclic hierarchical concepts", lexicalizationModel: [SKOS.uri, SKOSXL.uri],
            //     description: "skos:Concept(s) that compose a hierarchical cycle through the skos:narrower and skos:broader properties"
            // },
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
                name: "No mandatory label resources", model: [], lexicalization: [SKOSXL.uri, SKOS.uri, RDFS.uri], 
                routeName: "/Icv/NoMandatoryLabelResource",
                description: "Resources that don't have any label in the given languages", 
                authAction: AuthorizationEvaluator.Actions.ICV_GENERIC_RESOURCE
            },
            // {
            //     name: "No rdfs:label resource", lexicalizationModel: [RDFS.uri], // routeName: "/Icv/NoLabelResource", 
            //     description: "Classes or instances that have no rdfs:label"
            // },
            {
                name: "Only alternative label resources", model: [], lexicalization: [SKOS.uri, SKOSXL.uri], routeName: "/Icv/OnlyAltLabelResource",
                description: "Resources that have an alternative label but not a preferred in the same language",
                authAction: AuthorizationEvaluator.Actions.ICV_GENERIC_RESOURCE
            },
            {
                name: "No language tag label resources", model: [], lexicalization: [SKOS.uri, SKOSXL.uri, RDFS.uri],
                routeName: "/Icv/NoLangLabelResource", description: "Resources that have a label without language tag",
                authAction: AuthorizationEvaluator.Actions.ICV_GENERIC_RESOURCE
            },
            // {
            //     name: "Same skos:prefLabel concepts", lexicalizationModel: [SKOS.uri],
            //     description: "skos:Concept(s) that have the same skos:prefLabel in the same language"
            // },
            // {
            //     name: "Same skosxl:prefLabel concepts", lexicalizationModel: [SKOSXL.uri],
            //     description: "skos:Concept(s) that have the same skosxl:prefLabel in the same language"
            // },
            // {
            //     name: "Overlapped skos label resources", lexicalizationModel: [SKOS.uri], routeName: "/Icv/OverlappedLabelResource",
            //     description: "skos:Concept(s) and skos:ConceptScheme(s) that have the same value as skos:prefLabel and skos:altLabel in the same language"
            // },
            // {
            //     name: "Overlapped skosxl label resources", lexicalizationModel: [SKOSXL.uri], routeName: "/Icv/OverlappedLabelResource",
            //     description: "skos:Concept(s) and skos:ConceptScheme(s) that have the same value as skosxl:prefLabel and skosxl:altLabel in the same language"
            // },
            {
                name: "Extra whitespace label resources", model:[], lexicalization: [SKOS.uri, SKOSXL.uri, RDFS.uri],
                routeName: "/Icv/ExtraSpaceLabelResource", description: "skos:Concept(s) that have some extra whitespace in a SKOS label",
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
            // {
            //     name: "Whitespace URI Resources", lexicalizationModel: [SKOS.uri, SKOSXL.uri, RDFS.uri],
            //     description: "URI Resources that have a whitespace in the URI"
            // }
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