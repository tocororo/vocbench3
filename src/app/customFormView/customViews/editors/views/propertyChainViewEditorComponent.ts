import { Component, Input } from '@angular/core';
import { ARTURIResource } from 'src/app/models/ARTResources';
import { CustomViewModel, PropertyChainViewDefinition } from 'src/app/models/CustomViews';
import { BasicModalServices } from 'src/app/widget/modal/basicModal/basicModalServices';
import { ModalType } from 'src/app/widget/modal/Modals';
import { AbstractCustomViewEditor } from './abstractCustomViewEditor';

@Component({
    selector: 'property-chain-view-editor',
    templateUrl: "propertyChainViewEditorComponent.html",
})
export class PropertyChainViewEditorComponent extends AbstractCustomViewEditor {

    @Input() cvDef: PropertyChainViewDefinition;

    model: CustomViewModel = CustomViewModel.property_chain;

    propertyChain: ARTURIResource[];

    constructor(private basicModals: BasicModalServices) {
        super()
    }

    ngOnInit() {
        super.ngOnInit();
    }

    initCustomViewDef(): void {
        this.propertyChain = [];
        this.cvDef = {
            propertyChain: [],
            suggestedView: this.suggestedView
        }
    }

    initEditor(): void {
        this.propertyChain = this.cvDef.propertyChain.map(p => new ARTURIResource(p));
        this.suggestedView = this.cvDef.suggestedView;
    }

    onPropChainChanged(properties: ARTURIResource[]) {
        this.propertyChain = properties;
        this.emitChanges();
    }

    emitChanges(): void {
        this.cvDef.propertyChain = this.propertyChain.map(p => p.toNT());
        this.cvDef.suggestedView = this.suggestedView;
        this.changed.emit(this.cvDef);
    }

    public isDataValid(): boolean {
        if (this.propertyChain.length == 0) {
            this.basicModals.alert({ key: "STATUS.ERROR" }, { key: "Property chain must contain at least one proprety." }, ModalType.warning);
            return false;
        }
        return true;
    }

}
