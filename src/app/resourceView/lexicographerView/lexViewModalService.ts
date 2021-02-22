import { Injectable } from '@angular/core';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { TranslateService } from '@ngx-translate/core';
import { ARTResource } from 'src/app/models/ARTResources';
import { ModalOptions, TextOrTranslation } from 'src/app/widget/modal/Modals';
import { LexicoRelationModal, LexicoRelationModalReturnData } from './lexicalSense/lexicoRelationModal';

@Injectable()
export class LexViewModalService {

    constructor(private modalService: NgbModal, private translateService: TranslateService) { }

    createRelation(title: TextOrTranslation, sourceEntity: ARTResource): Promise<LexicoRelationModalReturnData> {
        const modalRef: NgbModalRef = this.modalService.open(LexicoRelationModal, new ModalOptions());
        modalRef.componentInstance.title = (typeof title == "string") ? title : this.translateService.instant(title.key, title.params);
        modalRef.componentInstance.sourceEntity = sourceEntity;
        return modalRef.result;
    }

}
