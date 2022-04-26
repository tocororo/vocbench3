import { Component, EventEmitter, Input, Output, SimpleChanges } from "@angular/core";
import { ARTResource, ResAttribute } from "../../models/ARTResources";
import { ResourceViewType } from '../../models/Properties';
import { OntoLex, SKOS } from "../../models/Vocabulary";
import { AuthorizationEvaluator } from "../../utils/AuthorizationEvaluator";
import { VBActionsEnum } from "../../utils/VBActions";
import { VBContext } from "../../utils/VBContext";
import { RDFResourceRolesEnum } from './../../models/ARTResources';

@Component({
    selector: "resource-view",
    templateUrl: "./resourceViewContainer.html",
    host: { class: "vbox" },
    styleUrls: ["./resourceViewContainer.css"]
})
export class ResourceViewTabContainer {

    @Input() resource: ARTResource;

    @Output() dblclickObj: EventEmitter<ARTResource> = new EventEmitter<ARTResource>();
    @Output() update: EventEmitter<ARTResource> = new EventEmitter<ARTResource>();
    @Output() renderingChanged: EventEmitter<boolean> = new EventEmitter();

    private resourceViewStruct: ResViewStruct = { type: ResourceViewType.resourceView, show: "ResView" };
    private termViewStruct: ResViewStruct = { type: ResourceViewType.termView, show: "TermView" };
    private lexicographerViewStruct: ResViewStruct = { type: ResourceViewType.lexicographerView, show: "LexicographerView" };
    private sourceCodeStruct: ResViewStruct = { type: ResourceViewType.sourceCode, show: "Code" };
    rViews: ResViewStruct[];
    activeView: ResourceViewType = ResourceViewType.resourceView;

    private pendingValidation: boolean; //tells if the resource (or its content) is under validation (prevent the usage of code tab)

    ngOnInit() {
        this.initActiveView();
    }

    ngOnChanges(changes: SimpleChanges) {
        if (changes['resource']) {
            this.rViews = [this.resourceViewStruct];
            //add the term view if available
            if (this.resource.getRole() == RDFResourceRolesEnum.concept && VBContext.getWorkingProject().getModelType() == SKOS.uri) {
                this.rViews.push(this.termViewStruct);
            }
            //add the lexicographer view if available
            if (this.resource.getRole() == RDFResourceRolesEnum.ontolexLexicalEntry && VBContext.getWorkingProject().getModelType() == OntoLex.uri) {
                this.rViews.push(this.lexicographerViewStruct);
            }
            //add the source code editor if available
            if (this.resource.getAdditionalProperty(ResAttribute.EXPLICIT) && AuthorizationEvaluator.isAuthorized(VBActionsEnum.resourcesGetResourceTriplesDescription, this.resource)) {
                this.rViews.push(this.sourceCodeStruct);
            }

            this.initActiveView(changes['resource'].previousValue);
        }
    }

    /**
     * Init the view to activate according the type of the described resource and the preferences
     * @param previousRes provided if the method is invoked after a change of the Input resource
     */
    private initActiveView(previousRes?: ARTResource) {
        /* try to restore the view from the preference if:
        - it is the first initialization (previousRes null)
        - resource is changed. In this case I need to check if previousRes and this.resource are different since 
          Input resource changes also when user changes the viewTab from this component (changeView method invoked) but the resource is still the same
        */
        if (previousRes == null || !previousRes.equals(this.resource)) {
            let rvPrefs = VBContext.getWorkingProjectCtx().getProjectPreferences().resViewPreferences;
            //restore the last view (for concept and lex entry only) or set the default
            if (this.resource.getRole() == RDFResourceRolesEnum.concept) {
                this.activeView = rvPrefs.lastConceptType;
                if (this.activeView == null) { //null if last selection was not set => set the default
                    this.activeView = rvPrefs.defaultConceptType;
                }
            }   
            if (this.resource.getRole() == RDFResourceRolesEnum.ontolexLexicalEntry) {
                this.activeView = rvPrefs.lastLexEntryType;
                if (this.activeView == null) { //null if last selection was not set => set the default
                    this.activeView = rvPrefs.defaultLexEntryType;
                }
            }
        }
        /* if the current active view is not set, or it is not among the available
        (e.g. user went from a concept to a class => the termView is no more available),
        activate the resourceForm as fallback */
        if (this.activeView == null || !this.rViews.some(v => v.type == this.activeView)) {
            this.activeView = ResourceViewType.resourceView;
        }
    }

    changeView(view: ResourceViewType) {
        this.activeView = view;
        //in case of concept or lexEntry, update the setting about the last view activated (execpt for sourceCode)
        if (this.activeView != ResourceViewType.sourceCode) {
            if (this.resource.getRole() == RDFResourceRolesEnum.concept) {
                VBContext.getWorkingProjectCtx().getProjectPreferences().resViewPreferences.lastConceptType = this.activeView;
            }
            if (this.resource.getRole() == RDFResourceRolesEnum.ontolexLexicalEntry) {
                VBContext.getWorkingProjectCtx().getProjectPreferences().resViewPreferences.lastLexEntryType = this.activeView;
            }
        }
        
    }
    

    /**
     * EVENT LISTENERS
     */

    onObjectDblClick(object: ARTResource) {
        this.dblclickObj.emit(object);
    }

    onResourceUpdate(res: ARTResource) {
        this.update.emit(res);
    }

    onRenderingChanged(rendering: boolean) {
        this.renderingChanged.emit(rendering);
    }


}

interface ResViewStruct {
    type: ResourceViewType;
    show: string;
}