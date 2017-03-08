import {ARTURIResource} from "./ARTResources";

export class FormCollectionMapping {

    private resource: ARTURIResource;
    private formCollectionId: string;
    private replace: boolean;

    constructor(formCollectionId: string, resource: ARTURIResource, replace: boolean) {
        this.resource = resource;
        this.formCollectionId = formCollectionId;
        this.replace = replace;
    }

    public getResource(): ARTURIResource {
        return this.resource;
    }

    public getFormCollectionID(): string {
        return this.formCollectionId;
    }

    public getReplace(): boolean {
        return this.replace;
    }

}

export class FormCollection {
    
    public static PREFIX = "it.uniroma2.art.semanticturkey.customform.collection.";
    
    private id: string;
    private forms: CustomForm[];
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
    
    constructor(id: string) {
        this.id = id;
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
    private dependency: boolean = false; //tells if the FormEntry is a dependency of another FormEntry 
        //(it determines also if the FormEntry should be shown in the form) 
    private converterArg: FormField; //provided optionally only if the entry has coda:langString converter that requires a language
        //as argument that is in turn provided by means a userPrompt
    
    
    constructor(placeholderId: string, type: FormFieldType, mandatory: boolean, userPrompt: string, converter: string) {
        this.placeholderId = placeholderId;
        this.type = type;
        this.mandatory = mandatory;
        this.userPrompt = userPrompt;
        this.converter = converter;
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
    
    public setConverterArg(arg: FormField) {
        this.converterArg = arg;
    }
    
    public getConverterArg(): FormField {
        return this.converterArg;
    }
    
}

export type CustomFormType = "node" | "graph";
export type FormFieldType = "literal" | "uri";
export type CustomFormLevel = "system" | "project";
export const CustomFormLevel = {
    system: "system" as CustomFormLevel,
    project: "project" as CustomFormLevel
}