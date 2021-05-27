import { Component } from "@angular/core";
import { Router } from "@angular/router";
import { RepositoryLocation } from "../models/History";
import { OWL, SKOS, SKOSXL } from "../models/Vocabulary";
import { AuthorizationEvaluator } from "../utils/AuthorizationEvaluator";
import { VBActionsEnum } from "../utils/VBActions";
import { VBContext } from "../utils/VBContext";

@Component({
    selector: "icv-list",
    templateUrl: "./icvListComponent.html",
    host: { class: "pageComponent" }
})
export class IcvListComponent {

    structuralIcv: { open: boolean, list: ICVElement[] } = {
        open: true,
        list: [
            {
                name: "ICV.STRUCTURAL.DANGLING_CONCEPTS.NAME", 
                routeName: "/Icv/DanglingConcept",
                description: "ICV.STRUCTURAL.DANGLING_CONCEPTS.DESCRIPTION",
                precondition: {
                    model: [SKOS.uri],
                    authAction: VBActionsEnum.icvGenericConcept,
                }
            },
            {
                name: "ICV.STRUCTURAL.OMITTED_TOP_CONCEPT.NAME",
                routeName: "/Icv/NoTopConceptScheme",
                description: "ICV.STRUCTURAL.OMITTED_TOP_CONCEPT.DESCRIPTION",
                precondition: {
                    model: [SKOS.uri],
                    authAction: VBActionsEnum.icvGenericConcept,
                }
            },
            {
                name: "ICV.STRUCTURAL.CONCEPT_IN_NO_SCHEME.NAME",
                routeName: "/Icv/NoSchemeConcept",
                description: "ICV.STRUCTURAL.CONCEPT_IN_NO_SCHEME.DESCRIPTION",
                precondition: {
                    model: [SKOS.uri],
                    authAction: VBActionsEnum.icvGenericConcept,
                }
            },
            {
                name: "ICV.STRUCTURAL.TOP_CONCEPT_WITH_BROADER.NAME",
                routeName: "/Icv/TopConceptWithBroader",
                description: "ICV.STRUCTURAL.TOP_CONCEPT_WITH_BROADER.DESCRIPTION",
                precondition: {
                    model: [SKOS.uri],
                    authAction: VBActionsEnum.icvGenericConcept,
                }
            },
            {
                name: "ICV.STRUCTURAL.CONCEPTS_RELATED_DISJOINT.NAME",
                routeName: "/Icv/DisjointRelatedConcept",
                description: "ICV.STRUCTURAL.CONCEPTS_RELATED_DISJOINT.DESCRIPTION",
                precondition: {
                    model: [SKOS.uri],
                    authAction: VBActionsEnum.icvGenericConcept,
                }
            },
            {
                name: "ICV.STRUCTURAL.CONCEPT_EXACT_MATCH_DISJOINT.NAME",
                routeName: "/Icv/DisjointExactMatchConcept",
                description: "ICV.STRUCTURAL.CONCEPT_EXACT_MATCH_DISJOINT.DESCRIPTION",
                precondition: {
                    model: [SKOS.uri],
                    authAction: VBActionsEnum.icvGenericConcept,
                }
            },
            {
                name: "ICV.STRUCTURAL.HIERARCHICAL_REDUNDANCIES.NAME",
                routeName: "/Icv/HierarchicalRedundancy",
                description: "ICV.STRUCTURAL.HIERARCHICAL_REDUNDANCIES.DESCRIPTION",
                precondition: {
                    model: [SKOS.uri],
                    authAction: VBActionsEnum.icvGenericConcept,
                }
            },
            {
                name: "ICV.STRUCTURAL.CYCLIC_HIERARCHICAL_CONCEPTS.NAME",
                routeName: "/Icv/HierarchicalCycle",
                description: "ICV.STRUCTURAL.CYCLIC_HIERARCHICAL_CONCEPTS.DESCRIPTION",
                precondition: {
                    model: [SKOS.uri],
                    authAction: VBActionsEnum.icvGenericConcept,
                }
            },
            {
                name: "ICV.STRUCTURAL.OWL_CONSISTENCY_VIOLATION.NAME",
                routeName: "/Icv/OwlViolations",
                description: "ICV.STRUCTURAL.OWL_CONSISTENCY_VIOLATION.DESCRIPTION",
                precondition: {
                    model: [OWL.uri],
                    authAction: VBActionsEnum.icvGenericResource,
                    location: "remote"
                }
            },
        ]
    };

