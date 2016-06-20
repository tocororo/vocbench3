import {Component} from "@angular/core";
import {Router} from '@angular/router-deprecated';
import {VocbenchCtx} from "../utils/VocbenchCtx";
import {RDFResourceRolesEnum} from "../utils/ARTResources";

@Component({
    selector: "icv-component",
    templateUrl: "app/src/icv/icvComponent.html",
    host: { class: "pageComponent" }
})
export class IcvComponent {

    private ontotype: string;
    
    private structuralIcv = {
        open: true,
        list: [
            //OK
            { name: "Dangling concepts", ontoType: ["SKOS", "SKOS-XL"], routeName: "DanglingConcept",
            description: "skos:Concept(s) that have no skos:broader or are not skos:topConceptOf in the skos:ConceptScheme where they belong"},
            //OK
            { name: "Omitted topConcept", ontoType: ["SKOS", "SKOS-XL"], routeName: "NoTopConceptScheme",
            description: "skos:ConceptScheme(s) that have no top concept"},
            //OK
            { name: "Concepts in no scheme", ontoType: ["SKOS", "SKOS-XL"], routeName: "NoSchemeConcept",
            description: "skos:Concept(s) that doesn't belong to any scheme"},
            //OK
            { name: "TopConcept with broader", ontoType: ["SKOS", "SKOS-XL"], routeName: "TopConceptWithBroader",
            description: "skos:Concept(s) that are skos:topConceptOf some scheme and have some skos:broader concept"},
            //OK
            { name: "Hierarchical redundancy", ontoType: ["SKOS", "SKOS-XL"], routeName: "HierarchicalRedundancy",
            description: "skos:Concept(s) that have redundant hierarchical relations"},
            { name: "Cyclic hierarchical concepts", ontoType: ["SKOS", "SKOS-XL"],
            description: "skos:Concept(s) that compose a hierarchical cycle through the skos:narrower and skos:broader properties"},
        ]
    };
    
    private labelIcv = {
        open: true,
        list: [
            //OK
            { name: "No skos:prefLabel resource", ontoType: ["SKOS"], routeName: "NoLabelResource", 
            description: "skos:Concept(s) or skos:ConceptScheme(s) that don't have any skos:prefLabel"},
            //OK
            { name: "No skosxl:prefLabel resource", ontoType: ["SKOS-XL"], routeName: "NoLabelResource", 
            description: "skos:Concept(s) or skos:ConceptScheme(s) that don't have any skosxl:prefLabel"},
            { name: "No rdfs:label resource", ontoType: ["OWL"], // routeName: "NoLabelResource", 
            description: "Classes or instances that have no rdfs:label"},
            //OK
            { name: "Only skos:altLabel resources", ontoType: ["SKOS"], routeName: "OnlyAltLabelResource",
            description: "skos:Concept(s) or skos:ConceptScheme(s) that have a skos:altLabel but don't have a skos:prefLabel in the same language"},
            //OK
            { name: "Only skosxl:altLabel resources", ontoType: ["SKOS-XL"], routeName: "OnlyAltLabelResource",
            description: "skos:Concept(s) or skos:ConceptScheme(s) that have a skosxl:altLabel but don't have a skosxl:prefLabel in the same language"},
            { name: "No language tag skos label", ontoType: ["SKOS"],
            description: "skos:Concept(s) that have a SKOS label without language tag"},
            { name: "No language tag skosxl label", ontoType: ["SKOS-XL"],
            description: "skos:Concept(s) that have a SKOS-XL label without language tag"},
            { name: "Same skos:prefLabel concepts", ontoType: ["SKOS"],
            description: "skos:Concept(s) that have the same skos:prefLabel in the same language"},
            { name: "Same skosxl:prefLabel concepts", ontoType: ["SKOS-XL"],
            description: "skos:Concept(s) that have the same skosxl:prefLabel in the same language"},
            //OK
            { name: "Overlapped skos label resources", ontoType: ["SKOS"], routeName: "OverlappedLabelResource",
            description: "skos:Concept(s) and skos:ConceptScheme(s) that have the same value as skos:prefLabel and skos:altLabel in the same language"},
            //OK
            { name: "Overlapped skosxl label resources", ontoType: ["SKOS-XL"], routeName: "OverlappedLabelResource",
            description: "skos:Concept(s) and skos:ConceptScheme(s) that have the same value as skosxl:prefLabel and skosxl:altLabel in the same language"},
            { name: "Extra whitespace skos label concepts", ontoType: ["SKOS"],
            description: "skos:Concept(s) that have some extra whitespace in a SKOS label"},
            { name: "Extra whitespace skosxl label concepts", ontoType: ["SKOS-XL"],
            description: "skos:Concept(s) that have some extra whitespace in a SKOS-XL label"},
            { name: "Multiple skos:prefLabel concepts", ontoType: ["SKOS"],
            description: "skos:Concept(s) that have multiple skos:prefLabel in the same language"},
            { name: "Multiple skosxl:prefLabel concepts", ontoType: ["SKOS-XL"],
            description: "skos:Concept(s) that have multiple skosxl:prefLabel in the same language"},
            { name: "skosxl:Label without skos:literalForm", ontoType: ["SKOS-XL"],
            description: "skosxl:Label(s) that don't specify a literal form"},
            //OK
            { name: "Dangling skosxl:Label(s)", ontoType: ["SKOS-XL"], routeName: "DanglingXLabel",
            description: "skosxl:Label(s) that are not linked with any skos:Concept"}
        ]
    };
    
    private genericIcv = {
        open: true,
        list: [
            { name: "Whitespace URI Resources", ontoType: ["SKOS", "SKOS-XL", "OWL"],
            description: "URI Resources that have a whitespace in the URI"}
        ]
    };
    
    constructor(private vbCtx: VocbenchCtx, private router: Router) {
        //navigate to Home view if not authenticated
        if (vbCtx.getAuthenticationToken() == undefined) {
            router.navigate(['Home']);
        } else if (vbCtx.getWorkingProject() == undefined) {//navigate to Projects view if a project is not selected
            router.navigate(['Projects']);
        }
    }

    ngOnInit() {
        this.ontotype = this.vbCtx.getWorkingProject().getPrettyPrintOntoType()
    }
    
    /**
     * Listener of the "Go" button. It redirect to the page of the requested ICV.
     */
    goToIcv(icvStruct) {
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
    private togglePanel(icvStruct) {
        icvStruct.open = !icvStruct.open;
    }
    
    /**
     * Returns true if the given icv ontoType is the same of the current project ontoType.
     * Useful to show/hide the icv.
     */
    private isCompatibleWithProject(icvStruct): boolean {
        return icvStruct.ontoType.indexOf(this.ontotype) != -1;
    }

}