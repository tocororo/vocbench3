import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';

import {SharedModule} from "./sharedModule";
import {TreeAndListModule} from "./treeAndListModule";

import {ModalServices} from "../widget/modal/modalServices";
import {BrowsingServices} from "../widget/modal/browsingModal/browsingServices";

import {AlertModal} from '../widget/modal/alertModal/alertModal';
import {ConfirmModal} from '../widget/modal/confirmModal/confirmModal';
import {ConfirmCheckModal} from '../widget/modal/confirmModal/confirmCheckModal';
import {DownloadModal} from '../widget/modal/downloadModal/downloadModal';
import {NewPlainLiteralModal} from '../widget/modal/newPlainLiteralModal/newPlainLiteralModal';
import {NewTypedLiteralModal} from '../widget/modal/newTypedLiteralModal/newTypedLiteralModal';
import {PromptModal} from '../widget/modal/promptModal/promptModal';
import {SelectionModal} from '../widget/modal/selectionModal/selectionModal';

import {ClassTreeModal} from '../widget/modal/browsingModal/classTreeModal/classTreeModal';
import {ConceptTreeModal} from '../widget/modal/browsingModal/conceptTreeModal/conceptTreeModal';
import {InstanceListModal} from '../widget/modal/browsingModal/instanceListModal/instanceListModal';
import {PropertyTreeModal} from '../widget/modal/browsingModal/propertyTreeModal/propertyTreeModal';
import {SchemeListModal} from '../widget/modal/browsingModal/schemeListModal/schemeListModal';

@NgModule({
    imports: [CommonModule, FormsModule, SharedModule, TreeAndListModule],
    declarations: [
        AlertModal, ConfirmModal, ConfirmCheckModal, DownloadModal,
        NewPlainLiteralModal, NewTypedLiteralModal, PromptModal, SelectionModal,
        ClassTreeModal, ConceptTreeModal, InstanceListModal, PropertyTreeModal, SchemeListModal
    ],
    exports: [],
    providers: [ModalServices, BrowsingServices],
    //components never used outside the module (so not in exports array), but redered (loaded) dynamically
    /**
     * (From ngModule FAQ https://angular.io/docs/ts/latest/cookbook/ngmodule-faq.html#!#q-what-not-to-export)
     * What should I not export?
     * Components that are only loaded dynamically by the router or by bootstrapping.
     * Such entry components can never be selected in another component's template.
     * There's no harm in exporting them but no benefit either. 
     */
    entryComponents: [
        AlertModal, ConfirmModal, ConfirmCheckModal, DownloadModal,
        NewPlainLiteralModal, NewTypedLiteralModal, PromptModal, SelectionModal,
        ClassTreeModal, ConceptTreeModal, InstanceListModal, PropertyTreeModal, SchemeListModal
    ]
})
export class VBModalModule { }