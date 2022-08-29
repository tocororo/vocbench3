import { Component, EventEmitter, Input, Output, SimpleChanges } from "@angular/core";
import { Subscription } from 'rxjs';
import { Language, Languages } from "src/app/models/LanguagesCountries";
import { VBEventHandler } from 'src/app/utils/VBEventHandler';
import { ARTLiteral, ARTNode, ARTResource, ARTURIResource, RDFResourceRolesEnum, ResAttribute, ResourceNature } from "../../models/ARTResources";
import { XmlSchema } from "../../models/Vocabulary";
import { ResourcesServices } from "../../services/resourcesServices";
import { ResourceUtils } from "../../utils/ResourceUtils";
import { UIUtils } from "../../utils/UIUtils";
import { VBContext } from "../../utils/VBContext";

@Component({
    selector: "rdf-resource",
    templateUrl: "./rdfResourceComponent.html",
    styleUrls: ["./rdfResourceComponent.css", "../codemirror/manchesterEditor/manchester.css"]
})
export class RdfResourceComponent {
    @Input() resource: ARTNode;
    @Input() rendering: boolean = true; //if true the resource should be rendered with the show, with the qname otherwise

    @Output() link: EventEmitter<ARTURIResource> = new EventEmitter();

    private eventSubscriptions: Subscription[] = [];

    renderingClass: string;
    renderingLabel: string;

    language: Language; //language of the resource

    isExplicit: boolean; //tells if the resource is explicit (useful for disabling/make transparent lang-item)

    private datatype: ARTURIResource; //datatype of the resource
    showDatatypeBadge: boolean = false;

    literalWithLink: boolean = false; //true if the resource is a literal which contains url
    private splittedLiteral: string[]; //when literalWithLink is true, even elements are plain text, odd elements are url

    imgSrc: string; //src of the image icon
    natureTooltip: string;

    manchExpr: boolean = false;
    private manchExprStruct: { token: string, class: string }[] = [];

    constructor(private resourcesService: ResourcesServices, private eventHandler: VBEventHandler) {
        this.eventSubscriptions.push(this.eventHandler.resourceLexicalizationUpdatedEvent.subscribe(
            (data: { oldResource: ARTResource, newResource: ARTResource }) => {
                if (data.oldResource.equals(this.resource)) {
                    this.resource = data.newResource;
                    this.initRenderingLabel();
                }
            }));
    }

    ngOnChanges(changes: SimpleChanges) {
        if (changes['resource'] && changes['resource'].currentValue) {
            this.init();
        } else if (changes['rendering']) {
            this.initRenderingLabel();
        }
    }

    ngOnDestroy() {
        this.eventSubscriptions.forEach(s => s.unsubscribe());
    }

    init() {
        this.initRenderingLabel();
        this.initImgSrc();
        this.initLang();
        this.initDatatype();
        this.initLiteralWithLink();
        this.initRenderingClass();
        this.initNatureTooltip();
        this.initManchExpr();

        //init isExplicit
        this.isExplicit = this.resource.getAdditionalProperty(ResAttribute.EXPLICIT) ||
            this.resource.getAdditionalProperty(ResAttribute.EXPLICIT) == undefined;
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
     * Returns the language tag of the current resource in order to show it as title of resource icon (flag)
     */
    private initLang(): void {
        //reset
        this.language = null;
        //init
        let lang: string;
        if (this.resource.isResource()) { //even if it is a resource, get the lang (it could be a custom form preview)
            lang = this.resource.getAdditionalProperty(ResAttribute.LANG);
        } else if (this.resource instanceof ARTLiteral) {
            lang = this.resource.getLang();
            if (this.resource.getDatatype() == XmlSchema.language.getURI()) {
                lang = this.resource.getValue();
            }
        }
        if (lang != null) {
            this.language = Languages.getLanguageFromTag(lang);
        }
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
            if (natureList.length > 0) {
                let natureListSerlalized: string[] = [];
                natureList.forEach(n => {
                    let graphsToNT: string[] = [];
                    n.graphs.forEach(g => {
                        graphsToNT.push(g.toNT());
                    });
                    natureListSerlalized.push(ResourceUtils.getResourceRoleLabel(n.role) + ", defined in: " + graphsToNT.join(", "));
                });
                this.natureTooltip = natureListSerlalized.join("\n\n");
            } else { //nature empty => could be the case of a reified resource => check language or datatype (representing the one of the preview value)
                if (this.language != null) {
                    this.natureTooltip = this.language.tag;
                } else if (this.datatype != null) {
                    this.natureTooltip = this.datatype.toNT();
                }
            }
        } else if (this.resource instanceof ARTLiteral) {
            if (this.language != null) {
                this.natureTooltip = this.language.tag;
            } else if (this.datatype != null) {
                this.natureTooltip = this.datatype.toNT();
            }
        }
    }