    labelIcv: { open: boolean, list: ICVElement[] } = {
        open: true,
        list: [
            {
                name: "ICV.LABEL.NO_SKOS_PREFLABEL.NAME",
                routeName: "/Icv/NoLabelResource",
                description: "ICV.LABEL.NO_SKOS_PREFLABEL.DESCRIPTION",
                precondition: {
                    lexicalization: [SKOS.uri],
                    authAction: VBActionsEnum.icvGenericResource,
                }
            },
            {
                name: "ICV.LABEL.NO_SKOSXL_PREFLABEL.NAME",
                routeName: "/Icv/NoLabelResource",
                description: "ICV.LABEL.NO_SKOSXL_PREFLABEL.DESCRIPTION",
                precondition: {
                    lexicalization: [SKOSXL.uri],
                    authAction: VBActionsEnum.icvGenericResource,
                }
            },
            {
                name: "ICV.LABEL.NO_MANDATORY_LABEL.NAME",
                routeName: "/Icv/NoMandatoryLabelResource",
                description: "ICV.LABEL.NO_MANDATORY_LABEL.DESCRIPTION",
                precondition: {
                    authAction: VBActionsEnum.icvGenericResource,
                }
            },
            {
                name: "ICV.LABEL.ONLY_ALTLABEL.NAME",
                routeName: "/Icv/OnlyAltLabelResource",
                description: "ICV.LABEL.ONLY_ALTLABEL.DESCRIPTION",
                precondition: {
                    lexicalization: [SKOS.uri, SKOSXL.uri],
                    authAction: VBActionsEnum.icvGenericResource,
                }
            },
            {
                name: "ICV.LABEL.NO_LANGTAG_LABEL.NAME",
                routeName: "/Icv/NoLangLabelResource",
                description: "ICV.LABEL.NO_LANGTAG_LABEL.DESCRIPTION",
                precondition: {
                    authAction: VBActionsEnum.icvGenericResource,
                }
            },
            {
                name: "ICV.LABEL.OVERLAPPED_LABEL.NAME",
                routeName: "/Icv/OverlappedLabelResource",
                description: "ICV.LABEL.OVERLAPPED_LABEL.DESCRIPTION",
                precondition: {
                    authAction: VBActionsEnum.icvGenericResource,
                }
            },
            {
                name: "ICV.LABEL.CONFLICTUAL_LABEL.NAME",
                routeName: "/Icv/ConflictualLabelResource",
                description: "ICV.LABEL.CONFLICTUAL_LABEL.DESCRIPTION",
                precondition: {
                    lexicalization: [SKOS.uri, SKOSXL.uri],
                    authAction: VBActionsEnum.icvGenericResource,
                }
            },
            {
                name: "ICV.LABEL.EXTRA_WHITESPACE_LABEL.NAME",
                routeName: "/Icv/ExtraSpaceLabelResource",
                description: "ICV.LABEL.EXTRA_WHITESPACE_LABEL.DESCRIPTION",
                precondition: {
                    authAction: VBActionsEnum.icvGenericResource,
                }
            },
            {
                name: "ICV.LABEL.MULTIPLE_PREFLABEL.NAME",
                routeName: "/Icv/MutliplePrefLabelResource",
                description: "ICV.LABEL.MULTIPLE_PREFLABEL.DESCRIPTION",
                precondition: {
                    lexicalization: [SKOS.uri, SKOSXL.uri],
                    authAction: VBActionsEnum.icvGenericResource,
                }
            },
            {
                name: "ICV.LABEL.DANGLING_SKOSXL_LABEL.NAME",
                routeName: "/Icv/DanglingXLabel",
                description: "ICV.LABEL.DANGLING_SKOSXL_LABEL.DESCRIPTION",
                precondition: {
                    lexicalization: [SKOSXL.uri],
                    authAction: VBActionsEnum.icvDanglingXLabel,
                }
            }
        ]
    };

