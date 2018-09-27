import {
    ARTNode, ARTURIResource, ARTResource, ARTBNode, ARTLiteral, ARTPredicateObjects, ResAttribute, RDFResourceRolesEnum
} from "../models/ARTResources";
import { User } from "../models/User";
import { SemanticTurkey } from "../models/Vocabulary";
import { VBContext } from "./VBContext";

export class Deserializer {

    /**
     * Creates an ARTURIResource from a Json Object {"@id": string, "show": string, "role": string, ...other optional attributes}
     */
    public static createURI(uri: any, additionalAttr?: string[]): ARTURIResource {
        var id: string = uri['@id'];
        var show: string = uri[ResAttribute.SHOW];
        var uriRes: ARTURIResource = new ARTURIResource(id, show);
        //other properties
        this.parseNodeOptionalProperties(uri, uriRes, additionalAttr);

        return uriRes;
    }

    public static createBlankNode(bnode: any, additionalAttr?: string[]): ARTBNode {
        var id = bnode['@id'];
        var show = bnode[ResAttribute.SHOW];
        var role: RDFResourceRolesEnum = RDFResourceRolesEnum[<string>bnode[ResAttribute.ROLE]];
        var bNodeRes = new ARTBNode(id, show, role);
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
        var accessMethod: string = resJson[ResAttribute.ACCESS_METHOD];
        if (accessMethod != undefined) {
            node.setAdditionalProperty(ResAttribute.ACCESS_METHOD, accessMethod);
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
            node.setAdditionalProperty(ResAttribute.MEMBERS, this.createResourceArray(members, additionalAttr));
        }
        var index: any = resJson[ResAttribute.INDEX];
        if (index != undefined) {
            node.setAdditionalProperty(ResAttribute.INDEX, this.createLiteral(index, additionalAttr));
        }
        var inScheme: string = resJson[ResAttribute.IN_SCHEME];
        if (inScheme != undefined) {
            node.setAdditionalProperty(ResAttribute.IN_SCHEME, inScheme);
        }
        var schemesAttr: string = resJson[ResAttribute.SCHEMES];
        if (schemesAttr != undefined) {
            let schemes: ARTURIResource[] = []
            if (schemesAttr != "") {
                let splittedSchemes: string[] = schemesAttr.split(",");
                for (var i = 0; i < splittedSchemes.length; i++) {
                    schemes.push(new ARTURIResource(splittedSchemes[i].trim()));
                }
            }
            node.setAdditionalProperty(ResAttribute.SCHEMES, schemes);
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
             * explicit is true if the resource is defined in the main graph (but not in the remove-staging)
             */
            if (node.getAdditionalProperty(ResAttribute.EXPLICIT) == null) {
                var baseURI = VBContext.getWorkingProject() ? VBContext.getWorkingProject().getBaseURI() : null;
                let resGraphs: ARTURIResource[] = node.getGraphs();
                let inMainGraph: boolean = false;
                let inRemoveStagingGraph: boolean = false;
                for (var i = 0; i < resGraphs.length; i++) {
                    if (resGraphs[i].getURI() == baseURI) {
                        inMainGraph = true;
                    } else if (resGraphs[i].getURI().startsWith(SemanticTurkey.stagingRemoveGraph)) {
                        inRemoveStagingGraph = true;
                    }
                }
                if (inMainGraph && !inRemoveStagingGraph) {
                    node.setAdditionalProperty(ResAttribute.EXPLICIT, true);
                }
            }
            //if explicit is still null, set it to false
            if (node.getAdditionalProperty(ResAttribute.EXPLICIT) == null) {
                node.setAdditionalProperty(ResAttribute.EXPLICIT, false);
            }
        }

        //patch to override the show of the dataRange (that could be very long) with a shorter version
        if (node.getRole() == RDFResourceRolesEnum.dataRange) {
            let charLimit: number = 50;
            let dataRangeShow = node.getShow();
            if (dataRangeShow.length > charLimit) {
                let shortShow: string = "";
                let splitted: string[] = dataRangeShow.split(",");
                let i = 0;
                while (shortShow.length < charLimit) {
                    shortShow += splitted[i] + ",";
                    i++;
                } 
                shortShow += " ...}";
                node.setAdditionalProperty(ResAttribute.SHOW, shortShow);
            }
        }

        if (additionalAttr != undefined) {
            for (var i = 0; i < additionalAttr.length; i++) {
                let attrValue: string = resJson[additionalAttr[i]];
                if (attrValue != undefined) {
                    node.setAdditionalProperty(additionalAttr[i], attrValue);
                }
            }
        }
    }

    public static createLiteral(literal: any, additionalAttr?: string[]): ARTLiteral {
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
        this.parseNodeOptionalProperties(literal, artLiteralRes, additionalAttr)

        return artLiteralRes;
    }

    public static createRDFResource(resource: any, additionalAttr?: string[]): ARTResource {
        var resId = resource['@id'];
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
        var nodeId: string = node['@id']; //resource
        var nodeValue: string = node['@value']; //literal
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
        var uriResourceArray: ARTURIResource[] = new Array();
        for (var i = 0; i < result.length; i++) {
            uriResourceArray.push(this.createURI(result[i], additionalAttr));
        }
        return uriResourceArray;
    }

    public static createResourceArray(resArray: any[], additionalAttr?: string[]): ARTResource[] {
        var resourceArray: ARTResource[] = new Array();
        for (var i = 0; i < resArray.length; i++) {
            resourceArray.push(this.createRDFResource(resArray[i], additionalAttr));
        }
        return resourceArray;
    }

    public static createLiteralArray(result: Array<any>, additionalAttr?: string[]): ARTLiteral[] {
        var literalArray: ARTLiteral[] = new Array();
        for (var i = 0; i < result.length; i++) {
            literalArray.push(this.createLiteral(result[i], additionalAttr));
        }
        return literalArray;
    }

    public static createRDFNodeArray(nodeArray: any, additionalAttr?: string[]) {
        var collectionArray: ARTNode[] = new Array();
        for (var i = 0; i < nodeArray.length; i++) {
            collectionArray.push(this.createRDFNode(nodeArray[i], additionalAttr));
        }
        return collectionArray;
    }

    public static createPredicateObjectsList(poList: any, additionalAttr?: string[]): ARTPredicateObjects[] {
        var result: ARTPredicateObjects[] = [];
        for (var i = 0; i < poList.length; i++) {
            var predicate = this.createURI(poList[i].predicate, additionalAttr);
            var objects = this.createRDFNodeArray(poList[i].objects, additionalAttr);
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
        user.setOnline(userJson.online);
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
        if (userJson.avatarUrl != undefined) {
            user.setAvatarUrl(userJson.avatarUrl);
        }
        if (userJson.languageProficiencies != undefined) {
            user.setLanguageProficiencies(userJson.languageProficiencies);
        }
        return user;
    }

}