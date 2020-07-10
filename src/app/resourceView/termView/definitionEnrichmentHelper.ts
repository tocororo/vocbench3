import { CustomForm } from "../../models/CustomForms";
import { Observable } from "rxjs";
import { SKOS } from "../../models/Vocabulary";
import { PropertyServices, RangeResponse } from "../../services/propertyServices";
import { BasicModalServices } from "../../widget/modal/basicModal/basicModalServices";
import { RDFTypesEnum } from "../../models/ARTResources";

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
    public static getDefinitionEnrichmentInfo(propService: PropertyServices, basicModals: BasicModalServices): Observable<DefinitionEnrichmentInfo> {
        let predicate = SKOS.definition;
        return propService.getRange(predicate).flatMap(
            (range: RangeResponse) => {
                let ranges = range.ranges;
                let customForms: CustomForm[] = range.formCollection.getForms();
                //handle 2 cases: only CustomRange, both Custom and standard range (3rd case, only "standard", is excluded since @Input customRange is true)
                if (ranges == null) { //only CustomRange
                    if (customForms.length == 1) { //just one CF in the collection => prompt it
                        return Observable.of({type: DefEnrichmentType.customForm, form: customForms[0]});
                    } else { //multiple CF => ask which one to use
                        return Observable.fromPromise(
                            //prepare the range options with the custom range entries
                            basicModals.selectCustomForm("Select a Custom Range", customForms).then(
                                (selectedCF: CustomForm) => {
                                    return {type: DefEnrichmentType.customForm, form: selectedCF};
                                },
                                () => {
                                    return { type: null };
                                }
                            )
                        )
                    }
                } else { //both standard and custom range
                    //workaroung tu include "literal" as choice in the CF selection modal
                    let rangeOptions: CustomForm[] = [new CustomForm(RDFTypesEnum.literal, RDFTypesEnum.literal)];
                    rangeOptions = rangeOptions.concat(customForms);
                    return Observable.fromPromise(
                        //ask the user to choose
                        basicModals.selectCustomForm("Select a range", rangeOptions).then(
                            (selectedCF: CustomForm) => {
                                if (selectedCF.getId() == RDFTypesEnum.literal) { //if selected range is "literal"
                                    return {type: DefEnrichmentType.literal};
                                } else { //user selected a custom range
                                    return {type: DefEnrichmentType.customForm, form: selectedCF};
                                }
                            }
                        )
                    )
                }
            }
        );
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