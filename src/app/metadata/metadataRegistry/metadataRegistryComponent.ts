import { Component, ElementRef, ViewChild } from "@angular/core";
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { TranslateService } from '@ngx-translate/core';
import { forkJoin } from "rxjs";
import { ModalOptions } from 'src/app/widget/modal/Modals';
import { ARTURIResource } from "../../models/ARTResources";
import { CatalogRecord2, DatasetNature, LexicalizationSetMetadata } from "../../models/Metadata";
import { MetadataRegistryServices } from "../../services/metadataRegistryServices";
import { AuthorizationEvaluator } from "../../utils/AuthorizationEvaluator";
import { UIUtils } from "../../utils/UIUtils";
import { VBActionsEnum } from "../../utils/VBActions";
import { BasicModalServices } from "../../widget/modal/basicModal/basicModalServices";
import { NewEmbeddedLexicalizationModal } from "./newEmbeddedLexicalizationModal";

@Component({
    selector: "metadata-registry-component",
    templateUrl: "./metadataRegistryComponent.html",
    host: { class: "pageComponent" },
    styles: [`.activePanel { border: 2px solid #cde8ff; border-radius: 6px; }`]
})
export class MetadataRegistryComponent {

    @ViewChild('blockDiv', { static: false }) lexSetBlockDivElement: ElementRef;
    // @ViewChild(MetadataRegistryTreePanelComponent) mdrTreePanel: MetadataRegistryTreePanelComponent;

    selectedCatalogRecord2: CatalogRecord2;

    lexicalizationSets: LexicalizationSetMetadata[] = []; //lex set of the selected dataset
    selectedLexicalizationSet: LexicalizationSetMetadata;
    lexSetSort: SortEnum = SortEnum.lang_asc;

    constructor(private metadataRegistryService: MetadataRegistryServices, private basicModals: BasicModalServices, private translateService: TranslateService, private modalService: NgbModal) { }

    /**
     * Catalog records
     */

    onCatalogSelected(catalogRecord: CatalogRecord2) {
        this.selectedCatalogRecord2 = catalogRecord;
        if (this.selectedCatalogRecord2 != null && this.selectedCatalogRecord2.dataset.nature != DatasetNature.ABSTRACT) { //onCatalogSelected is invoked also when tree is initialized/refreshed and the selected node of the tree is nulls 
            setTimeout(() => {
                this.initEmbeddedLexicalizationSets();
            });
        }
    }

    // onDatasetUpdate() {
    //     this.mdrTreePanel.refresh();
    // }


    /**
     * Lexicalization sets
     */

    private initEmbeddedLexicalizationSets() {
        this.lexicalizationSets = null;
        UIUtils.startLoadingDiv(this.lexSetBlockDivElement.nativeElement);
        this.metadataRegistryService.getEmbeddedLexicalizationSets(this.selectedCatalogRecord2.dataset.identity).subscribe(
            sets => {
                UIUtils.stopLoadingDiv(this.lexSetBlockDivElement.nativeElement);
                this.lexicalizationSets = sets;
                this.sortLexicalizationSetsImpl(this.lexSetSort);
                this.selectedLexicalizationSet = null;
            }
        );
    }

    sortLexicalizationSets(criteria: 'language'|'lexicalizations') {
        if (criteria == "language") {
            if (this.lexSetSort == SortEnum.lang_asc) {
                this.sortLexicalizationSetsImpl(SortEnum.lang_desc);
            } else if (this.lexSetSort == SortEnum.lang_desc) {
                this.sortLexicalizationSetsImpl(SortEnum.lang_asc);
            } else {
                this.sortLexicalizationSetsImpl(SortEnum.lang_asc);
            }
        } else {
            if (this.lexSetSort == SortEnum.lex_asc) {
                this.sortLexicalizationSetsImpl(SortEnum.lex_desc);
            } else if (this.lexSetSort == SortEnum.lex_desc) {
                this.sortLexicalizationSetsImpl(SortEnum.lex_asc);
            } else {
                this.sortLexicalizationSetsImpl(SortEnum.lex_asc);
            }
        }
    }

