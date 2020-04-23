import { Component, forwardRef, Input, SimpleChanges, ViewChild } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import * as CodeMirror from 'codemirror';
import { OverlayConfig } from 'ngx-modialog';
import { BSModalContextBuilder, Modal } from 'ngx-modialog/plugins/bootstrap';
import { Observable } from 'rxjs';
import { ExpressionCheckResponse, ManchesterServices, ObjectError } from '../../../services/manchesterServices';
import { SearchMode } from './../../../models/Properties';
import { SearchServices } from './../../../services/searchServices';
import './manchester';
import { HelperModal } from './modal/helperModal';





@Component({
    selector: 'manchester-editor',
    templateUrl: "manchesterEditorComponent.html",
    providers: [{
        provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => ManchesterEditorComponent), multi: true,
    }],
    host: { class: "vbox" }
})

export class ManchesterEditorComponent implements ControlValueAccessor {
    @Input() context: ManchesterCtx;
    @Input() disabled: boolean;
    @ViewChild('txtarea') textareaElement: any;


    private markers: CodeMirror.TextMarker[] = [];
    private cmEditor: CodeMirror.EditorFromTextArea;
    private codeValid: boolean = true;
    private codeValidationTimer: number;
    private codeInvalidDetails: string;

    constructor(private manchesterService: ManchesterServices, private searchServices: SearchServices, private modal: Modal) { }

    ngAfterViewInit() {
        this.cmEditor = CodeMirror.fromTextArea(
            this.textareaElement.nativeElement,
            {
                lineNumbers: true,
                mode: "manchester",
                indentUnit: 4,
                indentWithTabs: true,
                lineWrapping: true,
                readOnly: this.disabled,
                viewportMargin: Infinity,//with height:auto applied to .CodeMirror class, lets the editor expand its heigth dinamically
                //moreover, .CodeMirror-scroll { height: 300px; } sets an height limit
                extraKeys: { "Ctrl-Space": "autocomplete" },
                hintOptions: {
                    hint: (cm: CodeMirror.Editor, callback: (hints: CodeMirror.Hints) => any) => {
                        return this.asyncHintFunction();
                    }
                }
            }
        );

        this.cmEditor.on('change', (cm: CodeMirror.Editor) => {
            this.onCodeChange(cm.getDoc().getValue());
        });

    }


    ngOnChanges(changes: SimpleChanges) {
        if (changes['disabled'] && this.cmEditor != null) {
            this.cmEditor.setOption('readOnly', changes['disabled'].currentValue);
        }
    }

    onCodeChange(code: string) {
        clearTimeout(this.codeValidationTimer);
        this.codeValidationTimer = window.setTimeout(() => { this.validateExpression(code) }, 1000);

    }

    /**
     * Open helper modal
     */
    private onClick() {
        const builder = new BSModalContextBuilder<any>();
        let overlayConfig: OverlayConfig = { context: builder.dialogClass("modal-dialog").keyboard(27).toJSON() };
        return this.modal.open(HelperModal, overlayConfig);
    }

