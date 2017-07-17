import {
    ARTNode, ARTURIResource, ARTResource, ARTBNode, ARTLiteral, ARTPredicateObjects, ResAttribute, RDFResourceRolesEnum
} from "../models/ARTResources";
import { User } from "../models/User";
import { VBContext } from "../utils/VBContext";

export class Deserializer {

    /**
     * Creates an ARTURIResource from a Json Object {"@id": string, "show": string, "role": string, ...other optional attributes}
     */
    public static createURI(uri: any): ARTURIResource {
        var id: string = uri['@id'];
        var show: string = uri[ResAttribute.SHOW];
        var uriRes: ARTURIResource = new ARTURIResource(id, show);
        //other properties
        this.parseNodeOptionalProperties(uri, uriRes);

        return uriRes;
    }

    public static createBlankNode(bnode: any): ARTBNode {
        var id = bnode['@id'];
        var show = bnode[ResAttribute.SHOW];
        var role = RDFResourceRolesEnum[bnode[ResAttribute.ROLE]];
        var bNodeRes = new ARTBNode(id, show, role);
        //other properties
        this.parseNodeOptionalProperties(bnode, bNodeRes);

        return bNodeRes;
    }

    private static parseNodeOptionalProperties(resJson: any, node: ARTNode) {
        var role: RDFResourceRolesEnum = <RDFResourceRolesEnum>resJson[ResAttribute.ROLE];
        if (role != undefined) {
            node.setRole(role);
        }
        var qname: string = resJson[ResAttribute.QNAME];
        if (qname != undefined) {
            node.setAdditionalProperty(ResAttribute.QNAME, qname);
        }
        var explicit: boolean = resJson[ResAttribute.EXPLICIT];
        if (explicit != undefined) {
            node.setAdditionalProperty(ResAttribute.EXPLICIT, explicit);
        }
        var more: boolean = resJson[ResAttribute.MORE];
        if (more != undefined) {
            node.setAdditionalProperty(ResAttribute.MORE, more);
        }
        var numInst: number = resJson[ResAttribute.NUM_INST];
        if (numInst != undefined) {
            node.setAdditionalProperty(ResAttribute.NUM_INST, numInst);
        }
        var hasCustomRange: boolean = resJson[ResAttribute.HAS_CUSTOM_RANGE];
        if (hasCustomRange != undefined) {
            node.setAdditionalProperty(ResAttribute.HAS_CUSTOM_RANGE, hasCustomRange);
        }
        var resourcePosition: string = resJson[ResAttribute.RESOURCE_POSITION];
        if (resourcePosition != undefined) {
            node.setAdditionalProperty(ResAttribute.RESOURCE_POSITION, resourcePosition);
        }
        var lang: string = resJson[ResAttribute.LANG];
        if (lang != undefined) {
            node.setAdditionalProperty(ResAttribute.LANG, lang);
        }
        var graphsAttr: string = resJson[ResAttribute.GRAPHS];
        if (graphsAttr != undefined) {
            let splittedGraph: string[] = graphsAttr.split(",");
            let graphs: ARTURIResource[] = []
            for (var i = 0; i < splittedGraph.length; i++) {
                graphs.push(new ARTURIResource(splittedGraph[i].trim()));
            }
            node.setGraphs(graphs);
        }
        var members: any[] = resJson[ResAttribute.MEMBERS];
        if (members != undefined) {
            node.setAdditionalProperty(ResAttribute.MEMBERS, this.createResourceArray(members));
        }
        var index: any = resJson[ResAttribute.INDEX];
        if (index != undefined) {
            node.setAdditionalProperty(ResAttribute.INDEX, this.createLiteral(index));
        }
        var inScheme: string = resJson[ResAttribute.IN_SCHEME];
        if (inScheme != undefined) {
            node.setAdditionalProperty(ResAttribute.IN_SCHEME, inScheme);
        }
        var nature: string = resJson[ResAttribute.NATURE];
        if (nature != undefined && nature != "") {
            let natureRole: RDFResourceRolesEnum;
            let natureDeprecated: boolean = false;
            let splitted: string[] = nature.split("|_|");
            for (var i = 0; i < splitted.length; i++) {
                let roleGraphDeprecated: string[] = splitted[i].split(",");
                node.setRole(<RDFResourceRolesEnum>roleGraphDeprecated[0]); //in this way I set the last role encountered in the nature
                node.addGraph(new ARTURIResource(roleGraphDeprecated[1]));
                node.setAdditionalProperty(ResAttribute.DEPRECATED, roleGraphDeprecated[2] == "true");
            }
            
            /**
             * if explicit is null => explicit attribute was missing => infer it from the graphs in the nature:
             * explicit is true if the resource is defined in the main graph
             */
            if (node.getAdditionalProperty(ResAttribute.EXPLICIT) == null) {
                var baseURI = VBContext.getWorkingProject().getBaseURI();
                let resGraphs: ARTURIResource[] = node.getGraphs();
                for (var i = 0; i < resGraphs.length; i++) {
                    if (resGraphs[i].getURI() == baseURI) {
                        node.setAdditionalProperty(ResAttribute.EXPLICIT, true);
                        break;
                    }
                }
            }
            //if explicit is still null, set it to false
            if (node.getAdditionalProperty(ResAttribute.EXPLICIT) == null) {
                node.setAdditionalProperty(ResAttribute.EXPLICIT, false);
            }
        }
    }

