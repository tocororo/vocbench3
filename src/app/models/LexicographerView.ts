import { Deserializer } from "../utils/Deserializer";
import { ARTBNode, ARTLiteral, ARTNode, ARTPredicateObjects, ARTResource, ARTURIResource, RDFResourceRolesEnum, ResourceNature, TripleScopes } from "./ARTResources";
import { SemanticTurkey } from "./Vocabulary";

export class LexicographerView {
    id: ARTResource;
    nature: ResourceNature[];
    morphosyntacticProps: ARTPredicateObjects[];
    lemma: Form[];
    otherForms: Form[];
    senses: Sense[];

    isInStaging(): boolean {
        return this.isInStagingAdd() || this.isInStagingRemove();
    }
    isInStagingAdd(): boolean {
        for (let n of this.nature) {
            if (n.graphs.some(g => g.getURI().startsWith(SemanticTurkey.stagingAddGraph))) {
                return true;
            }
        }
        return false;
    }
    isInStagingRemove(): boolean {
        for (let n of this.nature) {
            if (n.graphs.some(g => g.getURI().startsWith(SemanticTurkey.stagingRemoveGraph))) {
                return true;
            }
        }
        return false;
    }

    public static parse(json: any): LexicographerView {
        let lv: LexicographerView = new LexicographerView();

        lv.id = ParsingUtils.parseResourceId(json.id);
        lv.nature = ResourceNature.parse(json.nature);
        
        lv.morphosyntacticProps = Deserializer.createPredicateObjectsList(json.morphosyntacticProps);

        let lemma: Form[] = [];
        for (let f of json.lemma) {
            lemma.push(Form.parse(f));
        }
        lv.lemma = lemma;

        let otherForms: Form[] = [];
        for (let f of json.otherForms) {
            otherForms.push(Form.parse(f));
        }
        lv.otherForms = otherForms;

        let senses: Sense[] = [];
        for (let s of json.senses) {
            senses.push(Sense.parse(s));
        }
        lv.senses = senses;

        return lv;
    }
}

export class Form {
    id: ARTResource;
    morphosyntacticProps: ARTPredicateObjects[];
    phoneticRep: ARTLiteral[];
    writtenRep: ARTLiteral[];
    nature: ResourceNature[];
    scope: TripleScopes;

    isInStaging(): boolean {
        return this.isInStagingAdd() || this.isInStagingRemove();
    }
    isInStagingAdd(): boolean {
        for (let n of this.nature) {
            if (n.graphs.some(g => g.getURI().startsWith(SemanticTurkey.stagingAddGraph))) {
                return true;
            }
        }
        return false;
    }
    isInStagingRemove(): boolean {
        for (let n of this.nature) {
            if (n.graphs.some(g => g.getURI().startsWith(SemanticTurkey.stagingRemoveGraph))) {
                return true;
            }
        }
        return false;
    }

    public static parse(json: any): Form {
        let f: Form = new Form();
        f.id = ParsingUtils.parseResourceId(json.id);
        f.nature = ResourceNature.parse(json.nature);
        f.id.setRole(f.nature[0].role); //role needed to authorization evaluator
        f.morphosyntacticProps = Deserializer.createPredicateObjectsList(json.morphosyntacticProps);
        f.phoneticRep = Deserializer.createLiteralArray(json.phoneticRep);
        f.writtenRep = Deserializer.createLiteralArray(json.writtenRep);
        f.scope = json.scope;
        return f;
    }

}

export class Sense {
    id: ARTResource;
    definition: ARTNode[] = [];
    reference: ARTResource[] = [];
    concept: ConceptReference[] = [];
    related: SenseRelation[];
	translations: SenseRelation[];
	terminologicallyRelated: SenseRelation[];

