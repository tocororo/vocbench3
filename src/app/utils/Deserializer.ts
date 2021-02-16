import { ARTBNode, ARTLiteral, ARTNode, ARTPredicateObjects, ARTResource, ARTURIResource, RDFResourceRolesEnum, ResAttribute, ShowInterpretation } from "../models/ARTResources";
import { User } from "../models/User";
import { SemanticTurkey } from "../models/Vocabulary";
import { VBContext } from "./VBContext";

export class Deserializer {

    /**
     * Creates an ARTURIResource from a Json Object {"@id": string, "show": string, "role": string, ...other optional attributes}
     */
    public static createURI(uri: any, additionalAttr?: string[]): ARTURIResource {
        let id: string = uri['@id'];
        let show: string = uri[ResAttribute.SHOW];
        let uriRes: ARTURIResource = new ARTURIResource(id, show);
        //other properties
        this.parseNodeOptionalProperties(uri, uriRes, additionalAttr);

        return uriRes;
    }

    public static createBlankNode(bnode: any, additionalAttr?: string[]): ARTBNode {
        let id = bnode['@id'];
        let show = bnode[ResAttribute.SHOW];
        let role: RDFResourceRolesEnum = RDFResourceRolesEnum[<string>bnode[ResAttribute.ROLE]];
        let bNodeRes = new ARTBNode(id, show, role);
        //other properties
        this.parseNodeOptionalProperties(bnode, bNodeRes, additionalAttr);

        return bNodeRes;
    }

