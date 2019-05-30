export class MatchingProblem {
    sourceDataset: Dataset;
    targetDataset: Dataset;
    supportDatasets: Dataset[];
    pairings: Pairing[];
}
export class Dataset {
    '@id': string;
	'@type': string;
	uriSpace: string;
    sparqlEndpoint?: string;
}
export class Pairing {
    score: number;
    source: PairingHand;
    target: PairingHand;
}
export class PairingHand {
    lexicalizationSet: string;
    synonymizer: Synonymizer;
}
export class Synonymizer {
    lexicon: string;
    conceptualizationSet: string;
}