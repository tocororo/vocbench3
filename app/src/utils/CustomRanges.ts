export class CustomRange {
    
    public static PREFIX = "it.uniroma2.art.semanticturkey.customrange.";
    
    private id: string;
    private entries: string[]; //id of the entries
    
    constructor(id: string, entries: string[]) {
        this.id = id;
        this.entries = entries;
    }
    
    public getId(): string {
        return this.id;
    }
    
    public getEntries(): string[] {
        return this.entries;
    }
    
    public setEntries(entries: string[]) {
        this.entries = entries;
    }
    
}

export class CustomRangeEntry {
    
    public static PREFIX = "it.uniroma2.art.semanticturkey.entry.";
    
    private id: string;
    private name: string;
    private type: CustomRangeType;
    private description: string;
    // private form: FormEntry[];
    
    constructor(id: string, name: string, type: CustomRangeType, description: string) {
        this.id = id;
        this.name = name;
        this.type = type;
        this.description = description;
    }
    
    public getId(): string {
        return this.id;
    }
    
    public getName(): string {
        return this.name;
    }
    
    public getType(): CustomRangeType {
        return this.type;
    }
    
    public getDescription(): string {
        return this.description;
    }
}

export class FormEntry {
    private mandatory: boolean;
    private placeholderId: string;
    private type: FormEntryType;
    private userPrompt: string;
    private converter: string;
    private datatype: string; //provided optionally only if type is literal
    private lang: string; //provided optionally only if type is literal and datatype is null or xsd:string
    private dependency: boolean = false; //tells if the FormEntry is a dependency of another FormEntry 
        //(it determines also if the FormEntry should be shown in the form) 
    private converterArg: FormEntry; //provided optionally only if the entry has coda:langString converter that requires a language
        //as argument that is in turn provided by means a userPrompt
    
    
    constructor(placeholderId: string, type: FormEntryType, mandatory: boolean, userPrompt: string, converter: string) {
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
    
    public getType(): FormEntryType {
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
    
    public setConverterArg(arg: FormEntry) {
        this.converterArg = arg;
    }
    
    public getConverterArg(): FormEntry {
        return this.converterArg;
    }
    
}

export type CustomRangeType = "node" | "graph";
export type FormEntryType = "literal" | "uri";