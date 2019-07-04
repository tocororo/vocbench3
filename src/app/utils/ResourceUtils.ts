import { ARTNode, ARTURIResource, ResAttribute, ARTLiteral, ARTBNode, RDFResourceRolesEnum, ARTResource } from "../models/ARTResources";
import { PrefixMapping } from "../models/Metadata";
import { SemanticTurkey, RDF, OWL, SKOS, RDFS, OntoLex, Lime, SKOSXL } from "../models/Vocabulary";

export class ResourceUtils {

    /**
     * Sort an Array of ARTResource by the given attribute.
     * @param list 
     * @param attribute
     */
    static sortResources(list: ARTNode[], attribute: SortAttribute) {
        //sort by show
        if (attribute == SortAttribute.show) {
            let collator = new Intl.Collator(undefined, { numeric: true, sensitivity: "base" });
            list.sort(
                function (r1: ARTNode, r2: ARTNode) {
                    return collator.compare(r1.getShow().toLowerCase(), r2.getShow().toLowerCase());
                }
            );
        }
        if (attribute == SortAttribute.value) {
            list.sort(
                function (r1: ARTNode, r2: ARTNode) {
                    return r1.getNominalValue().localeCompare(r2.getNominalValue());
                }
            );
        }
    }

    /**
     * Tells if a list contains a given node
     */
    static containsNode(list: ARTNode[], node: ARTNode): boolean {
        return this.indexOfNode(list, node) != -1;
    }

    static indexOfNode(list: ARTNode[], node: ARTNode): number {
        for (var i = 0; i < list.length; i++) {
            if (list[i].getNominalValue() == node.getNominalValue()) {
                return i;
            }
        }
        return -1;
    }

    /**
     * Returns the rendering of a resource.
     * If rendering is true, returns the show of the resource.
     * If rendering is false, if the resource is a URI resource, reuturns its qname (if not available, the whole uri), if the
     * resource isn't a URI resource, returns the show.
     * @param resource 
     * @param rendering 
     */
    static getRendering(resource: ARTNode, rendering: boolean) {
        if (rendering) {
            return resource.getShow();
        } else {
            if (resource.isURIResource()) {
                let qname = resource.getAdditionalProperty(ResAttribute.QNAME);
                if (qname != undefined) {
                    return qname;
                } else {
                    return (<ARTURIResource>resource).getURI();
                }
            } else {
                return resource.getShow();
            }
        }
    }

    /**
     * 
     * @param nTripleNode 
     */
    static parseNode(nTripleNode: string): ARTNode {
        let node: ARTNode;
        try {
            node = ResourceUtils.parseURI(nTripleNode);
        } catch (err) {}
        if (node == null) {
            try {
                node = ResourceUtils.parseLiteral(nTripleNode);
            } catch (err) {}
        }
        if (node == null) {
            try {
                node = ResourceUtils.parseBNode(nTripleNode);
            } catch (err) {}
        }
        if (node == null) {
            throw new Error("Not a legal N-Triples representation: " + nTripleNode);
        }
        return node;
    }

    /**
     * Given an NT serialization of a URI, creates and returns an ARTURIResource object.
     * Code inspired by org.eclipse.rdf4j.rio.ntriples.NTripleUtils#parseURI()
     * @param nTriplesURI 
     */
    static parseURI(nTriplesURI: string): ARTURIResource {
        if (nTriplesURI.startsWith("<") && nTriplesURI.endsWith(">")) {
            let uri: string = nTriplesURI.substring(1, nTriplesURI.length - 1);
            uri = decodeURI(uri);
            return new ARTURIResource(uri);
        }
        else {
            throw new Error("Not a legal N-Triples URI: " + nTriplesURI);
        }
    }

