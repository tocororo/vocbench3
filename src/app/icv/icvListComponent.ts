import { Component } from "@angular/core";
import { Router } from "@angular/router";
import { SKOS, RDFS, SKOSXL } from "../models/Vocabulary";
import { VBContext } from "../utils/VBContext";
import { AuthorizationEvaluator } from "../utils/AuthorizationEvaluator";

@Component({
    selector: "icv-list",
    templateUrl: "./icvListComponent.html",
    host: { class: "pageComponent" }
})
export class IcvListComponent {

    private lexicalizationModel: string;

    private structuralIcv: { open: boolean, list: ICVElement[] } = {
        open: true,
        list: [
            {
                name: "Dangling concepts", lexicalizationModel: [SKOS.uri, SKOSXL.uri], routeName: "/Icv/DanglingConcept",
                description: "skos:Concept(s) that have no skos:broader or are not skos:topConceptOf in the skos:ConceptScheme where they belong",
                authAction: AuthorizationEvaluator.Actions.ICV_DANGLING_CONCEPT
            },
            {
                name: "Omitted topConcept", lexicalizationModel: [SKOS.uri, SKOSXL.uri], routeName: "/Icv/NoTopConceptScheme",
                description: "skos:ConceptScheme(s) that have no top concept",
                authAction: AuthorizationEvaluator.Actions.ICV_SCHEME_WITHOUT_TOP_CONCEPT
            },
            {
                name: "Concepts in no scheme", lexicalizationModel: [SKOS.uri, SKOSXL.uri], routeName: "/Icv/NoSchemeConcept",
                description: "skos:Concept(s) that doesn't belong to any scheme",
                authAction: AuthorizationEvaluator.Actions.ICV_CONCEPT_WITHOUT_SCHEME
            },
            {
                name: "TopConcept with broader", lexicalizationModel: [SKOS.uri, SKOSXL.uri], routeName: "/Icv/TopConceptWithBroader",
                description: "skos:Concept(s) that are skos:topConceptOf some scheme and have some skos:broader concept",
                authAction: AuthorizationEvaluator.Actions.ICV_TOP_CONCEPT_WITH_BROADER
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
                name: "No skos:prefLabel resources", lexicalizationModel: [SKOS.uri], routeName: "/Icv/NoLabelResource",
                description: "skos:Concept(s) or skos:ConceptScheme(s) that don't have any skos:prefLabel", 
                authAction: AuthorizationEvaluator.Actions.ICV_RESOURCE_WITHOUT_PREFLABEL
            },
            {
                name: "No skosxl:prefLabel resources", lexicalizationModel: [SKOSXL.uri], routeName: "/Icv/NoLabelResource",
                description: "skos:Concept(s) or skos:ConceptScheme(s) that don't have any skosxl:prefLabel", 
                authAction: AuthorizationEvaluator.Actions.ICV_RESOURCE_WITHOUT_PREFLABEL
            },
            {
                name: "No mandatory label resources", lexicalizationModel: [SKOSXL.uri, SKOS.uri, RDFS.uri], 
                routeName: "/Icv/NoMandatoryLabelResource",
                description: "Resources that don't have any label in the given languages", 
                authAction: AuthorizationEvaluator.Actions.ICV_RESOURCE_WITHOUT_MANDATORY_LABEL
            },
            // {
            //     name: "No rdfs:label resource", lexicalizationModel: [RDFS.uri], // routeName: "/Icv/NoLabelResource", 
            //     description: "Classes or instances that have no rdfs:label"
            // },
            // {
            //     name: "Only skos:altLabel resources", lexicalizationModel: [SKOS.uri], routeName: "/Icv/OnlyAltLabelResource",
            //     description: "skos:Concept(s) or skos:ConceptScheme(s) that have a skos:altLabel but don't have a skos:prefLabel in the same language"
            // },
            // {
            //     name: "Only skosxl:altLabel resources", lexicalizationModel: [SKOSXL.uri], routeName: "/Icv/OnlyAltLabelResource",
            //     description: "skos:Concept(s) or skos:ConceptScheme(s) that have a skosxl:altLabel but don't have a skosxl:prefLabel in the same language"
            // },
            // {
            //     name: "No language tag skos label", lexicalizationModel: [SKOS.uri], routeName: "/Icv/NoLangLabelResource",
            //     description: "skos:Concept(s) or skos:ConceptScheme(s) that have a SKOS label without language tag"
            // },
            // {
            //     name: "No language tag skosxl label", lexicalizationModel: [SKOSXL.uri], routeName: "/Icv/NoLangLabelResource",
            //     description: "skos:Concept(s) or skos:ConceptScheme(s) that have a SKOS-XL label without language tag"
            // },
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
            // {
            //     name: "Extra whitespace skos label concepts", lexicalizationModel: [SKOS.uri],
            //     description: "skos:Concept(s) that have some extra whitespace in a SKOS label"
            // },
            // {
            //     name: "Extra whitespace skosxl label concepts", lexicalizationModel: [SKOSXL.uri],
            //     description: "skos:Concept(s) that have some extra whitespace in a SKOS-XL label"
            // },
            // {
            //     name: "Multiple skos:prefLabel concepts", lexicalizationModel: [SKOS.uri],
            //     description: "skos:Concept(s) that have multiple skos:prefLabel in the same language"
            // },
            // {
            //     name: "Multiple skosxl:prefLabel concepts", lexicalizationModel: [SKOSXL.uri],
            //     description: "skos:Concept(s) that have multiple skosxl:prefLabel in the same language"
            // },
            // {
            //     name: "skosxl:Label without skos:literalForm", lexicalizationModel: [SKOSXL.uri],
            //     description: "skosxl:Label(s) that don't specify a literal form"
            // },
            {
                name: "Dangling skosxl:Label(s)", lexicalizationModel: [SKOSXL.uri], routeName: "/Icv/DanglingXLabel",
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
    private isCompatibleWithProject(icvStruct: any): boolean {
        return icvStruct.lexicalizationModel.indexOf(this.lexicalizationModel) != -1;
    }

}

class ICVElement {
    name: string;
    lexicalizationModel: string[];
    routeName: string;
    description: string;
    authAction: number;
}