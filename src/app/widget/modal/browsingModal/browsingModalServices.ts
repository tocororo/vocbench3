import { Injectable } from '@angular/core';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { ARTURIResource, RDFResourceRolesEnum } from "../../../models/ARTResources";
import { ProjectContext } from '../../../utils/VBContext';
import { ModalOptions } from '../Modals';
import { ClassIndividualTreeModal } from "./classIndividualTreeModal/classIndividualTreeModal";
import { ClassTreeModal } from "./classTreeModal/classTreeModal";
import { CollectionTreeModal } from "./collectionTreeModal/collectionTreeModal";
import { ConceptTreeModal } from "./conceptTreeModal/conceptTreeModal";
import { DatatypeListModal } from './datatypeListModal/datatypeListModal';
import { InstanceListModal } from "./instanceListModal/instanceListModal";
import { LexiconListModal } from './lexiconListModal/lexiconListModal';
import { PropertyTreeModal } from "./propertyTreeModal/propertyTreeModal";
import { SchemeListModal } from "./schemeListModal/schemeListModal";

/**
 * Service to open browsing modals, namely the modal that contains trees (concept, class, property) or list (instances).
 */
@Injectable()
export class BrowsingModalServices {

    constructor(private modalService: NgbModal) { }

    /**
     * Opens a modal to browse the class tree
     * @param title the title of the modal
     * @return if the modal closes with ok returns a promise containing the selected class
     */
    browseClassTree(title: string, roots?: ARTURIResource[], projectCtx?: ProjectContext): Promise<ARTURIResource> {
        let _options: ModalOptions = new ModalOptions();
        const modalRef: NgbModalRef = this.modalService.open(ClassTreeModal, _options);
        modalRef.componentInstance.title = title;
        if (roots != null) modalRef.componentInstance.roots = roots;
        if (projectCtx != null) modalRef.componentInstance.projectCtx = projectCtx;
        return modalRef.result;
    }

    /**
     * Opens a modal to browse the class tree and select an individual of a class
     * @param title the title of the modal
     * @param classes (optional) tells the admitted type of the individual to pick
     * @return if the modal closes with ok returns a promise containing the selected individual
     */
    browseClassIndividualTree(title: string, classes?: ARTURIResource[], projectCtx?: ProjectContext): Promise<ARTURIResource> {
        let _options: ModalOptions = new ModalOptions('lg');
        const modalRef: NgbModalRef = this.modalService.open(ClassIndividualTreeModal, _options);
        modalRef.componentInstance.title = title;
        if (classes != null) modalRef.componentInstance.classes = classes;
        if (projectCtx != null) modalRef.componentInstance.projectCtx = projectCtx;
        return modalRef.result;
    }

    /**
     * Opens a modal to browse the concept tree
     * @param title the title of the modal
     * @param cls the class of the instance to browse
     * @return if the modal closes with ok returns a promise containing the selected instance
     */
    browseInstanceList(title: string, cls: ARTURIResource): Promise<ARTURIResource> {
        let _options: ModalOptions = new ModalOptions();
        const modalRef: NgbModalRef = this.modalService.open(InstanceListModal, _options);
        modalRef.componentInstance.title = title;
        modalRef.componentInstance.cls = cls;
        return modalRef.result;
    }

    /**
     * Opens a modal to browse the concept tree
     * @param title the title of the modal
     * @param scheme the scheme of the concept tree. If not provided the modal contains a tree in no-scheme mode
     * @param schemeChangeable if true a menu is shown and the user can browse not only the selected scheme
     * @return if the modal closes with ok returns a promise containing the selected concept
     */
    browseConceptTree(title: string, schemes?: ARTURIResource[], schemeChangeable?: boolean, projectCtx?: ProjectContext): Promise<ARTURIResource> {
        let _options: ModalOptions = new ModalOptions();
        const modalRef: NgbModalRef = this.modalService.open(ConceptTreeModal, _options);
        modalRef.componentInstance.title = title;
        if (schemes != null) modalRef.componentInstance.schemes = schemes;
        if (schemeChangeable != null) modalRef.componentInstance.schemeChangeable = schemeChangeable;
        if (projectCtx != null) modalRef.componentInstance.projectCtx = projectCtx;
        return modalRef.result;
    }

