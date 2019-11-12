import { XmlSchema, RDF } from "../models/Vocabulary";
import { ARTURIResource } from "../models/ARTResources";

export class XsdValidator {

    /**
     * list of datatypes that undergo to a validation (useful to show a warning in the UI for unvalidable types)
     * The validation can be done using a validation function (see typeValidatorMap) or via UI
     * (e.g. boolean uses radio buttons that force the value to 'true' or 'false', date uses an input date. See TypedLiteralInputComponent)
     */
    public static validableTypes = [
        RDF.langString, //programmatically (not empty)
        XmlSchema.boolean, //UI
        XmlSchema.byte, //pattern
        XmlSchema.date, //UI
        XmlSchema.dateTime, //UI
        XmlSchema.decimal, //UI
        XmlSchema.double, //UI
        XmlSchema.float, //UI
        XmlSchema.int, //pattern
        XmlSchema.integer, //pattern
        XmlSchema.language, //pattern
        XmlSchema.long, //pattern
        XmlSchema.negativeInteger, //pattern
        XmlSchema.nonNegativeInteger, //pattern
        XmlSchema.nonPositiveInteger, //pattern
        XmlSchema.positiveInteger, //pattern
        XmlSchema.short, //pattern
        XmlSchema.string, //programmatically (not empty)
        XmlSchema.time, //UI
        XmlSchema.unsignedByte, //pattern
        XmlSchema.unsignedInt, //pattern
        XmlSchema.unsignedLong, //pattern
        XmlSchema.unsignedShort, //pattern
    ];

    public static isValidableType(type: ARTURIResource): boolean {
        return this.validableTypes.some(t => t.equals(type));
    }


    /**
     * Useful references:
     * https://www.w3.org/TR/xmlschema11-2
     * http://www.datypic.com/sc/xsd/s-datatypes.xsd.html
     * http://books.xmlschemata.org/relaxng/relax-CHP-19.html
     */
    public static numericTypesMap: Map<string, { min: number, max: number, pattern: string }> = new Map([
        [XmlSchema.byte.getURI(), { min: -128, max: 128, pattern: "[\-+]?[0-9]+" }],
        [XmlSchema.decimal.getURI(), { min: null, max: null, pattern: null }],
        [XmlSchema.double.getURI(), { min: null, max: null, pattern: null }],
        [XmlSchema.float.getURI(), { min: null, max: null, pattern: null }],
        [XmlSchema.int.getURI(), { min: -2147483648, max: 2147483647, pattern: "[\-+]?[0-9]+" }],
        [XmlSchema.integer.getURI(), { min: null, max: -1, pattern: "^[\-\+]?[0-9]+$" }],
        [XmlSchema.long.getURI(), { min: -9223372036854775808, max: 9223372036854775807, pattern: "[\-+]?[0-9]+" }],
        [XmlSchema.negativeInteger.getURI(), { min: null, max: null, pattern: "[\-+]?[0-9]+" }],
        [XmlSchema.nonNegativeInteger.getURI(), { min: 0, max: null, pattern: "[\-+]?[0-9]+" }],
        [XmlSchema.nonPositiveInteger.getURI(), { min: null, max: 0, pattern: "[\-+]?[0-9]+" }],
        [XmlSchema.positiveInteger.getURI(), { min: 1, max: null, pattern: "^[\-+]?[0-9]+$" }],
        [XmlSchema.short.getURI(), { min: -32768, max: 32767, pattern: "[\-+]?[0-9]+" }],
        [XmlSchema.unsignedByte.getURI(), { min: 0, max: 255, pattern: "[\-+]?[0-9]+" }],
        [XmlSchema.unsignedInt.getURI(), { min: 0, max: 4294967295, pattern: "[\-+]?[0-9]+" }],
        [XmlSchema.unsignedLong.getURI(), { min: 0, max: 18446744073709551615, pattern: "[\-+]?[0-9]+" }],
        [XmlSchema.unsignedShort.getURI(), { min: 0, max: 65535, pattern: "[\-+]?[0-9]+" }],
    ]);

    /**
     * Mappings between the datatypes and the validation functions.
     */
    private static typeValidatorMap: Map<string, ValidationFunction> = new Map([
        [
            RDF.langString.getURI(),
            (value: any) => { return value.trim() != "" }, //valid only if is not an empty string
        ],
        [
            XmlSchema.string.getURI(),
            (value: any) => { return value.trim() != "" } // if value is string, it's valid only if is not an empty string
        ],
    ]);

    public static isValid(value: any, type: ARTURIResource): boolean {
        let valid: boolean = true;
        let numericTypeConfig = this.numericTypesMap.get(type.getURI());
        if (numericTypeConfig != null) {
            if (numericTypeConfig.pattern != null) { //pattern constraint failed
                let regexp = new RegExp(numericTypeConfig.pattern);
                if (!regexp.test(value)) {
                    return false;
                }
            }
            if (numericTypeConfig.min != null && value < numericTypeConfig.min) { //constraint on the min failed
                return false;
            }
            if (numericTypeConfig.max != null && value > numericTypeConfig.max) { //constraint on the max failed
                return false;
            }
        }
        let validationFunction = this.typeValidatorMap.get(type.getURI());
        if (validationFunction != null) { //a validation function exists => use it
            valid = validationFunction(value);
        }
        //if the type is not numeric and does not exist a validation function, it means that the value does not undergo to any validation
        return valid;
    }
}


interface ValidationFunction {
    (value: any): boolean
}