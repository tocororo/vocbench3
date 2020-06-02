export class TaskReport {
    leftDataset: Dataset;
    rightDataset: Dataset;
    supportDatasets: Dataset[];
    pairings: Pairing[];
}
export class RefinableTaskReport {
    leftDataset: Dataset;
    rightDataset: Dataset;
    supportDatasets: Dataset[];
    pairings: RefinablePairing[];
}
export class Dataset {
    '@id': string;
    '@type': string;
    uriSpace: string;
    sparqlEndpoint?: string;
    conformsTo?: string;
    title: string[];
}
export class Pairing {
    score: number;
    source: PairingHand;
    target: PairingHand;
    synonymizer: Synonymizer;
}
export class RefinablePairing {
    score: number;
    bestCombinedScore: number;
    source: PairingHand;
    target: PairingHand;
    synonymizers: Synonymizer[];
}
export class PairingHand {
    lexicalizationSet: string;
}
export class Synonymizer {
    lexicon: string;
    conceptualizationSet: string;
    score: number;
}

export class LexicalizationSet extends Dataset {
    avgNumOfLexicalizations: number;
    languageLexvo: string;
    languageLOC: string;
    languageTag: string;
    lexicalEntries: number;
    lexicalizationModel: string;
    lexicalizations: number;
    lexiconDataset: string;
    percentage: number;
    referenceDataset: string;
    references: number;
}
export class ConceptSet extends Dataset {
    concepts: number;
}
export class ConceptualizationSet extends Dataset {
    avgAmbiguity: number;
    avgSynonymy: number;
    concepts: number;
    conceptualDataset: string;
    conceptualizations: number;
    lexicalEntries: number;
    lexiconDataset: string;
}
export class Lexicon extends Dataset {
    languageLexvo: string;
    languageLOC: string;
    languageTag: string;
    lexicalEntries: number;
    linguisticCatalog: string;
}
export class VoidDataset extends Dataset { }

export class ProfilerOptions {}