    /**
     * Opens a modal to browse the collection tree
     * @param title the title of the modal
     * @return if the modal closes with ok returns a promise containing the selected collection
     */
    browseCollectionTree(title: string, projectCtx?: ProjectContext): Promise<ARTURIResource> {
        let _options: ModalOptions = new ModalOptions();
        const modalRef: NgbModalRef = this.modalService.open(CollectionTreeModal, _options);
        modalRef.componentInstance.title = title;
        if (projectCtx != null) modalRef.componentInstance.projectCtx = projectCtx;
        return modalRef.result;
    }

    /**
     * Opens a modal to browse the scheme list
     * @param title the title of the modal
     * @return if the modal closes with ok returns a promise containing the selected scheme
     */
    browseSchemeList(title: string, projectCtx?: ProjectContext): Promise<ARTURIResource> {
        let _options: ModalOptions = new ModalOptions();
        const modalRef: NgbModalRef = this.modalService.open(SchemeListModal, _options);
        modalRef.componentInstance.title = title;
        if (projectCtx != null) modalRef.componentInstance.projectCtx = projectCtx;
        return modalRef.result;
    }

    /**
     * Opens a modal to browse the property tree
     * @param title the title of the modal
     * @param rootProperties optional , if provided the tree is build with these properties as roots
     * @param resource optional, if provided the returned propertyTree contains 
     * @param type optional, tells the type of properties to show in the tree
     * just the properties that have as domain the type of the resource 
     * @return if the modal closes with ok returns a promise containing the selected property
     */
    browsePropertyTree(title: string, rootProperties?: ARTURIResource[], resource?: ARTURIResource, type?: RDFResourceRolesEnum, projectCtx?: ProjectContext): Promise<ARTURIResource> {
        let _options: ModalOptions = new ModalOptions();
        const modalRef: NgbModalRef = this.modalService.open(PropertyTreeModal, _options);
        modalRef.componentInstance.title = title;
        if (rootProperties != null) modalRef.componentInstance.rootProperties = rootProperties;
        if (resource != null) modalRef.componentInstance.resource = resource;
        if (type != null) modalRef.componentInstance.type = type;
        if (projectCtx != null) modalRef.componentInstance.projectCtx = projectCtx;
        return modalRef.result;
    }

    /**
     * 
     * @param title 
     * @param lexicon if not provided, get the current active
     * @param lexiconChangeable 
     * @param allowMultiselection
     */
    browseLexicalEntryList(title: string, lexicon?: ARTURIResource, lexiconChangeable?: boolean, editable?: boolean, deletable?: boolean,
        allowMultiselection?: boolean, projectCtx?: ProjectContext) {
        let _options: ModalOptions = new ModalOptions();
        const modalRef: NgbModalRef = this.modalService.open(ClassTreeModal, _options);
        modalRef.componentInstance.title = title;
        if (lexicon != null) modalRef.componentInstance.lexicon = lexicon;
        if (lexiconChangeable != null) modalRef.componentInstance.lexiconChangeable = lexiconChangeable;
        if (editable != null) modalRef.componentInstance.editable = editable;
        if (deletable != null) modalRef.componentInstance.deletable = deletable;
        if (allowMultiselection != null) modalRef.componentInstance.allowMultiselection = allowMultiselection;
        if (projectCtx != null) modalRef.componentInstance.projectCtx = projectCtx;
        return modalRef.result;
    }

    /**
     * 
     * @param title 
     */
    browseLexiconList(title: string, projectCtx?: ProjectContext): Promise<ARTURIResource> {
        let _options: ModalOptions = new ModalOptions();
        const modalRef: NgbModalRef = this.modalService.open(LexiconListModal, _options);
        modalRef.componentInstance.title = title;
        if (projectCtx != null) modalRef.componentInstance.projectCtx = projectCtx;
        return modalRef.result;
    }

    /**
     * Opens a modal to browse the datatype list
     * @param title the title of the modal
     * @return if the modal closes with ok returns a promise containing the selected datatype
     */
    browseDatatypeList(title: string): Promise<ARTURIResource> {
        let _options: ModalOptions = new ModalOptions();
        const modalRef: NgbModalRef = this.modalService.open(DatatypeListModal, _options);
        modalRef.componentInstance.title = title;
        return modalRef.result;
    }

}