    genericIcv: { open: boolean, list: ICVElement[] } = {
        open: true,
        list: [
            {
                name: "ICV.GENERIC.NO_DEFINITION.NAME",
                routeName: "/Icv/NoDefinitionResource",
                description: "ICV.GENERIC.NO_DEFINITION.DESCRIPTION",
                precondition: {
                    model: [SKOS.uri],
                    authAction: VBActionsEnum.icvGenericResource,
                }
            },
            {
                name: "ICV.GENERIC.BROKEN_ALIGNMENTS.NAME",
                routeName: "/Icv/BrokenAlignment",
                description: "ICV.GENERIC.BROKEN_ALIGNMENTS.DESCRIPTION",
                precondition: {
                    authAction: VBActionsEnum.icvGenericResource,
                }
            },
            {
                name: "ICV.GENERIC.BROKEN_DEFINITIONS.NAME",
                routeName: "/Icv/BrokenDefinition",
                description: "ICV.GENERIC.BROKEN_DEFINITIONS.DESCRIPTION",
                precondition: {
                    authAction: VBActionsEnum.icvGenericResource,
                }
            },
            {
                name: "ICV.GENERIC.INVALID_URI_LOCAL_RES.NAME",
                routeName: "/Icv/InvalidURI",
                description: "ICV.GENERIC.INVALID_URI_LOCAL_RES.DESCRIPTION",
                precondition: {
                    authAction: VBActionsEnum.icvGenericResource,
                }
            }
        ]
    };

    constructor(private router: Router) { }

    ngOnInit() {
        for (let icv of this.structuralIcv.list) {
            this.checkPrecondition(icv);
        }
        for (let icv of this.genericIcv.list) {
            this.checkPrecondition(icv);
        }
        for (let icv of this.labelIcv.list) {
            this.checkPrecondition(icv);
        }
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

    /**
     * Changes the open attribute of the icv structure, so that in the UI the panel expands/collapses
     */
    togglePanel(icvStruct: any) {
        icvStruct.open = !icvStruct.open;
    }

    private checkPrecondition(icvElem: ICVElement) {
        let lexicalization = VBContext.getWorkingProject().getLexicalizationModelType();
        let model = VBContext.getWorkingProject().getModelType();
        let location = VBContext.getWorkingProject().getRepositoryLocation().location;
        /*
        ICV is available if:
        - authorized
        - restriction on model (if any) is compliant with the current project model
        - restriction on lexicalization (if any) is compliant with the current project lexicalization
        - restriction on location (if any) are compliant with the current project location
        */
        let preconditionOk: boolean = AuthorizationEvaluator.isAuthorized(icvElem.precondition.authAction) &&
            (icvElem.precondition.model == null || icvElem.precondition.model.includes(model)) &&
            (icvElem.precondition.lexicalization == null || icvElem.precondition.lexicalization.includes(lexicalization)) &&
            (icvElem.precondition.location == null || icvElem.precondition.location == location);
        icvElem.show = preconditionOk;
    }

}

interface ICVElement {
    name: string;
    routeName: string;
    description: string;
    precondition: ICVPrecondition;
    show?: boolean;
}

interface ICVPrecondition {
    model?: string[]; //restricts the compatibility of the icv with the data model
    lexicalization?: string[]; //restricts the compatibility of the icv with the lexicalization model
    authAction: VBActionsEnum;
    location?: "remote" | "local";
}