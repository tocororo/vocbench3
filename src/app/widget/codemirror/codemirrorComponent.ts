import {Component, ViewChild, Input, Output, EventEmitter, SimpleChanges} from '@angular/core';
import * as CodeMirror from 'codemirror';
import "./pearl";

// var CodeMirror = require('codemirror/lib/codemirror');

@Component({
    selector: 'codemirror',
    template: `
        <div class="vbox" style="overflow: auto">
            <textarea #txtarea [ngClass]="{disabled: disabled}">{{code}}</textarea>
        </div>
    `,
})
export class CodemirrorComponent {
    @Input() code: string;
    @Input() disabled: boolean;
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
                // matchBrackets: true, //it seems not to work
                // autoCloseBrackets: true,
                lineWrapping: true,
                readOnly: this.disabled,
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
        /* Unlike when the user change the code by typing in the textare, when the @Input 'code' is changed in the parent component 
        (e.g. by doing codeVar = "abcde", where codeVar is bound in the template with this @Input like [code]="code"),
        I need to call setValue() manually. The only way to distinguish this scenario is to recognize the first initialization of 
        @Input code. I cannot do it using changes['code'].firstChange since the "change in the parent" could be not be the first change,
        so I recognize this scenario inspecting the previous value. The parent component need to set the bound code to undefined, then
        set its real value, so that the the "if condition" is true and then the setValue() is fired. */
        if (changes['code'] && changes['code'].previousValue == undefined && changes['code'].currentValue != undefined) {
            //setValue() reset the cursor at the begin of the textarea, so I need to reset manually
            let cursor = this.cmEditor.getDoc().getCursor();
            this.cmEditor.setValue(changes['code'].currentValue);
            this.cmEditor.getDoc().setCursor(cursor);
        }
        if (changes['disabled'] && this.cmEditor != null) {
            this.cmEditor.setOption('readOnly', changes['disabled'].currentValue);
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

    insertAtCursor(text: string) {
        // let selection = this.cmEditor.getDoc().getSelection();
        // if (selection.length > 0) {
        //     this.cmEditor.getDoc().replaceSelection(text);
        //     return;
        // }
        let cursor = this.cmEditor.getDoc().getCursor();
        this.cmEditor.getDoc().replaceRange(text, cursor, cursor);
    }

}