    /**
     * Given an NT serialization of a literal, creates and returns an ARTLiteral object.
     * Code inspired by org.eclipse.rdf4j.rio.ntriples.NTripleUtils#parseLiteral()
     * @param nTriplesLiteral
     */
    static parseLiteral(nTriplesLiteral: string): ARTLiteral {
        if (nTriplesLiteral.startsWith("\"")) {
            // Find string separation points
            let endLabelIdx: number = this.findEndOfLabel(nTriplesLiteral);

            if (endLabelIdx != -1) {
                let startLangIdx: number = nTriplesLiteral.indexOf("@", endLabelIdx);
                let startDtIdx: number = nTriplesLiteral.indexOf("^^", endLabelIdx);

                if (startLangIdx != -1 && startDtIdx != -1) {
                    throw new Error("Literals can not have both a language and a datatype");
                }

                // Get label
                let label: string = nTriplesLiteral.substring(1, endLabelIdx);
                label = label.replace(/\\"/g, '"');

                if (startLangIdx != -1) {
                    // Get language
                    let language: string = nTriplesLiteral.substring(startLangIdx + 1);
                    return new ARTLiteral(label, null, language);
                }
                else if (startDtIdx != -1) {
                    // Get datatype
                    let datatype: string = nTriplesLiteral.substring(startDtIdx + 2);
                    let dtURI: ARTURIResource = this.parseURI(datatype);
                    return new ARTLiteral(label, dtURI.getURI());
                }
                else {
                    return new ARTLiteral(label);
                }
            }
        }
        throw new Error("Not a legal N-Triples literal: " + nTriplesLiteral);
    }

    /**
	 * Finds the end of the label in a literal string. This method takes into account that characters can be
	 * escaped using backslashes.
     * Code inspired by org.eclipse.rdf4j.rio.ntriples.NTripleUtils#parseLiteral()
     * 
	 * @return The index of the double quote ending the label, or <tt>-1</tt> if it could not be found.
	 */
    private static findEndOfLabel(nTriplesLiteral: string): number {
        // First character of literal is guaranteed to be a double
        // quote, start search at second character.
        let previousWasBackslash: boolean = false;
        for (var i = 1; i < nTriplesLiteral.length; i++) {
            let c: string = nTriplesLiteral.charAt(i);
            if (c == '"' && !previousWasBackslash) {
                return i;
            }
            else if (c == '\\' && !previousWasBackslash) {
                previousWasBackslash = true; // start of escape
            }
            else if (previousWasBackslash) {
                previousWasBackslash = false; // c was escaped
            }
        }
        return -1;
    }

    static parseBNode(nTriplesBNode: string): ARTBNode {
        if (nTriplesBNode.startsWith("_:")) {
            return new ARTBNode(nTriplesBNode);
        } else {
            throw new Error("Not a legal N-Triples Blank Node: " + nTriplesBNode);
        }
    }

    static isQName(nTripleQName: string, prefixMapping: PrefixMapping[]): boolean {
        let colonIdx: number = nTripleQName.indexOf(":");
        if (colonIdx != -1) {
            if (nTripleQName.includes(" ")) { //QName cannot contains whitespace (nTripleQName could represent a manch expr)
                return false;
            }
            let prefix: string = nTripleQName.substring(0, colonIdx);
            for (var i = 0; i < prefixMapping.length; i++) {
                if (prefixMapping[i].prefix == prefix) {
                    return true;
                }
            }
        }
        return false;
    }

    static parseQName(nTripleQName: string, prefixMapping: PrefixMapping[]): ARTURIResource {
        let colonIdx: number = nTripleQName.indexOf(":");
        if (colonIdx != -1) {
            let prefix: string = nTripleQName.substring(0, colonIdx);
            let localName: string = nTripleQName.substring(colonIdx + 1);
            //resolve prefix
            let namespace: string;
            for (var i = 0; i < prefixMapping.length; i++) {
                if (prefixMapping[i].prefix == prefix) {
                    return new ARTURIResource(prefixMapping[i].namespace + localName);
                }
            }
        } else {
            throw new Error("Not a legal N-Triples QName: " + nTripleQName);
        }
    }

    /**
     * Returns the qname of a IRI if the prefix-namespace is found, null otherwise
     * @param resource
     * @param prefixMapping 
     */
    static getQName(iri: string, prefixMapping: PrefixMapping[]): string {
        for (var i = 0; i < prefixMapping.length; i++) {
            if (iri.startsWith(prefixMapping[i].namespace)) {
                return iri.replace(prefixMapping[i].namespace, prefixMapping[i].prefix + ":");
            }
        }
        return null;
    }

    /**
     * Returns true if the resource is in the staging (add or remove) graph, false otherwise
     * @param resource 
     */
    static isResourceInStaging(resource: ARTResource): boolean {
        return this.isResourceInStagingAdd(resource) || this.isResourceInStagingRemove(resource);
    }
    static isResourceInStagingAdd(resource: ARTResource): boolean {
        let graphs: ARTURIResource[] = resource.getGraphs();
        for (var i = 0; i < graphs.length; i++) {
            if (graphs[i].getURI().startsWith(SemanticTurkey.stagingAddGraph)) {
                return true;
            }
        }
        return false;
    }
    static isResourceInStagingRemove(resource: ARTResource): boolean {
        let graphs: ARTURIResource[] = resource.getGraphs();
        for (var i = 0; i < graphs.length; i++) {
            if (graphs[i].getURI().startsWith(SemanticTurkey.stagingRemoveGraph)) {
                return true;
            }
        }
        return false;
    }

    /**
     * Returns true if the triple (which the resource respresents the object) is in the staging (add or remove) graph, false otherwise
     * @param resource 
     */
    static isTripleInStaging(resource: ARTNode): boolean {
        return this.isTripleInStagingAdd(resource) || this.isTripleInStagingRemove(resource);
    }
    static isTripleInStagingAdd(resource: ARTNode): boolean {
        let graphs: ARTURIResource[] = resource.getTripleGraphs();
        for (var i = 0; i < graphs.length; i++) {
            if (graphs[i].getURI().startsWith(SemanticTurkey.stagingAddGraph)) {
                return true;
            }
        }
        return false;
    }
    static isTripleInStagingRemove(resource: ARTNode): boolean {
        let graphs: ARTURIResource[] = resource.getTripleGraphs();
        for (var i = 0; i < graphs.length; i++) {
            if (graphs[i].getURI().startsWith(SemanticTurkey.stagingRemoveGraph)) {
                return true;
            }
        }
        return false;
    }

    /**
     * Returns true if the triple (which the resource respresents the object) is in the inference graph, false otherwise
     * @param resource 
     */
    static isTripleInferred(resource: ARTNode): boolean {
        return ResourceUtils.containsNode(resource.getTripleGraphs(), new ARTURIResource(SemanticTurkey.inferenceGraph));
    }

    /**
     * Taken from it.uniroma2.art.semanticturkey.data.role.RDFResourceRoles
     * @param subsumer 
     * @param subsumee 
     * @param undeterminedSubsumeesAll 
     */
    static roleSubsumes(subsumer: RDFResourceRolesEnum, subsumee: RDFResourceRolesEnum, undeterminedSubsumeesAll?: boolean) {
        if (subsumer == subsumee) {
            return true;
        }
        if (subsumer == RDFResourceRolesEnum.undetermined && undeterminedSubsumeesAll) {
            return true;
        }
        if (subsumer == RDFResourceRolesEnum.property) {
            return subsumee == RDFResourceRolesEnum.objectProperty || subsumee == RDFResourceRolesEnum.datatypeProperty
                || subsumee == RDFResourceRolesEnum.annotationProperty || subsumee == RDFResourceRolesEnum.ontologyProperty;
        }
        if (subsumer == RDFResourceRolesEnum.skosCollection && subsumee == RDFResourceRolesEnum.skosOrderedCollection) {
            return true;
        }
        return false;
    }

    static testIRI(iri: string) {
        let iriRegexp = new RegExp("\\b(https?|ftp|file)://[-a-zA-Z0-9+&@#/%?=~_|!:,.;]*[-a-zA-Z0-9+&@#/%=~_|]");
        return iriRegexp.test(iri);
    }


    static convertRoleToClass(role: RDFResourceRolesEnum, modelType?: string): ARTURIResource {
        let roleClass: ARTURIResource;
        if (role == RDFResourceRolesEnum.annotationProperty) {
            roleClass = OWL.annotationProperty;
        } else if (role == RDFResourceRolesEnum.cls) {
            roleClass = modelType == RDFS.uri ? RDFS.class : OWL.class;
        } else if (role == RDFResourceRolesEnum.concept) {
            roleClass = modelType == OntoLex.uri ? OntoLex.lexicalConcept : SKOS.concept;
        } else if (role == RDFResourceRolesEnum.conceptScheme) {
            roleClass = modelType == OntoLex.uri ? OntoLex.conceptSet : SKOS.conceptScheme;
        } else if (role == RDFResourceRolesEnum.dataRange) {
            roleClass = OWL.dataRange;
        } else if (role == RDFResourceRolesEnum.datatypeProperty) {
            roleClass = OWL.datatypeProperty;
        } else if (role == RDFResourceRolesEnum.limeLexicon) {
            roleClass = Lime.lexicon;
        } else if (role == RDFResourceRolesEnum.objectProperty) {
            roleClass = OWL.objectProperty;
        } else if (role == RDFResourceRolesEnum.ontolexForm) {
            roleClass = OntoLex.form;
        } else if (role == RDFResourceRolesEnum.ontolexLexicalEntry) {
            roleClass = OntoLex.lexicalEntry;
        } else if (role == RDFResourceRolesEnum.ontolexLexicalSense) {
            roleClass = OntoLex.lexicalSense;
        } else if (role == RDFResourceRolesEnum.ontology) {
            roleClass = OWL.ontology;
        } else if (role == RDFResourceRolesEnum.ontologyProperty) {
            roleClass = OWL.ontologyProperty;
        } else if (role == RDFResourceRolesEnum.property) {
            roleClass = RDF.property;
        } else if (role == RDFResourceRolesEnum.skosCollection) {
            roleClass = SKOS.collection;
        } else if (role == RDFResourceRolesEnum.skosOrderedCollection) {
            roleClass = SKOS.orderedCollection;
        } else if (role == RDFResourceRolesEnum.xLabel) {
            roleClass = SKOSXL.label;
        }
        return roleClass;
    }

    static getResourceRoleLabel(role: RDFResourceRolesEnum): string {
        if (role == RDFResourceRolesEnum.cls) {
            return "Class";
        } else if (role == RDFResourceRolesEnum.xLabel) {
            return "Skosxl Label";
        } else {
            let splitted: string = role.replace(/([a-z])([A-Z])/g, '$1 $2');
            return splitted.charAt(0).toLocaleUpperCase() + splitted.slice(1); //upper case the first letter
        }
    }

}


export enum SortAttribute {
    value = "value",
    show = "show"
}