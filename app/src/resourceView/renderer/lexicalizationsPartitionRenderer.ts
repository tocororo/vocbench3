import {Component, Input, Output, EventEmitter} from "@angular/core";
import {VocbenchCtx} from "../../utils/VocbenchCtx";
import {ARTResource, ARTURIResource, ARTNode, ARTLiteral, ARTPredicateObjects, ResAttribute, RDFTypesEnum} from "../../utils/ARTResources";
import {ResourceUtils} from "../../utils/ResourceUtils";
import {RDFS, SKOS, SKOSXL} from "../../utils/Vocabulary";
import {RdfResourceComponent} from "../../widget/rdfResource/rdfResourceComponent";
import {ModalServices} from "../../widget/modal/modalServices";
import {SkosServices} from "../../services/skosServices";
import {SkosxlServices} from "../../services/skosxlServices";
import {OwlServices} from "../../services/owlServices";
import {PropertyServices} from "../../services/propertyServices";

@Component({
    selector: "lexicalizations-renderer",
    templateUrl: "app/src/resourceView/renderer/lexicalizationsPartitionRenderer.html",
    directives: [RdfResourceComponent],
    providers: [SkosServices, SkosxlServices, OwlServices, PropertyServices],
})
export class LexicalizationsPartitionRenderer {
    
    @Input('pred-obj-list') predicateObjectList: ARTPredicateObjects[];
    @Input() resource:ARTURIResource;
    @Output() update = new EventEmitter();//something changed in this partition. Tells to ResView to update
    @Output() dblclickObj: EventEmitter<ARTResource> = new EventEmitter<ARTResource>();
    
    private showAllLexicalProp = false;
    
    private lexicalizationProperties = [
        SKOSXL.prefLabel, SKOSXL.altLabel, SKOSXL.hiddenLabel,
        SKOS.prefLabel, SKOS.altLabel, SKOS.hiddenLabel, RDFS.label
    ];
    
    constructor(private skosService:SkosServices, private owlService:OwlServices, private skosxlService: SkosxlServices,
        private propertyService:PropertyServices, private modalService: ModalServices, private vbCtx: VocbenchCtx) {}
    
    private add(predicate: ARTURIResource) {
        this.modalService.newPlainLiteral("Add " + predicate.getShow()).then(
            literal => {
                switch (predicate.getURI()) {
                    case SKOSXL.prefLabel.getURI():
                        this.skosxlService.setPrefLabel(this.resource, literal.value, literal.lang, RDFTypesEnum.uri).subscribe(
                            stResp => this.update.emit(null)
                        );
                        break;
                    case SKOSXL.altLabel.getURI():
                        this.skosxlService.addAltLabel(this.resource, literal.value, literal.lang, RDFTypesEnum.uri).subscribe(
                            stResp => this.update.emit(null)
                        );
                        break;
                    case SKOSXL.hiddenLabel.getURI():
                        this.skosxlService.addHiddenLabel(this.resource, literal.value, literal.lang, RDFTypesEnum.uri).subscribe(
                            stResp => this.update.emit(null)
                        );
                        break;
                    case SKOS.prefLabel.getURI():
                        this.skosService.setPrefLabel(this.resource, literal.value, literal.lang).subscribe(
                            stResp => this.update.emit(null)
                        );
                        break;
                    case SKOS.altLabel.getURI():
                        this.skosService.addAltLabel(this.resource, literal.value, literal.lang).subscribe(
                            stResp => this.update.emit(null)
                        );
                        break;
                    case SKOS.hiddenLabel.getURI():
                        this.skosService.addHiddenLabel(this.resource, literal.value, literal.lang).subscribe(
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
            () => {}
        );
    }
    
    private removePredicateObject(predicate: ARTURIResource, object: ARTNode) {
        switch (predicate.getURI()) {
            case SKOSXL.prefLabel.getURI():
                this.skosxlService.removePrefLabel(this.resource, object.getShow(), object.getAdditionalProperty(ResAttribute.LANG)).subscribe(
                    stResp => this.update.emit(null)
                );
                break;
            case SKOSXL.altLabel.getURI():
                this.skosxlService.removeAltLabel(this.resource, object.getShow(), object.getAdditionalProperty(ResAttribute.LANG)).subscribe(
                    stResp => this.update.emit(null)
                );
                break;
            case SKOSXL.hiddenLabel.getURI():
                this.skosxlService.removeHiddenLabel(this.resource, object.getShow(), object.getAdditionalProperty(ResAttribute.LANG)).subscribe(
                    stResp => this.update.emit(null)
                );
                break;
            case SKOS.prefLabel.getURI():
                this.skosService.removePrefLabel(this.resource, (<ARTLiteral>object).getLabel(), (<ARTLiteral>object).getLang()).subscribe(
                    stResp => this.update.emit(null)
                );
                break;
            case SKOS.altLabel.getURI():
                this.skosService.removeAltLabel(this.resource, (<ARTLiteral>object).getLabel(), (<ARTLiteral>object).getLang()).subscribe(
                    stResp => this.update.emit(null)
                );
                break;
            case SKOS.hiddenLabel.getURI():
                this.skosService.removeHiddenLabel(this.resource, (<ARTLiteral>object).getLabel(), (<ARTLiteral>object).getLang()).subscribe(
                    stResp => this.update.emit(null)
                );
                break;
            case RDFS.label.getURI():
                this.propertyService.removePropValue(this.resource, predicate, (<ARTLiteral>object).getLabel(),
                    null, RDFTypesEnum.plainLiteral, (<ARTLiteral>object).getLang()).subscribe(
                        stResp => this.update.emit(null)
                    );
                break;
            }
    }
    
    /**
     * Given a lexicalization property, tells if it is compliant with the current project onto type.
     * If the property is one of the skosxl lexicalization properties, returns true if project is SKOS-XL
     * If the property is one of the skos lexicalization properties, returns true if project is SKOS
     * If the property is rdfs:label, returns true if the project is OWL
     */
    private isPropOntoTypeCompliant(property: ARTURIResource) {
        var ontoType = this.vbCtx.getWorkingProject().getPrettyPrintOntoType();
        return (
            this.showAllLexicalProp ||
            (
                property.getShow().startsWith("rdfs:") && ontoType == "OWL" ||
                property.getShow().startsWith("skos:") && ontoType == "SKOS" ||
                property.getShow().startsWith("skosxl:") && ontoType == "SKOS-XL"
            )
        );
    }
    
    private objectDblClick(obj: ARTNode) {
        //clicked object (label) can be a Resource (xlabel bnode or uri) or literal (plain label)
        if (obj.isResource()) {//emit double click for open a new res view only for resources
            this.dblclickObj.emit(<ARTResource>obj);
        }
    }
    
    private getAddPropImgTitle(predicate: ARTURIResource) {
        return "Add a " + predicate.getShow();
    }
    
    private getRemovePropImgTitle(predicate: ARTURIResource) {
        return "Remove " + predicate.getShow();
    }
    
}