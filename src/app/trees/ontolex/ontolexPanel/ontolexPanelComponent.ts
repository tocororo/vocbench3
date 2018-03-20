import { Component, Input, Output, EventEmitter, ViewChild, ElementRef } from "@angular/core";
import { LexiconListPanelComponent } from "../lexicon/lexiconListPanel/lexiconListPanelComponent";
import { LexicalEntryListPanelComponent } from "../lexicalEntry/lexicalEntryListPanel/lexicalEntryListPanelComponent";
import { SearchServices } from "../../../services/searchServices";
import { BasicModalServices } from "../../../widget/modal/basicModal/basicModalServices";
import { ARTURIResource, ResAttribute, RDFResourceRolesEnum, ResourceUtils } from "../../../models/ARTResources";
import { RDF, OWL } from "../../../models/Vocabulary";
import { SearchSettings, ClassIndividualPanelSearchMode } from "../../../models/Properties";
import { VBProperties } from "../../../utils/VBProperties";
import { UIUtils, TreeListContext } from "../../../utils/UIUtils";

@Component({
    selector: "ontolex-panel",
    templateUrl: "./ontolexPanelComponent.html",
    host: { 
        class: "blockingDivHost",
        '(mousemove)': 'onMousemove($event)',
        '(mouseup)': 'onMouseup()',
        '(mouseleave)': 'onMouseup()'
    }
})
export class OntolexPanelComponent {
    @Input() readonly: boolean;
    @Input() context: TreeListContext;
    @Output() lexiconSelected = new EventEmitter<ARTURIResource>();
    @Output() lexicalEntrySelected = new EventEmitter<ARTURIResource>();
    @Output() lexiconDeleted = new EventEmitter<ARTURIResource>();
    @Output() lexicalEntryDeleted = new EventEmitter<ARTURIResource>();

    @ViewChild('blockDivClsIndList') public blockDivElement: ElementRef;
    //{ read: ElementRef } to specify to get the element instead of the component (see https://stackoverflow.com/q/45921819/5805661)
    @ViewChild('lexiconPanel', { read: ElementRef }) private lexiconPanelRef: ElementRef; 
    @ViewChild('lexEntryPanel',  { read: ElementRef }) private lexEntryPanelRef: ElementRef;

    @ViewChild(LexiconListPanelComponent) viewChildLexiconList: LexiconListPanelComponent;
    @ViewChild(LexicalEntryListPanelComponent) viewChildLexicalEntryList: LexicalEntryListPanelComponent;

    private rendering: boolean = false; //if true the nodes in the tree should be rendered with the show, with the qname otherwise

    private selectedLexicon: ARTURIResource;
    private selectedLexEntry: ARTURIResource;

    private rolesForSearch: RDFResourceRolesEnum[] = [RDFResourceRolesEnum.limeLexicon, RDFResourceRolesEnum.ontolexLexicalEntry];

    constructor(private searchService: SearchServices, private basicModals: BasicModalServices, private vbProp: VBProperties) { }

    private doSearch(searchedText: string) {
        // if (searchedText.trim() == "") {
        //     this.basicModals.alert("Search", "Please enter a valid string to search", "error");
        // } else {
        //     let searchSettings: SearchSettings = this.vbProp.getSearchSettings();
        //     let searchRoles: RDFResourceRolesEnum[] = [RDFResourceRolesEnum.cls, RDFResourceRolesEnum.individual];
        //     if (searchSettings.classIndividualSearchMode == ClassIndividualPanelSearchMode.onlyInstances) {
        //         searchRoles = [RDFResourceRolesEnum.individual];
        //     } else if (searchSettings.classIndividualSearchMode == ClassIndividualPanelSearchMode.onlyClasses) {
        //         searchRoles = [RDFResourceRolesEnum.cls];
        //     }
        //     let searchLangs: string[];
        //     let includeLocales: boolean;
        //     if (searchSettings.restrictLang) {
        //         searchLangs = searchSettings.languages;
        //         includeLocales = searchSettings.includeLocales;
        //     }
        //     UIUtils.startLoadingDiv(this.blockDivElement.nativeElement);
        //     this.searchService.searchResource(searchedText, searchRoles, searchSettings.useLocalName, searchSettings.useURI, 
        //         searchSettings.stringMatchMode, searchLangs, includeLocales).subscribe(
        //         searchResult => {
        //             UIUtils.stopLoadingDiv(this.blockDivElement.nativeElement);
        //             if (searchResult.length == 0) {
        //                 this.basicModals.alert("Search", "No results found for '" + searchedText + "'", "warning");
        //             } else { //1 or more results
        //                 if (searchResult.length == 1) {
        //                     this.selectSearchedResource(searchResult[0]);
        //                 } else { //multiple results, ask the user which one select
        //                     ResourceUtils.sortResources(searchResult, this.rendering ? "show" : "value");
        //                     this.basicModals.selectResource("Search", searchResult.length + " results found.", searchResult, this.rendering).then(
        //                         (selectedResource: any) => {
        //                             this.selectSearchedResource(selectedResource);
        //                         },
        //                         () => { }
        //                     );
        //                 }
        //             }
        //         }
        //     );
        // }
    }

