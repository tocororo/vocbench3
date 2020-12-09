import { Component } from "@angular/core";
import { Router } from "@angular/router";
import { SKOS, SKOSXL } from "../models/Vocabulary";
import { AuthorizationEvaluator } from "../utils/AuthorizationEvaluator";
import { VBActionsEnum } from "../utils/VBActions";
import { VBContext } from "../utils/VBContext";

@Component({
    selector: "icv-list",
    templateUrl: "./icvListComponent.html",
    host: { class: "pageComponent" }
})
export class IcvListComponent {

    private dataModel: string;
    private lexicalizationModel: string;

    structuralIcv: { open: boolean, list: ICVElement[] } = {
        open: true,
        list: [
            {
                name: "ICV.STRUCTURAL.DANGLING_CONCEPTS.NAME", 
                model: [SKOS.uri],
                lexicalization: [],
                routeName: "/Icv/DanglingConcept",
                description: "ICV.STRUCTURAL.DANGLING_CONCEPTS.DESCRIPTION",
                authAction: VBActionsEnum.icvGenericConcept
            },
            {
                name: "ICV.STRUCTURAL.OMITTED_TOP_CONCEPT.NAME",
                model: [SKOS.uri],
                lexicalization: [],
                routeName: "/Icv/NoTopConceptScheme",
                description: "ICV.STRUCTURAL.OMITTED_TOP_CONCEPT.DESCRIPTION",
                authAction: VBActionsEnum.icvGenericConcept
            },
            {
                name: "ICV.STRUCTURAL.CONCEPT_IN_NO_SCHEME.NAME",
                model: [SKOS.uri],
                lexicalization: [],
                routeName: "/Icv/NoSchemeConcept",
                description: "ICV.STRUCTURAL.CONCEPT_IN_NO_SCHEME.DESCRIPTION",
                authAction: VBActionsEnum.icvGenericConcept
            },
            {
                name: "ICV.STRUCTURAL.TOP_CONCEPT_WITH_BROADER.NAME",
                model: [SKOS.uri],
                lexicalization: [],
                routeName: "/Icv/TopConceptWithBroader",
                description: "ICV.STRUCTURAL.TOP_CONCEPT_WITH_BROADER.DESCRIPTION",
                authAction: VBActionsEnum.icvGenericConcept
            },
            {
                name: "ICV.STRUCTURAL.CONCEPTS_RELATED_DISJOINT.NAME",
                model: [SKOS.uri],
                lexicalization: [],
                routeName: "/Icv/DisjointRelatedConcept",
                description: "ICV.STRUCTURAL.CONCEPTS_RELATED_DISJOINT.DESCRIPTION",
                authAction: VBActionsEnum.icvGenericConcept
            },
            {
                name: "ICV.STRUCTURAL.CONCEPT_EXACT_MATCH_DISJOINT.NAME",
                model: [SKOS.uri],
                lexicalization: [],
                routeName: "/Icv/DisjointExactMatchConcept",
                description: "ICV.STRUCTURAL.CONCEPT_EXACT_MATCH_DISJOINT.DESCRIPTION",
                authAction: VBActionsEnum.icvGenericConcept
            },
            {
                name: "ICV.STRUCTURAL.HIERARCHICAL_REDUNDANCIES.NAME",
                model: [SKOS.uri],
                lexicalization: [],
                routeName: "/Icv/HierarchicalRedundancy",
                description: "ICV.STRUCTURAL.HIERARCHICAL_REDUNDANCIES.DESCRIPTION",
                authAction: VBActionsEnum.icvGenericConcept
            },
            {
                name: "ICV.STRUCTURAL.CYCLIC_HIERARCHICAL_CONCEPTS.NAME",
                model: [SKOS.uri],
                lexicalization: [],
                routeName: "/Icv/HierarchicalCycle",
                description: "ICV.STRUCTURAL.CYCLIC_HIERARCHICAL_CONCEPTS.DESCRIPTION",
                authAction: VBActionsEnum.icvGenericConcept
            },
        ]
    };

