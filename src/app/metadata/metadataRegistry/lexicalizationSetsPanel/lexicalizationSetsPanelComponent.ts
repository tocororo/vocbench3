import { Component, ElementRef, Input, SimpleChanges, ViewChild } from "@angular/core";
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { forkJoin } from 'rxjs';
import { ARTURIResource } from 'src/app/models/ARTResources';
import { DatasetMetadata2, LexicalizationSetMetadata } from 'src/app/models/Metadata';
import { MetadataRegistryServices } from 'src/app/services/metadataRegistryServices';
import { AuthorizationEvaluator } from 'src/app/utils/AuthorizationEvaluator';
import { UIUtils } from 'src/app/utils/UIUtils';
import { VBActionsEnum } from 'src/app/utils/VBActions';
import { ModalOptions } from 'src/app/widget/modal/Modals';
import { NewEmbeddedLexicalizationModal } from '../newEmbeddedLexicalizationModal';

@Component({
    selector: "lexicalization-sets-panel",
    templateUrl: "./lexicalizationSetsPanelComponent.html",
    host: { class: "vbox" },
    styles: [`.activePanel { border: 2px solid #cde8ff; border-radius: 6px; }`],
})
export class LexicalizationSetsPanelComponent {

    @Input() dataset: DatasetMetadata2;
    @ViewChild('blockDiv', { static: true }) blockingDivElement: ElementRef;


    lexicalizationSets: LexicalizationSetMetadata[] = []; //lex set of the selected dataset
    selectedLexicalizationSet: LexicalizationSetMetadata;
    lexSetSort: SortEnum = SortEnum.lang_asc;

    readonly: boolean;

    addEmbeddedLexicalizationSetAuthorized: boolean;
    removeEmbeddedLexicalizationSetAuthorized: boolean;
    updateEmbeddedLexicalizationSetAuthorized: boolean;

    constructor(private metadataRegistryService: MetadataRegistryServices, private modalService: NgbModal) { }

    ngOnInit() {
        this.addEmbeddedLexicalizationSetAuthorized = AuthorizationEvaluator.isAuthorized(VBActionsEnum.metadataRegistryCreate);
        this.removeEmbeddedLexicalizationSetAuthorized = AuthorizationEvaluator.isAuthorized(VBActionsEnum.metadataRegistryDelete);
        this.updateEmbeddedLexicalizationSetAuthorized = AuthorizationEvaluator.isAuthorized(VBActionsEnum.metadataRegistryUpdate);
    }

    ngOnChanges(changes: SimpleChanges) {
        if (changes['dataset'] && changes['dataset'].currentValue) {
            this.initEmbeddedLexicalizationSets();
        }
    }

    private initEmbeddedLexicalizationSets() {
        this.lexicalizationSets = null;
        UIUtils.startLoadingDiv(this.blockingDivElement.nativeElement);
        this.metadataRegistryService.getEmbeddedLexicalizationSets(this.dataset.identity).subscribe(
            sets => {
                UIUtils.stopLoadingDiv(this.blockingDivElement.nativeElement);
                this.lexicalizationSets = sets;
                this.sortLexicalizationSetsImpl(this.lexSetSort);
                this.selectedLexicalizationSet = null;
            }
        );
    }

    sortLexicalizationSets(criteria: 'language' | 'lexicalizations') {
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
        UIUtils.startLoadingDiv(this.blockingDivElement.nativeElement);
        this.metadataRegistryService.assessLexicalizationModel(this.dataset.identity).subscribe(
            () => {
                UIUtils.stopLoadingDiv(this.blockingDivElement.nativeElement);
                this.initEmbeddedLexicalizationSets();
            }
        );
    }

    addEmbeddedLexicalizationSet() {
        const modalRef: NgbModalRef = this.modalService.open(NewEmbeddedLexicalizationModal, new ModalOptions());
        modalRef.componentInstance.catalogRecordIdentity = this.dataset.identity;
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
        UIUtils.startLoadingDiv(this.blockingDivElement.nativeElement);
        forkJoin(deleteFn).subscribe(
            () => {
                UIUtils.stopLoadingDiv(this.blockingDivElement.nativeElement);
                this.initEmbeddedLexicalizationSets();
            }
        );
    }

}

enum SortEnum {
    lang_asc = "lang_asc",
    lang_desc = "lang_desc",
    lex_asc = "lex_asc",
    lex_desc = "lex_desc",
}