///<reference path="../../../typings/index.d.ts" />

import {Component, ViewChild, Input, Output, EventEmitter} from '@angular/core';
import {VocbenchCtx} from '../utils/VocbenchCtx';
import {ARTURIResource} from '../utils/ARTResources';
import {MetadataServices} from '../services/metadataServices';
import {SearchServices} from '../services/searchServices';

// var YASQE = require('yasgui-yasqe/dist/yasqe.bundled.min');
var YASQE = require('yasgui-yasqe/dist/yasqe.bundled');
var $: JQueryStatic = require('jquery');

@Component({
    selector: 'yasgui',
    template: `
        <div class="hbox" style="align-items: center; justify-content: flex-end;">
            <span style="margin-right: 3px;">Fetch prefix from prefix.cc</span>
            <input type="checkbox" (change)="onCheckboxChange($event.target.checked)" [(ngModel)]="fetchFromPrefixCheck">
        </div>
        <textarea #txtarea style="">{{query}}</textarea>
    `,
})
export class YasguiComponent {
    @Input() query: string;
    @Output() querychange = new EventEmitter<Object>(); //emit event containing {query: string, valid: boolean} when it changes
    @Output() modechange = new EventEmitter<string>(); //emit event containing mode (update/query) when it changes
    
    @ViewChild('txtarea') textareaElement;

    private fetchFromPrefixCheck: boolean = false;
    // private fetchFromPrefixCheck: boolean = true;

    private yasqe;

    constructor(private vbCtx: VocbenchCtx, private metadataService: MetadataServices, private searchService: SearchServices) {}

    ngAfterViewInit() {

        YASQE.registerAutocompleter('customPrefixCompleter',
            (yasqe) => {
                return this.customPrefixCompleter(yasqe, this.metadataService, this.fetchFromPrefixCheck);
            }
        );

        YASQE.registerAutocompleter('customPropertyCompleter',
            (yasqe) => {
                return this.customPropertyCompleter(yasqe, this.searchService);
            }
        );

        this.yasqe = YASQE.fromTextArea(
            this.textareaElement.nativeElement,
            {
                persistent: null, //avoid same query for all the tabs
                createShareLink: null, //disable share button
                autocompleters: ["customPrefixCompleter", "customPropertyCompleter", "classes", "variables"],
                // autocompleters: ["customPrefixCompleter", "properties", "classes", "variables"],
                // autocompleters: ["prefixes", "properties", "classes", "variables"],
                extraKeys: { "Ctrl-7": YASQE.commentLines }
            }
        );
        //called on changes in yasqe editor
        this.yasqe.on('change', (yasqe) => {
            //update query mode in parent component
            this.modechange.emit(yasqe.getQueryMode());
            //update query in parent component
            this.querychange.emit({query: yasqe.getValue(), valid: yasqe.queryValid});
            //Check whether typed prefix is declared. If not, automatically add declaration using list from prefix.cc
            //taken from prefixes.js, since I don't use prefixes autocompleter I nees to register this listener
            YASQE.Autocompleters.prefixes.appendPrefixIfNeeded(yasqe, "customPrefixCompleter");
        });

        /*------------------------------------------------------------------------------
        In this way I use the default yasqe prefixes autocompletion:
        - the prefixes are completed fetching them from prefix.cc
        - the sparql query is initialized with a sample SELECT query and with the 
          declaration of the  prefixes known in the project (not suggested otherwise by autocompletion)
        - when the user types a prefix not yet imported, it is added to the prefix
          declaration (if it is declarated in prefix.cc as well)
        --------------------------------------------------------------------------------*/
        // this.yasqe = YASQE.fromTextArea(
        //     this.textareaElement.nativeElement,
        //     {
        //         persistent: null, //avoid same query for all the tabs
        //         createShareLink: null, //disable share button
        //         autocompleters: ["prefixes", "properties", "classes", "variables"],
        //         extraKeys: { "Ctrl-7": YASQE.commentLines }
        //     }
        // );
        // //called on changes in yasqe editor
        // this.yasqe.on('change', (yasqe) => {
        //     //update query mode in parent component
        //     this.modechange.emit(yasqe.getQueryMode());
        //     //update query in parent component
        //     this.querychange.emit(yasqe.getValue());
        // });
    }

