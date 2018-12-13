import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef } from "@angular/core";
import { ARTURIResource, ARTPredicateObjects, ARTNode, RDFResourceRolesEnum, ARTResource } from "../../models/ARTResources";
import { ResourceViewServices } from "../../services/resourceViewServices";
import { D3Service } from "../d3/d3Services";
import { Node } from "../model/Node";
import { AbstractGraph } from "../abstractGraph";
import { ResViewPartition } from "../../models/ResourceView";
import { Deserializer } from "../../utils/Deserializer";
import { Link } from "../model/Link";

@Component({
    selector: 'graph-explore',
    templateUrl: "./graphComponent.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
    styleUrls: ['../graph.css']
})
export class ExplorationGraphComponent extends AbstractGraph {

    private rvPartitions: ResViewPartition[] = [
        ResViewPartition.broaders, ResViewPartition.classaxioms, ResViewPartition.constituents, ResViewPartition.denotations,
        ResViewPartition.disjointProperties, ResViewPartition.domains, ResViewPartition.equivalentProperties, 
        ResViewPartition.evokedLexicalConcepts, ResViewPartition.facets, ResViewPartition.formBasedPreview,
        ResViewPartition.formRepresentations, ResViewPartition.imports, ResViewPartition.labelRelations, ResViewPartition.lexicalForms,
        ResViewPartition.lexicalSenses, ResViewPartition.lexicalizations, ResViewPartition.members, ResViewPartition.membersOrdered,
        ResViewPartition.notes, ResViewPartition.properties, ResViewPartition.ranges, ResViewPartition.rdfsMembers, ResViewPartition.schemes,
        ResViewPartition.subPropertyChains, ResViewPartition.subterms, ResViewPartition.superproperties, ResViewPartition.topconceptof,
        ResViewPartition.types
    ]

    constructor(protected d3Service: D3Service, protected elementRef: ElementRef, protected ref: ChangeDetectorRef,
        private resViewService: ResourceViewServices) {
        super(d3Service, elementRef, ref);
    }

    protected expandNode(node: Node) {
        if (!node.res.isResource()) {
            return;
        }

        this.resViewService.getResourceView(<ARTResource>node.res).subscribe(
            rv => {
                let links: Link[] = [];
                this.rvPartitions.forEach(partition => {
                    let partitionJson = rv[partition];
                    if (partition == ResViewPartition.facets && partitionJson != null) {
                        partitionJson = partitionJson.inverseOf;
                    }
                    if (partitionJson != null) {
                        let poList: ARTPredicateObjects[] = Deserializer.createPredicateObjectsList(partitionJson);
                        poList.forEach(pol => {
                            let pred: ARTURIResource = pol.getPredicate();
                            let objs: ARTNode[] = pol.getObjects();
                            objs.forEach(o => {
                                links.push(new Link(node, new Node(o), pred));
                            });
                        });
                    }
                });
                this.graph.appendLinks(node, links);
            }
        );
    }

    protected onNodeDblClicked(node: Node) {
        if (this.graph.hasOutgoingLink(node)) {
            this.graph.closeNode(node);
        } else {
            this.expandNode(node);
        }
    }

}