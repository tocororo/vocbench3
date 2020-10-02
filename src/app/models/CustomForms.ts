import { ARTLiteral, ARTURIResource } from "./ARTResources";

export class FormCollectionMapping {

    private resource: ARTURIResource;
    private formCollection: FormCollection;
    private replace: boolean;

    constructor(formCollection: FormCollection, resource: ARTURIResource, replace: boolean) {
        this.resource = resource;
        this.formCollection = formCollection;
        this.replace = replace;
    }

    public getResource(): ARTURIResource {
        return this.resource;
    }

    public getFormCollection(): FormCollection {
        return this.formCollection;
    }

    public getReplace(): boolean {
        return this.replace;
    }

}

export class FormCollection {

    public static PREFIX = "it.uniroma2.art.semanticturkey.customform.collection.";

    private id: string;
    private forms: CustomForm[];
    private suggestions: ARTURIResource[];
    private level: CustomFormLevel;

    constructor(id: string) {
        this.id = id;
    }

    public getId(): string {
        return this.id;
    }

    public getForms(): CustomForm[] {
        return this.forms;
    }

    public setForms(forms: CustomForm[]) {
        this.forms = forms;
    }

    public getSuggestions(): ARTURIResource[] {
        return this.suggestions;
    }

    public setSuggestions(suggestions: ARTURIResource[]) {
        this.suggestions = suggestions;
    }

    public getLevel(): CustomFormLevel {
        return this.level;
    }

    public setLevel(level: CustomFormLevel) {
        this.level = level;
    }

}

export class CustomForm {

    public static PREFIX = "it.uniroma2.art.semanticturkey.customform.form.";

    private id: string;
    private name: string;
    private type: CustomFormType;
    private description: string;
    private ref: string;
    private showPropertyChain: ARTURIResource[];
    private level: CustomFormLevel;

    constructor(id: string, name?: string, description?: string) {
        this.id = id;
        if (name != null) {
            this.name = name;
        }
        if (description != null) {
            this.description = description;
        }
    }

    public getId(): string {
        return this.id;
    }

    public getName(): string {
        return this.name;
    }

    public setName(name: string) {
        this.name = name;
    }

    public getType(): CustomFormType {
        return this.type;
    }

    public setType(type: CustomFormType) {
        this.type = type;
    }

    public getDescription(): string {
        return this.description;
    }

    public setDescription(description: string) {
        this.description = description;
    }

    public getRef(): string {
        return this.ref;
    }

    public setRef(ref: string) {
        this.ref = ref;
    }

    public getShowPropertyChain(): ARTURIResource[] {
        return this.showPropertyChain;
    }

    public setShowPropertyChain(showPropertyChain: ARTURIResource[]) {
        this.showPropertyChain = showPropertyChain;
    }

    public getLevel(): CustomFormLevel {
        return this.level;
    }

    public setLevel(level: CustomFormLevel) {
        this.level = level;
    }

}

export class FormField {
    private mandatory: boolean;
    private placeholderId: string;
    private type: FormFieldType;
    private userPrompt: string;
    private converter: string;
    private datatype: string; //provided optionally only if type is literal
    private lang: string; //provided optionally only if type is literal and datatype is null or xsd:string
    private dependency: boolean = false; //tells if the FormEntry is a dependency of another FormEntry (it determines also if the FormEntry should be shown in the form) 
    private converterArg: LangStringConverterArg;// arg of coda:langString
    private annotations: FormFieldAnnotation[];

    public value: any;

    constructor(placeholderId: string, type: FormFieldType, mandatory: boolean, userPrompt: string, converter: string) {
        this.placeholderId = placeholderId;
        this.type = type;
        this.mandatory = mandatory;
        this.userPrompt = userPrompt;
        this.converter = converter;
        this.annotations = [];
    }

    public isMandatory(): boolean {
        return this.mandatory;
    }

    public getPlaceholderId(): string {
        return this.placeholderId;
    }

    public getType(): FormFieldType {
        return this.type;
    }

    public getUserPrompt(): string {
        return this.userPrompt;
    }

    public getConverter(): string {
        return this.converter;
    }

    public setDatatype(datatype: string) {
        this.datatype = datatype;
    }

    public getDatatype(): string {
        return this.datatype;
    }

    public setLang(lang: string) {
        this.lang = lang;
    }

    public getLang(): string {
        return this.lang;
    }

    public setDependency(dependency: boolean) {
        this.dependency = dependency;
    }

    public isDependency(): boolean {
        return this.dependency;
    }

