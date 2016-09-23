import {Component, ViewChild, Input, Output, EventEmitter} from '@angular/core';
import {VocbenchCtx} from '../utils/VocbenchCtx';
import {MetadataServices} from '../services/metadataServices';

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
    @Output() querychange = new EventEmitter<string>(); //emit event containing query as string when it changes
    @Output() modechange = new EventEmitter<string>(); //emit event containing mode (update/query) when it changes
    
    @ViewChild('txtarea') textareaElement;

    private yasqe;

    constructor(private vbCtx: VocbenchCtx, private metadataService: MetadataServices) { }

    ngAfterViewInit() {
        /*------------------------------------------------------------------------------
        In this way I use the default yasqe prefixes autocompletion:
        - the prefixes are completed fetching them from prefix.cc
        - the sparql query is initialized with a sample SELECT query and with the 
          declaration of the  prefixes known in the project (not suggested otherwise by autocompletion)
        - when the user types a prefix not yet imported, it is added to the prefix
          declaration (if it is declarated in prefix.cc as well)
        --------------------------------------------------------------------------------*/
        this.yasqe = YASQE.fromTextArea(
            this.textareaElement.nativeElement,
            {
                persistent: null, //avoid same query for all the tabs
                createShareLink: null, //disable share button
                autocompleters: ["prefixes", "properties", "classes", "variables"],
                extraKeys: { "Ctrl-7": YASQE.commentLines }
            }
        );
        //called on changes in yasqe editor
        this.yasqe.on('change', (yasqe) => {
            //update query mode in parent component
            this.modechange.emit(yasqe.getQueryMode());
            //update query in parent component
            this.querychange.emit(yasqe.getValue());
        });
        /*------------------------------------------------------------------------------
        In this way I override the default YASQE prefixes autocompletion:
        - No prefix.cc support
        - Autocompletion suggests only prefixes known in the project
        - If the user types a prefix not yet imported there is no support from YASQE
          (the declaration is not automatically added)
        - Since the YASQE editor is initialized once the prefixNsMapping is fetched from server,
          every time an editor is initialized, it takes a few moment to show the proper UI
          that it is not so good.
        --------------------------------------------------------------------------------*/
        // this.metadataService.getNSPrefixMappings().subscribe(
        //     mappings => {
        //         YASQE.registerAutocompleter('customPrefixCompleter', (yasqe) => {return this.customPrefixCompleter(yasqe, mappings)});
        //         this.yasqe = YASQE.fromTextArea(
        //             this.textareaElement.nativeElement,
        //             {
        //                 persistent: null, //avoid same query for all the tabs
        //                 createShareLink: null, //disable share button
        //                 //the default autocompleters except for "prefixes" replaced by the customPrefixCompleter
        //                 autocompleters: ["variables", "properties", "classes", "customPrefixCompleter"], 
        //                 extraKeys: {
        //                     "Ctrl-7": YASQE.commentLines
        //                 }
        //             }
        //         );
        //         //called on changes in yasqe editor
        //         this.yasqe.on('change', (yasqe) => {
        //             //update query mode in parent component
        //             this.modechange.emit(yasqe.getQueryMode());
        //             //update query in parent component
        //             this.querychange.emit(yasqe.getValue());
        //         });
        //     }
        // );
        //------------------------------------------------------------

    }

    // private customPrefixCompleter(yasqe, prefNsMap) {
    //     return {
    //         //Check whether the cursor is in a proper position for this autocompletion. Use the default function on prefixes autocompletion
    //         isValidCompletionPosition : function() {
    //             return YASQE.Autocompleters.prefixes.isValidCompletionPosition(yasqe);
    //         },
    //         //completions are fetched synchronously
    //         async : false,
    //         //In this case we assume the prefixes will fit in memory. So, turn on bulk loading, which will make autocompleting a lot faster
    //         bulk : true,
    //         //Automatically show the hints, no need to press ctrl-space. Note: this only works when completions are fetched synchronously
    //         autoShow : true,
    //         persistent : null,
    //         get : () => {
    //             var suggestions = [];
    //             for (var i = 0; i < prefNsMap.length; i++) {
    //                 suggestions.push(prefNsMap[i].prefix + ": <" + prefNsMap[i].namespace + ">");
    //             }
    //             return suggestions;
    //         }
    //     }
    // };

    

}