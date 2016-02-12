import {Injectable} from 'angular2/core';
import {ARTNode, ARTURIResource, ARTBNode, ARTLiteral, ARTPredicateObjects} from "./ARTResources";

@Injectable()
export class Deserializer {
    
    createRDFArray(response) {
		var collectionElement = response.getElementsByTagName('collection')[0];
		var childElements = collectionElement.childNodes;
		return this.createRDFArrayGivenList(childElements);
	};
	
	createRDFArrayGivenList(childElements) {
		var collectionArray = new Array(); 
		if(typeof childElements.length == "undefined")
			return null;
		for (var i = 0; i < childElements.length; i++){
			if(childElements[i].nodeType == 1) {// == ELEMENT_NODE
				collectionArray.push(this.createRDFNode(childElements[i]));
			}
		}
		return collectionArray;
	};
	
	createURI(response): ARTURIResource {
		var uriElement;
		if(response.tagName == 'uri') {
			uriElement = response;
		} else {
			uriElement = response.getElementsByTagName('uri')[0];
		}
		
		var uri = uriElement.textContent;
		var show = uriElement.getAttribute('show');
        var role = uriElement.getAttribute('role');
        var artURIRes = new ARTURIResource(uri, show, role);
        
        //optional properties
		var explicit = uriElement.getAttribute('explicit');
        if (explicit != undefined) {
             artURIRes.setAdditionalProperty("explicit", (explicit == "true"));
        }
		var deleteForbidden = uriElement.getAttribute('deleteForbidden');
        if (deleteForbidden != undefined) {
            artURIRes.setAdditionalProperty("deleteForbidden", (deleteForbidden == "true"));
        }
		var more = uriElement.getAttribute('more');
        if (more != undefined) {
            artURIRes.setAdditionalProperty("more", more); 
        }
		var numInst = uriElement.getAttribute("numInst");
        if (numInst != undefined) {
            artURIRes.setAdditionalProperty("numInst", numInst);
        }
		var hasCustomRange = uriElement.getAttribute("hasCustomRange") == "true";//indicates if a property has a CustomRange
        if (hasCustomRange != undefined) {
            artURIRes.setAdditionalProperty("hasCustomRange", hasCustomRange);
        }
		var resourcePosition = uriElement.getAttribute("resourcePosition");//indicates the position of the resource
        if (resourcePosition != undefined) {
            artURIRes.setAdditionalProperty("resourcePosition", resourcePosition);
        }
		var lang = uriElement.getAttribute("lang");//indicates the language of an xLabel
        if (lang != undefined) {
            artURIRes.setAdditionalProperty("lang", lang);
        }
		
		return artURIRes;
	}
	
	createBlankNode(bnodeElement): ARTBNode {
		var bnodeElement;
		if(bnodeElement.tagName == 'bnode') {
			bnodeElement = bnodeElement;
		} else {
			bnodeElement = bnodeElement.getElementsByTagName('bnode')[0];
		}
		
		var id = bnodeElement.textContent;
		var show = bnodeElement.getAttribute("show");
		var role = bnodeElement.getAttribute('role');
        var bNodeRes = new ARTBNode(id, show, role);
        
        //optional properties
		var explicit = bnodeElement.getAttribute('explicit');
        if (explicit != undefined) {
             bNodeRes.setAdditionalProperty("explicit", (explicit == "true"));
        }
        var resourcePosition = bnodeElement.getAttribute("resourcePosition");//indicates the position of the resource
        if (resourcePosition != undefined) {
            bNodeRes.setAdditionalProperty("resourcePosition", resourcePosition);
        }
		var lang = bnodeElement.getAttribute("lang");//indicates the language of an xLabel
        if (lang != undefined) {
            bNodeRes.setAdditionalProperty("lang", lang);
        }

		return bNodeRes;
	}
	
	createLiteral(response): ARTLiteral{
		var isTypedLiteral;
		var literalElement;
		if(response.tagName == 'plainLiteral' || response.tagName == 'typedLiteral') {
			literalElement = response;
		} else {
			literalElement = response.getElementsByTagName('typedLiteral');
			if(literalElement.lenght != 0) {
				literalElement = response.getElementsByTagName('typedLiteral')[0];
				isTypedLiteral = true;
			} else {
				literalElement = response.getElementsByTagName('plainLiteral')[0];
				isTypedLiteral = false;
			}
		}
		
		var label = literalElement.textContent;
		var datatype;
		if (isTypedLiteral) {
			datatype = literalElement.getAttribute("type");
		} else {
			datatype = "";
		}
		var lang;
		if(isTypedLiteral) {
			lang = "";
		} else {
			lang = literalElement.getAttribute("lang");
		}
		var artLiteralRes = new ARTLiteral(label, datatype, lang, isTypedLiteral);
        //optional properties
        var show = literalElement.getAttribute("show");
        if (show != undefined) {
             artLiteralRes.setAdditionalProperty("show", show);
        }
		var explicit = literalElement.getAttribute('explicit');
        if (explicit != undefined) {
             artLiteralRes.setAdditionalProperty("explicit", (explicit == "true"));
        }
        
		return artLiteralRes;
	}
	
    createRDFNode(element): ARTNode {
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
	
	createRDFResource(element): ARTNode {
		var tagName = element.tagName;
		if(tagName == 'uri' || tagName == 'bnode'){
			return this.createRDFNode(element);
		} else {
			throw new Error("Not a RDFResource");
		}
	}
	
	createPredicateObjectsList(element): ARTPredicateObjects[] {
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