export interface DirectoryEntryInfo {
    type: EntryType;
    name: string;
}

export enum EntryType {
    FILE = "FILE",
    DIRECTORY = "DIRECTORY"
}