    /**
     * 
     * @param resJson 
     * @param node 
     * @param additionalAttr list of non common attributes to parse
     */
    private static parseNodeOptionalProperties(resJson: any, node: ARTNode, additionalAttr?: string[]) {
        let qname: string = resJson[ResAttribute.QNAME];
        if (qname != undefined) {
            node.setAdditionalProperty(ResAttribute.QNAME, qname);
        }
        let explicit: boolean = resJson[ResAttribute.EXPLICIT];
        if (explicit != undefined) {
            node.setAdditionalProperty(ResAttribute.EXPLICIT, explicit);
        }
        let more: boolean = resJson[ResAttribute.MORE];
        if (more != undefined) {
            node.setAdditionalProperty(ResAttribute.MORE, more);
        }
        let numInst: number = resJson[ResAttribute.NUM_INST];
        if (numInst != undefined) {
            node.setAdditionalProperty(ResAttribute.NUM_INST, numInst);
        }
        let hasCustomRange: boolean = resJson[ResAttribute.HAS_CUSTOM_RANGE];
        if (hasCustomRange != undefined) {
            node.setAdditionalProperty(ResAttribute.HAS_CUSTOM_RANGE, hasCustomRange);
        }
        let resourcePosition: string = resJson[ResAttribute.RESOURCE_POSITION];
        if (resourcePosition != undefined) {
            node.setAdditionalProperty(ResAttribute.RESOURCE_POSITION, resourcePosition);
        }
        let accessMethod: string = resJson[ResAttribute.ACCESS_METHOD];
        if (accessMethod != undefined) {
            node.setAdditionalProperty(ResAttribute.ACCESS_METHOD, accessMethod);
        }
        let lang: string = resJson[ResAttribute.LANG];
        if (lang != undefined) {
            node.setAdditionalProperty(ResAttribute.LANG, lang);
        }
        let dataType: string = resJson[ResAttribute.DATA_TYPE];
        if (dataType != undefined) {
            node.setAdditionalProperty(ResAttribute.DATA_TYPE, dataType);
        }
        let graphsAttr: string = resJson[ResAttribute.GRAPHS];
        if (graphsAttr != undefined) {
            let splittedGraph: string[] = graphsAttr.split(",");
            for (let i = 0; i < splittedGraph.length; i++) {
                node.addTripleGraph(new ARTURIResource(splittedGraph[i].trim()));
            }
        }
        let members: any[] = resJson[ResAttribute.MEMBERS];
        if (members != undefined) {
            node.setAdditionalProperty(ResAttribute.MEMBERS, this.createResourceArray(members, additionalAttr));
        }
        let index: any = resJson[ResAttribute.INDEX];
        if (index != undefined) {
            node.setAdditionalProperty(ResAttribute.INDEX, this.createLiteral(index, additionalAttr));
        }
        let inScheme: string = resJson[ResAttribute.IN_SCHEME];
        if (inScheme != undefined) {
            node.setAdditionalProperty(ResAttribute.IN_SCHEME, inScheme);
        }
        let schemesAttr: string = resJson[ResAttribute.SCHEMES];
        if (schemesAttr != undefined) {
            let schemes: ARTURIResource[] = []
            if (schemesAttr != "") {
                let splittedSchemes: string[] = schemesAttr.split(",");
                for (let s of splittedSchemes) {
                    schemes.push(new ARTURIResource(s.trim()));
                }
            }
            node.setAdditionalProperty(ResAttribute.SCHEMES, schemes);
        }

        if (node instanceof ARTResource) {
            let role: RDFResourceRolesEnum = <RDFResourceRolesEnum>resJson[ResAttribute.ROLE];
            if (role != undefined) {
                node.setRole(role);
            }

            let natureAttr: string = resJson[ResAttribute.NATURE];
            if (natureAttr != undefined && natureAttr != "") {
                let splitted: string[] = natureAttr.split("|_|");
                for (let s of splitted) {
                    let roleGraphDeprecatedTriple: string[] = s.split(",");
                    let roleInNature: RDFResourceRolesEnum = <RDFResourceRolesEnum>roleGraphDeprecatedTriple[0];
                    let graphInNature: ARTURIResource = new ARTURIResource(roleGraphDeprecatedTriple[1]);
                    let deprecatedInNature: boolean = roleGraphDeprecatedTriple[2] == "true";
                    node.setRole(roleInNature); //in this way I set the last role encountered in the nature
                    node.addGraph(graphInNature);
                    node.addNature(roleInNature, graphInNature, deprecatedInNature);
                    //I set the last deprecated encountered but it doesn't matter since the deprecated value is the same in all the role-graph-deprecated triples
                    node.setAdditionalProperty(ResAttribute.DEPRECATED, deprecatedInNature);
                }
                
                /**
                 * if explicit is null => explicit attribute was missing => infer it from the graphs in the nature:
                 * explicit is true if the resource is defined in the main graph (but not in the remove-staging)
                 */
                if (node.getAdditionalProperty(ResAttribute.EXPLICIT) == null) {
                    let baseURI = VBContext.getActualWorkingGraphString();
                    let resGraphs: ARTURIResource[] = node.getGraphs();
                    let inWorkingGraph: boolean = false;
                    let inRemoveStagingGraph: boolean = false;
                    for (let g of resGraphs) {
                        if (g.getURI() == baseURI) {
                            inWorkingGraph = true;
                        } else if (g.getURI().startsWith(SemanticTurkey.stagingRemoveGraph)) {
                            inRemoveStagingGraph = true;
                        }
                    }
                    if (inWorkingGraph && !inRemoveStagingGraph) {
                        node.setAdditionalProperty(ResAttribute.EXPLICIT, true);
                    }
                }
                //if explicit is still null, set it to false
                if (node.getAdditionalProperty(ResAttribute.EXPLICIT) == null) {
                    node.setAdditionalProperty(ResAttribute.EXPLICIT, false);
                }
            }
        }

        let tripleScope: string = resJson[ResAttribute.TRIPLE_SCOPE];
        if (tripleScope != undefined) {
            node.setAdditionalProperty(ResAttribute.TRIPLE_SCOPE, tripleScope);
        }

        let showInterpr: ShowInterpretation = resJson[ResAttribute.SHOW_INTERPR];
        if (showInterpr != null) {
            node.setAdditionalProperty(ResAttribute.SHOW_INTERPR, showInterpr);
        }

        if (additionalAttr != undefined) {
            for (let attr of additionalAttr) {
                let attrValue: string = resJson[attr];
                if (attrValue != undefined) {
                    node.setAdditionalProperty(attr, attrValue);
                }
            }
        }
    }

    public static createLiteral(literal: any, additionalAttr?: string[]): ARTLiteral {
        let value = literal['@value'];
        let artLiteralRes: ARTLiteral = new ARTLiteral(value);
        let datatype = literal['@type'];
        if (datatype != undefined) {
            artLiteralRes.setDatatype(datatype);
        }
        let lang = literal[ResAttribute.LANG];
        if (lang == undefined) {
            lang = literal["@language"];
        }
        if (lang != undefined) {
            artLiteralRes.setLang(lang);
        }
        
        //optional properties
        this.parseNodeOptionalProperties(literal, artLiteralRes, additionalAttr)

        return artLiteralRes;
    }

    public static createRDFResource(resource: any, additionalAttr?: string[]): ARTResource {
        let resId = resource['@id'];
        if (resource['@id'] != undefined) {
            if (resId.startsWith('_:')) {
                return this.createBlankNode(resource, additionalAttr);
            } else {
                return this.createURI(resource, additionalAttr);
            }
        } else {
            throw new Error("Not a RDFResource");
        }
    }

