import { Observable } from "rxjs";
import { RDFTypesEnum } from "../../models/ARTResources";
import { CustomForm } from "../../models/CustomForms";
import { SKOS } from "../../models/Vocabulary";
import { PropertyServices, RangeResponse } from "../../services/propertyServices";
import { BasicModalServices } from "../../widget/modal/basicModal/basicModalServices";
import { DefinitionCustomRangeConfig } from "./languageBox/languageBoxComponent";

export class DefinitionEnrichmentHelper {

    /**
     * Returns a DefinitionEnrichmentInfo object that describes how to enrich a skos:definition. This object will contains:
     * - type: 
     *      tells how the definition needs to be enriched (literal|customForm).
     *      In case of error or if the flow is interrupted (closed a modal), the type is null.
     * - form: chosed custom form to enrich. It is provided if type is "customForm"
     * 
     * The flow to create a DefinitionEnrichmentInfo, requires in some case interaction with the user, thus in this cases it is necessary
     * to convert a promise (returned by the dialog) to an Observable. See below in the code:
     * ----------
     * return Observable.fromPromise(basicModals.select(...).then(...)
     * ----------
     * Moreover, in these cases, the flow can be interrupted if the user close a dialog. Since this method is expected to
     * return a PropertyEnrichmentInfo anyway, it will be returned this object with type null.
     * ----------
     * return { type: null };
     * ----------
     * 
     * @param propService used to retrieve the range of predicate
     * @param basicModals used to prompt the user some decisions or to show error messages
     */
    public static getDefinitionEnrichmentInfo(propService: PropertyServices, basicModals: BasicModalServices, crConfig: DefinitionCustomRangeConfig): Observable<DefinitionEnrichmentInfo> {
        let predicate = SKOS.definition;

        return this.fillDefinitionCustomRangeConfig(propService, crConfig).flatMap(
            () => {
                /* 
                handle 2 cases: 
                - both Custom and standard range; 
                - only CustomRange 
                (3rd case, only "standard", is excluded since this method is called only when skos:definition has CR)
                */
                if (crConfig.hasLiteralRange) { //both standard and CR
                    //workaround tu include "literal" as choice in the CF selection modal
                    let rangeOptions: CustomForm[] = [new CustomForm(RDFTypesEnum.literal, RDFTypesEnum.literal)];
                    rangeOptions = rangeOptions.concat(crConfig.customForms);
                    return Observable.fromPromise(
                        //ask the user to choose
                        basicModals.selectCustomForm("Select a range", rangeOptions).then(
                            (selectedCF: CustomForm) => {
                                if (selectedCF.getId() == RDFTypesEnum.literal) { //if selected range is "literal"
                                    return {type: DefEnrichmentType.literal};
                                } else { //user selected a custom range
                                    return {type: DefEnrichmentType.customForm, form: selectedCF};
                                }
                            },
                            () => {
                                return { type: null };
                            }
                        )
                    );
                } else { //only CR
                    if (crConfig.customForms.length == 1) { //just one CF in the collection => prompt it
                        return Observable.of({type: DefEnrichmentType.customForm, form: crConfig.customForms[0]});
                    } else { //multiple CF => ask which one to use
                        return Observable.fromPromise(
                            //prepare the range options with the custom range entries
                            basicModals.selectCustomForm("Select a Custom Range", crConfig.customForms).then(
                                (selectedCF: CustomForm) => {
                                    return {type: DefEnrichmentType.customForm, form: selectedCF};
                                },
                                () => {
                                    return { type: null };
                                }
                            )
                        )
                    }
                }
            }
        );
    }

    /**
     * For enriching skos:definition, a DefinitionCustomRangeConfig is supposed to be provided.
     * This method ensure that the needed info are provided in the configuration.
     * E.g. ensure that custom forms are already retrieved (memo: getDefinitionEnrichmentInfo is invoked only when skos:definition has CR)
     * @param propService 
     * @param customRangeConfig 
     */
    private static fillDefinitionCustomRangeConfig(propService: PropertyServices, crConfig: DefinitionCustomRangeConfig): Observable<void> {
        if (crConfig.customForms != null) {
            //since the CFs are already there, it means that the config has been already filled, so nothing left to do
            return Observable.of(null);
        } else { //CFs are not provided (probably it was initialized with the "hasCustomRange" attr) => fill the configuration by invoking getRange
            return propService.getRange(SKOS.definition).flatMap(
                (range: RangeResponse) => {
                    let ranges = range.ranges;
                    let customForms: CustomForm[] = range.formCollection.getForms();
                    crConfig.hasLiteralRange = ranges != null;
                    crConfig.customForms = customForms;
                    return Observable.of(null);
                }
            );
        }
    }

}

export class DefinitionEnrichmentInfo {
    type: DefEnrichmentType;
    form?: CustomForm; //provided if type is "customForm"
}

export enum DefEnrichmentType {
    literal = "literal",
    customForm = "customForm"
}