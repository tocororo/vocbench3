import {
    ARTNode, ARTURIResource, ARTResource, ARTBNode, ARTLiteral, ARTPredicateObjects,
    ResAttribute, RDFResourceRolesEnum
} from "./ARTResources";
import { User } from "./User";

export class Deserializer {

    /**
     * creates an array of mixed resources (ARTBNode, ARTLiteral, ARTURIResource)
     * from a <collection> element.
     */
    static createRDFArray(response: Element): ARTNode[] {
        var collectionElement = response.getElementsByTagName('collection')[0];
        var childElements = collectionElement.children;
        return this.createRDFArrayGivenList(childElements);
    };

    /**
     * creates an array of mixed resources (ARTBNode, ARTLiteral, ARTURIResource)
     */
    static createRDFArrayGivenList(childElements: HTMLCollection): ARTNode[] {
        var collectionArray: ARTNode[] = new Array();
        if (typeof childElements.length == "undefined")
            return null;
        for (var i = 0; i < childElements.length; i++) {
            collectionArray.push(this.createRDFNode(childElements[i]));
        }
        return collectionArray;
    };

    /**
     * creates an array of ARTURIResource and ARTResource from a <collection> element.
     */
    static createResourceArray(response: Element): ARTResource[] {
        var resourceArray: ARTResource[] = new Array();
        var childElements = response.getElementsByTagName('collection')[0].children;
        for (var i = 0; i < childElements.length; i++) {
            if (childElements[i].tagName == "uri") {
                resourceArray.push(this.createURI(childElements[i]));
            } else if (childElements[i].tagName == "bnode") {
                resourceArray.push(this.createBlankNode(childElements[i]));
            }
        }
        return resourceArray;
    }

    /**
     * creates an array of ARTURIResource and ARTResource 
     */
    static createResourceArrayGivenList(childElements: HTMLCollection): ARTResource[] {
        var collectionArray: ARTResource[] = new Array();
        if (typeof childElements.length == "undefined")
            return null;
        for (var i = 0; i < childElements.length; i++) {
            if (childElements[i].nodeType == 1) {// == ELEMENT_NODE
                if (childElements[i].tagName == "uri") {
                    collectionArray.push(this.createURI(childElements[i]));
                } else if (childElements[i].tagName == "bnode") {
                    collectionArray.push(this.createBlankNode(childElements[i]));
                }
            }
        }
        return collectionArray;
    };

    static createURIArray(response: any): ARTURIResource[] {
        if (response instanceof Element) {
            return this.createURIArrayFromXML(response);
        } else { //new json response
            return this.createURIArrayFromJson(response);
        }
    }

    /**
     * creates an array of only ARTURIResource from a <collection> element.
     */
    static createURIArrayFromXML(response: Element): ARTURIResource[] {
        var uriResourceArray: ARTURIResource[] = new Array();
        var collectionElement = response.getElementsByTagName('collection')[0];
        var uriElemens = collectionElement.getElementsByTagName('uri');
        for (var i = 0; i < uriElemens.length; i++) {
            uriResourceArray.push(this.createURI(uriElemens[i]))
        }
        return uriResourceArray;
    }

    /**
     * creates an array of only ARTURIResource from a json result
     */
    static createURIArrayFromJson(result: Array<any>): ARTURIResource[] {
        var uriResourceArray: ARTURIResource[] = new Array();
        for (var i = 0; i < result.length; i++) {
            uriResourceArray.push(this.createURI(result[i]));
        }
        return uriResourceArray;
    }

