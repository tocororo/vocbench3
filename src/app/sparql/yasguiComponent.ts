import {Component, ViewChild, Input, Output, EventEmitter} from '@angular/core';
import {VocbenchCtx} from '../utils/VocbenchCtx';

// var YASQE = require('yasgui-yasqe/dist/yasqe.bundled.min');
var YASQE = require('yasgui-yasqe/dist/yasqe.bundled');

@Component({
    selector: 'yasgui',
    template: `
        <textarea #txtarea style="">{{query}}</textarea>
    `,
    host: { style: "border: 1px solid #ddd;"},
})
export class YasguiComponent {
    @Input() query: string;
    @Output() querychange = new EventEmitter<string>();
    
    @ViewChild('txtarea') textareaElement;

    private yasqe;

    constructor(private vbCtx: VocbenchCtx) { }

    ngAfterViewInit() {
        this.yasqe = YASQE.fromTextArea(
            this.textareaElement.nativeElement,
            {
                persistent: null, //avoid same query for all the tabs
                createShareLink: null, //disable share button
                extraKeys: {
                    "Ctrl-7": YASQE.commentLines
                }
            }
        );

        this.yasqe.on('change', (yasqe) => {
            //update query in parent component
            this.querychange.emit(yasqe.getValue());
        });
    }

    

}