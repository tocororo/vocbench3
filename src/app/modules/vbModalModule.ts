import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MappingPropertySelectionModal } from '../alignment/alignmentValidation/alignmentValidationModals/mappingPropertySelectionModal';
import { ValidationReportModal } from '../alignment/alignmentValidation/alignmentValidationModals/validationReportModal';
import { ValidationSettingsModal } from '../alignment/alignmentValidation/alignmentValidationModals/validationSettingsModal';
import { AssistedSearchModal } from '../alignment/resourceAlignment/assistedSearchModal';
import { AssistedSearchResultModal } from '../alignment/resourceAlignment/assistedSearchResultModal';
import { ResourceAlignmentModal } from '../alignment/resourceAlignment/resourceAlignmentModal';
import { FilterGraphsModal } from "../config/dataManagement/exportData/filterGraphsModal/filterGraphsModal";
import { DumpCreationModal } from "../config/dataManagement/versioning/dumpCreationModal";
import { AlertCheckModal } from '../widget/modal/basicModal/alertModal/alertCheckModal';
import { AlertModal } from '../widget/modal/basicModal/alertModal/alertModal';
import { BasicModalServices } from "../widget/modal/basicModal/basicModalServices";
import { ConfirmCheckModal } from '../widget/modal/basicModal/confirmModal/confirmCheckModal';
import { ConfirmModal } from '../widget/modal/basicModal/confirmModal/confirmModal';
import { DownloadModal } from '../widget/modal/basicModal/downloadModal/downloadModal';
import { FilePickerModal } from '../widget/modal/basicModal/filePickerModal/filePickerModal';
import { PromptModal } from '../widget/modal/basicModal/promptModal/promptModal';
import { PromptPrefixedModal } from '../widget/modal/basicModal/promptModal/promptPrefixedModal';
import { PromptPropertiesModal } from '../widget/modal/basicModal/promptModal/promptPropertiesModal';
import { CustomFormSelectionModal } from '../widget/modal/basicModal/selectionModal/customFormSelectionModal';
import { ResourceSelectionModal } from '../widget/modal/basicModal/selectionModal/resourceSelectionModal';
import { SelectionModal } from '../widget/modal/basicModal/selectionModal/selectionModal';
import { BrowsingModalServices } from "../widget/modal/browsingModal/browsingModalServices";
import { ClassIndividualTreeModal } from "../widget/modal/browsingModal/classIndividualTreeModal/classIndividualTreeModal";
import { ClassTreeModal } from '../widget/modal/browsingModal/classTreeModal/classTreeModal';
import { CollectionTreeModal } from '../widget/modal/browsingModal/collectionTreeModal/collectionTreeModal';
import { ConceptTreeModal } from '../widget/modal/browsingModal/conceptTreeModal/conceptTreeModal';
import { InstanceListModal } from '../widget/modal/browsingModal/instanceListModal/instanceListModal';
import { LexicalEntryListModal } from '../widget/modal/browsingModal/lexicalEntryListModal/lexicalEntryListModal';
import { LexiconListModal } from '../widget/modal/browsingModal/lexiconListModal/lexiconListModal';
import { PropertyTreeModal } from '../widget/modal/browsingModal/propertyTreeModal/propertyTreeModal';
import { SchemeListModal } from '../widget/modal/browsingModal/schemeListModal/schemeListModal';
import { CreationModalServices } from "../widget/modal/creationModal/creationModalServices";
import { NewPlainLiteralModal } from '../widget/modal/creationModal/newPlainLiteralModal/newPlainLiteralModal';
import { EditableNsInput } from '../widget/modal/creationModal/newResourceModal/editableNsInput';
import { NewLexiconCfModal } from '../widget/modal/creationModal/newResourceModal/ontolex/newLexiconCfModal';
import { NewOntoLexicalizationCfModal } from '../widget/modal/creationModal/newResourceModal/ontolex/newOntoLexicalizationCfModal';
import { NewResourceCfModal } from '../widget/modal/creationModal/newResourceModal/shared/newResourceCfModal';
import { NewResourceWithLiteralCfModal } from '../widget/modal/creationModal/newResourceModal/shared/newResourceWithLiteralCfModal';
import { NewConceptCfModal } from '../widget/modal/creationModal/newResourceModal/skos/newConceptCfModal';
import { NewConceptFromLabelModal } from '../widget/modal/creationModal/newResourceModal/skos/newConceptFromLabelModal';
import { NewXLabelModal } from '../widget/modal/creationModal/newResourceModal/skos/newXLabelModal';
import { SchemeSelectionComponent } from '../widget/modal/creationModal/newResourceModal/skos/schemeSelectionComponent';
import { NewTypedLiteralModal } from '../widget/modal/creationModal/newTypedLiteralModal/newTypedLiteralModal';
import { LoadConfigurationModal } from '../widget/modal/sharedModal/configurationStoreModal/loadConfigurationModal';
import { StoreConfigurationModal } from '../widget/modal/sharedModal/configurationStoreModal/storeConfigurationModal';
import { ConverterPickerModal } from '../widget/modal/sharedModal/converterPickerModal/converterPickerModal';
import { SignaturePickerModal } from '../widget/modal/sharedModal/converterPickerModal/signaturePickerModal';
import { LanguageSelectorModal } from "../widget/modal/sharedModal/languagesSelectorModal/languageSelectorModal";
import { PluginConfigModal } from "../widget/modal/sharedModal/pluginConfigModal/pluginConfigModal";
import { RemoteAccessConfigEditorModal } from "../widget/modal/sharedModal/remoteAccessConfigModal/remoteAccessConfigEditorModal";
import { RemoteAccessConfigModal } from "../widget/modal/sharedModal/remoteAccessConfigModal/remoteAccessConfigModal";
import { RemoteRepoSelectionModal } from "../widget/modal/sharedModal/remoteRepoSelectionModal/remoteRepoSelectionModal";
import { ResourcePickerModal } from '../widget/modal/sharedModal/resourcePickerModal/resourcePickerModal';
import { SharedModalServices } from "../widget/modal/sharedModal/sharedModalServices";
import { UserSelectionModal } from '../widget/modal/sharedModal/userSelectionModal/userSelectionModal';
import { CustomFormModule } from "./customFormModule";
import { SharedModule } from "./sharedModule";
import { TreeAndListModule } from "./treeAndListModule";
import { UserModule } from "./userModule";

