import { DragDropModule } from '@angular/cdk/drag-drop';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';
import { MappingPropertySelectionModal } from '../alignment/alignmentValidation/alignmentValidationModals/mappingPropertySelectionModal';
import { ValidationReportModal } from '../alignment/alignmentValidation/alignmentValidationModals/validationReportModal';
import { ValidationSettingsModal } from '../alignment/alignmentValidation/alignmentValidationModals/validationSettingsModal';
import { AssistedSearchModal } from '../alignment/resourceAlignment/assistedSearchModal';
import { AssistedSearchResultModal } from '../alignment/resourceAlignment/assistedSearchResultModal';
import { ResourceAlignmentModal } from '../alignment/resourceAlignment/resourceAlignmentModal';
import { InferenceExplanationModal } from '../icv/owlConsistencyViolations/inferenceExplanationModal';
import { PrefixNamespaceModal } from '../metadata/namespacesAndImports/prefixNamespaceModal';
import { ProjectSelectionModal } from '../project/projectListPanel/projectSelectionModal';
import { HelperModal } from '../widget/codemirror/manchesterEditor/modal/helperModal';
import { AlertModal } from '../widget/modal/basicModal/alertModal/alertModal';
import { BasicModalServices } from '../widget/modal/basicModal/basicModalServices';
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
import { BrowsingModalServices } from '../widget/modal/browsingModal/browsingModalServices';
import { ClassIndividualTreeModal } from '../widget/modal/browsingModal/classIndividualTreeModal/classIndividualTreeModal';
import { ClassTreeModal } from '../widget/modal/browsingModal/classTreeModal/classTreeModal';
import { CollectionTreeModal } from '../widget/modal/browsingModal/collectionTreeModal/collectionTreeModal';
import { ConceptTreeModal } from '../widget/modal/browsingModal/conceptTreeModal/conceptTreeModal';
import { DatatypeListModal } from '../widget/modal/browsingModal/datatypeListModal/datatypeListModal';
import { InstanceListModal } from '../widget/modal/browsingModal/instanceListModal/instanceListModal';
import { LexicalEntryListModal } from '../widget/modal/browsingModal/lexicalEntryListModal/lexicalEntryListModal';
import { LexiconListModal } from '../widget/modal/browsingModal/lexiconListModal/lexiconListModal';
import { PropertyTreeModal } from '../widget/modal/browsingModal/propertyTreeModal/propertyTreeModal';
import { SchemeListModal } from '../widget/modal/browsingModal/schemeListModal/schemeListModal';
import { CreationModalServices } from '../widget/modal/creationModal/creationModalServices';
import { NewPlainLiteralModal } from '../widget/modal/creationModal/newPlainLiteralModal/newPlainLiteralModal';
import { NewConceptualizationCfModal } from '../widget/modal/creationModal/newResourceModal/ontolex/newConceptualizationCfModal';
import { NewLexiconCfModal } from '../widget/modal/creationModal/newResourceModal/ontolex/newLexiconCfModal';
import { NewLexSenseCfModal } from '../widget/modal/creationModal/newResourceModal/ontolex/newLexSenseCfModal';
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
import { DatetimePickerModal } from '../widget/modal/sharedModal/datetimePickerModal/datetimePickerModal';
import { LanguageSelectorModal } from '../widget/modal/sharedModal/languagesSelectorModal/languageSelectorModal';
import { ManchesterExprModal } from '../widget/modal/sharedModal/manchesterExprModal/manchesterExprModal';
import { PluginConfigModal } from '../widget/modal/sharedModal/pluginConfigModal/pluginConfigModal';
import { RemoteAccessConfigModal } from '../widget/modal/sharedModal/remoteAccessConfigModal/remoteAccessConfigModal';
import { RemoteRepoSelectionModal } from '../widget/modal/sharedModal/remoteRepoSelectionModal/remoteRepoSelectionModal';
import { ResourcePickerModal } from '../widget/modal/sharedModal/resourcePickerModal/resourcePickerModal';
import { SharedModalServices } from '../widget/modal/sharedModal/sharedModalServices';
import { StorageManagerModal } from '../widget/modal/sharedModal/storageManagerModal/storageManagerModal';
import { UserSelectionModal } from '../widget/modal/sharedModal/userSelectionModal/userSelectionModal';
import { CustomFormModule } from './customFormModule';
import { SharedModule } from './sharedModule';
import { TreeAndListModule } from './treeAndListModule';
import { UserModule } from './userModule';

