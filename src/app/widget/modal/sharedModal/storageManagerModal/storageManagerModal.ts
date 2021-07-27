import { Component, Input } from "@angular/core";
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { Observable } from "rxjs";
import { Scope, ScopeUtils } from "src/app/models/Plugins";
import { DirectoryEntryInfo, EntryType } from "src/app/models/Storage";
import { StorageServices } from "src/app/services/storageServices";
import { BasicModalServices } from "../../basicModal/basicModalServices";

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
            return { scope: s, rootPath: ScopeUtils.serializeScope(s) + ":/" }
        })
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
            this.path = this.path.substring(0, this.path.length-1);
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
                })
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
                })
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
                this.listEntries();
            }
        )
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
                        this.listEntries()
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
                this.storageServices.createFile(file, newFilePath).subscribe(
                    () => {
                        this.listEntries();
                    }
                );
            }
        )
    }

    isOkEnabled(): boolean {
        if (this.multiselection) {
            return this.selectedEntries.length > 0;
        } else {
            return this.selectedEntry != null && this.selectedEntry.type == EntryType.FILE;
        }
    }

    ok() {
        let returnFile: string[];
        if (this.multiselection) {
            returnFile = this.selectedEntries;
        } else {
            returnFile = [this.selectedEntry.fullPath];
        }
        this.activeModal.close(returnFile);

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