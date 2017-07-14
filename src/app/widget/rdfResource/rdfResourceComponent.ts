import { Component, Input, SimpleChanges } from "@angular/core";
import { ARTNode, ARTResource, ARTURIResource, ARTLiteral, RDFResourceRolesEnum, ResAttribute, ResourceUtils } from "../../models/ARTResources";
import { SemanticTurkey } from "../../models/Vocabulary";
import { UIUtils } from "../../utils/UIUtils";
import { VBProperties } from "../../utils/VBProperties";

@Component({
	selector: "rdf-resource",
	templateUrl: "./rdfResourceComponent.html"
})
export class RdfResourceComponent {
	@Input() resource: ARTNode;
	@Input() rendering: boolean = true; //if true the resource should be rendered with the show, with the qname otherwise

	private renderingClass: string = "";

	constructor(private preferences: VBProperties) { }

	ngOnChanges(changes: SimpleChanges) {
		if (changes['resource'] && changes['resource'].currentValue) {
			let graphs: ARTURIResource[] = this.resource.getGraphs();
			for (var i = 0; i < graphs.length; i++) {
				if (graphs[i].getURI().startsWith(SemanticTurkey.stagingAddGraph)) {
					this.renderingClass = "stagingAdd";
					break;
				} else if (graphs[i].getURI().startsWith(SemanticTurkey.stagingRemoveGraph)) {
					this.renderingClass = "stagingRemove";
					break;
				} else {
					this.renderingClass = "";
				}
			}
		}
	}

	private getRendering(): string {
		return ResourceUtils.getRendering(this.resource, this.rendering);
	}

	private getImgSrc(): string {
		return UIUtils.getImageSrc(this.resource);
	}

	private getUnknownFlagImgSrc(): string {
		//pass an invalid langTag so the method returns the empty flag image source
		return UIUtils.getFlagImgSrc("unknown");
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
	 * Returns true if the current resource langTag has a flag image available and the show_flag is true.
	 * This method should be called only for resource with lang, so it should depend from isResourceWithLang
	 */
	private isLangFlagAvailable(): boolean {
		if (this.preferences.getShowFlags()) {
			//just check if the image name doesn't contains "unknown" since the image name for unavailable flag is flag_unknown.png
			return !this.getImgSrc().includes("unknown");
		} else {
			return false; //if the show_flag preference is false, show always the langTag
		}
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