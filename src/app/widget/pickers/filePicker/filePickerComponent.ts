import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
    selector: 'file-picker',
    templateUrl: './filePickerComponent.html',
    styles: [
        ':host { flex: 1; }'
    ]
})
export class FilePickerComponent {
    
    @Input() label: string = "Browse";
    @Input() size: string;
    @Input() accept: string;
    @Input() placeholder: string = "Select a file...";
    @Input() file: File; //in case the file is already known when the component is initialized
    
    @Output() fileChanged = new EventEmitter<File>();
    
    private btnClassPrefix: string = "btn btn-default btn-file btn-";
    private btnClass: string = this.btnClassPrefix + "sm";
    private txtClassPrefix: string = "form-control input-";
    private txtClass: string = this.txtClassPrefix + "sm";
    
    constructor() { }

    ngOnChanges() {
        if (this.size == "xs" || this.size == "sm" || this.size == "md" || this.size == "lg") {
            this.btnClass = this.btnClassPrefix + this.size;
            this.txtClass = this.txtClassPrefix + this.size;
        } else {
            this.btnClass = this.btnClassPrefix + "sm";
            this.txtClass = this.txtClassPrefix + "sm";
        }
    }
    
    private fileChangeEvent(file: File) {
        this.file = file;
        this.fileChanged.emit(file);
    }

}