    labelIcv: { open: boolean, list: ICVElement[] } = {
        open: true,
        list: [
            {
                name: "ICV.LABEL.NO_SKOS_PREFLABEL.NAME",
                model: [],
                lexicalization: [SKOS.uri],
                routeName: "/Icv/NoLabelResource",
                description: "ICV.LABEL.NO_SKOS_PREFLABEL.DESCRIPTION",
                authAction: VBActionsEnum.icvGenericResource
            },
            {
                name: "ICV.LABEL.NO_SKOSXL_PREFLABEL.NAME",
                model: [],
                lexicalization: [SKOSXL.uri],
                routeName: "/Icv/NoLabelResource",
                description: "ICV.LABEL.NO_SKOSXL_PREFLABEL.DESCRIPTION",
                authAction: VBActionsEnum.icvGenericResource
            },
            {
                name: "ICV.LABEL.NO_MANDATORY_LABEL.NAME",
                model: [],
                lexicalization: [],
                routeName: "/Icv/NoMandatoryLabelResource",
                description: "ICV.LABEL.NO_MANDATORY_LABEL.DESCRIPTION",
                authAction: VBActionsEnum.icvGenericResource
            },
            {
                name: "ICV.LABEL.ONLY_ALTLABEL.NAME",
                model: [],
                lexicalization: [SKOS.uri, SKOSXL.uri],
                routeName: "/Icv/OnlyAltLabelResource",
                description: "ICV.LABEL.ONLY_ALTLABEL.DESCRIPTION",
                authAction: VBActionsEnum.icvGenericResource
            },
            {
                name: "ICV.LABEL.NO_LANGTAG_LABEL.NAME",
                model: [],
                lexicalization: [],
                routeName: "/Icv/NoLangLabelResource",
                description: "ICV.LABEL.NO_LANGTAG_LABEL.DESCRIPTION",
                authAction: VBActionsEnum.icvGenericResource
            },
            {
                name: "ICV.LABEL.OVERLAPPED_LABEL.NAME",
                model: [],
                lexicalization: [],
                routeName: "/Icv/OverlappedLabelResource",
                description: "ICV.LABEL.OVERLAPPED_LABEL.DESCRIPTION",
                authAction: VBActionsEnum.icvGenericResource
            },
            {
                name: "ICV.LABEL.CONFLICTUAL_LABEL.NAME",
                model: [],
                lexicalization: [SKOS.uri, SKOSXL.uri],
                routeName: "/Icv/ConflictualLabelResource",
                description: "ICV.LABEL.CONFLICTUAL_LABEL.DESCRIPTION",
                authAction: VBActionsEnum.icvGenericResource
            },
            {
                name: "ICV.LABEL.EXTRA_WHITESPACE_LABEL.NAME",
                model: [],
                lexicalization: [],
                routeName: "/Icv/ExtraSpaceLabelResource",
                description: "ICV.LABEL.EXTRA_WHITESPACE_LABEL.DESCRIPTION",
                authAction: VBActionsEnum.icvGenericResource
            },
            {
                name: "ICV.LABEL.MULTIPLE_PREFLABEL.NAME",
                model: [],
                lexicalization: [SKOS.uri, SKOSXL.uri],
                routeName: "/Icv/MutliplePrefLabelResource",
                description: "ICV.LABEL.MULTIPLE_PREFLABEL.DESCRIPTION",
                authAction: VBActionsEnum.icvGenericResource
            },
            // {
            //     name: "skosxl:Label without skos:literalForm", lexicalizationModel: [SKOSXL.uri],
            //     description: "skosxl:Label(s) that don't specify a literal form"
            // },
            {
                name: "ICV.LABEL.DANGLING_SKOSXL_LABEL.NAME",
                model: [],
                lexicalization: [SKOSXL.uri],
                routeName: "/Icv/DanglingXLabel",
                description: "ICV.LABEL.DANGLING_SKOSXL_LABEL.DESCRIPTION",
                authAction: VBActionsEnum.icvDanglingXLabel
            }
        ]
    };

    genericIcv: { open: boolean, list: ICVElement[] } = {
        open: true,
        list: [
            {
                name: "ICV.GENERIC.NO_DEFINITION.NAME",
                model: [SKOS.uri],
                lexicalization: [], 
                routeName: "/Icv/NoDefinitionResource",
                description: "ICV.GENERIC.NO_DEFINITION.DESCRIPTION",
                authAction: VBActionsEnum.icvGenericResource
            },
            {
                name: "ICV.GENERIC.BROKEN_ALIGNMENTS.NAME",
                model: [],
                lexicalization: [],
                routeName: "/Icv/BrokenAlignment",
                description: "ICV.GENERIC.BROKEN_ALIGNMENTS.DESCRIPTION",
                authAction: VBActionsEnum.icvGenericResource
            },
            {
                name: "ICV.GENERIC.BROKEN_DEFINITIONS.NAME",
                model: [],
                lexicalization: [],
                routeName: "/Icv/BrokenDefinition",
                description: "ICV.GENERIC.BROKEN_DEFINITIONS.DESCRIPTION",
                authAction: VBActionsEnum.icvGenericResource
            },
            {
                name: "ICV.GENERIC.INVALID_URI_LOCAL_RES.NAME",
                model: [],
                lexicalization: [],
                routeName: "/Icv/InvalidURI",
                description: "ICV.GENERIC.INVALID_URI_LOCAL_RES.DESCRIPTION",
                authAction: VBActionsEnum.icvGenericResource
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
    togglePanel(icvStruct: any) {
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
    authAction: VBActionsEnum;
}