import {Directive, ElementRef, Input, SimpleChanges} from '@angular/core';

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
    }
})
export class SanitizerDirective {
    
    @Input('sanitized') active: boolean;
    
    private sourceChar = " ";
    private targetChar = "_";
    
    constructor(private el: ElementRef) {}
    
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
		var text = text.replace(new RegExp(this.sourceChar, 'g'), this.targetChar);
		return text;
	}
    
    /**
     * Sanitized pasted text
     */
    onPasteListener = function(event: ClipboardEvent) {
        if (this.active) {
            var inputElement = this.el.nativeElement;
            var txtContent = inputElement.value;

            var start = inputElement.selectionStart;
            var end = inputElement.selectionEnd;

            var textToPaste = event.clipboardData.getData("text/plain");
            var transformedText = this.sanitize(textToPaste);

            // Set the new textbox content
            var contentBeforeSpace = txtContent.slice(0, start);
            var contentAfterSpace = txtContent.slice(end);
            inputElement.value = contentBeforeSpace + transformedText + contentAfterSpace;
            // Move the cursor
            inputElement.selectionStart = inputElement.selectionEnd = start + transformedText.length;

            event.preventDefault();//prevent the default keypress listener
        }
    }

    /**
     * Sanitizes typed text
     */
    onKeypressListener = function(event: KeyboardEvent) {
        if (this.active) {
            var inputElement = this.el.nativeElement;
            var txtContent = inputElement.value;
            
            var charPressed = String.fromCharCode(event.which);

            if (charPressed == this.sourceChar) {
                var transformedChar = this.sanitize(charPressed);
                var start = inputElement.selectionStart;
                var end = inputElement.selectionEnd;
                // Set the new textbox content
                var contentBeforeSpace = txtContent.slice(0, start);
                var contentAfterSpace = txtContent.slice(end);
                inputElement.value = contentBeforeSpace + transformedChar + contentAfterSpace;
                // Move the cursor
                inputElement.selectionStart = inputElement.selectionEnd = start + 1;
                event.preventDefault();//prevent the default keypress listener
            }
        }
    }
    
}