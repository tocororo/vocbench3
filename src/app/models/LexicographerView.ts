import { Deserializer } from "../utils/Deserializer";
import { ARTLiteral, ARTPredicateObjects, ARTResource, ARTURIResource, ResourceNature, TripleScopes } from "./ARTResources";
import { SemanticTurkey } from "./Vocabulary";

export class LexicographerView {
    id: ARTURIResource;
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

    public static parse(lvJson: any): LexicographerView {
        let lv: LexicographerView = new LexicographerView();

        lv.id = new ARTURIResource(lvJson.id);
        lv.nature = ResourceNature.parse(lvJson.nature);
        
        lv.morphosyntacticProps = Deserializer.createPredicateObjectsList(lvJson.morphosyntacticProps);

        let lemma: Form[] = [];
        for (let f of lvJson.lemma) {
            lemma.push(Form.parse(f));
        }
        lv.lemma = lemma;

        let otherForms: Form[] = [];
        for (let f of lvJson.otherForms) {
            otherForms.push(Form.parse(f));
        }
        lv.otherForms = otherForms;

        let senses: Sense[] = [];
        for (let s of lvJson.senses) {
            senses.push(Sense.parse(s));
        }
        lv.senses = senses;

        return lv;
    }
}

export class Form {
    id: ARTURIResource;
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

    public static parse(fJson: any): Form {
        let f: Form = new Form();
        f.id = new ARTURIResource(fJson.id);
        f.nature = ResourceNature.parse(fJson.nature);
        f.morphosyntacticProps = Deserializer.createPredicateObjectsList(fJson.morphosyntacticProps);
        f.phoneticRep = Deserializer.createLiteralArray(fJson.phoneticRep);
        f.writtenRep = Deserializer.createLiteralArray(fJson.writtenRep);
        f.scope = fJson.scope;
        return f;
    }

}

export class Sense {
    id: ARTURIResource;
    definition: ARTLiteral[] = [];
    reference: ARTResource[] = [];
    concept: ARTResource[] = [];

    public static parse(sJson: any): Sense {
        let s: Sense = new Sense();
        s.id = new ARTURIResource(sJson.id);
        if (sJson.definition) {
            s.definition = Deserializer.createLiteralArray(sJson.definition);
        }
        s.reference = Deserializer.createResourceArray(sJson.reference);
        s.concept = Deserializer.createResourceArray(sJson.concept);
        return s;
    }
}

// export class MorphosyntacticCache {

//     private static instance: MorphosyntacticCache;

//     static getInstance(lexicographerViewService: LexicographerViewServices, propertyService: PropertyServices, classService: ClassesServices) {
//         return this.instance || (this.instance = new this(lexicographerViewService, propertyService, classService));
//     }

//     private lexicographerViewService: LexicographerViewServices;
//     private propertyService: PropertyServices;
//     private classService: ClassesServices;

//     private propCache: ARTURIResource[];
//     private propValueCache: MorphosyntacticCacheEntry[];

//     private constructor(lexicographerViewService: LexicographerViewServices, propertyService: PropertyServices, classService: ClassesServices) {
//         this.lexicographerViewService = lexicographerViewService;
//         this.propertyService = propertyService;
//         this.classService = classService;
//         this.propValueCache = [];
//     }

//     getProperties(): Observable<ARTURIResource[]> {
//         if (this.propCache == null) {
//             return this.propertyService.getSubProperties(Lexinfo.morphosyntacticProperty).pipe(
//                 map(props => {
//                     ResourceUtils.sortResources(props, SortAttribute.value);
//                     this.propCache = props;
//                     return props;
//                 })
//             );
//         } else {
//             return of(this.propCache);
//         }
//     }

//     getValues(property: ARTURIResource): Observable<ARTURIResource[]> {
//         let entry = this.propValueCache.find(c => c.prop.equals(property));
//         if (entry != null) {
//             return of(entry.values);
//         } else {
//             return this.propertyService.getRange(property).pipe(
//                 flatMap(range => {
//                     if (range.ranges != null && range.ranges.rangeCollection != null && range.ranges.rangeCollection.resources != null) {
//                         let rangeColl = range.ranges.rangeCollection.resources;
//                         if (rangeColl.length == 1) {
//                             let rangeCls = rangeColl[0];
//                             return this.classService.getInstances(rangeCls).pipe(
//                                 map(instances => {
//                                     ResourceUtils.sortResources(instances, SortAttribute.value);
//                                     let values = <ARTURIResource[]>instances;
//                                     this.propValueCache.push({ prop: property, values: values }); //store in cache
//                                     return values;
//                                 })
//                             )
//                         }
//                     }
//                 })
//             )
//         }
//     }
// }

// export interface MorphosyntacticCacheEntry {
//     prop: ARTURIResource;
//     values: ARTURIResource[];
// }