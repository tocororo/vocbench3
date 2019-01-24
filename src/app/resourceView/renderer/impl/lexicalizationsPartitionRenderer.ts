import { Component, SimpleChanges } from "@angular/core";
import { Observable } from "rxjs/Observable";
import { ARTLiteral, ARTNode, ARTPredicateObjects, ARTResource, ARTURIResource, ResAttribute } from "../../../models/ARTResources";
import { ResViewPartition } from "../../../models/ResourceView";
import { OntoLex, RDFS, SKOS, SKOSXL } from "../../../models/Vocabulary";
import { CustomFormsServices } from "../../../services/customFormsServices";
import { OntoLexLemonServices } from "../../../services/ontoLexLemonServices";
import { ResourcesServices } from "../../../services/resourcesServices";
import { ResourceViewServices } from "../../../services/resourceViewServices";
import { SkosServices } from "../../../services/skosServices";
import { SkosxlServices } from "../../../services/skosxlServices";
import { BasicModalServices } from "../../../widget/modal/basicModal/basicModalServices";
import { BrowsingModalServices } from '../../../widget/modal/browsingModal/browsingModalServices';
import { CreationModalServices } from "../../../widget/modal/creationModal/creationModalServices";
import { NewOntoLexicalizationCfModalReturnData } from "../../../widget/modal/creationModal/newResourceModal/ontolex/newOntoLexicalizationCfModal";
import { NewXLabelModalReturnData } from "../../../widget/modal/creationModal/newResourceModal/skos/newXLabelModal";
import { ResViewModalServices } from "../../resViewModals/resViewModalServices";
import { MultiAddError, MultiAddFunction } from "../partitionRenderer";
import { PartitionRendererMultiRoot } from "../partitionRendererMultiRoot";

@Component({
    selector: "lexicalizations-renderer",
    templateUrl: "../partitionRenderer.html",
})
export class LexicalizationsPartitionRenderer extends PartitionRendererMultiRoot {

    partition = ResViewPartition.lexicalizations;
    addManuallyAllowed: boolean = false;
    rootProperties: ARTURIResource[] = []; //lexicalization properties are not known at priori
    knownProperties: ARTURIResource[] = [
        RDFS.label, SKOS.prefLabel, SKOS.altLabel, SKOS.hiddenLabel,
        SKOSXL.prefLabel, SKOSXL.altLabel, SKOSXL.hiddenLabel, OntoLex.isDenotedBy];
    label = "Lexicalizations";
    addBtnImgTitle = "Add a lexicalization";
    addBtnImgSrc = require("../../../../assets/images/icons/actions/propAnnotation_create.png");

    private predicateOrder: string[] = [
        SKOSXL.prefLabel.getURI(), SKOSXL.altLabel.getURI(), SKOSXL.hiddenLabel.getURI(),
        SKOS.prefLabel.getURI(), SKOS.altLabel.getURI(), SKOS.hiddenLabel.getURI(),
        RDFS.label.getURI()
    ];

