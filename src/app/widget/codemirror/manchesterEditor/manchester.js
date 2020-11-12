// (function (mod) {
//     if (typeof exports == "object" && typeof module == "object") // CommonJS
//         mod(require('codemirror/lib/codemirror'));
//     else if (typeof define == "function" && define.amd) // AMD
//         define(["codemirror/lib/codemirror"], mod);
//     else // Plain browser env
//         mod(CodeMirror);
// })(function (CodeMirror) {
//     "use strict";

//     function getRegexp(tokensList, caseSentitive) {
//         if (caseSentitive) {
//             return new RegExp("(?:" + tokensList.join("|") + ")\\b");
//         } else {
//             return new RegExp("(?:" + tokensList.join("|") + ")\\b", "i");
//         }
//     }

//     const booleans = ["true", "false"];
//     const brackets = ["(", ")", "[", "]", "{", "}"];
//     const builtinDatatypes = ["decimal", "double", "float", "integer", "string"];
//     const characteristics = ["Functional", "InverseFunctional", "Reflexive", "Irreflexive", "Symmetric", "Asymmetric", "Transitive" ,"Inverse"]; 
//     const conjuctions = ["and", "not", "that", "or"];
//     const facets = ["langRange", "length", "maxLength", "minLength", "pattern", "<", "<=", ">", ">="];
//     const quantifiers = ["some", "only", "value", "min", "max", "exactly", "self"];
//     // const frames = ["AnnotationProperty", "Class", "DataProperty", "Datatype", "DifferentIndividuals", "DisjointClasses",
//     //     "DisjointProperties", "EquivalentClasses", "EquivalentProperties", "Individual", "ObjectProperty", "SameIndividual"];
//     // const sections = ["Annotations", "SubClassOf", "EquivalentTo", "DisjointWith", "DisjointUnion", "SubPropertyOf",
//     //     "InverseOf", "SubPropertyChain", "Domain", "Range", "Characteristics", "Types", "SameAs", "DifferentFrom",
//     //     "Facts", "SuperClassOf", "SuperPropertyOf", "Individuals"];

//     //Regular expressions
//     const booleansRegex = getRegexp(booleans, false);
//     const builtinDatatypesRegex = getRegexp(builtinDatatypes, true); //case sensitive?
//     const characteristicsRegex = getRegexp(characteristics, false);
//     const conjuctionsRegex = getRegexp(conjuctions, false);
//     const facetsRegex = getRegexp(facets, true);
//     const quantifiersRegex = getRegexp(quantifiers, false);
//     // const framesRegex = new RegExp("(?:" + frames.join("|") + "):(\\b|\\s|$)");
//     // const sectionsRegex = new RegExp("(?:" + sections.join("|") + "):(\\b|\\s|$)");


//     CodeMirror.defineSimpleMode("manchester", {
//         // The start state contains the rules that are intially used
//         start: [
//             {
//                 regex: /"(?:[^\\]|\\.)*?(?:"|$)/,
//                 token: "string"
//             },
//             {
//                 regex: booleansRegex,
//                 token: "boolean"
//             },
//             {
//                 regex: builtinDatatypesRegex,
//                 token: "builtinDatatype"
//             },
//             {
//                 regex: characteristicsRegex,
//                 token: "characteristic"
//             },
//             {
//                 regex: conjuctionsRegex,
//                 token: "conjuction"
//             },
//             {
//                 regex: facetsRegex,
//                 token: "facet"
//             },
//             {
//                 regex: quantifiersRegex,
//                 token: "quantifier"
//             },
//             // {
//             //     regex: framesRegex,
//             //     token: "frame"
//             // },
//             // {
//             //     regex: sectionsRegex,
//             //     token: "section"
//             // },
//             {
//                 regex: /0x[a-f\d]+|[-+]?(?:\.\d+|\d+\.?\d*)(?:e[-+]?\d+)?/i,
//                 token: "number"
//             },
//             { regex: /\/(?:[^\\]|\\.)*?\//, token: "variable-3" },
//             // indent and dedent properties guide autoindentation
//             { regex: /[\{\[\(]/, indent: true, token: "bracket" },
//             { regex: /[\}\]\)]/, dedent: true, token: "bracket" },
//             { regex: /[a-z$][\w$]*/, token: "variable" },
//         ],
//     });

// });