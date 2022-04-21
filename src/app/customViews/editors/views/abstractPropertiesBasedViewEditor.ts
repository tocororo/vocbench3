import { Directive, Input } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { ARTURIResource } from 'src/app/models/ARTResources';
import { PropertiesBasedViewDefinition } from 'src/app/models/CustomViews';
import { BasicModalServices } from 'src/app/widget/modal/basicModal/basicModalServices';
import { ModalType } from 'src/app/widget/modal/Modals';
import { AbstractCustomViewEditor } from './abstractCustomViewEditor';

@Directive()
export abstract class AbstractPropertiesBasedViewEditor extends AbstractCustomViewEditor {

    @Input() cvDef: PropertiesBasedViewDefinition;

    properties: ARTURIResource[];

    abstract propListLabelTranslationKey: string;
    abstract invalidPropListMsgTranslationKey: string;
    abstract allowDuplicates: boolean; //tells if property list can contains duplicates (e.g. static-vector doesn't allow duplicated headers, prop-chain allows duplicated props)

    abstract infoHtml: string;
    
    infoHtmlSafe: SafeHtml;

    basicModals: BasicModalServices;
    sanitizer: DomSanitizer;
    constructor(basicModals: BasicModalServices, sanitizer: DomSanitizer) {
        super();
        this.basicModals = basicModals;
        this.sanitizer = sanitizer;
    }


    ngOnInit() {
        super.ngOnInit();
        this.infoHtmlSafe = this.sanitizer.bypassSecurityTrustHtml(this.infoHtml);
    }

    initCustomViewDef(): void {
        this.properties = [];
        this.cvDef = {
            properties: [],
            suggestedView: this.suggestedView
        };
    }

    restoreEditor(): void {
        this.properties = this.cvDef.properties.map(p => new ARTURIResource(p));
        this.suggestedView = this.cvDef.suggestedView;
    }

    onPropertiesChanged(properties: ARTURIResource[]) {
        this.properties = properties;
        this.emitChanges();
    }

    emitChanges(): void {
        this.cvDef.properties = this.properties.map(p => p.toNT());
        this.cvDef.suggestedView = this.suggestedView;
        this.changed.emit(this.cvDef);
    }

    public isDataValid(): boolean {
        if (this.properties.length == 0) {
            this.basicModals.alert({ key: "STATUS.ERROR" }, { key: this.invalidPropListMsgTranslationKey }, ModalType.warning);
            return false;
        }
        return true;
    }

}
