export class CustomRange {
    
    public static PREFIX = "it.uniroma2.art.semanticturkey.customrange.";
    
    private id: string;
    private entries: CustomRangeEntry[];
    
    constructor(id: string) {
        this.id = id;
    }
    
    public getId(): string {
        return this.id;
    }
    
    public getEntries(): CustomRangeEntry[] {
        return this.entries;
    }
    
    public setEntries(entries: CustomRangeEntry[]) {
        this.entries = entries;
    }
    
}

export class CustomRangeEntry {
    
    public static PREFIX = "it.uniroma2.art.semanticturkey.entry.";
    
    private id: string;
    private name: string;
    private type: CustomRangeEntryType;
    private description: string;
    private ref: string;
    private showProperty: string;
    // private form: FormEntry[];
    
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
    
    public getType(): CustomRangeEntryType {
        return this.type;
    }
    
    public setType(type: CustomRangeEntryType) {
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
    
    public getShowProperty(): string {
        return this.showProperty;
    }
    
    public setShowProperty(showProperty: string) {
        this.showProperty = showProperty;
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

export type CustomRangeEntryType = "node" | "graph";
export type FormEntryType = "literal" | "uri";