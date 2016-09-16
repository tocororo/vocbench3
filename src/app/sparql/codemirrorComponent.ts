///<reference path="../../../typings/index.d.ts"/>

import {Component, ViewChild, Input, Output, EventEmitter} from '@angular/core';

require('./sparql-hint.js');

var CodeMirror = require('codemirror/lib/codemirror');

@Component({
    selector: 'codemirror',
    template: `
        <textarea #txtarea style="">{{query}}</textarea>
    `,
    host: { style: "border: 1px solid #ddd;"}
})
export class CodemirrorComponent {
    @Input() query: string;
    @Output() querychange = new EventEmitter<string>();
    
    @ViewChild('txtarea') textareaElement;

    private cmEditor: CodeMirror.EditorFromTextArea;

    constructor() { }

    ngAfterViewInit() {
        this.cmEditor = CodeMirror.fromTextArea(
            this.textareaElement.nativeElement,
            { 
                lineNumbers: true, mode: "application/sparql-query", 
                indentUnit : 4,
                indentWithTabs: true,
                matchBrackets: true, //it seems not to work
                autoCloseBrackets: true,
                extraKeys: {
                    // "Ctrl-Space": this.autoCompleteHandler,
                    "Ctrl-7": () => this.commentHandler(this.cmEditor),
                    // "Ctrl-7": () => {
                    //     var start = this.cmEditor.cursorCoords(true, "local");
                    //     var end = this.cmEditor.cursorCoords(false, "local");
                    //     //"this.cmEditor as any" in order to ignore error 
                    //     //"The property toggleComment does not exist on value of type CodeMirror"
                    //     //thrown (without consequences) since the codemirror typings doesn't contain toggleComment definition
                    //     (this.cmEditor as any).toggleComment({from: start, to: end });
                    // },
                    "Ctrl-Space": "autocomplete",
                },
            }
        );
        CodeMirror.commands.autocomplete = function (cm) {
           CodeMirror.showHint(cm, CodeMirror.hint.sparql);
        }
        
        this.cmEditor.on('change', (editor: CodeMirror.Editor) => {
            this.querychange.emit(editor.getDoc().getValue());
        });

    }

    private commentHandler(cmEditor) {
        var start = cmEditor.cursorCoords(true, "local");
        var end = cmEditor.cursorCoords(false, "local");
        cmEditor.toggleComment({ from: start, to: end });
    } 
    
}