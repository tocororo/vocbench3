import {ARTNode, ARTURIResource, ARTResource, ARTBNode, ARTLiteral, ARTPredicateObjects, ResAttribute} from "./ARTResources";

export class Deserializer {
    
    /**
     * creates an array of mixed resources (ARTBNode, ARTLiteral, ARTURIResource)
     * from a <collection> element.
     */
    static createRDFArray(response): ARTNode[] {
		var collectionElement = response.getElementsByTagName('collection')[0];
		var childElements = collectionElement.childNodes;
		return this.createRDFArrayGivenList(childElements);
	};
    
    /**
     * creates an array of mixed resources (ARTBNode, ARTLiteral, ARTURIResource)
     */
    static createRDFArrayGivenList(childElements): ARTNode[] {
        var collectionArray: ARTNode[] = new Array();
        if (typeof childElements.length == "undefined")
            return null;
        for (var i = 0; i < childElements.length; i++) {
            if (childElements[i].nodeType == 1) {// == ELEMENT_NODE
                collectionArray.push(this.createRDFNode(childElements[i]));
            }
        }
        return collectionArray;
    };
    
    /**
     * creates an array of only ARTURIResource from a <collection> element.
     */
    static createURIArray(response): ARTURIResource[] {
        var uriResourceArray: ARTURIResource[] = new Array();
        var collectionElement = response.getElementsByTagName('collection')[0];
		var uriElemens = collectionElement.getElementsByTagName('uri');
        for (var i = 0; i < uriElemens.length; i++) {
            uriResourceArray.push(this.createURI(uriElemens[i]))
        }
        return uriResourceArray;
    }
    
    /**
     * creates an array of ARTURIResource
     */
    static createURIArrayGivenList(childElements): ARTURIResource[] {
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
	
	static createURI(response): ARTURIResource {
		var uriElement;
		if(response.tagName == 'uri') {
			uriElement = response;
		} else {
			uriElement = response.getElementsByTagName('uri')[0];
		}
		
		var uri = uriElement.textContent;
		var show = uriElement.getAttribute(ResAttribute.SHOW);
        var role = uriElement.getAttribute(ResAttribute.ROLE);
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
	
	static createBlankNode(bnodeElement): ARTBNode {
		var bnodeElement;
		if(bnodeElement.tagName == 'bnode') {
			bnodeElement = bnodeElement;
		} else {
			bnodeElement = bnodeElement.getElementsByTagName('bnode')[0];
		}
		
		var id = bnodeElement.textContent;
		var show = bnodeElement.getAttribute(ResAttribute.SHOW);
		var role = bnodeElement.getAttribute(ResAttribute.ROLE);
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
	
    static createLiteral(response): ARTLiteral {
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
	
    static createRDFNode(element): ARTNode {
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
	
	static createRDFResource(element): ARTResource {
		var tagName = element.tagName;
		if(tagName == 'uri' || tagName == 'bnode'){
			return <ARTResource>this.createRDFNode(element);
		} else {
			throw new Error("Not a RDFResource");
		}
	}
	
	static createPredicateObjectsList(element): ARTPredicateObjects[] {
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
    
}