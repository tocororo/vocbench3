import { Component } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { CustomViewModel } from 'src/app/models/CustomViews';
import { BasicModalServices } from 'src/app/widget/modal/basicModal/basicModalServices';
import { AbstractPropertiesBasedViewEditor } from './abstractPropertiesBasedViewEditor';

@Component({
    selector: 'property-chain-view-editor',
    templateUrl: "propertiesBasedViewEditor.html",
})
export class PropertyChainViewEditorComponent extends AbstractPropertiesBasedViewEditor {

    model: CustomViewModel = CustomViewModel.property_chain;

    propertyListLabel: string = "Property chain";
    invalidPropListMsg: string = "Property chain must contain at least one proprety.";
    allowDuplicates: boolean = true;

    infoHtml: string = `With this view, the object in the ResourceView will be rendered with a single value reached passing through a defined property chain.<br />
    E.g.:
    <code class="my-2" style="display: block;">
        $resource $trigprop ?o1 .<br/>
        ?o1 %prop1% ?o2 .<br/> 
        ...<br/>
        ?oN %propN ?RENDERED_VALUE .
    </code>
    <i>Note</i>: the property chain must start from the object of the triggering property, so such property doesn't have to be included in the chain.`;

    constructor(basicModals: BasicModalServices, sanitizer: DomSanitizer) {
        super(basicModals, sanitizer);
    }

    ngOnInit() {
        super.ngOnInit();
    }

}
