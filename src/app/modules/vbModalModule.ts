import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { SharedModule } from "./sharedModule";
import { TreeAndListModule } from "./treeAndListModule";
import { CustomFormModule } from "./customFormModule";
import { UserModule } from "./userModule";

//services to open modals
import { BasicModalServices } from "../widget/modal/basicModal/basicModalServices";
import { BrowsingModalServices } from "../widget/modal/browsingModal/browsingModalServices";
import { CreationModalServices } from "../widget/modal/creationModal/creationModalServices";
import { SharedModalServices } from "../widget/modal/sharedModal/sharedModalServices";

//basic modals
import { AlertModal } from '../widget/modal/basicModal/alertModal/alertModal';
import { AlertCheckModal } from '../widget/modal/basicModal/alertModal/alertCheckModal';
import { ConfirmModal } from '../widget/modal/basicModal/confirmModal/confirmModal';
import { ConfirmCheckModal } from '../widget/modal/basicModal/confirmModal/confirmCheckModal';
import { DownloadModal } from '../widget/modal/basicModal/downloadModal/downloadModal';
import { FilePickerModal } from '../widget/modal/basicModal/filePickerModal/filePickerModal';
import { PromptModal } from '../widget/modal/basicModal/promptModal/promptModal';
import { PromptPrefixedModal } from '../widget/modal/basicModal/promptModal/promptPrefixedModal';
import { PromptPropertiesModal } from '../widget/modal/basicModal/promptModal/promptPropertiesModal';
import { SelectionModal } from '../widget/modal/basicModal/selectionModal/selectionModal';
import { ResourceSelectionModal } from '../widget/modal/basicModal/selectionModal/resourceSelectionModal';
import { CustomFormSelectionModal } from '../widget/modal/basicModal/selectionModal/customFormSelectionModal';

//shared modals
import { PluginConfigModal } from "../widget/modal/sharedModal/pluginConfigModal/pluginConfigModal";
import { RemoteAccessConfigModal } from "../widget/modal/sharedModal/remoteAccessConfigModal/remoteAccessConfigModal";
import { RemoteAccessConfigEditorModal } from "../widget/modal/sharedModal/remoteAccessConfigModal/remoteAccessConfigEditorModal";
import { RemoteRepoSelectionModal } from "../widget/modal/sharedModal/remoteRepoSelectionModal/remoteRepoSelectionModal";
import { LanguageSelectorModal } from "../widget/modal/sharedModal/languagesSelectorModal/languageSelectorModal";
import { ConverterPickerModal } from '../widget/modal/sharedModal/converterPickerModal/converterPickerModal';
import { SignaturePickerModal } from '../widget/modal/sharedModal/converterPickerModal/signaturePickerModal';

//browsing modals
import { ClassTreeModal } from '../widget/modal/browsingModal/classTreeModal/classTreeModal';
import { ClassIndividualTreeModal } from "../widget/modal/browsingModal/classIndividualTreeModal/classIndividualTreeModal";
import { ConceptTreeModal } from '../widget/modal/browsingModal/conceptTreeModal/conceptTreeModal';
import { InstanceListModal } from '../widget/modal/browsingModal/instanceListModal/instanceListModal';
import { PropertyTreeModal } from '../widget/modal/browsingModal/propertyTreeModal/propertyTreeModal';
import { SchemeListModal } from '../widget/modal/browsingModal/schemeListModal/schemeListModal';
import { CollectionTreeModal } from '../widget/modal/browsingModal/collectionTreeModal/collectionTreeModal';

//creation modals
import { NewPlainLiteralModal } from '../widget/modal/creationModal/newPlainLiteralModal/newPlainLiteralModal';
import { NewXLabelModal } from '../widget/modal/creationModal/newResourceModal/skos/newXLabelModal';
import { NewResourceCfModal } from '../widget/modal/creationModal/newResourceModal/shared/newResourceCfModal';
import { NewResourceWithLiteralCfModal } from '../widget/modal/creationModal/newResourceModal/shared/newResourceWithLiteralCfModal';
import { NewTypedLiteralModal } from '../widget/modal/creationModal/newTypedLiteralModal/newTypedLiteralModal';
import { NewConceptCfModal } from '../widget/modal/creationModal/newResourceModal/skos/newConceptCfModal';
import { NewConceptFromLabelModal } from '../widget/modal/creationModal/newResourceModal/skos/newConceptFromLabelModal';
import { NewLexiconCfModal } from '../widget/modal/creationModal/newResourceModal/ontolex/newLexiconCfModal';

//these are used only in creation modals, if they will be useful elsewhere, they can be moved in sharedModule
import { EditableNsInput } from '../widget/modal/creationModal/newResourceModal/editableNsInput';
import { SchemeSelectionComponent } from '../widget/modal/creationModal/newResourceModal/skos/schemeSelectionComponent';

