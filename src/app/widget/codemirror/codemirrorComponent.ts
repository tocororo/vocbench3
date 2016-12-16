///<reference path="../../../../typings/index.d.ts"/>

import {Component, ViewChild, Input, Output, EventEmitter, SimpleChanges} from '@angular/core';
import "./pearl";

var CodeMirror = require('codemirror/lib/codemirror');

@Component({
    selector: 'codemirror',
    template: `
        <div style="overflow: auto">
            <textarea #txtarea>{{code}}</textarea>
        </div>
    `,
})
export class CodemirrorComponent {
    @Input() code: string;
    @Output() codechange = new EventEmitter<string>();
    
    @ViewChild('txtarea') textareaElement: any;

    private cmEditor: CodeMirror.EditorFromTextArea;

    constructor() { }

    ngAfterViewInit() {
    // ngOnInit() {
        this.cmEditor = CodeMirror.fromTextArea(
            this.textareaElement.nativeElement,
            { 
                lineNumbers: true,
                mode: "pearl",
                indentUnit : 4,
                indentWithTabs: true,
                matchBrackets: true, //it seems not to work
                autoCloseBrackets: true,
                lineWrapping: true,
                viewportMargin: Infinity,//with height:auto applied to .CodeMirror class, lets the editor expand its heigth dinamically
                    //moreover, .CodeMirror-scroll { height: 300px; } sets an height limit
                extraKeys: {
                    "Ctrl-7": () => this.commentHandler(this.cmEditor)
                },
            }
        );

        this.cmEditor.on('change', (cm: CodeMirror.Editor) => {
            //update code in parent component
            this.codechange.emit(cm.getDoc().getValue());
        });

    }

    ngOnChanges(changes: SimpleChanges) {
        /* Since the @Input code is initialized after the initialization of the codemirror editor (code is init 
        asynchronously in the parent component creEditorModal), I need to set the value in codemirror editor manually
        and only at the first change (when previousValue is undefined and currentValue is not undefined), otherwise
        every single change will reset the cursor at the begin of the editor (setValue() resets the cursor) */
        if (changes['code'].previousValue == undefined && changes['code'].currentValue) {
            this.cmEditor.setValue(changes['code'].currentValue);
        }
    }

    /** 
     * Cannot declare cm as CodeMirror.FromTextEditor since typings has not toggleComment definition
     * (it is not included in codemirror.js, it is in comment.js)
     */
    private commentHandler(cm: any) {
        var start = cm.cursorCoords(true, "local");
        var end = cm.cursorCoords(false, "local");
        cm.toggleComment({ from: start, to: end });
    }

}