    private customPrefixCompleter(yasqe, metadataService: MetadataServices, fetchFromPrefixCC: boolean) {
        return {
            isValidCompletionPosition: function () {
                return YASQE.Autocompleters.prefixes.isValidCompletionPosition(yasqe);
            },
            get: function (token, callback) { //callback is the function to which pass the suggested strings if get is async
                metadataService.getNSPrefixMappings().subscribe(
                    mappings => {
                        var prefixArray = [];
                        //add the prefixes from the local triplestore
                        for (var i = 0; i < mappings.length; i++) {
                            var pr = (mappings[i].prefix == "") ? "base" : mappings[i].prefix;
                            var ns = mappings[i].namespace;
                            var prNs = pr + ": <" + ns + ">";
                            prefixArray.push(prNs);
                        }
                        prefixArray.sort();
                        if (fetchFromPrefixCC) {
                            //-----------copied from prefixes.js of yasgui-yasqe-----------
                            $.get(YASQE.Autocompleters.prefixes.fetchFrom, function(data) {
                                for (var prefix in data) {
                                    if (prefix == "bif")
                                        continue; // skip this one! see #231
                                    var completeString = prefix + ": <" + data[prefix] + ">";
                                    prefixArray.push(completeString); // the array we want to store in localstorage
                                }
                                
                                callback(prefixArray);
                            });
                            //-------------------------------------------------------
                        } else {
                            callback(prefixArray);
                        }
                    }
                );
            },
            preProcessToken: function(token) {
                return YASQE.Autocompleters.prefixes.preprocessPrefixTokenForCompletion(yasqe, token)
            },
            async: true,
            bulk: true,
            autoShow: true,
            persistent: null,
            callbacks: {
                pick: function() {
                    yasqe.collapsePrefixes(false);
                }
            }
        }
    };

    private onCheckboxChange(checked) {
        //disable the completer, register it with fetchFromPrefixCC changed, then enable it again
        this.yasqe.disableCompleter("customPrefixCompleter");
        YASQE.registerAutocompleter('customPrefixCompleter',
            (yasqe) => {
                return this.customPrefixCompleter(yasqe, this.metadataService, checked);
            }
        );
        // YASQE.defaults.autocompleters = ["customPrefixCompleter", "properties", "classes", "variables"];
        this.yasqe.enableCompleter("customPrefixCompleter");
    }

    private customPropertyCompleter(yasqe, searchService: SearchServices) {
        return {
            isValidCompletionPosition: function() {
                return YASQE.Autocompleters.properties.isValidCompletionPosition(yasqe);
            },
            get: function(token, callback) {
                //update when searchResource will be changed with useURI parameter
                searchService.searchResource(token.autocompletionString, ["property"], false, true, "start").subscribe(
                    results => {
                        var resArray = [];
                        for (var i = 0; i < results.length; i++) {
                            var uri = results[i].getURI()
                            //results may contains duplicate (properties with multiple roles), so add the uri only if not already in
                            if (resArray.indexOf(uri) == -1) {
                                resArray.push(uri);
                            }
                        }
                        callback(resArray);
                    }
                );
            },
            preProcessToken: function(token) {
                return YASQE.Autocompleters.properties.preProcessToken(yasqe, token)
            },
            postProcessToken: function(token, suggestedString) {
                return YASQE.Autocompleters.properties.postProcessToken(yasqe, token, suggestedString);
            },
            async: true,
            bulk: false,
            autoShow: false,
            persistent: null,
            callbacks: {
                validPosition: yasqe.autocompleters.notifications.show,
                invalidPosition: yasqe.autocompleters.notifications.hide,
            }
        }
    }

}