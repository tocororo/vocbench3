import { AlignmentOverview } from "../../models/Alignment";
import { Output, EventEmitter } from "@angular/core";

export class AbstractAlignSource {

    @Output() alignmentLoaded: EventEmitter<AlignmentOverview> = new EventEmitter();

    relationSymbols: Array<any> = [
        { relation: "=", dlSymbol: "\u2261", text: "equivalent" },
        { relation: ">", dlSymbol: "\u2292", text: "subsumes" },
        { relation: "<", dlSymbol: "\u2291", text: "is subsumed" },
        { relation: "%", dlSymbol: "\u22a5", text: "incompatible" },
        { relation: "HasInstance", dlSymbol: "\u2192", text: "has instance" },
        { relation: "InstanceOf", dlSymbol: "\u2190", text: "instance of" }
    ];

    constructor() {}

    updateRelationSymbols(alignmentOverview: AlignmentOverview) {
        for (var i = 0; i < alignmentOverview.unknownRelations.length; i++) {
            this.relationSymbols.push({
                relation: alignmentOverview.unknownRelations[i],
                dlSymbol: alignmentOverview.unknownRelations[i],
                text: alignmentOverview.unknownRelations[i]
            });
        }
    }

}