//alignment modals
import { ValidationSettingsModal } from '../alignment/alignmentValidation/alignmentValidationModals/validationSettingsModal';
import { ValidationReportModal } from '../alignment/alignmentValidation/alignmentValidationModals/validationReportModal';
import { MappingPropertySelectionModal } from '../alignment/alignmentValidation/alignmentValidationModals/mappingPropertySelectionModal';
import { ResourceAlignmentModal } from '../alignment/resourceAlignment/resourceAlignmentModal';
import { BrowseExternalResourceModal } from '../alignment/resourceAlignment/browseExternalResourceModal';

//config modals
import { FilterGraphsModal } from "../config/dataManagement/exportData/filterGraphsModal/filterGraphsModal";
import { DumpCreationModal } from "../config/dataManagement/versioning/dumpCreationModal";

//query
import { ExportResultAsRdfModal } from "../sparql/exportResultAsRdfModal";
import { LoadQueryModal } from "../sparql/loadQueryModal";
import { SaveQueryModal } from "../sparql/saveQueryModal";

//collaboration
import { CollaborationProjSettingsModal } from "../collaboration/modals/collaborationProjSettingsModal";
import { CollaborationUserSettingsModal } from "../collaboration/modals/collaborationUserSettingsModal";
import { CollaborationProjectModal } from "../collaboration/modals/collaborationProjectModal";
import { IssueListModal } from "../collaboration/issueListModal";
import { CollaborationModalServices } from "../collaboration/collaborationModalService";

@NgModule({
    imports: [CommonModule, FormsModule, SharedModule, TreeAndListModule, CustomFormModule, UserModule],
    declarations: [
        AlertModal, AlertCheckModal, ConfirmModal, ConfirmCheckModal, DownloadModal, FilePickerModal,
        NewPlainLiteralModal, NewXLabelModal, NewResourceCfModal, NewConceptCfModal,
        NewResourceWithLiteralCfModal, NewTypedLiteralModal, NewConceptFromLabelModal, NewLexiconCfModal,
        PromptModal, PromptPrefixedModal, PromptPropertiesModal, SelectionModal, ResourceSelectionModal, CustomFormSelectionModal,
        ClassTreeModal, ClassIndividualTreeModal, ConceptTreeModal, InstanceListModal,
        PropertyTreeModal, SchemeListModal, CollectionTreeModal,
        ValidationSettingsModal, ValidationReportModal, MappingPropertySelectionModal, ResourceAlignmentModal, BrowseExternalResourceModal,
        RemoteAccessConfigModal, RemoteAccessConfigEditorModal, RemoteRepoSelectionModal, LanguageSelectorModal,
        ConverterPickerModal, SignaturePickerModal,
        PluginConfigModal, FilterGraphsModal, DumpCreationModal,
        EditableNsInput, SchemeSelectionComponent,
        ExportResultAsRdfModal, LoadQueryModal, SaveQueryModal,
        CollaborationProjSettingsModal, CollaborationUserSettingsModal, CollaborationProjectModal, IssueListModal
    ],
    exports: [],
    providers: [BasicModalServices, BrowsingModalServices, CreationModalServices, SharedModalServices, CollaborationModalServices],
    //components never used outside the module (so not in exports array), but rendered (loaded) dynamically
    /**
     * (From ngModule FAQ https://angular.io/docs/ts/latest/cookbook/ngmodule-faq.html#!#q-what-not-to-export)
     * What should I not export?
     * Components that are only loaded dynamically by the router or by bootstrapping.
     * Such entry components can never be selected in another component's template.
     * There's no harm in exporting them but no benefit either. 
     */
    entryComponents: [
        AlertModal, AlertCheckModal, ConfirmModal, ConfirmCheckModal, DownloadModal, FilePickerModal,
        NewPlainLiteralModal, NewXLabelModal, NewResourceCfModal, NewConceptCfModal,
        NewResourceWithLiteralCfModal, NewTypedLiteralModal, NewConceptFromLabelModal, NewLexiconCfModal,
        PromptModal, PromptPrefixedModal, PromptPropertiesModal, SelectionModal, ResourceSelectionModal, CustomFormSelectionModal,
        ClassTreeModal, ClassIndividualTreeModal, ConceptTreeModal, InstanceListModal,
        PropertyTreeModal, SchemeListModal, CollectionTreeModal,
        ValidationSettingsModal, ValidationReportModal, MappingPropertySelectionModal, ResourceAlignmentModal, BrowseExternalResourceModal,
        RemoteAccessConfigModal, RemoteAccessConfigEditorModal, RemoteRepoSelectionModal, LanguageSelectorModal,
        ConverterPickerModal, SignaturePickerModal,
        PluginConfigModal, FilterGraphsModal, DumpCreationModal,
        ExportResultAsRdfModal, LoadQueryModal, SaveQueryModal,
        CollaborationProjSettingsModal, CollaborationUserSettingsModal, CollaborationProjectModal, IssueListModal
    ]
})
export class VBModalModule { }