import { Component, Input, SimpleChanges } from "@angular/core";
import { ARTLiteral, ARTNode, ARTResource, ARTURIResource, RDFResourceRolesEnum, ResAttribute, ResourceUtils } from "../../models/ARTResources";
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

	private resourceWithLang: boolean = false; //true if resource is a literal (or a skosxl:Label) with language
	private langFlagAvailable: boolean = false; //true if the language has a flag icon available (used only if resourceWithLang is true)
	private lang: string; //language of the resource (used only if resourceWithLang is true)

	private literalWithLink: boolean = false; //true if the resource is a literal which contains url
	private splittedLiteral: string[]; //when literalWithLink is true, even elements are plain text, odd elements are url

	private imgSrc: string; //src of the image icon

	constructor(private preferences: VBProperties) { }

	ngOnChanges(changes: SimpleChanges) {
		if (changes['resource'] && changes['resource'].currentValue) {
			this.initImgSrc();
			this.resourceWithLang = this.isResourceWithLang();
			if (this.resourceWithLang) {
				this.lang = this.getLang();
				this.langFlagAvailable = this.isLangFlagAvailable();
			}
			this.initLiteralWithLink();
			this.initRenderingClass();
		}
	}

	/**
	 * Initializes the source of the icon image
	 */
	private initImgSrc() {
		this.imgSrc = UIUtils.getImageSrc(this.resource);
	}

	/**
	 * Initializes the class of the resource text: green if the resource is in the staging-add-graph, red if it's in the staging-remove-graph
	 */
	private initRenderingClass() {
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

	/**
	 * returns true if the current resource has language: it could be a literal with language or
	 * a skosxl:Label with language
	 */
	private isResourceWithLang(): boolean {
		var lang: string;
		if (this.resource.isResource()) {
			var role = (<ARTResource>this.resource).getRole();
			if (role == RDFResourceRolesEnum.xLabel || role == RDFResourceRolesEnum.mention) {
				//in case of CustomForm preview, the resource is a mention (doesn't have a role) but it could be have a language
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
	private getLang(): string {
		let lang: string = null;
		if (this.resource.isResource()) {
			var role = (<ARTResource>this.resource).getRole();
			//in case of CustomForm preview, the resource is a mention (doesn't have a role) but it could be have a language
			if (role == RDFResourceRolesEnum.xLabel || role == RDFResourceRolesEnum.mention) {
				lang = this.resource.getAdditionalProperty(ResAttribute.LANG);
			}
		} else if (this.resource.isLiteral()) {
			lang = (<ARTLiteral>this.resource).getLang();
		}
		return lang;
	}

	/**
	 * Returns true if the current resource langTag has a flag image available and the show_flag is true.
	 * This method should be called only for resource with lang, so it should depend from isResourceWithLang
	 */
	private isLangFlagAvailable(): boolean {
		if (this.preferences.getShowFlags()) {
			//just check if the image name doesn't contains "unknown" since the image name for unavailable flag is flag_unknown.png
			return !this.imgSrc.includes("unknown");
		} else {
			return false; //if the show_flag preference is false, show always the langTag
		}
	}

	/**
	 * If the resource is a literal with a link, splits the literal value so it can be rendered with different elements
	 * like <span> for plain text (even elements of array) or <a> for url (odd elements)
	 */
	private initLiteralWithLink() {
		this.literalWithLink = false;
		if (this.resource instanceof ARTLiteral) {
			let value = this.resource.getValue();
			let regexToken = /(((ftp|https?):\/\/)[\-\w@:%_\+.~#?,&\/\/=]+)|((mailto:)?[_.\w-]+@([\w][\w\-]+\.)+[a-zA-Z]{2,3})/g;
			let urlArray: string[] = [];

			let matchArray;
			while ((matchArray = regexToken.exec(value)) !== null) {
				urlArray.push(matchArray[0]);
			}

			if (urlArray.length > 0) {
				this.literalWithLink = true;
				this.splittedLiteral = [];
				let idx: number = 0;
				for (var i = 0; i < urlArray.length; i++) {
					let urlStartIdx: number = value.indexOf(urlArray[i]);
					let urlEndIdx: number = value.indexOf(urlArray[i]) + urlArray[i].length;
					this.splittedLiteral.push(value.substring(idx, urlStartIdx)); //what there is before url
					this.splittedLiteral.push(value.substring(urlStartIdx, urlEndIdx)); //url
					idx = urlEndIdx;
					//what there is between url and the end of the string
					if (urlArray[i+1] == null && idx != value.length) { //if there is no further links but there is text after last url
						this.splittedLiteral.push(value.substring(idx, value.length));
					}
				}
			}
		}
	}

	private getRendering(): string {
		return ResourceUtils.getRendering(this.resource, this.rendering);
	}

	private getUnknownFlagImgSrc(): string {
		//pass an invalid langTag so the method returns the empty flag image source
		return UIUtils.getFlagImgSrc("unknown");
	}

	/**
	 * Tells if the described resource is explicit.
	 * Useful for flag icons since they have not the "transparent" version (as for the concept/class/property... icons)
	 */
	private isExplicit(): boolean {
		return this.resource.getAdditionalProperty(ResAttribute.EXPLICIT) || 
			this.resource.getAdditionalProperty(ResAttribute.EXPLICIT) == undefined;
	}

}
