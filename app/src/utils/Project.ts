export class Project {
    private name: string;
    private accessible: boolean;
    private modelConfigType: string;
    private ontmgr: string;
    private ontoType: string;
    private open: boolean;
    private status: Object;
    private type: string;
    
    private static knownRDFModelInterfaces = {
        "it.uniroma2.art.owlart.models.RDFModel" : "RDF",
        "it.uniroma2.art.owlart.models.RDFSModel" : "RDFS",
        "it.uniroma2.art.owlart.models.OWLModel" : "OWL",
        "it.uniroma2.art.owlart.models.SKOSModel" : "SKOS",
        "it.uniroma2.art.owlart.models.SKOSXLModel" : "SKOS-XL"
    };
    
    private static knownOntoMgrInterfaces = {
        "it.uniroma2.art.semanticturkey.ontology.sesame2.OntologyManagerFactorySesame2Impl" : "Sesame2",
        "it.uniroma2.art.semanticturkey.ontology.sesame4.OntologyManagerFactorySesame4Impl" : "Sesame4",
        "it.uniroma2.art.semanticturkey.ontology.rdf4j.OntologyManagerFactoryRDF4JImpl" : "RDF4J"
    }
    
    // constructor() {}
    
    constructor(name?: string) {
        if (name != undefined) {
            this.name = name;       
        }
    }
    
    public setName(name: string) {
        this.name = name;
    }
    
    public getName(): string {
        return this.name;
    }
    
    public setAccessible(accessible: boolean) {
        this.accessible = accessible;
    }
    
    public isAccessible(): boolean {
        return this.accessible;
    }
    
    public setModelConfigType(modelConfigType: string) {
        this.modelConfigType = modelConfigType;
    }
    
    public getModelConfigType(): string {
        return this.modelConfigType;
    }
    
    public setOntoMgr(ontmgr: string) {
        this.ontmgr = ontmgr;
    }
    
    public getOntoMgr(): string {
        return this.ontmgr;
    }
    
    public getPrettyPrintOntoMgr(): string {
        var prettyPrint = null;
        prettyPrint = Project.knownOntoMgrInterfaces[this.ontmgr];
        if (prettyPrint == null) {
            prettyPrint = this.ontmgr.substring(this.ontmgr.lastIndexOf("."));
        }
        return prettyPrint;
    }
    
    public setOntoType(ontoType: string) {
        this.ontoType = ontoType;
    }
    
    public getOntoType(): string {
        return this.ontoType;
    }
    
    public getPrettyPrintOntoType(): string {
        var prettyPrint = null;
        prettyPrint = Project.knownRDFModelInterfaces[this.ontoType];
        if (prettyPrint == null) {
            prettyPrint = this.ontoType.substring(this.ontoType.lastIndexOf("."));
        }
        return prettyPrint;
    }
    
    public setOpen(open: boolean) {
        this.open = open;
    }
    
    public isOpen(): boolean {
        return this.open;
    }
    
    public setStatus(status: Object) {
        this.status = status;
    }
    
    public getStatus(): Object {
        return this.status;
    }
    
    public setType(type: string) {
        this.type = type;
    }
    
    public getType(): string {
        return this.type;
    }
}

export type ProjectTypesEnum = "saveToStore" | "continuosEditing";
    
export const ProjectTypesEnum = {
    saveToStore: "saveToStore" as ProjectTypesEnum,
    continuosEditing: "continuosEditing" as ProjectTypesEnum
}