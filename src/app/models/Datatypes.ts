import { ARTURIResource, ARTLiteral } from "./ARTResources";
import { XmlSchema, RDF, OWL } from "./Vocabulary";

export interface DatatypeRestrictionsMap extends Map<string, DatatypeRestrictionDescription> { } //map of datatype -> restrictions

export class DatatypeUtils {

    public static xsdBuiltInTypes: ARTURIResource[] = [
        XmlSchema.anyURI,
        XmlSchema.base64Binary,
        XmlSchema.boolean,
        XmlSchema.byte,
        XmlSchema.date,
        XmlSchema.dateTime,
        XmlSchema.decimal,
        XmlSchema.double,
        XmlSchema.duration,
        XmlSchema.ENTITIES,
        XmlSchema.ENTITY,
        XmlSchema.float,
        XmlSchema.gDay,
        XmlSchema.gMonth,
        XmlSchema.gMonthDay,
        XmlSchema.gYear,
        XmlSchema.gYearMonth,
        XmlSchema.hexBinary,
        XmlSchema.ID,
        XmlSchema.IDREF,
        XmlSchema.IDREFS,
        XmlSchema.int,
        XmlSchema.integer,
        XmlSchema.language,
        XmlSchema.long,
        XmlSchema.Name,
        XmlSchema.NCName,
        XmlSchema.negativeInteger,
        XmlSchema.NMTOKEN,
        XmlSchema.NMTOKENS,
        XmlSchema.nonNegativeInteger,
        XmlSchema.nonPositiveInteger,
        XmlSchema.normalizedString,
        XmlSchema.NOTATION,
        XmlSchema.positiveInteger,
        XmlSchema.QName,
        XmlSchema.short,
        XmlSchema.string,
        XmlSchema.time,
        XmlSchema.token,
        XmlSchema.unsignedByte,
        XmlSchema.unsignedInt,
        XmlSchema.unsignedLong,
        XmlSchema.unsignedShort,
    ];

    /**
     * Datatypes defined as "numeric" in the XSD definition
     */
    public static xsdNumericDatatypes: ARTURIResource[] = [
        XmlSchema.byte,
        XmlSchema.decimal,
        XmlSchema.double,
        XmlSchema.float,
        XmlSchema.int,
        XmlSchema.integer,
        XmlSchema.long,
        XmlSchema.negativeInteger,
        XmlSchema.nonNegativeInteger,
        XmlSchema.nonPositiveInteger,
        XmlSchema.positiveInteger,
        XmlSchema.short,
        XmlSchema.unsignedByte,
        XmlSchema.unsignedInt,
        XmlSchema.unsignedLong,
        XmlSchema.unsignedShort,
    ];

    /**
     * Datatypes for which exists a UI widget or a programmatic check that validate implicitly the value
     * e.g. xsd:boolean, xsd:date, xsd:string or rdf:langString (which are valid simply if not empty)
     */
    public static programmaticallyValidableType: ARTURIResource[] = [
        RDF.langString,
        XmlSchema.boolean,
        XmlSchema.date,
        XmlSchema.dateTime,
        XmlSchema.time,
        XmlSchema.string,
    ]

