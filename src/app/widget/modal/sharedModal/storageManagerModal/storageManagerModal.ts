import { Component, Input } from "@angular/core";
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { from, Observable, of } from "rxjs";
import { catchError, map, mergeMap } from "rxjs/operators";
import { Scope, ScopeUtils } from "src/app/models/Plugins";
import { DirectoryEntryInfo, EntryType } from "src/app/models/Storage";
import { StorageServices } from "src/app/services/storageServices";
import { BasicModalServices } from "../../basicModal/basicModalServices";
import { ModalType } from "../../Modals";

@Component({
    selector: "storage-mgr-modal",
    templateUrl: "./storageManagerModal.html",
})
export class StorageManagerModal {
    @Input() title: string;
    @Input() selectedFiles: string[];
    @Input() multiselection: boolean;

    scopes: ScopeItem[];
    selectedScope: ScopeItem;

    path: string;

    dirEntries: EntryDirStruct[];
    selectedEntry: EntryDirStruct;

    selectedEntries: string[] = []; //full path of the checked entries

    constructor(public activeModal: NgbActiveModal, private storageServices: StorageServices, private basicModals: BasicModalServices) {
    }

    ngOnInit() {
        this.selectedEntries = this.selectedFiles.splice(0);

        this.scopes = [Scope.SYSTEM, Scope.PROJECT, Scope.USER, Scope.PROJECT_USER].map(s => {
            return { scope: s, rootPath: ScopeUtils.serializeScope(s) + ":/" };
        });
        this.selectedScope = this.scopes[0];
        this.onScopeChanged();
    }

    onScopeChanged() {
        this.path = this.selectedScope.rootPath;
        this.listEntries();
    }

    levelUp() {
        this.path = this.path.substring(0, this.path.lastIndexOf("/") + 1);
        if (this.path != this.selectedScope.rootPath) {
            this.path = this.path.substring(0, this.path.length - 1);
        }
        this.listEntries();
    }

    listEntries() {
        this.storageServices.list(this.path).subscribe(
            entries => {
                this.selectedEntry = null;
                entries.sort((e1, e2) => {
                    if (e1.type == e2.type) {
                        return e1.name.toLocaleLowerCase().localeCompare(e2.name.toLocaleLowerCase());
                    } else if (e1.type == EntryType.DIRECTORY) {
                        return -1;
                    } else {
                        return 1;
                    }
                });
                this.dirEntries = entries.map(d => {
                    let fullPath: string = this.path;
                    if (!fullPath.endsWith("/")) {
                        fullPath += "/";
                    }
                    fullPath += d.name;
                    return {
                        fullPath: fullPath,
                        name: d.name,
                        type: d.type
                    };
                });
            }
        );
    }

    selectEntry(entry: EntryDirStruct) {
        this.selectedEntry = entry;
    }

    onEntryChecked(entry: EntryDirStruct) {
        if (this.selectedEntries.includes(entry.fullPath)) {
            this.selectedEntries.splice(this.selectedEntries.indexOf(entry.fullPath), 1);
        } else {
            this.selectedEntries.push(entry.fullPath);
        }
    }

    removeCheckedEntry(entryPath: string) {
        this.selectedEntries.splice(this.selectedEntries.indexOf(entryPath), 1);
    }

    doubleClickEntry(entry: EntryDirStruct) {
        if (entry.type == EntryType.DIRECTORY) {
            this.path = entry.fullPath;
            this.listEntries();
        } else {
            // this.storageServices.getFile(entry.fullPath).subscribe(
            //     file => {
            //         let url = window.URL.createObjectURL(file);
            //         window.open(url);
            //     }
            // )
        }
    }

    deleteEntry() {
        let deleteFn: Observable<void>;
        if (this.selectedEntry.type == EntryType.DIRECTORY) {
            deleteFn = this.storageServices.deleteDirectory(this.path + this.selectedEntry.name);
        } else {
            deleteFn = this.storageServices.deleteFile(this.path + this.selectedEntry.name);
        }
        deleteFn.subscribe(
            () => {
                if (this.selectedEntry.type == EntryType.FILE) {
                    if (this.selectedEntries.includes(this.selectedEntry.fullPath)) {
                        //if a file is deleted, check if it needs to be removed from the selected entries
                        this.selectedEntries.splice(this.selectedEntries.indexOf(this.selectedEntry.fullPath), 1);
                    }
                } else if (this.selectedEntry.type == EntryType.DIRECTORY) {
                    //if a directory is deleted, check if there are selected files that need to be removed from the selected entries
                    this.selectedEntries.forEach((entry, idx, list) => {
                        if (entry.startsWith(this.selectedEntry.fullPath)) {
                            list.splice(idx, 1);
                        }
                    });
                }
                this.listEntries();
            }
        );
    }

    createDir() {
        this.basicModals.prompt("Create folder", { value: "Name" }, null, null, null, true).then(
            name => {
                let newDirPath = this.path;
                if (!newDirPath.endsWith("/")) {
                    newDirPath += "/";
                }
                newDirPath += name;
                this.storageServices.createDirectory(newDirPath).subscribe(
                    () => {
                        this.listEntries();
                    }
                );
            }
        );
    }

    uploadFile() {
        this.basicModals.selectFile("Upload file").then(
            (file: File) => {
                let newFilePath = this.path;
                if (!newFilePath.endsWith("/")) {
                    newFilePath += "/";
                }
                let sanitizedFileName = file.name.replace(new RegExp(" ", 'g'), "_");
                newFilePath += sanitizedFileName;
                this.createFile(file, newFilePath).subscribe(
                    (done: boolean) => {
                        if (done) {
                            this.listEntries();
                        }
                    }
                );
            }
        );
    }

    private createFile(file: File, path: string, overwrite: boolean = false): Observable<boolean> {
        return this.storageServices.createFile(file, path, overwrite).pipe(
            map(() => {
                return true;
            }),
            catchError((err: Error) => {
                if (err.name.endsWith("FileAlreadyExistsException")) {
                    return from(
                        this.basicModals.confirm({ key: "WIDGETS.STORAGE_MGR.UPLOAD_FILE" }, { key: "MESSAGES.ALREADY_EXISTING_FILE_OVERWRITE_CONFIRM" }, ModalType.warning).then(
                            () => {
                                return this.storageServices.createFile(file, path, true).pipe(
                                    map(() => {
                                        return true;
                                    })
                                );
                            },
                            () => {
                                return of(false);
                            }
                        )
                    ).pipe(
                        mergeMap(done => done)
                    );
                } else {
                    return of(false);
                }
            })
        );
    }

    ok() {
        let returnData: string[]; //returns the full path of the selected file(s)
        if (this.multiselection) {
            returnData = this.selectedEntries;
        } else {
            if (this.selectedEntry != null) {
                returnData = [this.selectedEntry.fullPath];
            } else {
                returnData = [];
            }
            
        }
        this.activeModal.close(returnData);

    }

    cancel() {
        this.activeModal.dismiss();
    }

}

interface EntryDirStruct extends DirectoryEntryInfo {
    fullPath: string;
}

interface ScopeItem {
    scope: Scope;
    rootPath: string;
}