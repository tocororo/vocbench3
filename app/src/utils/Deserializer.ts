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
		var explicit = uriElement.getAttribute('explicit') == "true";
		var deleteForbidden = uriElement.getAttribute('deleteForbidden') == "true";
		var more = uriElement.getAttribute('more');
		var role = uriElement.getAttribute('role');
		var numInst = uriElement.getAttribute("numInst");
		var hasCustomRange = uriElement.getAttribute("hasCustomRange") == "true";//indicates if a property has a CustomRange
		var resourcePosition = uriElement.getAttribute("resourcePosition");//indicates the position of the resource
		var lang = uriElement.getAttribute("lang");//indicates the language of an xLabel
		
		var artURIRes = new ARTURIResource(uri, show, role);
		artURIRes.setAdditionalProperty("explicit", explicit); 
		artURIRes.setAdditionalProperty("deleteForbidden", deleteForbidden);
		artURIRes.setAdditionalProperty("more", more); 
		artURIRes.setAdditionalProperty("numInst", numInst);
		artURIRes.setAdditionalProperty("hasCustomRange", hasCustomRange);
		artURIRes.setAdditionalProperty("resourcePosition", resourcePosition);
		artURIRes.setAdditionalProperty("lang", lang);
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
		var explicit = bnodeElement.getAttribute('explicit') == "true";
		var resourcePosition = bnodeElement.getAttribute("resourcePosition");//indicates the position of the resource
		var lang = bnodeElement.getAttribute("lang");//indicates the language of an xLabel

		var bNodeRes = new ARTBNode(id, show, role);
		bNodeRes.setAdditionalProperty("explicit", explicit);
		bNodeRes.setAdditionalProperty("resourcePosition", resourcePosition);
		bNodeRes.setAdditionalProperty("lang", lang);
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
		var show = literalElement.getAttribute("show");
		var explicit = literalElement.getAttribute('explicit') == "true";
		
		var artLiteralRes = new ARTLiteral(label, datatype, lang, isTypedLiteral);
		artLiteralRes.setAdditionalProperty("show", show);
		artLiteralRes.setAdditionalProperty("explicit", explicit);
		return artLiteralRes;
	}
	
	createRDFNode(element): ARTNode {
		var tagName = element.tagName;
		if (tagName == 'uri'){
			return this.createURI(element);
		} else if(tagName == 'bnode'){
			return this.createBlankNode(element);
		} else if(tagName == 'plainLiteral' || tagName == 'typedLiteral'){ 
			return this.createLiteral(element);
		} else {
			throw new Error("Not a RDFNode");
		}
	}
	
	createRDFResource(element) {
		var tagName = element.tagName;
		if(tagName == 'uri' || tagName == 'bnode'){
			return this.createRDFNode(element);
		} else {
			throw new Error("Not a RDFResource");
		}
	}
	
	createPredicateObjectsList(element) {
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