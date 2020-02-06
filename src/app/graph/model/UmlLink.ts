import { RDFResourceRolesEnum } from './../../models/ARTResources';
import { Link } from './Link';
import * as d3 from 'd3';
import { Node } from "./Node";
import { UmlNode } from './UmlNode';
import { ARTURIResource } from '../../models/ARTResources';


export class UmlLink extends Link {
    index?: number;

    source: UmlNode;
    target: UmlNode;
    res: ARTURIResource; //predicate resource


    /*
     * mi serve per capire quali sono gli archi di un nodo che ciclano su se stessi(è usata insieme all'offset).
     * L'offset da solo non bastava perchè Tiziano l'ha usato per capire anche se un arco va sopra o sotto il nodo.
     */
    loop: boolean;

    offset: number = 0; //useful in case there are multiple links for the same source-target pair


    /**
     * List of nodes which expansion made "appear" the link.
     * The list is useful when a node is closed in order to know (expecially in model-oriented graph) if the link was opened by the 
     * closing node (and in this case the link should be removed from the graph) or if there are multiple nodes the opened the link
     * (and in this case the link should be kept in the graph)
     */
    //openBy: Node[];





    constructor(source: Node, target: Node, res: ARTURIResource) {

        super(source, target, res)
    }


    // getShow(): string {
    //     return this.source.getShow() + " --" + this.res.title + "--> " + this.target.getShow();
    // }

    getRole(): RDFResourceRolesEnum {
        return this.res.getRole();
    }

    isReflexive(){
        return this.res.getAdditionalProperty("reflexive");
    }


}