@NgModule({
    imports: [CommonModule, FormsModule, SharedModule, TreeAndListModule, CustomFormModule, UserModule],
    declarations: [
        AlertModal, AlertCheckModal, ConfirmModal, ConfirmCheckModal, DownloadModal, FilePickerModal,
        NewPlainLiteralModal, NewXLabelModal, NewResourceCfModal, NewConceptCfModal,
        NewResourceWithLiteralCfModal, NewTypedLiteralModal, NewConceptFromLabelModal, NewLexiconCfModal, NewOntoLexicalizationCfModal,
        PromptModal, PromptPrefixedModal, PromptPropertiesModal, SelectionModal, ResourceSelectionModal, CustomFormSelectionModal,
        ClassTreeModal, ClassIndividualTreeModal, ConceptTreeModal, InstanceListModal,
        PropertyTreeModal, SchemeListModal, CollectionTreeModal, LexicalEntryListModal, LexiconListModal,
        ValidationSettingsModal, ValidationReportModal, MappingPropertySelectionModal,
        ResourceAlignmentModal, AssistedSearchModal, AssistedSearchResultModal,
        RemoteAccessConfigModal, RemoteAccessConfigEditorModal, RemoteRepoSelectionModal, LanguageSelectorModal, UserSelectionModal,
        ConverterPickerModal, SignaturePickerModal, StoreConfigurationModal, LoadConfigurationModal, ResourcePickerModal,
        PluginConfigModal, FilterGraphsModal, DumpCreationModal,
        EditableNsInput, SchemeSelectionComponent
    ],
    exports: [],
    providers: [
        BasicModalServices, BrowsingModalServices, CreationModalServices, SharedModalServices, 
    ],
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
        NewResourceWithLiteralCfModal, NewTypedLiteralModal, NewConceptFromLabelModal, NewLexiconCfModal, NewOntoLexicalizationCfModal,
        PromptModal, PromptPrefixedModal, PromptPropertiesModal, SelectionModal, ResourceSelectionModal, CustomFormSelectionModal,
        ClassTreeModal, ClassIndividualTreeModal, ConceptTreeModal, InstanceListModal,
        PropertyTreeModal, SchemeListModal, CollectionTreeModal, LexicalEntryListModal, LexiconListModal,
        ValidationSettingsModal, ValidationReportModal, MappingPropertySelectionModal, 
        ResourceAlignmentModal, AssistedSearchModal, AssistedSearchResultModal,
        RemoteAccessConfigModal, RemoteAccessConfigEditorModal, RemoteRepoSelectionModal, LanguageSelectorModal, UserSelectionModal,
        ConverterPickerModal, SignaturePickerModal, StoreConfigurationModal, LoadConfigurationModal, ResourcePickerModal,
        PluginConfigModal, FilterGraphsModal, DumpCreationModal
    ]
})
export class VBModalModule { }