    public static parse(json: any): Sense {
        let s: Sense = new Sense();
        s.id = ParsingUtils.parseResourceId(json.id);
        s.id.setRole(RDFResourceRolesEnum.ontolexLexicalSense); //role needed to authorization evaluator
        if (json.definition) {
            s.definition = Deserializer.createRDFNodeArray(json.definition);
            s.definition.sort((d1, d2) => d1.getShow().toLocaleLowerCase().localeCompare(d2.getShow().toLocaleLowerCase()))
        }
        s.reference = Deserializer.createResourceArray(json.reference);
        s.concept = json.concept.map((c: any) => ConceptReference.parse(c));
        s.related = json.related.map((r: any) => SenseRelation.parse(r));
        s.translations = json.translations.map((t: any) => SenseRelation.parse(t));
        s.terminologicallyRelated = json.terminologicallyRelated.map((tr: any) => SenseRelation.parse(tr));
        return s;
    }
}

export class ConceptReference {
    id: ARTResource;
    nature: ResourceNature[];
    scope: TripleScopes;
    definition: ARTNode[];

    public static parse(json: any): ConceptReference {
        let c: ConceptReference = new ConceptReference();
        c.id = ParsingUtils.parseResourceId(json.id);
        c.nature = ResourceNature.parse(json.nature);
        c.id.setRole(c.nature[0].role); //role needed to authorization evaluator
        c.scope = json.scope;
        if (json.definition) {
            c.definition = Deserializer.createRDFNodeArray(json.definition);
            c.definition.sort((d1, d2) => d1.getShow().toLocaleLowerCase().localeCompare(d2.getShow().toLocaleLowerCase()))
        }
        return c;
    }
}

export class SenseRelation {
    id: ARTResource;
    nature: ResourceNature[];
    scope: TripleScopes;
    category: ARTResource[];
    source: SenseReference[];
    target: SenseReference[];
    related: SenseReference[];

    public static parse(json: any): SenseRelation {
        let r: SenseRelation = new SenseRelation();
        r.id = ParsingUtils.parseResourceId(json.id);
        r.nature = ResourceNature.parse(json.nature);
        r.id.setRole(r.nature[0].role);
        r.scope = json.scope;
        r.category = Deserializer.createResourceArray(json.category);
        r.source = json.source.map((s: any) => SenseReference.parse(s));
        r.target = json.target.map((t: any) => SenseReference.parse(t));
        r.related = json.related.map((rel: any) => SenseReference.parse(rel));
        return r;
    }
}

export class SenseReference {
    id: ARTResource;
    nature: ResourceNature[];
    scope: TripleScopes;
    entry: EntryReference[];

    public static parse(json: any): SenseReference {
        let r: SenseReference = new SenseReference();
        r.id = ParsingUtils.parseResourceId(json.id);
        r.nature = ResourceNature.parse(json.nature);
        r.id.setRole(r.nature[0].role);
        r.scope = json.scope;
        r.entry = json.entry.map((e: any) => EntryReference.parse(e));
        return r;
    }
}

export class EntryReference {
    id: ARTResource;
    nature: ResourceNature[];
    scope: TripleScopes;
    lemma: Form[];
    
    public static parse(json: any): EntryReference {
        let r: EntryReference = new EntryReference();
        r.id = ParsingUtils.parseResourceId(json.id);
        r.nature = ResourceNature.parse(json.nature);
        r.id.setRole(r.nature[0].role);
        r.scope = json.scope;
        r.lemma = json.lemma.map((l: any) => Form.parse(l));
        return r;
    }
}

/**
 * This is a utilities class just for parsing the id of the above classes (Form, Sense, ...).
 * Such IDs are represented as resource nominal value, not in NT format, so I cannot use NTripleUtils.
 * In the future if such format will be used elsewhere, this class could be moved in another shared .ts
 */
class ParsingUtils {
    static parseResourceId(id: string): ARTResource {
        if (id.startsWith("_:")) {
            return new ARTBNode(id);
        } else {
            return new ARTURIResource(id);
        }
    }
}