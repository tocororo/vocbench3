import {NgModule}            from '@angular/core';
import {CommonModule}        from '@angular/common';
import {FormsModule}         from '@angular/forms';

import {SharedModule} from "../widget/sharedModule";

import {AlertModal}    from './modal/alertModal/alertModal';
import {ConfirmModal}    from './modal/confirmModal/confirmModal';
import {DownloadModal}    from './modal/downloadModal/downloadModal';
import {NewPlainLiteralModal}    from './modal/newPlainLiteralModal/newPlainLiteralModal';
import {NewTypedLiteralModal}    from './modal/newTypedLiteralModal/newTypedLiteralModal';
import {PromptModal}    from './modal/promptModal/promptModal';
import {SelectionModal}    from './modal/selectionModal/selectionModal';

import {ClassTreeModal}    from './modal/browsingModal/classTreeModal/classTreeModal';
import {ConceptTreeModal}    from './modal/browsingModal/conceptTreeModal/conceptTreeModal';
import {InstanceListModal}    from './modal/browsingModal/instanceListModal/instanceListModal';
import {PropertyTreeModal}    from './modal/browsingModal/propertyTreeModal/propertyTreeModal';
import {SchemeListModal}    from './modal/browsingModal/schemeListModal/schemeListModal';

@NgModule({
    imports: [CommonModule, FormsModule, SharedModule],
    declarations: [
        AlertModal, ConfirmModal, DownloadModal, NewPlainLiteralModal, NewTypedLiteralModal, PromptModal, SelectionModal,
        ClassTreeModal, ConceptTreeModal, InstanceListModal, PropertyTreeModal, SchemeListModal
    ],
    exports: [],
    //components never used outside the module (so not in exports array), but redered (loaded) dynamically
    /**
     * (From ngModule FAQ https://angular.io/docs/ts/latest/cookbook/ngmodule-faq.html#!#q-what-not-to-export)
     * What should I not export?
     * Components that are only loaded dynamically by the router or by bootstrapping.
     * Such entry components can never be selected in another component's template.
     * There's no harm in exporting them but no benefit either. 
     */
    entryComponents: [
        AlertModal, ConfirmModal, DownloadModal, NewPlainLiteralModal, NewTypedLiteralModal, PromptModal, SelectionModal,
        ClassTreeModal, ConceptTreeModal, InstanceListModal, PropertyTreeModal, SchemeListModal
    ]
})
export class VBModalModule { }