    public static createRDFNode(node: any, additionalAttr?: string[]): ARTNode {
        let nodeId: string = node['@id']; //resource
        let nodeValue: string = node['@value']; //literal
        if (nodeId != undefined) {
            return this.createRDFResource(node, additionalAttr);
        } else if (nodeValue != undefined) {
            return this.createLiteral(node, additionalAttr);
        } else {
            throw new Error("Not a RDFNode");
        }
    }

    /**
     * creates an array of only ARTURIResource from a json result
     */
    public static createURIArray(result: Array<any>, additionalAttr?: string[]): ARTURIResource[] {
        let uriResourceArray: ARTURIResource[] = new Array();
        for (let r of result) {
            uriResourceArray.push(this.createURI(r, additionalAttr));
        }
        return uriResourceArray;
    }

    public static createResourceArray(resArray: any[], additionalAttr?: string[]): ARTResource[] {
        let resourceArray: ARTResource[] = [];
        for (let r of resArray) {
            resourceArray.push(this.createRDFResource(r, additionalAttr));
        }
        return resourceArray;
    }

    public static createLiteralArray(result: any[], additionalAttr?: string[]): ARTLiteral[] {
        let literalArray: ARTLiteral[] = [];
        for (let l of result) {
            literalArray.push(this.createLiteral(l, additionalAttr));
        }
        return literalArray;
    }

    public static createRDFNodeArray(nodeArray: any, additionalAttr?: string[]) {
        let collectionArray: ARTNode[] = new Array();
        for (let node of nodeArray) {
            collectionArray.push(this.createRDFNode(node, additionalAttr));
        }
        return collectionArray;
    }

    public static createPredicateObjectsList(poList: any, additionalAttr?: string[]): ARTPredicateObjects[] {
        let poLists: ARTPredicateObjects[] = [];
        for (let po of poList) {
            //note: objects must not be ordered since in some cases they are already ordered server side (e.g. constituents in RV)
            let predicate = this.createURI(po.predicate, additionalAttr);
            let objects = this.createRDFNodeArray(po.objects, additionalAttr);
            let predicateObjects = new ARTPredicateObjects(predicate, objects);
            poLists.push(predicateObjects);
        }
        poLists.sort((po1, po2) => {
            return po1.getPredicate().getShow().localeCompare(po2.getPredicate().getShow());
        })
        return poLists;
    };

    /**
     * Parses a datetime formatted like 2017-05-29T08:34:35.641+0000 and return it formatted as "<date> <time>" accordin to the local format
     * @param datetime 
     */
    public static parseDateTime(datetime: Date): string {
        // return datetime.toLocaleDateString([], { year: "numeric", month: "2-digit", day: "2-digit" }) + " " + datetime.toLocaleTimeString();
        return datetime.toLocaleDateString() + " " + datetime.toLocaleTimeString();
    }


    /**
     * @param resp json response containing {"user"" : [{givenName: string, familyName: string, ...}, {...}]}
     */
    static createUsersArray(resp: any): User[] {
        let users: User[] = [];
        for (let u of resp) {
            users.push(this.createUser(u));
        }
        return users;
    }

    /**
     * Parses a json response, creates and returns a User. Returns null if no user is present in input param
     * @param resp could be a "data" element of a response (containing a "user" element)
     * or directly a "user" element
     */
    static createUser(userJson: any): User {
        if (userJson.email == null) { //user object is empty (scenario: getUser with no logged user)
            return null;
        }
        let user = new User(userJson.email, userJson.givenName, userJson.familyName, userJson.iri);
        user.setRegistrationDate(userJson.registrationDate);
        user.setStatus(userJson.status);
        user.setAdmin(userJson.admin);
        user.setOnline(userJson.online);
        if (userJson.phone != undefined) {
            user.setPhone(userJson.phone);
        }
        if (userJson.address != undefined) {
            user.setAddress(userJson.address);
        }
        if (userJson.affiliation != undefined) {
            user.setAffiliation(userJson.affiliation);
        }
        if (userJson.url != undefined) {
            user.setUrl(userJson.url);
        }
        if (userJson.avatarUrl != undefined) {
            user.setAvatarUrl(userJson.avatarUrl);
        }
        if (userJson.languageProficiencies != undefined) {
            user.setLanguageProficiencies(userJson.languageProficiencies);
        }
        if (userJson.customProperties != undefined) {
            let cp: { [iri: string]: string } = {};
            userJson.customProperties.forEach((cpJson: any) => {
                cp[cpJson.iri] = cpJson.value;
            })
            user.setCustomProperties(cp);
        }
        return user;
    }

}