    sortLexicalizationSetsImpl(criteria: SortEnum) {
        if (criteria == SortEnum.lang_asc) {
            this.lexicalizationSets.sort((l1, l2) => {
                return l1.language.localeCompare(l2.language);
            });
        } else if (criteria == SortEnum.lang_desc) {
            this.lexicalizationSets.sort((l1, l2) => {
                return l2.language.localeCompare(l1.language);
            });
        } else { //lexicalizations
            this.lexicalizationSets.sort((l1, l2) => {
                /*
                - If both lex set has lexicalizations, compare them
                - If only one of lex set has lexicalizations, set first the one which has it
                - If none of them has lexicalizations, sort by language
                */
                if (l1.lexicalizations && l2.lexicalizations) {
                    if (criteria == SortEnum.lex_asc) {
                        return l2.lexicalizations - l1.lexicalizations;
                    } else {
                        return l1.lexicalizations - l2.lexicalizations;
                    }
                } else if (l1.lexicalizations && !l2.lexicalizations) {
                    if (criteria == SortEnum.lex_asc) {
                        return -1;
                    } else {
                        return 1;
                    }
                } else if (!l1.lexicalizations && l2.lexicalizations) {
                    if (criteria == SortEnum.lex_asc) {
                        return 1;
                    } else {
                        return -1;
                    }
                } else {
                    if (criteria == SortEnum.lex_asc) {
                        return l1.language.localeCompare(l2.language);
                    } else {
                        return l2.language.localeCompare(l1.language);
                    }
                }
            });
        }
        this.lexSetSort = criteria;
    }

    assessLexicalizationModel() {
        UIUtils.startLoadingDiv(this.lexSetBlockDivElement.nativeElement);
        this.metadataRegistryService.assessLexicalizationModel(this.selectedCatalogRecord2.dataset.identity).subscribe(
            () => {
                UIUtils.stopLoadingDiv(this.lexSetBlockDivElement.nativeElement);
                this.initEmbeddedLexicalizationSets();
            }
        );
    }

    addEmbeddedLexicalizationSet() {
        const modalRef: NgbModalRef = this.modalService.open(NewEmbeddedLexicalizationModal, new ModalOptions());
        modalRef.componentInstance.catalogRecordIdentity = this.selectedCatalogRecord2.dataset.identity;
        return modalRef.result.then(
            () => {
                this.initEmbeddedLexicalizationSets();
            },
            () => { }
        );
    }

    deleteEmbeddedLexicalizationSet() {
        this.metadataRegistryService.deleteEmbeddedLexicalizationSet(new ARTURIResource(this.selectedLexicalizationSet.identity)).subscribe(
            () => {
                this.initEmbeddedLexicalizationSets();
            }
        );
    }

    deleteAllEmbeddedLexicalizationSet() {
        let deleteFn: any[] = [];
        this.lexicalizationSets.forEach(ls => {
            deleteFn.push(this.metadataRegistryService.deleteEmbeddedLexicalizationSet(new ARTURIResource(ls.identity)));
        });
        UIUtils.startLoadingDiv(this.lexSetBlockDivElement.nativeElement);
        forkJoin(deleteFn).subscribe(
            () => {
                UIUtils.stopLoadingDiv(this.lexSetBlockDivElement.nativeElement);
                this.initEmbeddedLexicalizationSets();
            }
        );

    }


    //Authorizations

    isAddDatasetAuthorized(): boolean {
        return AuthorizationEvaluator.isAuthorized(VBActionsEnum.metadataRegistryCreate);
    }
    isRemoveDatasetAuthorized(): boolean {
        return AuthorizationEvaluator.isAuthorized(VBActionsEnum.metadataRegistryDelete);
    }
    isEditDatasetAuthorized(): boolean {
        return AuthorizationEvaluator.isAuthorized(VBActionsEnum.metadataRegistryUpdate);
    }

    isAddEmbeddedLexicalizationSetAuthorized(): boolean {
        return AuthorizationEvaluator.isAuthorized(VBActionsEnum.metadataRegistryCreate);
    }
    isRemoveEmbeddedLexicalizationSetAuthorized(): boolean {
        return AuthorizationEvaluator.isAuthorized(VBActionsEnum.metadataRegistryDelete);
    }


}

enum SortEnum {
    lang_asc = "lang_asc",
    lang_desc = "lang_desc",
    lex_asc = "lex_asc",
    lex_desc = "lex_desc",
}