import { Injectable } from '@angular/core';
import { OverlayConfig } from 'ngx-modialog';
import { BSModalContextBuilder, Modal } from 'ngx-modialog/plugins/bootstrap';
import { CustomFormModal, CustomFormModalData } from "../../customForms/customForm/customFormModal";
import { ARTBNode, ARTResource, ARTURIResource } from '../../models/ARTResources';
import { AddManuallyValueData, AddManuallyValueModal } from "./addManuallyValueModal";
import { AddPropertyValueModal, AddPropertyValueModalData } from "./addPropertyValueModal";
import { BrowseExternalResourceModal, BrowseExternalResourceModalData } from './browseExternalResourceModal';
import { ClassListCreatorModal, ClassListCreatorModalData } from "./classListCreatorModal";
import { DataRangeEditorModal, DataRangeEditorModalData } from "./dataRangeEditorModal";
import { InstanceListCreatorModal, InstanceListCreatorModalData } from "./instanceListCreatorModal";
import { PropertyChainCreatorModal, PropertyChainCreatorModalData } from './propertyChainCreatorModal';
import { ResViewSettingsModal } from "./resViewSettingsModal";

/**
 * Service to open modals that allow to create a classes list or instances list
 */
@Injectable()
export class ResViewModalServices {

    constructor(private modal: Modal) { }

    /**
     * Opens a modal to create a list of classes (useful for class axioms)
     * @param title the title of the modal
     * @return if the modal closes with ok returns a promise containing an array of 
     * classes (ARTURIResource) and expressions (ARTBNode)
     */
    createClassList(title: string) {
        var modalData = new ClassListCreatorModalData(title);
        const builder = new BSModalContextBuilder<ClassListCreatorModalData>(
            modalData, undefined, ClassListCreatorModalData
        );
        builder.size("lg").keyboard(null);
        let overlayConfig: OverlayConfig = { context: builder.toJSON() };
        return this.modal.open(ClassListCreatorModal, overlayConfig).result;
    }

    /**
     * Opens a modal to create a list of instance (useful for class axioms)
     * @param title the title of the modal
     * @return if the modal closes with ok returns a promise containing an array of instances
     */
    createInstanceList(title: string) {
        var modalData = new InstanceListCreatorModalData(title);
        const builder = new BSModalContextBuilder<InstanceListCreatorModalData>(
            modalData, undefined, InstanceListCreatorModalData
        );
        builder.size("lg").keyboard(null);
        let overlayConfig: OverlayConfig = { context: builder.toJSON() };
        return this.modal.open(InstanceListCreatorModal, overlayConfig).result;
    }

    createPropertyChain(title: string, property: ARTURIResource, propChangeable?: boolean, chain?: ARTBNode) {
        var modalData = new PropertyChainCreatorModalData(title, property, propChangeable, chain);
        const builder = new BSModalContextBuilder<InstanceListCreatorModalData>(
            modalData, undefined, InstanceListCreatorModalData
        );
        builder.size("lg").keyboard(null);
        let overlayConfig: OverlayConfig = { context: builder.toJSON() };
        return this.modal.open(PropertyChainCreatorModal, overlayConfig).result;
    }

    /**
     * Opens a modal with a custom form to enrich a property with a custom range.
     * @param title title of the dialog
     * @param creId custom range entry ID
     */
    enrichCustomForm(title: string, creId: string) {
        var modalData = new CustomFormModalData(title, creId);
        const builder = new BSModalContextBuilder<CustomFormModalData>(
            modalData, undefined, CustomFormModalData
        );
        let overlayConfig: OverlayConfig = { context: builder.keyboard(null).toJSON() };
        return this.modal.open(CustomFormModal, overlayConfig).result;
    }

    /**
     * Opens a modal that allows to select a property and add a value to it.
     * Returns and object containing "property" and "value".
     * @param title title of the dialog
     * @param resource resource that is going to enrich with the property-value pair.
     * @param property root property that the modal should allow to enrich
     * @param propChangeable tells whether the input property can be changed exploring the properties subtree.
     *  If false, the button to change property is hidden. Default is true
     */
    addPropertyValue(title: string, resource: ARTResource, property: ARTURIResource, propChangeable?: boolean) {
        var modalData = new AddPropertyValueModalData(title, resource, property, propChangeable);
        const builder = new BSModalContextBuilder<AddPropertyValueModalData>(
            modalData, undefined, AddPropertyValueModalData
        );
        builder.keyboard(null);
        let overlayConfig: OverlayConfig = { context: builder.toJSON() };
        return this.modal.open(AddPropertyValueModal, overlayConfig).result;
    }

    addManualValue(property: ARTURIResource, propChangeable?: boolean) {
        var modalData = new AddManuallyValueData(property, propChangeable);
        const builder = new BSModalContextBuilder<AddManuallyValueData>(
            modalData, undefined, AddManuallyValueData
        );
        let overlayConfig: OverlayConfig = { context: builder.keyboard(null).toJSON() };
        return this.modal.open(AddManuallyValueModal, overlayConfig).result;
    }

    /**
     * Opens a modal that allows to edit an existing datarange
     * @param datarangeNode node that represents the datarange
     */
    editDataRange(datarangeNode: ARTBNode) {
        var modalData = new DataRangeEditorModalData(datarangeNode);
        const builder = new BSModalContextBuilder<DataRangeEditorModalData>(
            modalData, undefined, DataRangeEditorModalData
        );
        builder.keyboard(null);
        let overlayConfig: OverlayConfig = { context: builder.toJSON() };
        return this.modal.open(DataRangeEditorModal, overlayConfig).result;
    }

    /**
     * Opens a modal that allows to edit the resource view settings
     */
    editSettings() {
        const builder = new BSModalContextBuilder<any>();
        let overlayConfig: OverlayConfig = { context: builder.keyboard(null).toJSON() };
        return this.modal.open(ResViewSettingsModal, overlayConfig).result;
    }

    /**
     * 
     * @param title 
     * @param property 
     * @param propChangeable 
     */
    browseExternalResource(title: string, property?: ARTURIResource, propChangeable?: boolean) {
        var modalData = new BrowseExternalResourceModalData(title, property, propChangeable);
        const builder = new BSModalContextBuilder<BrowseExternalResourceModalData>(
            modalData, undefined, BrowseExternalResourceModalData
        );
        builder.keyboard(null);
        let overlayConfig: OverlayConfig = { context: builder.keyboard(null).toJSON() };
        return this.modal.open(BrowseExternalResourceModal, overlayConfig).result;
    }

}