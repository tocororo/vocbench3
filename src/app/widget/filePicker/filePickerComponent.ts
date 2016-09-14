import {Component, OnInit, Input, Output, EventEmitter} from '@angular/core';

@Component({
    selector: 'file-picker',
    templateUrl: './filePickerComponent.html'
})
export class FilePickerComponent implements OnInit {
    
    @Input() label: string = "Browse";
    @Input() size: string = "sm";
    @Input() accept: string;
    @Input() placeholder: string = "Select a file...";
    
    @Output() fileChanged = new EventEmitter<File>();
    
    private file: File;
    private fileName: string;
    
    private btnClass: string = "btn btn-default btn-file btn-";
    private txtClass: string = "form-control input-";
    
    constructor() { }

    ngOnInit() {
        if (this.size == "xs" || this.size == "sm" || this.size == "md" || this.size == "lg") {
            this.btnClass += this.size;
            this.txtClass += this.size;
        } else {
            this.btnClass += "sm";
            this.txtClass += "sm";
        }
    }
    
    private fileChangeEvent(file: File) {
        this.file = file;
        this.fileName = file.name;
        this.fileChanged.emit(file);
    }

}