    /**
     * If resource is a class expands the class tree and select the resource,
     * otherwise (resource is an instance) expands the class tree to the class of the instance and
     * select the instance in the instance list
     */
    // private selectSearchedResource(resource: ARTURIResource) {
    //     if (resource.getRole() == RDFResourceRolesEnum.cls) {
    //         this.viewChildTree.openTreeAt(resource);
    //     } else { // resource is an instance
    //         //get type of instance, then open the tree to that class
    //         this.individualService.getNamedTypes(resource).subscribe(
    //             types => {
    //                 this.viewChildTree.openTreeAt(types[0]);
    //                 //center instanceList to the individual
    //                 this.viewChildInstanceList.selectSearchedInstance(types[0], resource);
    //             }
    //         )
    //     }
    // }

    // public openClassTreeAt(resource: ARTURIResource) {
    //     if (resource.getRole() == RDFResourceRolesEnum.cls) {
    //         this.viewChildTree.openTreeAt(resource);
    //     }
    // }

    //EVENT LISTENERS
    private onLexiconSelected(lexicon: ARTURIResource) {
        this.selectedLexicon = lexicon;
        if (this.selectedLexEntry != null) {
            this.selectedLexEntry.setAdditionalProperty(ResAttribute.SELECTED, false);
            this.selectedLexEntry = null;
        }
        if (lexicon != null) { //lexicon could be null if the underlaying lexicon list has been refreshed
            this.lexiconSelected.emit(lexicon);
        }
    }

    private onEntrySelected(entry: ARTURIResource) {
        this.selectedLexEntry = entry;
        //event could be fired after a refresh on the list, in that case, entry is null
        if (entry != null) { //forward the event only if entry is not null
            this.lexicalEntrySelected.emit(entry);
        }
    }

    private onLexiconDeleted(lexicon: ARTURIResource) {
        this.lexiconDeleted.emit(lexicon);
        this.selectedLexicon = null;
    }

    private onEntryDeleted(entry: ARTURIResource) {
        this.lexicalEntryDeleted.emit(entry);
        this.selectedLexEntry = null;
    }


    //Draggable slider handler

    /**
     * There are two panel:
     * - lexicon panel to the top:
     * The flex value varies between 8 and 4
     * - lexical entry panel to the bottom:
     * The flex value is fixed to 4
     * 
     * When resizing, it is changed just "lexiconPanelFlex" between "minPanelSize" and "maxPanelSize"
     * The "minPanelSize" and "maxPanelSize" determine the proportion between the two panels top:bottom that is between 
     * minPanelSize:lexEntryPanelFlex and maxPanelSize:lexEntryPanelFlex (1:4 8:4)
     */

    private readonly maxPanelSize: number = 16;
    private readonly minPanelSize: number = 1;

    private lexiconPanelFlex = 6;
    private readonly lexEntryPanelFlex: number = 4;

    private dragging: boolean = false;
    private startMousedownY: number;

    private onMousedown(event: MouseEvent) {
        event.preventDefault();
        this.dragging = true;
        this.startMousedownY = event.clientY;
        this.onMousemove = this.draggingHandler; //set listener on mousemove
    }
    private onMouseup() {
        if (this.dragging) { //remove listener on mousemove
            this.onMousemove = (event: MouseEvent) => {};
            this.dragging = false;
        }
    }
    private onMousemove(event: MouseEvent) {}
    private draggingHandler(event: MouseEvent) {
        let endMousedownY = event.clientY;
        let diffY: number = this.startMousedownY - endMousedownY;
        // console.log("startMousedownY", this.startMousedownY, "endMousedownY", endMousedownY, "diffY ", diffY);
        let lexiconPanelHeight: number = this.lexiconPanelRef.nativeElement.offsetHeight;
        let lexEntryPanelHeight: number = this.lexEntryPanelRef.nativeElement.offsetHeight;
        /**
         * Compute the lexiconPanelFlex based on the following mathematical proportion:
         *  lexiconPanelHeight:lexEntryPanelHeight = lexiconPanelFlex:lexEntryPanelFlex
         */
        this.lexiconPanelFlex = (lexiconPanelHeight-diffY)/(lexEntryPanelHeight+diffY)*this.lexEntryPanelFlex;

        //ration between lexicon and lexEntry panel should be always between 4:1 and 1:4
        if (this.lexiconPanelFlex > this.maxPanelSize) this.lexiconPanelFlex = this.maxPanelSize;
        else if (this.lexiconPanelFlex < this.minPanelSize) this.lexiconPanelFlex = this.minPanelSize;
        //update the initial Y position of the cursor
        this.startMousedownY = event.clientY;
    }

}