import { Component, Input } from "@angular/core";
import { ARTNode, ARTResource, ARTLiteral, RDFResourceRolesEnum, ResAttribute } from "../../utils/ARTResources";
import { ResourceUtils } from "../../utils/ResourceUtils";

@Component({
	selector: "rdf-resource",
	templateUrl: "./rdfResourceComponent.html",
})
export class RdfResourceComponent {
	@Input() resource: ARTNode;

	constructor() { }

	private getImgSrc() {
		return ResourceUtils.getImageSrc(this.resource);
	}

	/**
	 * Returns true if the current resource has language: it could be a literal with language or
	 * a skosxl:Label with language
	 */
	private isResourceWithLang() {
		var lang: string;
		if (this.resource.isResource()) {
			var role = (<ARTResource>this.resource).getRole().toLowerCase();
			if (role == RDFResourceRolesEnum.xLabel.toLowerCase()) {
				lang = this.resource.getAdditionalProperty(ResAttribute.LANG);
			}
		} else if (this.resource.isLiteral()) {
			lang = (<ARTLiteral>this.resource).getLang();
		}
		return (lang != undefined && lang != null && lang != "");
	}

	/**
	 * Returns the language tag of the current resource in order to show it as title of resource icon (flag)
	 * Note: this should be used in template only when isResourceWithLang returns true
	 */
	private getLang() {
		var lang: string;
		if (this.resource.isResource()) {
			var role = (<ARTResource>this.resource).getRole().toLowerCase();
			if (role == RDFResourceRolesEnum.xLabel.toLowerCase()) {
				lang = this.resource.getAdditionalProperty(ResAttribute.LANG);
			}
		} else if (this.resource.isLiteral()) {
			lang = (<ARTLiteral>this.resource).getLang();
		}
		return lang;
	}

	/**
	 * Returns true if the current resource has instances. Useful to show instances number next to the resource (class)
	 */
	private hasInstance() {
		return (this.resource.isResource() &&
			this.resource.getAdditionalProperty(ResAttribute.NUM_INST) &&
			this.resource.getAdditionalProperty(ResAttribute.NUM_INST) != "0");
	}

}