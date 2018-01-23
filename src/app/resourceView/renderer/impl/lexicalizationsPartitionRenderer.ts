import { Component, Input, Output, EventEmitter, SimpleChanges } from "@angular/core";
import { Observable } from "rxjs/Observable";
import { PartitionRendererMultiRoot } from "../partitionRendererMultiRoot";
import { CustomFormsServices } from "../../../services/customFormsServices";
import { SkosServices } from "../../../services/skosServices";
import { SkosxlServices } from "../../../services/skosxlServices";
import { ResourcesServices } from "../../../services/resourcesServices";
import { ResourceViewServices } from "../../../services/resourceViewServices";
import { ARTResource, ARTURIResource, ARTNode, ARTLiteral, ResAttribute, RDFTypesEnum, ARTPredicateObjects, ResourceUtils } from "../../../models/ARTResources";
import { RDFS, SKOS, SKOSXL } from "../../../models/Vocabulary";
import { ResViewPartition } from "../../../models/ResourceView";
import { BasicModalServices } from "../../../widget/modal/basicModal/basicModalServices";
import { CreationModalServices } from "../../../widget/modal/creationModal/creationModalServices";
import { BrowsingModalServices } from '../../../widget/modal/browsingModal/browsingModalServices';

@Component({
    selector: "lexicalizations-renderer",
    templateUrl: "../partitionRenderer.html",
})
export class LexicalizationsPartitionRenderer extends PartitionRendererMultiRoot {

    //inherited from PredObjListMultirootRenderer
    // @Input('pred-obj-list') predicateObjectList: ARTPredicateObjects[];
    // @Input() resource:ARTURIResource;
    // @Output() update = new EventEmitter();//something changed in this partition. Tells to ResView to update
    // @Output() dblclickObj: EventEmitter<ARTResource> = new EventEmitter<ARTResource>();

    partition = ResViewPartition.lexicalizations;
    rootProperties: ARTURIResource[] = [];
    knownProperties: ARTURIResource[] = [
        RDFS.label, SKOS.prefLabel, SKOS.altLabel, SKOS.hiddenLabel,
        SKOSXL.prefLabel, SKOSXL.altLabel, SKOSXL.hiddenLabel];
    label = "Lexicalizations";
    addBtnImgTitle = "Add a lexicalization";
    addBtnImgSrc = require("../../../../assets/images/icons/actions/propAnnotation_create.png");
    removeBtnImgTitle = "Remove lexicalization";

    private predicateOrder: string[] = [
        SKOSXL.prefLabel.getURI(), SKOSXL.altLabel.getURI(), SKOSXL.hiddenLabel.getURI(),
        SKOS.prefLabel.getURI(), SKOS.altLabel.getURI(), SKOS.hiddenLabel.getURI(),
        RDFS.label.getURI()
    ];

    constructor(basicModals: BasicModalServices,
        private cfService: CustomFormsServices, private skosService: SkosServices, private skosxlService: SkosxlServices,
        private resourceService: ResourcesServices, private resViewService: ResourceViewServices,
        private creationModals: CreationModalServices, private browsingModals: BrowsingModalServices) {
        super(basicModals);
    }

    ngOnChanges(changes: SimpleChanges) {
        //if changes reguard predicateObjectList
        if (changes['predicateObjectList'] && changes['predicateObjectList'].currentValue) {
            //sort predicate (SKOSXL pref, alt, hidden Label, SKOS pref, alt, hidden Label, RDFS label)
            this.predicateObjectList.sort(this.sortPredicates(this.predicateOrder));
            //sort objects by language
            for (var i = 0; i < this.predicateObjectList.length; i++) {
                let objects: ARTNode[] = this.predicateObjectList[i].getObjects();
                objects.sort(
                    function (a: ARTNode, b: ARTNode) {
                        if (a.getAdditionalProperty(ResAttribute.LANG) < b.getAdditionalProperty(ResAttribute.LANG)) return -1;
                        if (a.getAdditionalProperty(ResAttribute.LANG) > b.getAdditionalProperty(ResAttribute.LANG)) return 1;
                        return 0;
                    }
                );
            }
        }
    }

    private sortPredicates(order: string[]) {
        return function (a: ARTPredicateObjects, b: ARTPredicateObjects) {
            let indexPredA = order.indexOf(a.getPredicate().getURI());
            let indexPredB = order.indexOf(b.getPredicate().getURI());
            if (indexPredA == -1) return 1;
            else if (indexPredB == -1) return -1;
            else return indexPredA - indexPredB;
        }
    }

    add(predicate?: ARTURIResource) {
        if (predicate == undefined) {
            if (this.rootProperties.length == 0) {
                this.resViewService.getLexicalizationProperties(this.resource).subscribe(
                    props => {
                        this.rootProperties = props;
                        this.addPropWithRootInitialized(predicate);
                    }
                );
            } else {
                this.addPropWithRootInitialized(predicate);
            }
        } else {
            this.addPropWithRootInitialized(predicate);
        }
    }

