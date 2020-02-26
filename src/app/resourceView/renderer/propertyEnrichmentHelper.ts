import { Observable } from "rxjs";
import { ARTLiteral, ARTURIResource, RDFTypesEnum } from "../../models/ARTResources";
import { CustomForm, FormCollection } from "../../models/CustomForms";
import { PropertyServices, RangeType } from "../../services/propertyServices";
import { BasicModalServices } from "../../widget/modal/basicModal/basicModalServices";

export class PropertyEnrichmentHelper {

    /**
     * Given a predicate, gets its range and based on the range (and the eventually custom range) returns a PropertyEnrichmentInfo object
     * that describes how to enrich the property. Thi object will contains:
     * - type: 
     *      tells how the property needs to be enriched (resource|literal|customForm).
     *      In case of error or if the flow is interrupted (closed a modal), the type is null.
     * - allowedDatatypes: list of datatypes assignable to the value. It is provided optionally if type is "typedLiteral"
     * - dataRanges: list of dataRange values. It is provided optionally if type is "typedLiteral"
     * - form: chosed custom form to enrich. It is provided if type is "customForm"
     * 
     * The flow to create a PropertyEnrichmentInfo, requires in some case interaction with the user
     * (e.g. selection of literal type in case rangeType of the property is literal), thus in this cases it is necessary
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
     * @param predicate predicate to enrich
     * @param propService used to retrieve the range of predicate
     * @param basicModals used to prompt the user some decisions or to show error messages
     */
    public static getPropertyEnrichmentInfo(predicate: ARTURIResource, propService: PropertyServices, basicModals: BasicModalServices): Observable<PropertyEnrichmentInfo> {
        return propService.getRange(predicate).flatMap(
            range => {
                var ranges = range.ranges;
                var formCollection: FormCollection = range.formCollection;
                /**
                 * only "classic" range
                 */
                if (ranges != undefined && formCollection == undefined) {
                    //Check on the rangeType. Available values: resource, literal, undetermined, inconsistent
                    if (ranges.type == RangeType.resource) {
                        return Observable.of({ type: EnrichmentType.resource, rangeCollection: ranges.rangeCollection });
                    } else if (ranges.type == RangeType.literal) {
                        let datatypes = ranges.rangeCollection ? ranges.rangeCollection.resources : null;
                        let dataRanges = ranges.rangeCollection ? ranges.rangeCollection.dataRanges : null;
                        return Observable.of({
                            type: EnrichmentType.literal,
                            allowedDatatypes: datatypes,
                            dataRanges: dataRanges
                        });
                    } else if (ranges.type == RangeType.undetermined) {
                        var options = [RDFTypesEnum.resource, RDFTypesEnum.literal];
                        return Observable.fromPromise(
                            basicModals.select("Select range type", null, options).then(
                                (selectedRange: any) => {
                                    if (selectedRange == RDFTypesEnum.resource) {
                                        return { type: EnrichmentType.resource }
                                    } else if (selectedRange == RDFTypesEnum.literal) {
                                        return { type: EnrichmentType.literal };
                                    }
                                },
                                () => {
                                    return { type: null };
                                }
                            )
                        );
                    } else if (ranges.type == "inconsistent") {
                        basicModals.alert("Error", "Error range of " + predicate.getShow() + " property is inconsistent", "error");
                        return Observable.of({ type: null });
                    }
                }
                /**
                 * both "classic" and custom range
                 */
                else if (ranges != undefined && formCollection != undefined) {
                    var rangeOptions: CustomForm[] = [];
                    //classic ranges (this is a workaround to use selection CF modal with classic range as well)
                    if (ranges.type == RangeType.resource) {
                        rangeOptions.push(new CustomForm(RDFTypesEnum.resource, RDFTypesEnum.resource));
                    } else if (ranges.type == RangeType.literal) {
                        rangeOptions.push(new CustomForm(RDFTypesEnum.literal, RDFTypesEnum.literal));
                    } else if (ranges.type == RangeType.undetermined) { //undetermined => range could be resource and any kind of literal
                        rangeOptions.push(new CustomForm(RDFTypesEnum.resource, RDFTypesEnum.resource));
                        rangeOptions.push(new CustomForm(RDFTypesEnum.literal, RDFTypesEnum.literal));
                    }
                    //and custom ranges
                    var customForms = formCollection.getForms();
                    rangeOptions = rangeOptions.concat(customForms);

                    //ask the user to choose
                    return Observable.fromPromise(
                        basicModals.selectCustomForm("Select a range type", rangeOptions).then(
                            (selectedCF: CustomForm) => {
                                //check if selected range is one of the customs
                                for (var i = 0; i < customForms.length; i++) {
                                    if ((<CustomForm>selectedCF).getId() == customForms[i].getId()) {
                                        return { type: EnrichmentType.customForm, form: customForms[i] };
                                    }
                                }
                                if (selectedCF.getId() == RDFTypesEnum.resource) {
                                    return { type: EnrichmentType.resource };
                                } else if (selectedCF.getId() == RDFTypesEnum.literal) {
                                    return { type: EnrichmentType.literal };
                                }
                            },
                            () => {
                                return { type: null };
                            }
                        )
                    );
                }
                /**
                 * only custom range
                 */
                else if (ranges == undefined && formCollection != undefined) {
                    var forms = formCollection.getForms();
                    if (forms.length == 1) {//just one CREntry => prompt the CR form without asking to choose which CRE to use
                        return Observable.of({ type: EnrichmentType.customForm, form: forms[0] });
                    } else if (forms.length > 1) { //multiple CREntry => ask which one to use
                        //prepare the range options with the custom range entries
                        return Observable.fromPromise(
                            basicModals.selectCustomForm("Select a Custom Range", forms).then(
                                (selectedCF: CustomForm) => {
                                    return { type: EnrichmentType.customForm, form: selectedCF };
                                },
                                () => {
                                    return { type: null };
                                }
                            )
                        );
                    } else { //no CR linked to the property has no Entries => error
                        basicModals.alert("Error", "The FormCollection " + formCollection.getId() + ", linked to property " + predicate.getShow() +
                            ", doesn't contain any CustomForm", "error");
                        return Observable.of({ type: null });
                    }
                }
            }
        );
    }

}

export class PropertyEnrichmentInfo {
    type: EnrichmentType;
    allowedDatatypes?: ARTURIResource[]; //provided optionally if type is "typedLiteral"
    dataRanges?: (ARTLiteral[])[]; //provided optionally if type is "typedLiteral"
    form?: CustomForm; //provided if type is "customForm"
    rangeCollection?: ARTURIResource[]; //provided optionally if type is "resource"
}

export enum EnrichmentType {
    literal = "literal",
    resource = "resource",
    customForm = "customForm"
}