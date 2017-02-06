import { Component, Input } from "@angular/core";
import { ARTNode, ARTResource, ARTURIResource, ARTLiteral, RDFResourceRolesEnum, ResAttribute } from "../../utils/ARTResources";
import { ResourceUtils } from "../../utils/ResourceUtils";

@Component({
	selector: "rdf-resource",
	templateUrl: "./rdfResourceComponent.html",
})
export class RdfResourceComponent {
	@Input() resource: ARTNode;
	@Input() rendering: boolean = true; //if true the resource should be rendered with the show, with the qname otherwise

	constructor() { }

	private getRendering(): string {
		if (this.rendering) {
			return this.resource.getShow();	
		} else {
			if (this.resource.isURIResource()) {
				let qname = this.resource.getAdditionalProperty(ResAttribute.QNAME);
				if (qname != undefined) {
					return qname;
				} else {
					return (<ARTURIResource>this.resource).getURI();
				}
			} else {
				return this.resource.getShow();
			}
		}
	}

	private getImgSrc(): string {
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
	 * Returns true if the current resource langTag has a flag image available.
	 * This method should be called only for resource with lang, so it should depend from isResourceWithLang
	 */
	private isLangFlagAvailable(): boolean {
		//just check if the image name doesn't contains "unknown" since the image name for unavailable flag is flag_unknown.png
		return !this.getImgSrc().includes("unknown");
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
	 * Tells if the described resource is explicit.
	 * Useful for flag icons since they have not the "transparent" version (as for the concept/class/property... icons)
	 */
	private isExplicit(): boolean {
		return this.resource.getAdditionalProperty(ResAttribute.EXPLICIT);
	}

}