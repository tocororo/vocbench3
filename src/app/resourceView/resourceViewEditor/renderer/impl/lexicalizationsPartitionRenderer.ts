import { Component, SimpleChanges } from "@angular/core";
import { TranslateService } from "@ngx-translate/core";
import { from, Observable, of } from 'rxjs';
import { flatMap, map } from 'rxjs/operators';
import { ModalType } from 'src/app/widget/modal/Modals';
import { ARTLiteral, ARTNode, ARTPredicateObjects, ARTResource, ARTURIResource, ResAttribute } from "../../../../models/ARTResources";
import { CustomForm, CustomFormValue } from "../../../../models/CustomForms";
import { Language } from "../../../../models/LanguagesCountries";
import { ResViewPartition } from "../../../../models/ResourceView";
import { OntoLex, RDFS, SKOS, SKOSXL } from "../../../../models/Vocabulary";
import { CustomFormsServices } from "../../../../services/customFormsServices";
import { OntoLexLemonServices } from "../../../../services/ontoLexLemonServices";
import { PropertyServices } from "../../../../services/propertyServices";
import { ResourcesServices } from "../../../../services/resourcesServices";
import { ResourceViewServices } from "../../../../services/resourceViewServices";
import { SkosServices } from "../../../../services/skosServices";
import { SkosxlServices } from "../../../../services/skosxlServices";
import { BasicModalServices } from "../../../../widget/modal/basicModal/basicModalServices";
import { BrowsingModalServices } from '../../../../widget/modal/browsingModal/browsingModalServices';
import { CreationModalServices } from "../../../../widget/modal/creationModal/creationModalServices";
import { NewOntoLexicalizationCfModalReturnData } from "../../../../widget/modal/creationModal/newResourceModal/ontolex/newOntoLexicalizationCfModal";
import { NewXLabelModalReturnData } from "../../../../widget/modal/creationModal/newResourceModal/skos/newXLabelModal";
import { ResViewModalServices } from "../../resViewModals/resViewModalServices";
import { LexicalizationEnrichmentHelper } from "../lexicalizationEnrichmentHelper";
import { MultiActionError, MultiActionFunction } from "../multipleActionHelper";
import { PartitionRendererMultiRoot } from "../partitionRendererMultiRoot";
import { EnrichmentType, PropertyEnrichmentHelper, PropertyEnrichmentInfo } from "../propertyEnrichmentHelper";

@Component({
    selector: "lexicalizations-renderer",
    templateUrl: "../partitionRenderer.html",
})
export class LexicalizationsPartitionRenderer extends PartitionRendererMultiRoot {

    partition = ResViewPartition.lexicalizations;
    addBtnImgTitle = "Add a lexicalization";
    addBtnImgSrc = "./assets/images/icons/actions/annotationProperty_create.png";

    private predicateOrder: string[] = [
        SKOSXL.prefLabel.getURI(), SKOSXL.altLabel.getURI(), SKOSXL.hiddenLabel.getURI(),
        SKOS.prefLabel.getURI(), SKOS.altLabel.getURI(), SKOS.hiddenLabel.getURI(),
        RDFS.label.getURI()
    ];

    constructor(resourcesService: ResourcesServices, cfService: CustomFormsServices,
        basicModals: BasicModalServices, resViewModals: ResViewModalServices,
        private skosService: SkosServices, private skosxlService: SkosxlServices, private propService: PropertyServices,
        private resViewService: ResourceViewServices, private ontolexService: OntoLexLemonServices,
        private creationModals: CreationModalServices, private browsingModals: BrowsingModalServices,
        private lexicalizationEnrichmentHelper: LexicalizationEnrichmentHelper, private translateService: TranslateService) {
        super(resourcesService, cfService, basicModals, resViewModals);
    }

    ngOnInit() {
        super.ngOnInit();
    }

    ngOnChanges(changes: SimpleChanges) {
        super.ngOnChanges(changes);
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
                        //same lang code, order alphabetically
                        return a.getShow().localeCompare(b.getShow());
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
        return of(true);
    }

    private ensureInitializedRootProperties(): Observable<void> {
        if (this.rootProperties.length == 0) { //root properties not yet initialized
            return this.resViewService.getLexicalizationProperties(this.resource).pipe(
                map(props => {
                    this.rootProperties = props;
                })
            );
        } else { //root properties already initialized
            return of(null);
        }
    }

