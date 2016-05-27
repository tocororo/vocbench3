///<reference path="../../../typings/browser.d.ts"/>

import { Component, ViewChild, Input, Output, EventEmitter} from '@angular/core';

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
                extraKeys: {"Ctrl-Space": this.autoCompleteHandler},
            }
        );
        
        this.cmEditor.on('change', (editor: CodeMirror.Editor) => {
            this.querychange.emit(editor.getDoc().getValue());
        });
    }
    
    autoCompleteHandler() {
        console.log("autoCompleteHandler");
    }
    
}