    /**
     * creates an array of ARTURIResource
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

    static createURI(response: any): ARTURIResource {
        if (response instanceof Element) {
            return this.createURIFromXML(response);
        } else {
            return this.createURIFromJson(response);
        }
    }

    static createURIFromXML(response: Element): ARTURIResource {
        var uriElement;
        if (response.tagName == 'uri') {
            uriElement = response;
        } else {
            uriElement = response.getElementsByTagName('uri')[0];
        }

        var uri = uriElement.textContent;
        var show = uriElement.getAttribute(ResAttribute.SHOW);
        var role: RDFResourceRolesEnum = <RDFResourceRolesEnum> uriElement.getAttribute(ResAttribute.ROLE);
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
            artURIRes.setAdditionalProperty(ResAttribute.NUM_INST, parseInt(numInst));
        }
        var hasCustomRange = uriElement.getAttribute(ResAttribute.HAS_CUSTOM_RANGE);//indicates if a property has a CustomRange
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

    static createURIFromJson(jsonObj: any): ARTURIResource {

        var uri = jsonObj['@id'];
        var show = jsonObj[ResAttribute.SHOW];
        var role: RDFResourceRolesEnum = <RDFResourceRolesEnum> jsonObj[ResAttribute.ROLE];
        var artURIRes = new ARTURIResource(uri, show, role);

        //optional properties
        // var explicit = jsonObj[ResAttribute.EXPLICIT];
        // if (explicit != undefined) {
        //     artURIRes.setAdditionalProperty(ResAttribute.EXPLICIT, explicit);
        // }
        var more = jsonObj[ResAttribute.MORE];
        if (more != undefined) {
            artURIRes.setAdditionalProperty(ResAttribute.MORE, more);
        }
        // var numInst = jsonObj[ResAttribute.NUM_INST];
        // if (numInst != undefined) {
        //     artURIRes.setAdditionalProperty(ResAttribute.NUM_INST, numInst);
        // }
        // var hasCustomRange = jsonObj[ResAttribute.HAS_CUSTOM_RANGE];
        // if (hasCustomRange != undefined) {
        //     artURIRes.setAdditionalProperty(ResAttribute.HAS_CUSTOM_RANGE, hasCustomRange);
        // }
        // var resourcePosition = jsonObj[ResAttribute.RESOURCE_POSITION];
        // if (resourcePosition != undefined) {
        //     artURIRes.setAdditionalProperty(ResAttribute.RESOURCE_POSITION, resourcePosition);
        // }
        // var lang = jsonObj[ResAttribute.LANG];
        // if (lang != undefined) {
        //     artURIRes.setAdditionalProperty(ResAttribute.LANG, lang);
        // }
        // var graphs = jsonObj[ResAttribute.GRAPHS];
        // if (graphs != undefined) {
        //     artURIRes.setAdditionalProperty(ResAttribute.GRAPHS, graphs);
        // }

        return artURIRes;
    }

    static createBlankNode(bnodeElement: Element): ARTBNode {
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

    static createLiteral(response: Element): ARTLiteral {
        var isTypedLiteral;
        var literalElement;
        if (response.tagName == 'plainLiteral' || response.tagName == 'typedLiteral') {
            literalElement = response;
        } else {
            literalElement = response.getElementsByTagName('typedLiteral');
            if (literalElement.length != 0) {
                literalElement = response.getElementsByTagName('typedLiteral')[0];
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
        var datatype;
        if (isTypedLiteral) {
            datatype = literalElement.getAttribute(ResAttribute.TYPE);
        } else {
            datatype = "";
        }
        var lang;
        if (isTypedLiteral) {
            lang = "";
        } else {
            lang = literalElement.getAttribute(ResAttribute.LANG);
        }
        var artLiteralRes = new ARTLiteral(label, datatype, lang, isTypedLiteral);
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

    static createRDFNode(element: Element): ARTNode {
        var tagName = element.tagName;
        if (tagName == 'uri') {
            return this.createURI(element);
        } else if (tagName == 'bnode') {
            return this.createBlankNode(element);
        } else if (tagName == 'plainLiteral' || tagName == 'typedLiteral') {
            return this.createLiteral(element);
        } else {
            throw new Error("Not a RDFNode");
        }
    }

    static createRDFResource(element: Element): ARTResource {
        var tagName = element.tagName;
        if (tagName == 'uri' || tagName == 'bnode') {
            return <ARTResource>this.createRDFNode(element);
        } else {
            throw new Error("Not a RDFResource");
        }
    }

    static createPredicateObjectsList(element: Element): ARTPredicateObjects[] {
        if (element.tagName != "collection") {
            throw new Error("Not a collection");
        }
        var elements = element.children;
        var result = [];
        for (var i = 0; i < elements.length; i++) {
            var el = elements[i];
            if (el.tagName != "predicateObjects") {
                continue;
            }
            var predicate = this.createURI(el.getElementsByTagName("predicate")[0].children[0]);
            var objects = this.createRDFArray(el.getElementsByTagName("objects")[0]);
            var predicateObjects = new ARTPredicateObjects(predicate, objects);
            result.push(predicateObjects);
        }
        return result;
    };

    static createUser(resp): User {
        if (resp.user) {
            var user = new User(resp.user.email, resp.user.firstName, resp.user.lastName, resp.user.roles);
            if (resp.user.birthday != undefined) {
                user.setBirthday(resp.user.birthday);
            }
            if (resp.user.phone != undefined) {
                user.setPhone(resp.user.phone);
            }
            if (resp.user.gender != undefined) {
                user.setGender(resp.user.gender)
            }
            if (resp.user.country != undefined) {
                user.setCountry(resp.user.country);
            }
            if (resp.user.address != undefined) {
                user.setAddress(resp.user.address);
            }
            if (resp.user.registrationDate != undefined) {
                user.setRegistrationDate(resp.user.registrationDate);
            }
            if (resp.user.affiliation != undefined) {
                user.setAffiliation(resp.user.affiliation);
            }
            if (resp.user.url != undefined) {
                user.setUrl(resp.user.ur);
            }
            return user;
        } else {
            return null;
        }
    }

}