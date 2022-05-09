import { Component, forwardRef, HostListener } from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import * as CodeMirror from 'codemirror';
import { ARTURIResource } from '../models/ARTResources';
import { VBContext } from '../utils/VBContext';
import { TurtleEditorComponent } from '../widget/codemirror/turtleEditor/turtleEditorComponent';
import { SharedModalServices } from '../widget/modal/sharedModal/sharedModalServices';

@Component({
    selector: 'shacl-report-editor',
    templateUrl: "shaclReportEditorComponent.html",
    providers: [{
        provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => ShaclReportEditorComponent), multi: true,
    }],
    host: { class: "vbox" },
})

export class ShaclReportEditorComponent extends TurtleEditorComponent {

    constructor(private sharedModals: SharedModalServices, private translateService: TranslateService) {
        super();
    }

    //@override
    writeValue(obj: string) {
        super.writeValue(obj);
        if (this.code != null) {
            setTimeout(() => {
                this.initClickableTokens();
            }, 500); //give time to cm editor to initialize
        }
    }

    initClickableTokens() {
        for (let i = 0; i < this.cmEditor.lineCount(); i++) {
            let lineTokens = this.cmEditor.getLineTokens(i);
            lineTokens.forEach(t => {
                if (t.string.startsWith("<") && t.string.endsWith(">")) {
                    let res = new ARTURIResource(t.string);
                    if (res.getURI().startsWith(VBContext.getWorkingProject().getDefaultNamespace())) { //local resource
                        let from: CodeMirror.Position = { ch: t.start, line: i };
                        let to: CodeMirror.Position = { ch: t.end, line: i };
                        this.cmEditor.markText(from, to, { css: "cursor: pointer; background-color: #fdff8c;", title: this.translateService.instant("SHACL.CLICK_TO_INSPECT") });
                    }
                }
            });
        }
    }

    @HostListener("click", ['$event'])
    onClick(event: MouseEvent) {
        let resourceRepresentation: string;
        let pos: CodeMirror.Position = this.cmEditor.coordsChar({ left: event.pageX, top: event.pageY });
        let clickedToken: CodeMirror.Token = this.cmEditor.getTokenAt(pos);
        if (clickedToken.string.startsWith("<") && clickedToken.string.endsWith(">")) {
            resourceRepresentation = clickedToken.string;
        } else {
            // let lineTokens: CodeMirror.Token[] = this.cmEditor.getLineTokens(pos.line);
            // let idx = lineTokens.findIndex(t => t.string == clickedToken.string && t.start == clickedToken.start && t.end == clickedToken.end);
            // if (idx <= lineTokens.length - 2 && lineTokens[idx + 1].string == ":") { //check if prefix is clicked
            //     resourceRepresentation = clickedToken.string + ":" + lineTokens[idx + 2].string
            // } else if (idx > 0 && idx < lineTokens.length && clickedToken.string == ":") {
            //     let previousToken = lineTokens[idx - 1];
            //     let nextToken = lineTokens[idx + 1];
            //     if (previousToken.string != " " && nextToken.string != " ") {
            //         resourceRepresentation = previousToken.string + ":" + nextToken.string;
            //     }
            // } else if (idx >= 2 && lineTokens[idx - 1].string == ":") { //check if localname is clicked
            //     resourceRepresentation = lineTokens[idx - 2].string + ":" + clickedToken.string;
            // }
        }
        let res = new ARTURIResource(resourceRepresentation);
        this.sharedModals.openResourceView(res, false);

    }


}