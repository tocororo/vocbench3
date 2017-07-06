import {
    ARTNode, ARTURIResource, ARTResource, ARTBNode, ARTLiteral, ARTPredicateObjects, ResAttribute, RDFResourceRolesEnum
} from "../models/ARTResources";
import { User } from "../models/User";
import { VBContext } from "../utils/VBContext";

export class Deserializer {

    static createURI(response: any): ARTURIResource {
        if (response instanceof Element) {
            return this.createURIXML(response);
        } else {
            return this.createURIJSON(response);
        }
    }

    static createBlankNode(bnode: any): ARTBNode {
        if (bnode instanceof Element) {
            return this.createBlankNodeXML(bnode);
        } else {
            return this.createBlankNodeJSON(bnode);
        }
    }

    static createLiteral(literal: any): ARTLiteral {
        if (literal instanceof Element) {
            return this.createLiteralXML(literal);
        } else {
            return this.createLiteralJSON(literal);
        }
    }

    static createRDFNode(node: any): ARTNode {
        if (node instanceof Element) {
            return this.createRDFNodeXML(node);
        } else {
            return this.createRDFNodeJSON(node);
        }
    }

    static createRDFResource(resource: any) {
        if (resource instanceof Element) {
            return this.createRDFResourceXML(resource);
        } else {
            return this.createRDFResourceJSON(resource);
        }
    }

    /**
     * creates an array of mixed resources (ARTBNode, ARTLiteral, ARTURIResource)
     * from a <collection> element.
     */
    static createRDFNodeArray(response: Element): ARTNode[] {
        if (response instanceof Element) {
            return this.createRDFNodeArrayXML(response);
        } else {
            return this.createRDFNodeArrayJSON(response);
        }
    };

    /**
     * creates an array of ARTURIResource and ARTResource
     */
    static createResourceArray(response: any): ARTResource[] {
        if (response instanceof Element) {
            return this.createResourceArrayXML(response);
        } else {
            return this.createResourceArrayJSON(response);
        }
    }

    static createURIArray(response: any): ARTURIResource[] {
        if (response instanceof Element) {
            return this.createURIArrayXML(response);
        } else { //new json response
            return this.createURIArrayJSON(response);
        }
    }

    /**
     * creates an array of ARTURIResource (this method has only an xml implementation)
     */
    static createURIArrayGivenList(childElements: HTMLCollection): ARTURIResource[] {
        var collectionArray: ARTURIResource[] = new Array();
        if (typeof childElements.length == "undefined")
            return null;
        for (var i = 0; i < childElements.length; i++) {
            if (childElements[i].nodeType == 1 && childElements[i].tagName == "uri") {// == ELEMENT_NODE
                collectionArray.push(this.createURI(childElements[i]));
            }
        }
        return collectionArray;
    };