    getPredicateToEnrich(): Observable<ARTURIResource> {
        return this.ensureInitializedRootProperties().pipe(
            flatMap(res => {
                if (this.rootProperties.length == 1) { //just one property => return it
                    return of(this.rootProperties[0]);
                } else { //multiple properties => ask user to select
                    return from(
                        this.browsingModals.browsePropertyTree({key:"DATA.ACTIONS.SELECT_PROPERTY"}, this.rootProperties).then(
                            (selectedProp: any) => {
                                return selectedProp;
                            },
                            () => { }
                        )
                    );
                }
            })
        );
    }

    add(predicate: ARTURIResource) {
        PropertyEnrichmentHelper.getPropertyEnrichmentInfo(predicate, this.propService, this.basicModals).subscribe(
            (data: PropertyEnrichmentInfo) => {
                if (data.type == null) { //range selection canceled
                    return;
                } else if (data.type == EnrichmentType.customForm) { //if a custom form has been defined, use it
                    this.enrichWithCustomForm(predicate, data.form);
                } else { //otherwise (default case, where type is "resource" and rangeCollection is [skosxl:Label]) use the proper enrichment service
                    this.enrichWithLabel(predicate)
                }
            }
        );
    }

    private enrichWithLabel(predicate: ARTURIResource) {
        if (predicate.equals(SKOSXL.prefLabel) || predicate.equals(SKOSXL.altLabel) || predicate.equals(SKOSXL.hiddenLabel)) { //SKOSXL
            let prefLabelPred: boolean = predicate.equals(SKOSXL.prefLabel);
            this.creationModals.newXLabel({key: "ACTIONS.ADD_X", params:{x: predicate.getShow()}}, null, null, null, null, null, { enabled: true, allowSameLang: !prefLabelPred }).then(
                (data: NewXLabelModalReturnData) => {
                    this.addMultipleValues(predicate, data.labels, data.cls);
                },
                () => {}
            );
        } else if (predicate.equals(OntoLex.isDenotedBy)) {
            this.creationModals.newOntoLexicalizationCf({key:"DATA.ACTIONS.ADD_LEX_ENTRY"}, predicate, false).then(
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
            let prefLabelPred: boolean = predicate.equals(SKOS.prefLabel);
            this.creationModals.newPlainLiteral({key: "ACTIONS.ADD_X", params:{x: predicate.getShow()}}, null, null, null, null, null, { enabled: true, allowSameLang: !prefLabelPred }).then(
                (labels: ARTLiteral[]) => {
                    this.addMultipleValues(predicate, labels);
                },
                () => { }
            );
        }
    }

    private enrichWithCustomForm(predicate: ARTURIResource, form: CustomForm) {
        this.resViewModals.enrichCustomForm({key: "ACTIONS.ADD_X", params:{x: predicate.getShow()}}, form.getId()).then(
            (entryMap: any) => {
                let cfValue: CustomFormValue = new CustomFormValue(form.getId(), entryMap);
                this.resourcesService.addValue(this.resource, predicate, cfValue).subscribe(
                    stResp => this.update.emit()
                );
            },
            () => { }
        )
    }

    removePredicateObject(predicate: ARTURIResource, object: ARTNode) {
        this.getRemoveFunction(predicate, object).subscribe(
            stResp => this.update.emit()
        );
    }

    getRemoveFunctionImpl(predicate: ARTURIResource, object: ARTNode): Observable<any> {
        if (this.isKnownProperty(predicate)) { //if it is removing a value about a root property, call the specific method
            if (predicate.equals(SKOSXL.prefLabel)) {
                return this.skosxlService.removePrefLabel(<ARTURIResource>this.resource, <ARTResource>object);
            } else if (predicate.equals(SKOSXL.altLabel)) {
                return this.skosxlService.removeAltLabel(<ARTURIResource>this.resource, <ARTResource>object);
            } else if (predicate.equals(SKOSXL.hiddenLabel)) {
                return this.skosxlService.removeHiddenLabel(<ARTURIResource>this.resource, <ARTResource>object);
            } else if (predicate.equals(SKOS.prefLabel)) {
                return this.skosService.removePrefLabel(<ARTURIResource>this.resource, <ARTLiteral>object);
            } else if (predicate.equals(SKOS.altLabel)) {
                return this.skosService.removeAltLabel(<ARTURIResource>this.resource, <ARTLiteral>object);
            } else if (predicate.equals(SKOS.hiddenLabel)) {
                return this.skosService.removeHiddenLabel(<ARTURIResource>this.resource, <ARTLiteral>object);
            } else if (predicate.equals(RDFS.label)) {
                return this.resourcesService.removeValue(<ARTURIResource>this.resource, predicate, (<ARTLiteral>object));
            } else if (predicate.equals(OntoLex.isDenotedBy)) {
                return this.ontolexService.removePlainLexicalization(<ARTResource>object, this.resource);
            }
        } else {//predicate is some subProperty of a root property
            return this.resourcesService.removeValue(this.resource, predicate, object);
        }
    }

    private copyLocaleHandler(predicate: ARTURIResource, eventData: { value: ARTNode, locales: Language[] }) {
        let value: ARTNode = eventData.value;
        let locales: Language[] = eventData.locales;
        let labels: ARTLiteral[] = [];
        locales.forEach(l => {
            if (value instanceof ARTLiteral) { //plain literal label: skos or rdfs
                labels.push(new ARTLiteral(value.getValue(), null, l.tag));
            } else if (value instanceof ARTURIResource) { //skosxl label
                labels.push(new ARTLiteral(value.getShow(), null, l.tag));
            }
        })
        this.addMultipleValues(predicate, labels);
    }


    /**
     * This method prepares the objects to provide to the addMultiple function, 
     * namely the add functions and (optionally) the error handlers.
     * This code is in a dedicated method so it can be shared by the "classic" add and by the "copy to locale" operation
     * (that could copy a label in multile locales).
     * Since the multiple add is allowed only for rdfs, skos and skosxl lexicalization predicates, this methods handles only those predicates.
     * @param predicate 
     * @param labels 
     * @param cls optional class of the reified label. Useful expecially in with skosxl lexicalization predicates
     */
    private addMultipleValues(predicate: ARTURIResource, labels: ARTLiteral[], cls?: ARTURIResource) {
        let addFunctions: MultiActionFunction[] = [];
        let errorHandler: (errors: MultiActionError[]) => void;

        //SKOS or SKOSXL lexicalization predicates
        if (
            predicate.equals(SKOSXL.prefLabel) || predicate.equals(SKOSXL.altLabel) || predicate.equals(SKOSXL.hiddenLabel) ||
            predicate.equals(SKOS.prefLabel) || predicate.equals(SKOS.altLabel) || predicate.equals(SKOS.hiddenLabel)
        ) {
            labels.forEach((label: ARTLiteral) => {
                addFunctions.push({ 
                    function: this.lexicalizationEnrichmentHelper.getAddLabelFn(<ARTURIResource>this.resource, predicate, label, cls),
                    value: label 
                });
            });
            errorHandler = (errors: MultiActionError[]) => {
                if (errors.length == 1) { //if only one error, try to handle it
                    let err: Error = errors[0].error;
                    if (err.name.endsWith('PrefAltLabelClashException') || err.name.endsWith('BlacklistForbiddendException')) {
                        let msg = err.message + " " + this.translateService.instant("MESSAGES.FORCE_OPERATION_CONFIRM");
                        this.basicModals.confirm({key:"STATUS.WARNING"}, msg, ModalType.warning).then(
                            confirm => {
                                this.lexicalizationEnrichmentHelper.getAddLabelFn(
                                    <ARTURIResource>this.resource, predicate, <ARTLiteral>errors[0].value, cls, 
                                    !err.name.endsWith('PrefAltLabelClashException'), err.name.endsWith('BlacklistForbiddendException')
                                ).subscribe(
                                    stResp => this.update.emit(null)
                                );
                            },
                            () => {}
                        );
                    } else {
                        this.handleSingleMultiAddError(errors[0]);
                    }
                } else {
                    this.handleMultipleMultiAddError(errors);
                }
            }
        } else { //rdfs:label (or maybe a custom property) for which doens't exist a dedicated service
            labels.forEach((label: ARTLiteral) => {
                addFunctions.push({ 
                    function: this.resourcesService.addValue(this.resource, predicate, label),
                    value: label 
                });
            });
        }
        this.addMultiple(addFunctions, errorHandler);
    }


}