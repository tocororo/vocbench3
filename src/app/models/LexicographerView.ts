import { Deserializer } from "../utils/Deserializer";
import { ARTBNode, ARTLiteral, ARTNode, ARTPredicateObjects, ARTResource, ARTURIResource, RDFResourceRolesEnum, ResourceNature, TripleScopes } from "./ARTResources";
import { SemanticTurkey } from "./Vocabulary";

export class LexicalEntry {
    id: ARTResource;
    nature: ResourceNature[];
    morphosyntacticProps: ARTPredicateObjects[];
    lemma: Form[];
    otherForms: Form[];
    subterms: EntryReference[];
    constituents: Constituent[];
    senses: Sense[];
    related: LexicalRelation[];
    translatableAs: LexicalRelation[];

    public static parse(json: any): LexicalEntry {
        let lv: LexicalEntry = new LexicalEntry();
        lv.id = ParsingUtils.parseResourceId(json.id);
        lv.nature = ResourceNature.parse(json.nature);
        lv.id.setRole(lv.nature[0].role); //role needed to authorization evaluator
        lv.morphosyntacticProps = Deserializer.createPredicateObjectsList(json.morphosyntacticProps);
        lv.lemma = json.lemma.map((l: any) => Form.parse(l));
        lv.otherForms = json.otherForms.map((f: any) => Form.parse(f));
        lv.subterms = json.subterms.map((s: any) => EntryReference.parse(s));
        lv.constituents = json.constituents.map((c: any) => Constituent.parse(c));
        lv.senses = json.senses.map((s: any) => Sense.parse(s));
        lv.related = json.related.map((r: any) => LexicalRelation.parse(r));
        lv.translatableAs = json.translatableAs.map((r: any) => LexicalRelation.parse(r));
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
    definition: ARTNode[];
    reference: ARTResource[];
    concept: ConceptReference[];
    related: SenseRelation[];
	translations: SenseRelation[];
	terminologicallyRelated: SenseRelation[];

    public static parse(json: any): Sense {
        let s: Sense = new Sense();
        s.id = ParsingUtils.parseResourceId(json.id);
        if (s.id != null) { //sense not plain
            s.id.setRole(RDFResourceRolesEnum.ontolexLexicalSense); //role needed to authorization evaluator
        }
        if (json.definition) {
            s.definition = Deserializer.createRDFNodeArray(json.definition);
            s.definition.sort((d1, d2) => d1.getShow().toLocaleLowerCase().localeCompare(d2.getShow().toLocaleLowerCase()))
        }
        if (json.reference != null) { //might be null in plain sense
            s.reference = Deserializer.createResourceArray(json.reference);
        }
        if (json.concept != null) { //might be null in plain sense
            s.concept = json.concept.map((c: any) => ConceptReference.parse(c));
        }
        s.related = json.related.map((r: any) => SenseRelation.parse(r));
        s.translations = json.translations.map((t: any) => SenseRelation.parse(t));
        s.terminologicallyRelated = json.terminologicallyRelated.map((tr: any) => SenseRelation.parse(tr));
        return s;
    }
}

export abstract class LexicoSemanticRelation<T> {
    id: ARTResource;
    nature: ResourceNature[];
    scope: TripleScopes;
    category: ARTURIResource[];
    source: T[];
    target: T[];
    related: T[];
}

export class SenseRelation extends LexicoSemanticRelation<SenseReference> {
    public static parse(json: any): SenseRelation {
        let r: SenseRelation = new SenseRelation();
        r.id = ParsingUtils.parseResourceId(json.id);
        r.nature = ResourceNature.parse(json.nature);
        r.id.setRole(r.nature[0].role);
        r.scope = json.scope;
        r.category = Deserializer.createURIArray(json.category);
        r.source = json.source.map((s: any) => SenseReference.parse(s));
        r.target = json.target.map((t: any) => SenseReference.parse(t));
        r.related = json.related.map((rel: any) => SenseReference.parse(rel));
        return r;
    }
}

export class LexicalRelation extends LexicoSemanticRelation<EntryReference> {
    public static parse(json: any): LexicalRelation {
        let r: LexicalRelation = new LexicalRelation();
        r.id = ParsingUtils.parseResourceId(json.id);
        r.nature = ResourceNature.parse(json.nature);
        if (r.id != null) {
            r.id.setRole(r.nature[0].role);
        }
        r.scope = json.scope;
        r.category = Deserializer.createURIArray(json.category);
        r.source = json.source.map((s: any) => EntryReference.parse(s));
        r.target = json.target.map((t: any) => EntryReference.parse(t));
        r.related = json.related.map((rel: any) => EntryReference.parse(rel));
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

export class Constituent {
    id: ARTResource;
    correspondingLexicalEntry: EntryReference[];
	features: ARTPredicateObjects[];

    public static parse(json: any): Constituent {
        let c: Constituent = new Constituent();
        c.id = ParsingUtils.parseResourceId(json.id);
        c.correspondingLexicalEntry = json.correspondingLexicalEntry.map((e: any) => EntryReference.parse(e));
        c.features = Deserializer.createPredicateObjectsList(json.features);
        return c;
    }
}

/**
 * This is a utilities class just for parsing the id of the above classes (Form, Sense, ...).
 * Such IDs are represented as resource nominal value, not in NT format, so I cannot use NTripleUtils.
 * In the future if such format will be used elsewhere, this class could be moved in another shared .ts
 */
class ParsingUtils {
    static parseResourceId(id: string): ARTResource {
        if (id == null) return null;
        if (id.startsWith("_:")) {
            return new ARTBNode(id);
        } else {
            return new ARTURIResource(id);
        }
    }
}

export class LexicalResourceUtils {
    
    static isInStaging(resourceWithNature: ResourceWithNature): boolean {
        return this.isInStagingAdd(resourceWithNature) || this.isInStagingRemove(resourceWithNature);
    }
    static isInStagingAdd(resourceWithNature: ResourceWithNature): boolean {
        for (let n of resourceWithNature.nature) {
            if (n.graphs.some(g => g.getURI().startsWith(SemanticTurkey.stagingAddGraph))) {
                return true;
            }
        }
        return false;
    }
    static isInStagingRemove(resourceWithNature: ResourceWithNature): boolean {
        for (let n of resourceWithNature.nature) {
            if (n.graphs.some(g => g.getURI().startsWith(SemanticTurkey.stagingRemoveGraph))) {
                return true;
            }
        }
        return false;
    }

    static isStagedTriple(resourceWithScope: ResourceWithScope): boolean {
        return this.isStagedAddTriple(resourceWithScope) || this.isStagedRemoveTriple(resourceWithScope)
    }
    static isStagedAddTriple(resourceWithScope: ResourceWithScope): boolean {
        return resourceWithScope.scope == TripleScopes.del_staged;
    }
    static isStagedRemoveTriple(resourceWithScope: ResourceWithScope): boolean {
        return resourceWithScope.scope == TripleScopes.staged;
    }
}

interface ResourceWithNature {
    nature: ResourceNature[];
}

interface ResourceWithScope {
    scope: TripleScopes;
}