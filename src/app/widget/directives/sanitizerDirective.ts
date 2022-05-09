import { Directive, ElementRef, EventEmitter, Input, Output, SimpleChanges } from '@angular/core';
import { NgModel } from '@angular/forms';

/**
 * Directive to sanitize a text in an input text element
 * (replaces typed or pasted white spaces " " with underscores "_").
 * To sanitize an input text element just add sanitize directive as follow
 * <input type="text" sanitized>
 * To dynamically change sanitized directive use <input type="text" [sanitized]="booleanValue">
 * where booleanValue specifies whether the directive is active
 */

@Directive({
    selector: '[sanitized]',
    host: {
        '(keypress)': 'onKeypressListener($event)',
        '(paste)': 'onPasteListener($event)'
    },
    providers: [NgModel],
})
export class SanitizerDirective {

    @Input('sanitized') active: boolean;
    @Output() ngModelChange = new EventEmitter();

    private sourceChar = " ";
    private targetChar = "_";

    constructor(private el: ElementRef, private model: NgModel) { }

    ngOnChanges(changes: SimpleChanges) {
        //check needed when sanitized is used as <input type="text" sanitized>, so active is bound as ""
        if (changes['active'].currentValue === "") {
            this.active = true;
        }
    }

    /**
     * Sanitizes the input text replacing the white space with underscore.
     * @param text the input text to sanitize
     */
    sanitize(text: string) {
        //'g' = global match (find all matches, doesn't stop after 1st match)
        text = text.replace(new RegExp(this.sourceChar, 'g'), this.targetChar);
        return text;
    }

    /**
     * Sanitized pasted text
     */
    onPasteListener(event: ClipboardEvent) {
        if (this.active) {
            let inputElement = this.el.nativeElement;
            let txtContent = inputElement.value;

            let start = inputElement.selectionStart;
            let end = inputElement.selectionEnd;

            let textToPaste = event.clipboardData.getData("text/plain");
            let transformedText = this.sanitize(textToPaste);

            // Set the new textbox content
            let contentBeforeSpace = txtContent.slice(0, start);
            let contentAfterSpace = txtContent.slice(end);
            let updatedText = contentBeforeSpace + transformedText + contentAfterSpace;
            inputElement.value = updatedText;
            // Move the cursor
            inputElement.selectionStart = start + transformedText.length;
            inputElement.selectionEnd = start + transformedText.length;

            event.preventDefault();//prevent the default ctrl+v keypress listener

            this.ngModelChange.emit(updatedText);
        }
    }

    /**
     * Sanitizes typed text
     */
    onKeypressListener(event: KeyboardEvent) {
        if (this.active) {
            let inputElement = this.el.nativeElement;
            let txtContent = inputElement.value;

            let charPressed = event.key;

            if (charPressed == this.sourceChar) {
                let transformedChar = this.sanitize(charPressed);
                let start = inputElement.selectionStart;
                let end = inputElement.selectionEnd;
                // Set the new textbox content
                let contentBeforeSpace = txtContent.slice(0, start);
                let contentAfterSpace = txtContent.slice(end);
                let updatedText = contentBeforeSpace + transformedChar + contentAfterSpace;
                inputElement.value = updatedText;
                // Move the cursor
                inputElement.selectionStart = start + 1;
                inputElement.selectionEnd = start + 1;
                event.preventDefault();//prevent the default keypress listener

                this.ngModelChange.emit(updatedText);
            }
        }
    }

}