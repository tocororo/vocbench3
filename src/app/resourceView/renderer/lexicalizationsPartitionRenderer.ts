import { Component, Input, Output, EventEmitter } from "@angular/core";
import { AbstractPredicateValueListRenderer } from "./abstractPerdicateValueListRenderer";
import { CustomRangeServices } from "../../services/customRangeServices";
import { VocbenchCtx } from "../../utils/VocbenchCtx";
import { ARTResource, ARTURIResource, ARTNode, ARTLiteral, ARTPredicateValues, ResAttribute, RDFTypesEnum } from "../../utils/ARTResources";
import { ResourceUtils } from "../../utils/ResourceUtils";
import { RDFS, SKOS, SKOSXL } from "../../utils/Vocabulary";
import { ModalServices } from "../../widget/modal/modalServices";
import { SkosServices } from "../../services/skosServices";
import { SkosxlServices } from "../../services/skosxlServices";
import { PropertyServices } from "../../services/propertyServices";
import { ResourceViewServices } from "../../services/resourceViewServices";



@Component({
    selector: "lexicalizations-renderer",
    templateUrl: "./predicateValueListRenderer.html",
})
export class LexicalizationsPartitionRenderer extends AbstractPredicateValueListRenderer {

    //inherited from AbstractPredicateValueListRenderer
    // @Input('pred-value-list') predicateValueList: ARTPredicateValues[];
    // @Input() resource:ARTURIResource;
    // @Output() update = new EventEmitter();//something changed in this partition. Tells to ResView to update
    // @Output() dblclickObj: EventEmitter<ARTResource> = new EventEmitter<ARTResource>();

    rootProperties: ARTURIResource[] = [];
    label = "Lexicalizations";
    addBtnImgTitle = "Add a lexicalization";
    addBtnImgSrc = require("../../../assets/images/propAnnotation_create.png");
    removeBtnImgTitle = "Remove lexicalization";

    constructor(private crService: CustomRangeServices, private skosService: SkosServices,
        private skosxlService: SkosxlServices, private propertyService: PropertyServices,
        private resViewService: ResourceViewServices, private modalService: ModalServices, private vbCtx: VocbenchCtx) {
        super();
    }

    ngOnInit() {
        this.resViewService.getLexicalizationProperties(this.resource).subscribe(
            props => {
                this.rootProperties = props;
            }
        );
    }

    add() {
        alert("open modal to choose a property rooted on " + JSON.stringify(this.rootProperties));
        //based on the chosen property call enrichProperty
        // var chosenProp: ARTURIResource;
        // if (this.isRootProperty(chosenProp)) {
        //     this.enrichProperty(chosenProp);
        // } else {
        //     alert("enrichment of " + chosenProp.getShow() + " not available");
        // }
    }

    enrichProperty(predicate: ARTURIResource) {
        this.modalService.newPlainLiteral("Add " + predicate.getShow()).then(
            (literal: any) => {
                switch (predicate.getURI()) {
                    case SKOSXL.prefLabel.getURI():
                        this.skosxlService.setPrefLabel(<ARTURIResource>this.resource, literal.value, literal.lang, RDFTypesEnum.uri).subscribe(
                            stResp => this.update.emit(null)
                        );
                        break;
                    case SKOSXL.altLabel.getURI():
                        this.skosxlService.addAltLabel(<ARTURIResource>this.resource, literal.value, literal.lang, RDFTypesEnum.uri).subscribe(
                            stResp => this.update.emit(null)
                        );
                        break;
                    case SKOSXL.hiddenLabel.getURI():
                        this.skosxlService.addHiddenLabel(<ARTURIResource>this.resource, literal.value, literal.lang, RDFTypesEnum.uri).subscribe(
                            stResp => this.update.emit(null)
                        );
                        break;
                    case SKOS.prefLabel.getURI():
                        this.skosService.setPrefLabel(<ARTURIResource>this.resource, literal.value, literal.lang).subscribe(
                            stResp => this.update.emit(null)
                        );
                        break;
                    case SKOS.altLabel.getURI():
                        this.skosService.addAltLabel(<ARTURIResource>this.resource, literal.value, literal.lang).subscribe(
                            stResp => this.update.emit(null)
                        );
                        break;
                    case SKOS.hiddenLabel.getURI():
                        this.skosService.addHiddenLabel(<ARTURIResource>this.resource, literal.value, literal.lang).subscribe(
                            stResp => this.update.emit(null)
                        );
                        break;
                    case RDFS.label.getURI():
                        this.propertyService.createAndAddPropValue(
                            this.resource, predicate, literal.value, null, RDFTypesEnum.plainLiteral, literal.lang).subscribe(
                            stResp => this.update.emit(null)
                            );
                        break;
                }
            },
            () => { }
        );
    }

    removePredicateObject(predicate: ARTURIResource, object: ARTNode) {
        if (predicate.getAdditionalProperty(ResAttribute.HAS_CUSTOM_RANGE) && object.isResource()) {
            this.crService.removeReifiedResource(this.resource, predicate, object).subscribe(
                stResp => this.update.emit(null)
            );
        } else {
            //if it is removing a value about a root property, call the specific method
            if (this.isRootProperty(predicate)) {
                this.removeObjectForRootProperty(predicate, object);
            } else {//predicate is some subProperty of a root property
                alert("remove of value for " + predicate.getShow() + " not available");

            }
        }
    }

    private removeObjectForRootProperty(predicate: ARTURIResource, object: ARTNode) {
        switch (predicate.getURI()) {
            case SKOSXL.prefLabel.getURI():
                this.skosxlService.removePrefLabel(<ARTURIResource>this.resource, object.getShow(), object.getAdditionalProperty(ResAttribute.LANG)).subscribe(
                    stResp => this.update.emit(null)
                );
                break;
            case SKOSXL.altLabel.getURI():
                this.skosxlService.removeAltLabel(<ARTURIResource>this.resource, object.getShow(), object.getAdditionalProperty(ResAttribute.LANG)).subscribe(
                    stResp => this.update.emit(null)
                );
                break;
            case SKOSXL.hiddenLabel.getURI():
                this.skosxlService.removeHiddenLabel(<ARTURIResource>this.resource, object.getShow(), object.getAdditionalProperty(ResAttribute.LANG)).subscribe(
                    stResp => this.update.emit(null)
                );
                break;
            case SKOS.prefLabel.getURI():
                this.skosService.removePrefLabel(<ARTURIResource>this.resource, (<ARTLiteral>object).getLabel(), (<ARTLiteral>object).getLang()).subscribe(
                    stResp => this.update.emit(null)
                );
                break;
            case SKOS.altLabel.getURI():
                this.skosService.removeAltLabel(<ARTURIResource>this.resource, (<ARTLiteral>object).getLabel(), (<ARTLiteral>object).getLang()).subscribe(
                    stResp => this.update.emit(null)
                );
                break;
            case SKOS.hiddenLabel.getURI():
                this.skosService.removeHiddenLabel(<ARTURIResource>this.resource, (<ARTLiteral>object).getLabel(), (<ARTLiteral>object).getLang()).subscribe(
                    stResp => this.update.emit(null)
                );
                break;
            case RDFS.label.getURI():
                this.propertyService.removePropValue(<ARTURIResource>this.resource, predicate, (<ARTLiteral>object).getLabel(),
                    null, RDFTypesEnum.plainLiteral, (<ARTLiteral>object).getLang()).subscribe(
                    stResp => this.update.emit(null)
                    );
                break;
        }
    }

}