    /**
     * Standard restrictions defined by the xsd scheme
     * Useful references:
     * https://www.w3.org/TR/xmlschema11-2
     * http://www.datypic.com/sc/xsd/s-datatypes.xsd.html
     * http://books.xmlschemata.org/relaxng/relax-CHP-19.html
     * 
     * the real pattern of xsd:Name is "\i\c*", see here https://github.com/TIBCOSoftware/genxdm/issues/69#issuecomment-125290603
     */
    public static typeRestrictionsMap: Map<string, ConstrainingFacets> = new Map([
        [XmlSchema.anyURI.getURI(), {}],
        [XmlSchema.base64Binary.getURI(), { pattern: "((([A-Za-z0-9+/] ?){4})*(([A-Za-z0-9+/] ?){3}[A-Za-z0-9+/]|([A-Za-z0-9+/] ?){2}[AEIMQUYcgkosw048] ?=|[A-Za-z0-9+/] ?[AQgw] ?= ?=))?" }],
        [XmlSchema.boolean.getURI(), {}],
        [XmlSchema.byte.getURI(), { minInclusive: -128, maxInclusive: 128, pattern: "[\-+]?[0-9]+" }],
        [XmlSchema.date.getURI(), {}],
        [XmlSchema.dateTime.getURI(), {}],
        [XmlSchema.dateTimeStamp.getURI(), { pattern: ".*(Z|(\+|-)[0-9][0-9]:[0-9][0-9])" }],
        [XmlSchema.dayTimeDuration.getURI(), {}], //unknown pattern [^YM]*(T.*)?
        [XmlSchema.decimal.getURI(), {}],
        [XmlSchema.double.getURI(), {}],
        [XmlSchema.duration.getURI(), {}],
        [XmlSchema.ENTITIES.getURI(), {}],
        [XmlSchema.ENTITY.getURI(), {}], //unknown pattern \i\c* ∩ [\i-[:]][\c-[:]]*
        [XmlSchema.float.getURI(), {}],
        [XmlSchema.gDay.getURI(), {}],
        [XmlSchema.gMonth.getURI(), {}],
        [XmlSchema.gMonthDay.getURI(), {}],
        [XmlSchema.gYear.getURI(), {}],
        [XmlSchema.gYearMonth.getURI(), {}],
        [XmlSchema.hexBinary.getURI(), {}],
        [XmlSchema.ID.getURI(), {}], //unknown pattern \i\c* ∩ [\i-[:]][\c-[:]]*
        [XmlSchema.IDREF.getURI(), {}], //unknown pattern \i\c* ∩ [\i-[:]][\c-[:]]*
        [XmlSchema.IDREFS.getURI(), {}],
        [XmlSchema.int.getURI(), { minInclusive: -2147483648, maxInclusive: 2147483647, pattern: "[\-+]?[0-9]+" }],
        [XmlSchema.integer.getURI(), { pattern: "[\-\+]?[0-9]+" }],
        [XmlSchema.language.getURI(), { pattern: "[a-zA-Z]{1,8}(-[a-zA-Z0-9]{1,8})*" }],
        [XmlSchema.long.getURI(), { minInclusive: -9223372036854775808, maxInclusive: 9223372036854775807, pattern: "[\-+]?[0-9]+" }],
        [XmlSchema.Name.getURI(), { pattern: "[_:A-Za-z][-._:A-Za-z0-9]*" }],
        [XmlSchema.NCName.getURI(), {}], //unknown pattern \i\c* ∩ [\i-[:]][\c-[:]]*
        [XmlSchema.negativeInteger.getURI(), { maxInclusive: -1, pattern: "[\-+]?[0-9]+" }],
        [XmlSchema.NMTOKEN.getURI(), {}],
        [XmlSchema.NMTOKENS.getURI(), {}],
        [XmlSchema.nonNegativeInteger.getURI(), { minInclusive: 0, pattern: "[\-+]?[0-9]+" }],
        [XmlSchema.nonPositiveInteger.getURI(), { maxInclusive: 0, pattern: "[\-+]?[0-9]+" }],
        [XmlSchema.normalizedString.getURI(), {}],
        [XmlSchema.NOTATION.getURI(), {}],
        [XmlSchema.positiveInteger.getURI(), { minInclusive: 1, pattern: "^[\-+]?[0-9]+$" }],
        [XmlSchema.QName.getURI(), {}],
        [XmlSchema.short.getURI(), { minInclusive: -32768, maxInclusive: 32767, pattern: "[\-+]?[0-9]+" }],
        [XmlSchema.string.getURI(), {}],
        [XmlSchema.time.getURI(), {}],
        [XmlSchema.token.getURI(), {}],
        [XmlSchema.unsignedByte.getURI(), { minInclusive: 0, maxInclusive: 255, pattern: "[\-+]?[0-9]+" }],
        [XmlSchema.unsignedInt.getURI(), { minInclusive: 0, maxInclusive: 4294967295, pattern: "[\-+]?[0-9]+" }],
        [XmlSchema.unsignedLong.getURI(), { minInclusive: 0, maxInclusive: 18446744073709551615, pattern: "[\-+]?[0-9]+" }],
        [XmlSchema.unsignedShort.getURI(), { minInclusive: 0, maxInclusive: 65535, pattern: "[\-+]?[0-9]+" }],
        [XmlSchema.yearMonthDuration.getURI(), { pattern: "-?P((([0-9]+Y)([0-9]+M)?)|([0-9]+M))" }],
    ]);

    /**
     * Restrictions not defined explicitly in the standards, but defined accordingly their description
     */
    public static notStandardRestrictionsMap: Map<string, ConstrainingFacets> = new Map([
        [OWL.rational.getURI(), { pattern: "[\-+]?[0-9]+(/[1-9][0-9]*)*" }], //https://www.w3.org/TR/owl2-syntax/#Real_Numbers.2C_Decimal_Numbers.2C_and_Integers
    ]);

}

export class ConstrainingFacets {
    minExclusive?: number;
    minInclusive?: number;
    maxExclusive?: number;
    maxInclusive?: number;
    pattern?: string;
}

export class DatatypeRestrictionDescription {
    enumerations?: ARTLiteral[];
    facets?: FacetsRestriction;
}

export class FacetsRestriction {
    base: ARTURIResource;
    facets: ConstrainingFacets = new ConstrainingFacets();
}