    /**
     * This method manages hints window (activated via "crtl-space").
     */
    private asyncHintFunction(): Promise<CodeMirror.Hints> {
        let wordRegExp = /[\w|:$]+/;
        let cur = this.cmEditor.getDoc().getCursor();
        let curLine = this.cmEditor.getDoc().getLine(cur.line);
        let end = cur.ch;
        let start = end;
        while (start && wordRegExp.test(curLine.charAt(start - 1))) --start;
        let word = start != end && curLine.slice(start, end);

        if (word != "") {
            // if word contains ":" it call serachURIList otherwise it call searchPrefix and search in keywords
            if (word.indexOf(":") != -1) {
                //update start value to put hint choosen after ":"
                for (let i = start; i <= end; i++) {
                    if (curLine.charAt(i) == ":") {
                        start = i + 1;
                        break
                    }
                }
                return this.searchServices.searchURIList(word, SearchMode.startsWith, 200).map(
                    results => {
                        if (results.length > 199) {
                            results.sort();
                            results.push("...");
                            return {
                                from: CodeMirror.Pos(cur.line, start),
                                to: CodeMirror.Pos(cur.line, end),
                                list: results
                            }
                        }
                        return {
                            from: CodeMirror.Pos(cur.line, start),
                            to: CodeMirror.Pos(cur.line, end),
                            list: results.sort()
                        }
                    }
                ).toPromise();
            } else { // here look for between keywords and prefixes
                let keywords = ["SOME", "ONLY", "VALUE", "MIN", "MAX", "EXACTLY", "SELF", "LENGTH", "MINLENGTH", "MAXLENGTH", "PATTERN", "LANGRANGE", "OR", "AND", "NOT", "THAT"]; // remeber to check and update also manchester.js file in case of modify
                let filterKeywords = keywords.filter(w => w.startsWith(word.toUpperCase())).sort();
                return this.searchServices.searchPrefix(word, SearchMode.startsWith).map(
                    results => {
                        let list: CodeMirror.Hint[] = []; // it is a particular data structure that allows me to add a reference for the css ( a list of objects)
                        if (results.length > 0 && filterKeywords.length > 0) { //  case in which you need to add a separator in hints windows ( first keyword and then prefixes)
                            filterKeywords.forEach(value => {
                                if (value == "SOME" || value == "ONLY" || value == "VALUE" || value == "MIN" || value == "MAX" || value == "EXACTLY" || value == "SELF") {
                                    list.push({ text: value, className: "quantifier" })
                                } else if (value == "LANGRANGE" || value == "LENGTH" || value == "MAXLENGTH" || value == "MINLENGTH" || value == "PATTERN" || value == "<" || value == "<=" || value == ">" || value == ">=") {
                                    list.push({ text: value, className: "facet" })
                                } else if (value == "AND" || value == "OR" || value == "NOT" || value == "THAT") {
                                    list.push({ text: value, className: "conjuction" })
                                }

                            })
                            results.sort().forEach(value => {
                                if (results.indexOf(value) == 0) { // check to verify if it is the first element of array
                                    list.push({ text: value + ":", className: "hint-separator" }) // add separator because start prefixes. Add also ":" to each value of result array
                                } else {
                                    list.push({ text: value + ":" })
                                }
                                //list.push({ text: value + ":" })
                            })
                            return {
                                from: CodeMirror.Pos(cur.line, start),
                                to: CodeMirror.Pos(cur.line, end),
                                list: list
                            }

                        } else { // case only eighter keywords or prefixes
                            if (filterKeywords.length > 0) {
                                filterKeywords.forEach(value => {
                                    if (value == "SOME" || value == "ONLY" || value == "VALUE" || value == "MIN" || value == "MAX" || value == "EXACTLY" || value == "SELF" || value == "INVERSE") {
                                        list.push({ text: value, className: "quantifier" })
                                    } else if (value == "LANGRANGE" || value == "LENGTH" || value == "MAXLENGTH" || value == "MINLENGTH" || value == "PATTERN" || value == "<" || value == "<=" || value == ">" || value == ">=") {
                                        list.push({ text: value, className: "facet" })
                                    } else if (value == "AND" || value == "OR" || value == "NOT" || value == "THAT") {
                                        list.push({ text: value, className: "conjuction" })
                                    }

                                })
                            } else if (results.length > 0) {
                                results.sort().forEach(value => {
                                    list.push({ text: value + ":" })
                                })
                            }

                            let obj = {
                                from: CodeMirror.Pos(cur.line, start),
                                to: CodeMirror.Pos(cur.line, end),
                                list: list //filterKeywords.concat(results.map(function (elem) { let newElem = elem + ":"; return elem.replace(elem, newElem); }).sort())
                            }
                            if (obj.list.length > 0) {
                                return obj
                            }
                        }


                    }
                ).toPromise()
            }
        }

        // if (filterKeywords.length > 0) {
        //     let obj = {
        //         from: CodeMirror.Pos(cur.line, start),
        //         to: CodeMirror.Pos(cur.line, end),
        //         list: filterKeywords
        //     }
        //     return new Promise<CodeMirror.Hints>(function (resolve) { resolve(obj) });

        // }

    }