    public setConverterArg(arg: LangStringConverterArg) {
        this.converterArg = arg;
    }
    public getConverterArg(): LangStringConverterArg {
        return this.converterArg;
    }

    public setAnnotations(annotations: FormFieldAnnotation[]) {
        this.annotations = annotations;
    }

    public addAnnotation(annotation: FormFieldAnnotation) {
        this.annotations.push(annotation);
    }

    public getAnnotations(): FormFieldAnnotation[] {
        return this.annotations;
    }

    public getAnnotation(name: string): FormFieldAnnotation {
        return this.annotations.find(a => a.name == name);
    }

    public clone(): FormField {
        let fieldClone: FormField = new FormField(this.placeholderId, this.type, this.mandatory, this.userPrompt, this.converter);
        fieldClone.setAnnotations(this.annotations);
        fieldClone.setDatatype(this.datatype);
        fieldClone.setLang(this.lang);
        fieldClone.setDependency(this.dependency);
        fieldClone.setConverterArg(this.converterArg);
        return fieldClone;
    }

}

/**
 * argument of coda:langString converter: could be a placeholder reference of a language tag.
 * Currently this class is used, as said, only for coda:langString, in the future, if needed, could be extended
 */
export class LangStringConverterArg {
    ph?: FormField; //provided if argument is in turn a userPrompt
    lang?: string; //provided if argument is a language tag
}

export enum AnnotationName {
    ObjectOneOf = "ObjectOneOf",
    DataOneOf = "DataOneOf",
    Role = "Role",
    Range = "Range",
    RangeList = "RangeList",
    Foreign = "Foreign",
    Collection = "Collection"
}

export class FormFieldAnnotation {
    name: AnnotationName;
    value?: (ARTLiteral|ARTURIResource|string)[]|ARTURIResource|string;
    min?: number;
    max?: number;
}

export class CustomFormValue {
    private customFormId: string;
    private userPromptMap: { [key: string]: any };

    constructor(customFormId: string, userPromptMap: { [key: string]: any }) {
        this.customFormId = customFormId;
        this.userPromptMap = userPromptMap;
    }

    public getCustomFormId(): string {
        return this.customFormId;
    }

    public getUserPromptMap(): { [key: string]: any } {
        return this.userPromptMap;
    }
    
}

export class BrokenCFStructure {
    public id: string;
    public type: string; //class name: CustomFrom or FormCollection
    public level: CustomFormLevel;
    public file: string;
    public reason: string;
}

export type CustomFormType = "node" | "graph";
export type FormFieldType = "literal" | "uri";

export enum CustomFormLevel {
    system = "system",
    project = "project"
}

export enum EditorMode {
    create = "create",
    edit = "edit"
}

export class CustomFormUtils {

    static isFormValid(fields: FormField[]): boolean {
        let valid: boolean = true;

        if (fields != null) {
            fields.forEach(field => {
                let value: any = field.value;
                let emptyString: boolean = false;
                if (typeof value == "string" && value.trim() == "") {
                    emptyString = true;
                }
                let emptyList: boolean = false;
                if (field.getAnnotation(AnnotationName.Collection) != null && Array.isArray(value)) {
                    emptyList = value.length == 0 || //list of 0 lenght
                        !value.some(v => v != null && v.trim() != ""); //NOT a string not null and different from ""
                }

                if (field.isMandatory() && (value == null || emptyString || emptyList)) {
                    valid = false;
                }
            })
        }
        return valid;
    }

    /**
     * Returns an error message if a constraint is violated, null string otherwise
     * @param fields 
     */
    static isFormConstraintOk(fields: FormField[]): string {
        for (let f of fields) {
            //currentlty the only constraint is about the collection annotation
            let listAnn = f.getAnnotation(AnnotationName.Collection);
            if (listAnn != null) {
                let min = listAnn.min;
                if (f.isMandatory()) { 
                    if (f.value == null || f.value.length < min) { //mandatory and minimun required vaules not provided
                        return "Field '" + f.getUserPrompt() + "' requires at least " + min + " values.";
                    }
                } else {
                    if (f.value != null && f.value.length > 0 && f.value.length < min) { //not mandatory, but not enough values provided
                        return "Field '" + f.getUserPrompt() + "' is optional, anyway you filled it with only " 
                            + f.value.length + " value(s), while it requires at least " + min + " values. "
                            + "Please, provide more values or delete the provided ones";
                    }
                }
            }
        };
        return null; //if this code is reached, none constraint has been violated
    }

}