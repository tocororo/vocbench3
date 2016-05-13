///<reference path="../../../typings/browser.d.ts"/>

import { Component, ViewChild, Input, Output, EventEmitter } from '@angular/core';

@Component({
    selector: 'codemirror',
    template: `
        <textarea #txtarea style="resize: vertical; min-height: 150px; width:100%;">{{query}}</textarea>
    `,
    host: { style: "border: 1px solid #ddd;"}
})
export class CodemirrorComponent {
    @Input() query: string;
    @Output() querychange = new EventEmitter<string>();
    
    @ViewChild('txtarea') textareaElement;

    cm: CodeMirror.EditorFromTextArea;

    constructor() { }

    ngAfterViewInit() {
        this.cm = CodeMirror.fromTextArea(
            this.textareaElement.nativeElement,
            { 
                lineNumbers: true, mode: "application/sparql-query", 
                indentUnit : 4,
                indentWithTabs: true,
                extraKeys: {"Ctrl-Space": this.autoCompleteHandler},
            }
        );

        this.cm.on('change', (editor: CodeMirror.Editor) => {
            this.querychange.emit(editor.getDoc().getValue());
        });
    }
    
    autoCompleteHandler() {
        console.log("autoCompleteHandler");
    }
    
}