    constructor(resourcesService: ResourcesServices, cfService: CustomFormsServices,
        basicModals: BasicModalServices, resViewModals: ResViewModalServices,
        private skosService: SkosServices, private skosxlService: SkosxlServices,
        private resViewService: ResourceViewServices, private ontolexService: OntoLexLemonServices,
        private creationModals: CreationModalServices, private browsingModals: BrowsingModalServices) {
        super(resourcesService, cfService, basicModals, resViewModals);
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

    //not used since this partition doesn't allow manual add operation
    checkTypeCompliantForManualAdd(predicate: ARTURIResource, value: ARTNode): Observable<boolean> {
        return Observable.of(true);
    }

    private ensureInitializedRootProperties(): Observable<void> {
        if (this.rootProperties.length == 0) { //root properties not yet initialized
            return this.resViewService.getLexicalizationProperties(this.resource).map(
                props => {
                    this.rootProperties = props;
                }
            );
        } else { //root properties already initialized
            return Observable.of(null);
        }
    }

    getPredicateToEnrich(): Observable<ARTURIResource> {
        return this.ensureInitializedRootProperties().flatMap(
            res => {
                if (this.rootProperties.length == 1) { //just one property => return it
                    return Observable.of(this.rootProperties[0]);
                } else { //multiple properties => ask user to select
                    return Observable.fromPromise(
                        this.browsingModals.browsePropertyTree("Select a property", this.rootProperties).then(
                            (selectedProp: any) => {
                                return selectedProp;
                            },
                            () => { }
                        )
                    );
                }
            }
        );
    }

    add(predicate: ARTURIResource) {
        if (predicate.getURI() == SKOSXL.prefLabel.getURI() || 
            predicate.getURI() == SKOSXL.altLabel.getURI() || 
            predicate.getURI() == SKOSXL.hiddenLabel.getURI()
        ) { //SKOSXL
            let prefLabelPred: boolean = predicate.getURI() == SKOSXL.prefLabel.getURI();
            this.creationModals.newXLabel("Add " + predicate.getShow(), null, null, null, null, null, { enabled: true, allowSameLang: !prefLabelPred }).then(
                (data: NewXLabelModalReturnData) => {
                    let addFunctions: MultiAddFunction[] = [];
                    let errorHandler: (errors: MultiAddError[]) => void;

                    if (predicate.getURI() == SKOSXL.prefLabel.getURI()) {
                        data.labels.forEach((label: ARTLiteral) => {
                            addFunctions.push({ 
                                function: this.skosxlService.setPrefLabel(<ARTURIResource>this.resource, label, data.cls), 
                                value: label 
                            });
                        });
                        errorHandler = (errors: MultiAddError[]) => {
                            if (errors.length == 1) { //if only one error, try to handle it
                                let err: Error = errors[0].error;
                                if (err.name.endsWith('PrefAltLabelClashException')) {
                                    this.basicModals.confirm("Warning", err.message + " Do you want to force the creation?", "warning").then(
                                        confirm => {
                                            this.skosxlService.setPrefLabel(<ARTURIResource>this.resource, <ARTLiteral>errors[0].value, data.cls, false).subscribe(
                                                stResp => this.update.emit(null)
                                            );
                                        },
                                        () => {}
                                    );
                                }
                            } else {
                                let message = "The addition of the following values have failed:"
                                errors.forEach((e: MultiAddError) => {
                                    message += "\n\n" + e.value.toNT() + "\nReason:\n" + e.error.name + ((e.error.message != null) ? ":\n" + e.error.message : "");
                                });
                                this.basicModals.alert("Error", message, "error");
                            }
                        }
                    } else if (predicate.getURI() == SKOSXL.altLabel.getURI()) {
                        data.labels.forEach((label: ARTLiteral) => {
                            addFunctions.push({ 
                                function: this.skosxlService.addAltLabel(<ARTURIResource>this.resource, label, data.cls), 
                                value: label 
                            });
                        });
                    } else if (predicate.getURI() == SKOSXL.hiddenLabel.getURI()) {
                        data.labels.forEach((label: ARTLiteral) => {
                            addFunctions.push({ 
                                function: this.skosxlService.addHiddenLabel(<ARTURIResource>this.resource, label, data.cls), 
                                value: label 
                            });
                        });
                    }
                    this.addMultiple(addFunctions, errorHandler);
                },
                () => {}
            );
        } else if (predicate.getURI() == OntoLex.isDenotedBy.getURI()) {
            this.creationModals.newOntoLexicalizationCf("Add a lexical sense", predicate, false).then(
                (data: NewOntoLexicalizationCfModalReturnData) => {
                    this.ontolexService.addLexicalization(data.linkedResource, this.resource, data.createPlain, data.createSense, data.cls, data.cfValue).subscribe(
                        stResp => {
                            this.update.emit()
                        }
                    );
                },
                () => {}
            )
        } else { //Not SKOSXL lexicalization
            let prefLabelPred: boolean = predicate.getURI() == SKOS.prefLabel.getURI();
            this.creationModals.newPlainLiteral("Add " + predicate.getShow(), null, null, null, null, null, { enabled: true, allowSameLang: !prefLabelPred }).then(
                (labels: ARTLiteral[]) => {
                    let addFunctions: MultiAddFunction[] = [];
                    let errorHandler: (errors: MultiAddError[]) => void;
                    if (predicate.getURI() == SKOS.prefLabel.getURI()) {
                        labels.forEach((label: ARTLiteral) => {
                            addFunctions.push({ 
                                function: this.skosService.setPrefLabel(<ARTURIResource>this.resource, label), 
                                value: label 
                            });
                        });
                        errorHandler = (errors: MultiAddError[]) => {
                            if (errors.length == 1) { //if only one error, try to handle it
                                let err: Error = errors[0].error;
                                if (err.name.endsWith('PrefAltLabelClashException')) {
                                    this.basicModals.confirm("Warning", err.message + " Do you want to force the creation?", "warning").then(
                                        confirm => {
                                            this.skosService.setPrefLabel(<ARTURIResource>this.resource, <ARTLiteral>errors[0].value, false).subscribe(
                                                stResp => this.update.emit(null)
                                            );
                                        },
                                        () => {}
                                    );
                                }
                            } else {
                                let message = "The addition of the following values have failed:"
                                errors.forEach((e: MultiAddError) => {
                                    message += "\n\n" + e.value.toNT() + "\nReason:\n" + e.error.name + ((e.error.message != null) ? ":\n" + e.error.message : "");
                                });
                                this.basicModals.alert("Error", message, "error");
                            }
                        }
                    } else if (predicate.getURI() == SKOS.altLabel.getURI()) {
                        labels.forEach((label: ARTLiteral) => {
                            addFunctions.push({ 
                                function: this.skosService.addAltLabel(<ARTURIResource>this.resource, label), 
                                value: label 
                            });
                        });
                    } else if (predicate.getURI() == SKOS.hiddenLabel.getURI()) {
                        labels.forEach((label: ARTLiteral) => {
                            addFunctions.push({ 
                                function: this.skosService.addHiddenLabel(<ARTURIResource>this.resource, label), 
                                value: label 
                            });
                        });
                    } else { //default case, rdfs:label (or maybe a custom property) for which doens't exist a dedicated service
                        labels.forEach((label: ARTLiteral) => {
                            addFunctions.push({ 
                                function: this.resourcesService.addValue(this.resource, predicate, label),
                                value: label 
                            });
                        });
                    }
                    this.addMultiple(addFunctions, errorHandler);
                },
                () => { }
            );
        }

    }

    removePredicateObject(predicate: ARTURIResource, object: ARTNode) {
        this.getRemoveFunction(predicate, object).subscribe(
            stResp => this.update.emit()
        );
    }

    getRemoveFunctionImpl(predicate: ARTURIResource, object: ARTNode): Observable<any> {
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
                return this.resourcesService.removeValue(<ARTURIResource>this.resource, predicate, (<ARTLiteral>object));
            } else if (predicate.getURI() == OntoLex.isDenotedBy.getURI()) {
                return this.ontolexService.removePlainLexicalization(<ARTResource>object, this.resource);
            }
        } else {//predicate is some subProperty of a root property
            return this.resourcesService.removeValue(this.resource, predicate, object);
        }
    }

}