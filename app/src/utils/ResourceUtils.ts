import {Injectable} from 'angular2/core';
import {ARTNode, ARTResource, ARTURIResource, ARTBNode, ARTLiteral, ARTPredicateObjects} from "./ARTResources";

@Injectable()
export class ResourceUtils {
    
    getImageSrc(rdfResource:ARTNode):string {
		var imgSrc;
		if (rdfResource.isResource()) {
			var role = (<ARTResource>rdfResource).getRole().toLowerCase();
			var explicit = rdfResource.getAdditionalProperty("explicit");
			if (role == "cls") {
				if (explicit) {
					imgSrc = "app/assets/images/class.png";
				} else {
					imgSrc = "app/assets/images/class_imported.png";
				}
			} else if (role == "concept") {
				if (explicit) {
					imgSrc = "app/assets/images/concept.png";
				} else {
					imgSrc = "app/assets/images/concept_imported.png";
				}
            } else if (role == "individual") {
                if (explicit) {
					imgSrc = "app/assets/images/individual.png";
				} else {
					imgSrc = "app/assets/images/individual_imported.png";
				}
			} else if (role == "conceptscheme") {
				imgSrc = "app/assets/images/conceptScheme.png"; 
			} else if (role == "objectproperty") {
				if (explicit) {
					imgSrc = "app/assets/images/propObject.png";
				} else {
					imgSrc = "app/assets/images/propObject_imported.png";
				}
            } else if (role == "datatypeproperty") {
				if (explicit) {
					imgSrc = "app/assets/images/propDatatype.png";
				} else {
					imgSrc = "app/assets/images/propDatatype_imported.png";
				}
			} else if (role == "annotationproperty") {
				if (explicit) {
					imgSrc = "app/assets/images/propAnnotation.png";
				} else {
					imgSrc = "app/assets/images/propAnnotation_imported.png";
				}
			} else if (role == "ontologyproperty") {
				if (explicit) {
					imgSrc = "app/assets/images/propOntology.png";
				} else {
					imgSrc = "app/assets/images/propOntology_imported.png";
				}
			} else if (role == "property") {
				if (explicit) {
					imgSrc = "app/assets/images/prop.png";
				} else {
					imgSrc = "app/assets/images/prop_imported.png";
				}
			}
		} else if (rdfResource.isLiteral()) {
			var lang = (<ARTLiteral>rdfResource).getLang();
			if (lang != undefined && lang != "") {
				imgSrc = "app/assets/images/flags/flag_" + lang + ".png";
			} else {
				imgSrc = "app/assets/images/flags/flag_unknown.png";
			}
		}
		return imgSrc;
	};
    
}