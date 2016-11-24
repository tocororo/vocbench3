import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';

import {SharedModule} from "./sharedModule";
import {TreeAndListModule} from "./treeAndListModule";

//services to open modals
import {ModalServices} from "../widget/modal/modalServices";
import {BrowsingServices} from "../widget/modal/browsingModal/browsingServices";

//basic modals
import {AlertModal} from '../widget/modal/alertModal/alertModal';
import {ConfirmModal} from '../widget/modal/confirmModal/confirmModal';
import {ConfirmCheckModal} from '../widget/modal/confirmModal/confirmCheckModal';
import {DownloadModal} from '../widget/modal/downloadModal/downloadModal';
import {FilePickerModal} from '../widget/modal/filePickerModal/filePickerModal';
import {NewPlainLiteralModal} from '../widget/modal/newPlainLiteralModal/newPlainLiteralModal';
import {NewResourceModal} from '../widget/modal/newResourceModal/newResourceModal';
import {NewTypedLiteralModal} from '../widget/modal/newTypedLiteralModal/newTypedLiteralModal';
import {PromptModal} from '../widget/modal/promptModal/promptModal';
import {SelectionModal} from '../widget/modal/selectionModal/selectionModal';
import {ResourceSelectionModal} from '../widget/modal/selectionModal/resourceSelectionModal';
import {ContentLangModal} from '../widget/modal/contentLangModal/contentLangModal';

//browsing modals
import {ClassTreeModal} from '../widget/modal/browsingModal/classTreeModal/classTreeModal';
import {ConceptTreeModal} from '../widget/modal/browsingModal/conceptTreeModal/conceptTreeModal';
import {InstanceListModal} from '../widget/modal/browsingModal/instanceListModal/instanceListModal';
import {PropertyTreeModal} from '../widget/modal/browsingModal/propertyTreeModal/propertyTreeModal';
import {SchemeListModal} from '../widget/modal/browsingModal/schemeListModal/schemeListModal';

//metadata modals
import {ImportOntologyModal} from '../config/dataManagement/metadata/importOntologyModal';
import {PrefixNamespaceModal} from '../config/dataManagement/metadata/prefixNamespaceModal';
import {ReplaceBaseURIModal} from '../config/dataManagement/metadata/replaceBaseURIModal';

//custom range modals
import {CustomFormModal} from '../customRanges/customForm/customFormModal';
import {CustomRangeEditorModal} from '../customRanges/customRangeConfigModals/crEditorModal';
import {CustomRangeEntryEditorModal} from '../customRanges/customRangeConfigModals/creEditorModal';
import {CustomRangePropMappingModal} from '../customRanges/customRangeConfigModals/crPropMappingModal';

//alignment modals
import {ValidationSettingsModal} from '../alignment/alignmentValidation/validationSettingsModal/validationSettingsModal';
import {ValidationReportModal} from '../alignment/alignmentValidation/validationReportModal/validationReportModal';
import {ResourceAlignmentModal} from '../alignment/resourceAlignment/resourceAlignmentModal';
import {BrowseExternalResourceModal} from '../alignment/resourceAlignment/browseExternalResourceModal';

//project config modal
import {OntoMgrConfigModal} from "../project/createProject/ontoMgrConfigModal";
import {ProjectPropertiesModal} from "../project/projectPropertiesModal";

@NgModule({
    imports: [CommonModule, FormsModule, SharedModule, TreeAndListModule],
    declarations: [
        AlertModal, ConfirmModal, ConfirmCheckModal, DownloadModal, FilePickerModal, NewPlainLiteralModal,
        NewResourceModal, NewTypedLiteralModal, PromptModal, SelectionModal, ResourceSelectionModal, ContentLangModal,
        ClassTreeModal, ConceptTreeModal, InstanceListModal, PropertyTreeModal, SchemeListModal,
        ImportOntologyModal, PrefixNamespaceModal, ReplaceBaseURIModal,
        CustomFormModal, CustomRangeEditorModal, CustomRangeEntryEditorModal, CustomRangePropMappingModal,
        ValidationSettingsModal, ValidationReportModal, ResourceAlignmentModal, BrowseExternalResourceModal,
        OntoMgrConfigModal, ProjectPropertiesModal
    ],
    exports: [],
    providers: [ModalServices, BrowsingServices],
    //components never used outside the module (so not in exports array), but rendered (loaded) dynamically
    /**
     * (From ngModule FAQ https://angular.io/docs/ts/latest/cookbook/ngmodule-faq.html#!#q-what-not-to-export)
     * What should I not export?
     * Components that are only loaded dynamically by the router or by bootstrapping.
     * Such entry components can never be selected in another component's template.
     * There's no harm in exporting them but no benefit either. 
     */
    entryComponents: [
        AlertModal, ConfirmModal, ConfirmCheckModal, DownloadModal, FilePickerModal, NewPlainLiteralModal,
        NewResourceModal, NewTypedLiteralModal, PromptModal, SelectionModal, ResourceSelectionModal, ContentLangModal,
        ClassTreeModal, ConceptTreeModal, InstanceListModal, PropertyTreeModal, SchemeListModal,
        ImportOntologyModal, PrefixNamespaceModal, ReplaceBaseURIModal,
        CustomFormModal, CustomRangeEditorModal, CustomRangeEntryEditorModal, CustomRangePropMappingModal,
        ValidationSettingsModal, ValidationReportModal, ResourceAlignmentModal, BrowseExternalResourceModal,
        OntoMgrConfigModal, ProjectPropertiesModal
    ]
})
export class VBModalModule { }