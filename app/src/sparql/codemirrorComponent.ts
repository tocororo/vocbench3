import { Component, ViewChild, Input, Output, EventEmitter } from '@angular/core';

declare var CodeMirror: any;

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

    cm: any;

    constructor() { }

    ngAfterViewInit() {
        this.cm = CodeMirror.fromTextArea(
            this.textareaElement.nativeElement,
            { 
                lineNumbers: true, mode: "application/sparql-query", 
                matchBrackets: true,
                indentUnit : 4,
                tabMode : "indent",
                extraKeys: {"Ctrl-Space": this.autoCompleteHandler},
            }
        );

        this.cm.on('change', (editor: CodeMirror.Editor) => {
            this.querychange.emit(editor.getDoc().getValue());
        });
        
        this.cm.setSize();
        
    }
    
    autoCompleteHandler() {
        console.log("autoCompleteHandler");
    }
    
}