    public static createLiteral(literal: any): ARTLiteral {
        var isTypedLiteral: boolean;

        var value = literal['@value'];
        var artLiteralRes: ARTLiteral = new ARTLiteral(value);
        var datatype = literal['@type'];
        if (datatype != undefined) {
            artLiteralRes.setDatatype(datatype);
        }
        var lang = literal[ResAttribute.LANG];
        if (lang == undefined) {
            var lang = literal["@language"];
        }
        if (lang != undefined) {
            artLiteralRes.setLang(lang);
        }
        
        //optional properties
        this.parseNodeOptionalProperties(literal, artLiteralRes)

        return artLiteralRes;
    }

    public static createRDFResource(resource: any): ARTResource {
        var resId = resource['@id'];
        if (resource['@id'] != undefined) {
            if (resId.startsWith('_:')) {
                return this.createBlankNode(resource);
            } else {
                return this.createURI(resource);
            }
        } else {
            throw new Error("Not a RDFResource");
        }
    }

    public static createRDFNode(node: any): ARTNode {
        var nodeId: string = node['@id']; //resource
        var nodeValue: string = node['@value']; //literal
        if (nodeId != undefined) {
            return this.createRDFResource(node);
        } else if (nodeValue != undefined) {
            return this.createLiteral(node);
        } else {
            throw new Error("Not a RDFNode");
        }
    }

    /**
     * creates an array of only ARTURIResource from a json result
     */
    public static createURIArray(result: Array<any>): ARTURIResource[] {
        var uriResourceArray: ARTURIResource[] = new Array();
        for (var i = 0; i < result.length; i++) {
            uriResourceArray.push(this.createURI(result[i]));
        }
        return uriResourceArray;
    }

    public static createResourceArray(resArray: any[]): ARTResource[] {
        var resourceArray: ARTResource[] = new Array();
        for (var i = 0; i < resArray.length; i++) {
            resourceArray.push(this.createRDFResource(resArray[i]));
        }
        return resourceArray;
    }

    public static createLiteralArray(result: Array<any>): ARTLiteral[] {
        var literalArray: ARTLiteral[] = new Array();
        for (var i = 0; i < result.length; i++) {
            literalArray.push(this.createLiteral(result[i]));
        }
        return literalArray;
    }

    public static createRDFNodeArray(nodeArray: any) {
        var collectionArray: ARTNode[] = new Array();
        for (var i = 0; i < nodeArray.length; i++) {
            collectionArray.push(this.createRDFNode(nodeArray[i]));
        }
        return collectionArray;
    }

    public static createPredicateObjectsList(poList: any): ARTPredicateObjects[] {
        var result: ARTPredicateObjects[] = [];
        for (var i = 0; i < poList.length; i++) {
            var predicate = this.createURI(poList[i].predicate);
            var objects = this.createRDFNodeArray(poList[i].objects);
            var predicateObjects = new ARTPredicateObjects(predicate, objects);
            result.push(predicateObjects);
        }
        return result;
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
        var users: User[] = [];
        for (var i = 0; i < resp.length; i++) {
            users.push(this.createUser(resp[i]));
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
        var user = new User(userJson.email, userJson.givenName, userJson.familyName, userJson.iri);
        user.setRegistrationDate(userJson.registrationDate);
        user.setStatus(userJson.status);
        user.setAdmin(userJson.admin);
        if (userJson.birthday != undefined) {
            user.setBirthday(userJson.birthday);
        }
        if (userJson.phone != undefined) {
            user.setPhone(userJson.phone);
        }
        if (userJson.gender != undefined) {
            user.setGender(userJson.gender)
        }
        if (userJson.country != undefined) {
            user.setCountry(userJson.country);
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
        if (userJson.languageProficiencies != undefined) {
            user.setLanguageProficiencies(userJson.languageProficiencies);
        }
        return user;
    }

}