///<reference path="../../../typings/index.d.ts"/>

import {Component, ViewChild, Input, Output, EventEmitter} from '@angular/core';
import {VocbenchCtx} from '../utils/VocbenchCtx';

require('./sparql-hint.js');
require('./flint/sparql10querymode_ll1.js');
require('./flint/sparql11querymode_ll1.js');
require('./flint/sparql11updatemode_ll1.js');

var CodeMirror = require('codemirror/lib/codemirror');

@Component({
    selector: 'codemirror',
    template: `
        <textarea #txtarea style="">{{query}}</textarea>
    `,
    host: { style: "border: 1px solid #ddd;"},
})
export class CodemirrorComponent {
    @Input() query: string;
    @Output() querychange = new EventEmitter<string>();
    
    @ViewChild('txtarea') textareaElement;

    private cmEditor: CodeMirror.EditorFromTextArea;
    private mode = ["sparql10", "sparql11query", "sparql11update"]; //flint modes

    constructor(private vbCtx: VocbenchCtx) { }

    ngAfterViewInit() {
        this.cmEditor = CodeMirror.fromTextArea(
            this.textareaElement.nativeElement,
            { 
                lineNumbers: true,
                // mode: "application/sparql-query",
                mode: "sparql11query", 
                gutters: ["error_mark", 
                "CodeMirror-lint-markers"
                ],
                indentUnit : 4,
                indentWithTabs: true,
                matchBrackets: true, //it seems not to work
                autoCloseBrackets: true,
                lineWrapping: true,
                extraKeys: {
                    "Ctrl-Space": "autocomplete",
                    "Ctrl-7": () => this.commentHandler(this.cmEditor),
                    // "Ctrl-7": () => {
                    //     var start = this.cmEditor.cursorCoords(true, "local");
                    //     var end = this.cmEditor.cursorCoords(false, "local");
                    //     //"this.cmEditor as any" in order to ignore error 
                    //     //"The property toggleComment does not exist on value of type CodeMirror"
                    //     //thrown (without consequences) since the codemirror typings doesn't contain toggleComment definition
                    //     (this.cmEditor as any).toggleComment({from: start, to: end });
                    // },
                },
            }
        );

        //used to pass parameter to sparqlHint, like project name and serverhost ip (useful to create request url)
        var sparqlHintParams = {
            projectName : this.vbCtx.getWorkingProject().getName(),
            serverhost : "127.0.0.1"
        };
        if (process.env.SERVERHOST != undefined) {
            sparqlHintParams.serverhost = process.env.SERVERHOST;
        }

        CodeMirror.commands.autocomplete = function (cm) {
            /* 3rd param object is passed to the hint function 
            CodeMirror.registerHelper("hint", "sparql", sparqlHint); // <-- sparqlHint
            as "options" param (see sparql-hint.js) */
            CodeMirror.showHint(cm, CodeMirror.hint.sparql, sparqlHintParams);
        }

        var textMarkerHandler: CodeMirror.TextMarker[] = [];
	    var gutterMarkerHandler: CodeMirror.LineHandle = null;
        this.cmEditor.on('change', (cm: CodeMirror.Editor) => {
            //clear previous text markers and gutter markers
            for (var i = 0; i < textMarkerHandler.length; i++) {
                textMarkerHandler[i].clear();
            }
            if (gutterMarkerHandler != null) {
                cm.clearGutter("error_mark");
            }
            //for each code line, if status is not OK, add a gutter marker and mark the text
            for (var l = 0; l < cm.getDoc().lineCount(); l++) {
                console.log("checking line " + l);
                var lineInfo = cm.lineInfo(l);

                var state = cm.getTokenAt({ 
                    line : l,
				    ch : lineInfo.text.length
			    }).state;

                var marker = document.createElement("div");
                marker.className = "CodeMirror-lint-marker-error";

                if (state.OK === false) {
                    console.log("line "  + l + " not OK. State " + JSON.stringify(state, null, 2));
                    console.log("line "  + l + " not OK. Text " + JSON.stringify(lineInfo.text));
                    
                    gutterMarkerHandler = cm.setGutterMarker(l, "error_mark", lineInfo.gutterMarks ? null : marker);
                    
                    var textMarker: CodeMirror.TextMarker = cm.getDoc().markText(
                        { line : l, ch : state.errorStartPos }, 
                        { line : l, ch : state.errorEndPos }, 
                        { className : "cm-sp-error" }
                    );
                    textMarkerHandler.push(textMarker); 
                }
                cm.refresh();
            }

            //update query in parent component
            this.querychange.emit(cm.getDoc().getValue());
        });

    }

    private commentHandler(cmEditor) {
        var start = cmEditor.cursorCoords(true, "local");
        var end = cmEditor.cursorCoords(false, "local");
        cmEditor.toggleComment({ from: start, to: end });
    } 

}