    static createPredicateObjectsList(poList: any): ARTPredicateObjects[] {
        if (poList instanceof Element) {
            return this.createPredicateObjectsListXML(poList);
        } else {
            return this.createPredicateObjectsListJSON(poList);
        }
    };

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
        return user;
    }



    //########### XML IMPLEMENTATIONS ###########

    private static createURIXML(response: Element): ARTURIResource {
        var uriElement: Element;
        if (response.tagName == 'uri') {
            uriElement = response;
        } else {
            uriElement = response.getElementsByTagName('uri')[0];
        }

        var uri = uriElement.textContent;
        var show = uriElement.getAttribute(ResAttribute.SHOW);
        var role: RDFResourceRolesEnum = <RDFResourceRolesEnum>uriElement.getAttribute(ResAttribute.ROLE);
        var artURIRes = new ARTURIResource(uri, show, role);

        //optional properties
        var explicit = uriElement.getAttribute(ResAttribute.EXPLICIT);
        if (explicit != undefined) {
            artURIRes.setAdditionalProperty(ResAttribute.EXPLICIT, (explicit == "true"));
        }
        var more = uriElement.getAttribute(ResAttribute.MORE);
        if (more != undefined) {
            artURIRes.setAdditionalProperty(ResAttribute.MORE, more);
        }
        var numInst = uriElement.getAttribute(ResAttribute.NUM_INST);
        if (numInst != undefined) {
            artURIRes.setAdditionalProperty(ResAttribute.NUM_INST, Number(numInst));
        }
        var hasCustomRange = uriElement.getAttribute(ResAttribute.HAS_CUSTOM_RANGE);//indicates if a property has a FormCollection
        if (hasCustomRange != undefined) {
            artURIRes.setAdditionalProperty(ResAttribute.HAS_CUSTOM_RANGE, (hasCustomRange == "true"));
        }
        var resourcePosition = uriElement.getAttribute(ResAttribute.RESOURCE_POSITION);//indicates the position of the resource
        if (resourcePosition != undefined) {
            artURIRes.setAdditionalProperty(ResAttribute.RESOURCE_POSITION, resourcePosition);
        }
        var lang = uriElement.getAttribute(ResAttribute.LANG);//indicates the language of an xLabel
        if (lang != undefined) {
            artURIRes.setAdditionalProperty(ResAttribute.LANG, lang);
        }
        var graphs = uriElement.getAttribute(ResAttribute.GRAPHS);//contains comma separated graphs
        if (graphs != undefined) {
            artURIRes.setAdditionalProperty(ResAttribute.GRAPHS, graphs);
        }

        return artURIRes;
    }

    private static createBlankNodeXML(bnodeElement: Element): ARTBNode {
        // var bnodeElement;
        if (bnodeElement.tagName == 'bnode') {
            bnodeElement = bnodeElement;
        } else {
            bnodeElement = bnodeElement.getElementsByTagName('bnode')[0];
        }

        var id = bnodeElement.textContent;
        var show = bnodeElement.getAttribute(ResAttribute.SHOW);
        var role = RDFResourceRolesEnum[bnodeElement.getAttribute(ResAttribute.ROLE)];
        var bNodeRes = new ARTBNode(id, show, role);

        //optional properties
        var explicit = bnodeElement.getAttribute(ResAttribute.EXPLICIT);
        if (explicit != undefined) {
            bNodeRes.setAdditionalProperty(ResAttribute.EXPLICIT, (explicit == "true"));
        }
        var resourcePosition = bnodeElement.getAttribute(ResAttribute.RESOURCE_POSITION);//indicates the position of the resource
        if (resourcePosition != undefined) {
            bNodeRes.setAdditionalProperty(ResAttribute.RESOURCE_POSITION, resourcePosition);
        }
        var lang = bnodeElement.getAttribute(ResAttribute.LANG);//indicates the language of an xLabel
        if (lang != undefined) {
            bNodeRes.setAdditionalProperty(ResAttribute.LANG, lang);
        }
        var graphs = bnodeElement.getAttribute(ResAttribute.GRAPHS);//contains comma separated graphs
        if (graphs != undefined) {
            bNodeRes.setAdditionalProperty(ResAttribute.GRAPHS, graphs);
        }

        return bNodeRes;
    }

    private static createLiteralXML(response: Element): ARTLiteral {
        var isTypedLiteral: boolean;
        var literalElement: Element;
        if (response.tagName == 'plainLiteral' || response.tagName == 'typedLiteral') {
            literalElement = response;
        } else {
            //get literalElement in any case: if is a typedLiteral or plainLiteral
            var literalElements: NodeListOf<Element> = response.getElementsByTagName('typedLiteral');
            if (literalElements.length != 0) {
                literalElement = literalElements[0];
            } else {
                literalElement = response.getElementsByTagName('plainLiteral')[0];
            }
        }
        if (literalElement.tagName == 'typedLiteral') {
            isTypedLiteral = true;
        } else {
            isTypedLiteral = false;
        }

        var label = literalElement.textContent;
        var artLiteralRes = new ARTLiteral(label);
        var datatype: string = literalElement.getAttribute(ResAttribute.TYPE);
        if (datatype != undefined) {
            artLiteralRes.setDatatype(datatype);
        }
        var lang: string = literalElement.getAttribute(ResAttribute.LANG);
        if (lang != undefined) {
            artLiteralRes.setLang(lang);
        }
        //optional properties
        var show = literalElement.getAttribute(ResAttribute.SHOW);
        if (show != undefined) {
            artLiteralRes.setAdditionalProperty(ResAttribute.SHOW, show);
        }
        var explicit = literalElement.getAttribute(ResAttribute.EXPLICIT);
        if (explicit != undefined) {
            artLiteralRes.setAdditionalProperty(ResAttribute.EXPLICIT, (explicit == "true"));
        }
        var graphs = literalElement.getAttribute(ResAttribute.GRAPHS);//contains comma separated graphs
        if (graphs != undefined) {
            artLiteralRes.setAdditionalProperty(ResAttribute.GRAPHS, graphs);
        }

        return artLiteralRes;
    }

    /**
     * Creates an ARTResource from an xml Element
     */
    private static createRDFResourceXML(resource: Element): ARTResource {
        var tagName = resource.tagName;
        if (tagName == 'uri') {
            return this.createURIXML(resource);
        } else if (tagName == 'bnode') {
            return this.createBlankNodeXML(resource);
        } else {
            throw new Error("Not a RDFResource");
        }
    }

    private static createRDFNodeXML(node: Element): ARTNode {
        var tagName = node.tagName;
        if (tagName == 'uri' || tagName == 'bnode') {
            return this.createRDFResourceXML(node);
        } else if (tagName == 'plainLiteral' || tagName == 'typedLiteral') {
            return this.createLiteralXML(node);
        } else {
            throw new Error("Not a RDFNode");
        }
    }

    /**
     * creates an array of only ARTURIResource from a <collection> element.
     */
    private static createURIArrayXML(response: Element): ARTURIResource[] {
        var uriResourceArray: ARTURIResource[] = new Array();
        var collectionElement = response.getElementsByTagName('collection')[0];
        var uriElemens = collectionElement.getElementsByTagName('uri');
        for (var i = 0; i < uriElemens.length; i++) {
            uriResourceArray.push(this.createURIXML(uriElemens[i]))
        }
        return uriResourceArray;
    }

    /**
     * creates an array of ARTURIResource and ARTResource from a <collection> element.
     */
    private static createResourceArrayXML(response: Element): ARTResource[] {
        var resourceArray: ARTResource[] = new Array();
        var childElements = response.getElementsByTagName('collection')[0].children;
        for (var i = 0; i < childElements.length; i++) {
            if (childElements[i].tagName == "uri") {
                resourceArray.push(this.createURIXML(childElements[i]));
            } else if (childElements[i].tagName == "bnode") {
                resourceArray.push(this.createBlankNodeXML(childElements[i]));
            }
        }
        return resourceArray;
    }

    /**
     * creates an array of mixed resources (ARTBNode, ARTLiteral, ARTURIResource)
     * from a <collection> element.
     */
    private static createRDFNodeArrayXML(response: Element): ARTNode[] {
        var collectionElement = response.getElementsByTagName('collection')[0];
        var childElements = collectionElement.children;
        if (typeof childElements.length == "undefined") {
            return null;
        }
        var collectionArray: ARTNode[] = new Array();
        for (var i = 0; i < childElements.length; i++) {
            collectionArray.push(this.createRDFNodeXML(childElements[i]));
        }
        return collectionArray;
    };

    private static createPredicateObjectsListXML(element: Element): ARTPredicateObjects[] {
        if (element.tagName != "collection") {
            throw new Error("Not a collection");
        }
        var elements = element.children;
        var result: ARTPredicateObjects[] = [];
        for (var i = 0; i < elements.length; i++) {
            var el = elements[i];
            if (el.tagName != "predicateObjects") {
                continue;
            }
            var predicate = this.createURIXML(el.getElementsByTagName("predicate")[0].children[0]);
            var objects = this.createRDFNodeArrayXML(el.getElementsByTagName("objects")[0]);
            var predicateObjects = new ARTPredicateObjects(predicate, objects);
            result.push(predicateObjects);
        }
        return result;
    };

    //########### JSON IMPLEMENTATIONS ###########

    /**
     * Creates an ARTURIResource from a Json Object {"@id": string, "show": string, "role": string, ...other optional attributes}
     */
    private static createURIJSON(uri: any): ARTURIResource {
        var id: string = uri['@id'];
        var show: string = uri[ResAttribute.SHOW];
        var uriRes: ARTURIResource = new ARTURIResource(id, show);
        //other properties
        this.parseNodeOptionalProperties(uri, uriRes);

        return uriRes;
    }

    private static createBlankNodeJSON(bnode: any): ARTBNode {
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
            node.setAdditionalProperty(ResAttribute.MEMBERS, this.createResourceArrayJSON(members));
        }
        var index: any = resJson[ResAttribute.INDEX];
        if (index != undefined) {
            node.setAdditionalProperty(ResAttribute.INDEX, this.createLiteralJSON(index));
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

    private static createLiteralJSON(literal: any): ARTLiteral {
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

    private static createRDFResourceJSON(resource: any): ARTResource {
        var resId = resource['@id'];
        if (resource['@id'] != undefined) {
            if (resId.startsWith('_:')) {
                return this.createBlankNodeJSON(resource);
            } else {
                return this.createURIJSON(resource);
            }
        } else {
            throw new Error("Not a RDFResource");
        }
    }

    private static createRDFNodeJSON(node: any): ARTNode {
        var nodeId: string = node['@id']; //resource
        var nodeValue: string = node['@value']; //literal
        if (nodeId != undefined) {
            return this.createRDFResourceJSON(node);
        } else if (nodeValue != undefined) {
            return this.createLiteralJSON(node);
        } else {
            throw new Error("Not a RDFNode");
        }
    }

    /**
     * creates an array of only ARTURIResource from a json result
     */
    private static createURIArrayJSON(result: Array<any>): ARTURIResource[] {
        var uriResourceArray: ARTURIResource[] = new Array();
        for (var i = 0; i < result.length; i++) {
            uriResourceArray.push(this.createURIJSON(result[i]));
        }
        return uriResourceArray;
    }

    private static createResourceArrayJSON(resArray: any[]): ARTResource[] {
        var resourceArray: ARTResource[] = new Array();
        for (var i = 0; i < resArray.length; i++) {
            resourceArray.push(this.createRDFResourceJSON(resArray[i]));
        }
        return resourceArray;
    }

    public static createLiteralArray(result: Array<any>): ARTLiteral[] {
        var literalArray: ARTLiteral[] = new Array();
        for (var i = 0; i < result.length; i++) {
            literalArray.push(this.createLiteralJSON(result[i]));
        }
        return literalArray;
    }

    private static createRDFNodeArrayJSON(nodeArray: any) {
        var collectionArray: ARTNode[] = new Array();
        for (var i = 0; i < nodeArray.length; i++) {
            collectionArray.push(this.createRDFNodeJSON(nodeArray[i]));
        }
        return collectionArray;
    }

    private static createPredicateObjectsListJSON(poList: any): ARTPredicateObjects[] {
        var result: ARTPredicateObjects[] = [];
        for (var i = 0; i < poList.length; i++) {
            var predicate = this.createURIJSON(poList[i].predicate);
            var objects = this.createRDFNodeArrayJSON(poList[i].objects);
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

}