    private addPropWithRootInitialized(predicate?: ARTURIResource) {
        if (predicate == undefined) {
            this.browsingModals.browsePropertyTree("Select a property", this.rootProperties).then(
                (selectedProp: any) => {
                    if (this.isKnownProperty(selectedProp)) {
                        this.enrichProperty(selectedProp);
                    } else {
                        alert("enrichment of " + selectedProp.getShow() + " not available");
                    }
                },
                () => { }
            );
        } else {
            if (this.isKnownProperty(predicate)) {
                this.enrichProperty(predicate);
            } else {
                alert("enrichment of " + predicate.getShow() + " not available");
            }
        }
    }

    private enrichProperty(predicate: ARTURIResource) {
        this.creationModals.newPlainLiteral("Add " + predicate.getShow()).then(
            (literal: any) => {
                switch (predicate.getURI()) {
                    case SKOSXL.prefLabel.getURI():
                        this.skosxlService.setPrefLabel(<ARTURIResource>this.resource, (<ARTLiteral>literal), RDFTypesEnum.uri).subscribe(
                            stResp => this.update.emit(null),
                            (err: Error) => {
                                if (err.name.endsWith('PrefAltLabelClashException')) {
                                    this.basicModals.confirm("Warning", err.message + " Do you want to force the creation?", "warning").then(
                                        confirm => {
                                            this.skosxlService.setPrefLabel(<ARTURIResource>this.resource, (<ARTLiteral>literal), RDFTypesEnum.uri, false).subscribe(
                                                stResp => this.update.emit(null)
                                            );
                                        },
                                        () => {}
                                    );
                                }
                            }
                        );
                        break;
                    case SKOSXL.altLabel.getURI():
                        this.skosxlService.addAltLabel(<ARTURIResource>this.resource, (<ARTLiteral>literal), RDFTypesEnum.uri).subscribe(
                            stResp => this.update.emit(null),
                        );
                        break;
                    case SKOSXL.hiddenLabel.getURI():
                        this.skosxlService.addHiddenLabel(<ARTURIResource>this.resource, (<ARTLiteral>literal), RDFTypesEnum.uri).subscribe(
                            stResp => this.update.emit(null)
                        );
                        break;
                    case SKOS.prefLabel.getURI():
                        this.skosService.setPrefLabel(<ARTURIResource>this.resource, literal).subscribe(
                            stResp => this.update.emit(null),
                            (err: Error) => {
                                if (err.name.endsWith('PrefAltLabelClashException')) {
                                    this.basicModals.confirm("Warning", err.message + " Do you want to force the creation?", "warning").then(
                                        confirm => {
                                            this.skosService.setPrefLabel(<ARTURIResource>this.resource, literal, false).subscribe(
                                                stResp => this.update.emit(null)
                                            );
                                        },
                                        () => {}
                                    );
                                }
                            }
                        );
                        break;
                    case SKOS.altLabel.getURI():
                        this.skosService.addAltLabel(<ARTURIResource>this.resource, literal).subscribe(
                            stResp => this.update.emit(null)
                        );
                        break;
                    case SKOS.hiddenLabel.getURI():
                        this.skosService.addHiddenLabel(<ARTURIResource>this.resource, literal).subscribe(
                            stResp => this.update.emit(null)
                        );
                        break;
                    case RDFS.label.getURI():
                        this.resourceService.addValue(this.resource, predicate, (<ARTLiteral>literal)).subscribe(
                            stResp => this.update.emit(null)
                            );
                        break;
                }
            },
            () => { }
        );
    }

    removePredicateObject(predicate: ARTURIResource, object: ARTNode) {
        this.getRemoveFunction(predicate, object).subscribe(
            stResp => this.update.emit()
        );
    }

    getRemoveFunction(predicate: ARTURIResource, object: ARTNode): Observable<any> {
        if (predicate.getAdditionalProperty(ResAttribute.HAS_CUSTOM_RANGE) && object.isResource()) {
            return this.cfService.removeReifiedResource(this.resource, predicate, object);
        } else {
            if (this.isKnownProperty(predicate)) { //if it is removing a value about a root property, call the specific method
                if (predicate.getURI() == SKOSXL.prefLabel.getURI()) {
                    return this.skosxlService.removePrefLabel(<ARTURIResource>this.resource, <ARTResource>object);
                } else if (predicate.getURI() == SKOSXL.altLabel.getURI()) {
                    return this.skosxlService.removeAltLabel(<ARTURIResource>this.resource, <ARTResource>object);
                } else if (predicate.getURI() == SKOSXL.hiddenLabel.getURI()) {
                    return this.skosxlService.removeHiddenLabel(<ARTURIResource>this.resource, <ARTResource>object);
                } else if (predicate.getURI() == SKOS.prefLabel.getURI()) {
                    return this.skosService.removePrefLabel(<ARTURIResource>this.resource, <ARTLiteral>object);
                } else if (predicate.getURI() == SKOS.altLabel.getURI()) {
                    return this.skosService.removeAltLabel(<ARTURIResource>this.resource, <ARTLiteral>object);
                } else if (predicate.getURI() == SKOS.hiddenLabel.getURI()) {
                    return this.skosService.removeHiddenLabel(<ARTURIResource>this.resource, <ARTLiteral>object);
                } else if (predicate.getURI() == RDFS.label.getURI()) {
                    return this.resourceService.removeValue(<ARTURIResource>this.resource, predicate, (<ARTLiteral>object));
                }
            } else {//predicate is some subProperty of a root property
                return this.resourceService.removeValue(this.resource, predicate, object);
            }
        }
    }

}