@NgModule({
    imports: [
        CommonModule, 
        CustomFormModule, 
        DragDropModule,
        FormsModule, 
        NgbDropdownModule,
        SharedModule, 
        TranslateModule,
        TreeAndListModule, //I'm not sure this needs to be imported since it is already imported in the main AppModule
        UserModule
    ],
    declarations: [
        AlertModal,
        AssistedSearchModal,
        AssistedSearchResultModal,
        ClassIndividualTreeModal,
        ClassTreeModal,
        CollectionTreeModal,
        ConceptTreeModal,
        ConfirmCheckModal,
        ConfirmModal,
        ConverterPickerModal,
        CustomFormSelectionModal,
        DatatypeListModal,
        DatetimePickerModal,
        DownloadModal,
        FilePickerModal,
        HelperModal,
        InferenceExplanationModal,
        InstanceListModal,
        LanguageSelectorModal,
        LexicalEntryListModal,
        LexiconListModal,
        LoadConfigurationModal,
        ManchesterExprModal,
        MappingPropertySelectionModal,
        NewConceptCfModal,
        NewConceptFromLabelModal,
        NewConceptualizationCfModal,
        NewLexiconCfModal,
        NewLexSenseCfModal,
        NewOntoLexicalizationCfModal,
        NewPlainLiteralModal,
        NewResourceCfModal,
        NewResourceWithLiteralCfModal,
        NewTypedLiteralModal,
        NewXLabelModal,
        PluginConfigModal,
        PrefixNamespaceModal,
        ProjectSelectionModal,
        PromptModal,
        PromptPrefixedModal,
        PromptPropertiesModal,
        PropertyTreeModal,
        RemoteAccessConfigModal,
        RemoteRepoSelectionModal,
        ResourceAlignmentModal,
        ResourcePickerModal,
        ResourceSelectionModal,
        SchemeListModal,
        SchemeSelectionComponent,
        SelectionModal,
        SignaturePickerModal,
        StorageManagerModal,
        StoreConfigurationModal,
        UserSelectionModal,
        ValidationReportModal,
        ValidationSettingsModal
    ],
    exports: [],
    providers: [
        BasicModalServices, 
        BrowsingModalServices, 
        CreationModalServices, 
        SharedModalServices,
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
        AlertModal,
        AssistedSearchModal,
        AssistedSearchResultModal,
        ClassIndividualTreeModal,
        ClassTreeModal,
        CollectionTreeModal,
        ConceptTreeModal,
        ConfirmCheckModal,
        ConfirmModal,
        ConverterPickerModal,
        CustomFormSelectionModal,
        DatatypeListModal,
        DatetimePickerModal,
        DownloadModal,
        FilePickerModal,
        HelperModal,
        InferenceExplanationModal,
        InstanceListModal,
        LanguageSelectorModal,
        LexicalEntryListModal,
        LexiconListModal,
        LoadConfigurationModal,
        ManchesterExprModal,
        MappingPropertySelectionModal,
        NewConceptCfModal,
        NewConceptFromLabelModal,
        NewConceptualizationCfModal,
        NewLexiconCfModal,
        NewLexSenseCfModal,
        NewOntoLexicalizationCfModal,
        NewPlainLiteralModal,
        NewResourceCfModal,
        NewResourceWithLiteralCfModal,
        NewTypedLiteralModal,
        NewXLabelModal,
        PluginConfigModal,
        PrefixNamespaceModal,
        ProjectSelectionModal,
        PromptModal,
        PromptPrefixedModal,
        PromptPropertiesModal,
        PropertyTreeModal,
        RemoteAccessConfigModal,
        RemoteRepoSelectionModal,
        ResourceAlignmentModal,
        ResourcePickerModal,
        ResourceSelectionModal,
        SchemeListModal,
        SelectionModal,
        SignaturePickerModal,
        StorageManagerModal,
        StoreConfigurationModal,
        UserSelectionModal,
        ValidationReportModal,
        ValidationSettingsModal,
    ]
})
export class VBModalModule { }