    private initDatatype(): ARTURIResource {
        //reset
        this.datatype = null;
        this.showDatatypeBadge = false;
        //init
        let dtIri;
        if (this.resource instanceof ARTLiteral) { // if it is a literal
            dtIri = this.resource.getDatatype();
        } else { // otherwise, it is a resource, possibly with an additional property dataType (as it could be from a custom form preview)
            dtIri = this.resource.getAdditionalProperty(ResAttribute.DATA_TYPE);
        }

        if (dtIri != null) { //if there is a datatype
            let show: string = ResourceUtils.getQName(dtIri, VBContext.getPrefixMappings());
            this.datatype = new ARTURIResource(dtIri, show, RDFResourceRolesEnum.dataRange);
        }

        if (this.datatype != null) { //if a datatype is present, init datatypeIconAvailable
            let datatypeIconAvailable: boolean = !this.imgSrc.includes("unknown_datatype");
            if (!datatypeIconAvailable) { //if icon is not available, the badge is always shown
                this.showDatatypeBadge = true;
            } else { //otherwise, is show only according the preference
                this.showDatatypeBadge = VBContext.getWorkingProjectCtx().getProjectPreferences().resViewPreferences.showDatatypeBadge;
            }
        }
        return this.datatype;
    }

    /**
     * If the resource is a literal with a link, splits the literal value so it can be rendered with different elements
     * like <span> for plain text (even elements of array) or <a> for url (odd elements)
     */
    private initLiteralWithLink() {
        this.literalWithLink = false;
        if (this.resource instanceof ARTLiteral) {
            let value = this.resource.getValue();
            let regexToken = /(((ftp|https?):\/\/)[-\w@:%_+.~#?,&//=]+)|((mailto:)?[_.\w-][_.\w-!#$%&'*+-/=?^_`.{|}~]+@([\w][\w-]+\.)+[a-zA-Z]{2,3})/g;
            let urlArray: string[] = [];

            let matchArray: RegExpExecArray;
            while ((matchArray = regexToken.exec(value)) !== null) {
                urlArray.push(matchArray[0]);
            }

            if (urlArray.length > 0) {
                this.literalWithLink = true;
                this.splittedLiteral = [];
                for (let i = 0; i < urlArray.length; i++) {
                    let idx: number = 0;
                    let urlStartIdx: number = value.indexOf(urlArray[i]);
                    let urlEndIdx: number = value.indexOf(urlArray[i]) + urlArray[i].length;
                    this.splittedLiteral.push(value.substring(idx, urlStartIdx)); //what there is before url
                    this.splittedLiteral.push(value.substring(urlStartIdx, urlEndIdx)); //url
                    idx = urlEndIdx;
                    value = value.substring(idx);
                    //what there is between url and the end of the string
                    if (urlArray[i + 1] == null && idx != value.length) { //if there is no further links but there is text after last url
                        this.splittedLiteral.push(value); //push value, namely the rest of the value string
                    }
                }
            }
        }
    }

    /**
     * Listener on click of link in a literal: check if it represents a local resource emits an event, otherwise open the link in a modal
     * @param url
     */
    private openLink(url: string) {
        let urlRes = new ARTURIResource(url);
        this.resourcesService.getResourcePosition(urlRes).subscribe(
            position => {
                if (position.isLocal()) {
                    this.link.emit(urlRes);
                } else {
                    window.open(url, "_blank");
                }
            }
        );
    }

    private initManchExpr() {
        if (this.resource.isBNode() && this.resource.getAdditionalProperty(ResAttribute.SHOW_INTERPR) != null) {
            this.manchExpr = true;
        }
        if (this.manchExpr) {
            let booleans = ["true", "false"];
            let builtinDatatypes = ["decimal", "double", "float", "integer", "string"];
            let characteristics = ["Functional", "InverseFunctional", "Reflexive", "Irreflexive", "Symmetric", "Asymmetric", "Transitive", "Inverse"];
            let conjuctions = ["and", "not", "that", "or"];
            let facets = ["langRange", "length", "maxLength", "minLength", "pattern", "<", "<=", ">", ">="];
            let quantifiers = ["some", "only", "value", "min", "max", "exactly", "self"];

            let booleansRegex: RegExp = this.getRegexp(booleans, false);
            let builtinDatatypesRegex: RegExp = this.getRegexp(builtinDatatypes, true);
            let characteristicsRegex: RegExp = this.getRegexp(characteristics, false);
            let conjuctionsRegex: RegExp = this.getRegexp(conjuctions, false);
            let facetsRegex: RegExp = this.getRegexp(facets, true);
            let quantifiersRegex: RegExp = this.getRegexp(quantifiers, false);
            let bracketsRegex: RegExp = /(\{|\[|\(|\}|\]|\))/g;

            let tokenizerStruct: { regex: RegExp, tokenClass: string }[] = [
                { regex: /"(?:[^\\]|\\.)*?(?:"|$)/, tokenClass: "string" },
                { regex: booleansRegex, tokenClass: "boolean" },
                { regex: builtinDatatypesRegex, tokenClass: "builtinDatatype" },
                { regex: characteristicsRegex, tokenClass: "characteristic" },
                { regex: conjuctionsRegex, tokenClass: "conjuction" },
                { regex: facetsRegex, tokenClass: "facet" },
                { regex: quantifiersRegex, tokenClass: "quantifier" },
                { regex: /0x[a-f\d]+|[-+]?(?:\.\d+|\d+\.?\d*)(?:e[-+]?\d+)?/i, tokenClass: "number" },
                { regex: /\/(?:[^\\]|\\.)*?\//, tokenClass: "variable-3" },
                { regex: bracketsRegex, tokenClass: "bracket" },
                { regex: /[a-z$][\w$]*/, tokenClass: "variable" },
            ];

            let show = this.resource.getShow();
            show = show.replace(/([{[(}\])])/g, " $1 ").replace(/\s+/g, " ").trim(); //add spaces before and after brackets, remove multiple spaces, remove ending space
            let splitted: string[] = show.split(" ");
            this.manchExprStruct = [];
            splitted.forEach((s, idx, array) => {
                let tokenCls: string;
                for (let ts of tokenizerStruct) {
                    if (ts.regex.test(s)) {
                        tokenCls = ts.tokenClass;
                        break;
                    }
                }
                this.manchExprStruct.push({ token: s, class: "cm-" + tokenCls });
                if (idx != array.length - 1) {
                    //add a whitespace token just as separator between other tokens (exept after the laast)
                    this.manchExprStruct.push({ token: " ", class: "" });
                }

            });
        }
    }

    private getRegexp(tokensList: string[], caseSentitive: boolean) {
        if (caseSentitive) {
            return new RegExp("(?:" + tokensList.join("|") + ")\\b");
        } else {
            return new RegExp("(?:" + tokensList.join("|") + ")\\b", "i");
        }
    }

}
