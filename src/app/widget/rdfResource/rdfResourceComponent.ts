import { Component, Input, SimpleChanges } from "@angular/core";
import { ARTLiteral, ARTNode, ARTResource, RDFResourceRolesEnum, ResAttribute, ResourceNature } from "../../models/ARTResources";
import { XmlSchema } from "../../models/Vocabulary";
import { ResourceUtils } from "../../utils/ResourceUtils";
import { UIUtils } from "../../utils/UIUtils";
import { VBProperties } from "../../utils/VBProperties";

@Component({
    selector: "rdf-resource",
    templateUrl: "./rdfResourceComponent.html"
})
export class RdfResourceComponent {
    @Input() resource: ARTNode;
    @Input() rendering: boolean = true; //if true the resource should be rendered with the show, with the qname otherwise

    private renderingClass: string;
    private renderingLabel: string;

    private lang: string; //language of the resource
    private langFlagAvailable: boolean = false; //true if the language (if any) has a flag icon available

    private literalWithLink: boolean = false; //true if the resource is a literal which contains url
    private splittedLiteral: string[]; //when literalWithLink is true, even elements are plain text, odd elements are url

    private imgSrc: string; //src of the image icon
    private natureTooltip: string;

    constructor(private preferences: VBProperties) { }

    ngOnChanges(changes: SimpleChanges) {
        if (changes['resource'] && changes['resource'].currentValue) {
            this.initRenderingLabel();
            this.initImgSrc();

            this.lang = this.initLang();
            if (this.lang) {
                this.langFlagAvailable = this.isLangFlagAvailable();
            }

            this.initLiteralWithLink();
            this.initRenderingClass();
            this.initNatureTooltip();
        } else if (changes['rendering']) {
            this.initRenderingLabel();
        }
    }

    private initRenderingLabel() {
        this.renderingLabel = ResourceUtils.getRendering(this.resource, this.rendering);
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
        this.renderingClass = "";
        if (this.resource instanceof ARTResource) {
            if (ResourceUtils.isResourceInStagingAdd(this.resource)) {
                this.renderingClass += " proposedAddRes";
            } else if (ResourceUtils.isResourceInStagingRemove(this.resource)) {
                this.renderingClass += " proposedRemoveRes";
            }
        }

        if (ResourceUtils.isTripleInStagingAdd(this.resource)) {
            this.renderingClass += " proposedAddTriple";
        } else if (ResourceUtils.isTripleInStagingRemove(this.resource)) {
            this.renderingClass += " proposedRemoveTriple";
        }
    }

    private initNatureTooltip() {
        this.natureTooltip = null;
        if (this.resource instanceof ARTResource) {
            let natureList: ResourceNature[] = this.resource.getNature();
            let natureListSerlalized: string[] = [];
            natureList.forEach(n => {
                let graphsToNT: string[] = [];
                n.graphs.forEach(g => {
                    graphsToNT.push(g.toNT());
                });
                natureListSerlalized.push(ResourceUtils.getResourceRoleLabel(n.role) + " in: " + graphsToNT.join(", "));
            });
            this.natureTooltip = natureListSerlalized.join("\n\n");
        }
    }

	/**
	 * Returns the language tag of the current resource in order to show it as title of resource icon (flag)
	 */
    private initLang(): string {
        let lang: string = null;
        if (this.resource.isResource()) {
            var role = (<ARTResource>this.resource).getRole();
            //in case of CustomForm preview, the resource is a mention (doesn't have a role) but it could be have a language
            if (role == RDFResourceRolesEnum.xLabel || role == RDFResourceRolesEnum.mention) {
                lang = this.resource.getAdditionalProperty(ResAttribute.LANG);
            }
        } else if (this.resource instanceof ARTLiteral) {
            lang = this.resource.getLang();
            if (this.resource.getDatatype() == XmlSchema.language.getURI()) {
                lang = this.resource.getValue();
            }
        }
        return lang;
    }

	/**
	 * Returns true if the current resource langTag has a flag image available and the show_flag is true.
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
                for (var i = 0; i < urlArray.length; i++) {
                    let idx: number = 0;
                    let urlStartIdx: number = value.indexOf(urlArray[i]);
                    let urlEndIdx: number = value.indexOf(urlArray[i]) + urlArray[i].length;
                    this.splittedLiteral.push(value.substring(idx, urlStartIdx)); //what there is before url
                    this.splittedLiteral.push(value.substring(urlStartIdx, urlEndIdx)); //url
                    idx = urlEndIdx;
                    value = value.substring(idx);
                    //what there is between url and the end of the string
                    if (urlArray[i + 1] == null && idx != value.length) { //if there is no further links but there is text after last url
                        this.splittedLiteral.push(value.substring(idx, value.length));
                    }
                }
            }
        }
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