    /**
     * 
     * @param response 
     * This method underline errors in Manchester editor
     */
    errorMarks(response: ObjectError[]) {
        this.markers.forEach(value => { // clean words that have been marked (useful when applying changes to underlined words) 
            value.clear()
        })
        response.forEach(value => {
            if (value.type == "semantic") {
                let pattern = value.qname + "\\b|" + value.iri // regex checks if there are some word in text editor which match with any uri or qname if this happens takes its position with "positionWord"
                let positionWord = this.cmEditor.getDoc().getSearchCursor(new RegExp(pattern)); // take word position
                for (let i = 0; i <= value.occurrence; i++) {
                    positionWord.findNext();// take match in text editor
                }
                let marker = this.cmEditor.getDoc().markText(positionWord.from(), positionWord.to(), { className: "underline", title: value.msg }) //underline word that match
                this.markers.push(marker);// insert word into array that contain matched and underlined words
            } else {
                let startWordPosition = this.cmEditor.getDoc().posFromIndex(value.occurrence); // it take the position from word start ch
                let endWord = value.occurrence + value.offendingTerm.length //calculate ch of the word end ( -1 because we just are on the first character)
                let endWordPosition = this.cmEditor.getDoc().posFromIndex(endWord); // it take the position of the last character of the word
                let detailsExpectedTokens = value.expectedTokens.join("\n");
                if (value.offendingTerm == "<EOF>") {
                    let startWordPosition = this.cmEditor.getDoc().posFromIndex(value.occurrence - 1); // it take the position from word start ch
                    let endWordPosition = this.cmEditor.getDoc().posFromIndex(value.occurrence);
                    let marker = this.cmEditor.getDoc().markText(startWordPosition, endWordPosition, { className: "underline", title: detailsExpectedTokens }) //underline word that match
                    this.markers.push(marker);// insert word into array that contain matched and underlined words
                } else {
                    let marker = this.cmEditor.getDoc().markText(startWordPosition, endWordPosition, { className: "underline", title: detailsExpectedTokens }) //underline word that match
                    this.markers.push(marker);// insert word into array that contain matched and underlined words
                }



            }
        })

    }



    validateExpression(code: string) {
        let validationFn: Observable<ExpressionCheckResponse>;
        if (this.context == ManchesterCtx.datatypeFacets) {
            validationFn = this.manchesterService.checkDatatypeExpression(code);
        } else if (this.context == ManchesterCtx.datatypeEnumeration) {
            validationFn = this.manchesterService.checkLiteralEnumerationExpression(code);
        } else {
            validationFn = this.manchesterService.checkExpression(code)
        }
        validationFn.subscribe(
            (checkResp: ExpressionCheckResponse) => {
                this.codeValid = checkResp.valid;
                this.errorMarks(checkResp.details)
                if (this.codeValid) {
                    this.propagateChange(code);
                } else {
                    let detailsMsgs: string[] = checkResp.details.map(value => value.msg);
                    this.codeInvalidDetails = detailsMsgs.join("\n");
                    this.propagateChange(null); //in case invalid, propagate a null expression
                }
            }
        );



    }

    /**
     * Insert the given text in the position where the cursor is.
     * (this could be useful if it will be added some buttons for adding manchester keyword as AND, OR, ...)
     * @param text
     */
    insertAtCursor(text: string) {
        let cursor = this.cmEditor.getDoc().getCursor();
        this.cmEditor.getDoc().replaceRange(text, cursor, cursor);
    }


    //---- method of ControlValueAccessor and Validator interfaces ----
    /**
     * Write a new value to the element.
     */
    writeValue(obj: string) {
        if (obj != null) {
            this.cmEditor.setValue(obj);
        }
    }
    /**
     * Set the function to be called when the control receives a change event.
     */
    registerOnChange(fn: any): void {
        this.propagateChange = fn;
    }
    /**
     * Set the function to be called when the control receives a touch event. Not used.
     */
    registerOnTouched(fn: any): void { }

    //--------------------------------------------------

    // the method set in registerOnChange, it is just a placeholder for a method that takes one parameter, 
    // we use it to emit changes back to the parent
    private propagateChange = (_: any) => { };

}

/**
 * Useful to distringuish the context in which the editor is used and consequently which validation to apply
 */
export enum ManchesterCtx {
    datatypeFacets = "datatypeFacets", //the manchester expression describes a datatype restriction with facets
    datatypeEnumeration = "datatypeEnumeration", //the manchester expression describes a datatype restriction with enumerations 
    //default case: the manchester expression describes a class axiom
}
