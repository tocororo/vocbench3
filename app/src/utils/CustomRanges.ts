export class CustomRange {
    private id: string;
    private property: string;
    private entries: CustomRangeEntry[];
    
    constructor(id: string, property: string, entries: CustomRangeEntry[]) {
        this.id = id;
        this.property = property;
        this.entries = entries;
    }
    
    public getId(): string {
        return this.id;
    }
    
    public getProperty(): string {
        return this.property;
    }
    
    public getEntries(): CustomRangeEntry[] {
        return this.entries;
    }
    
}

export class CustomRangeEntry {
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
    private type: CustomRangeType;
    private userPrompt: string;
    private converter: string;
    
    constructor(placeholderId: string, type: CustomRangeType, mandatory: boolean, userPrompt: string, converter: string) {
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
    
    public getType(): CustomRangeType {
        return this.type;
    }
    
    public getUserPrompt(): string {
        return this.userPrompt;
    }
    
    public getConverter(): string {
        return this.converter;
    }
    
}

export type CustomRangeType = "node" | "graph";