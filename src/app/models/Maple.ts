export class MatchingProblem {
    leftDataset: Dataset;
    rightDataset: Dataset;
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
    synonymizer: Synonymizer;
}
export class PairingHand {
    lexicalizationSet: string;
}
export class Synonymizer {
    lexicon: string;
    conceptualizationSet: string;
}