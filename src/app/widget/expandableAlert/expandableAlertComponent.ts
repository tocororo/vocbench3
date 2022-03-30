import { Component, ElementRef, Input, ViewChild } from '@angular/core';
import { SafeHtml } from '@angular/platform-browser';

@Component({
    selector: 'expandable-alert',
    templateUrl: './expandableAlertComponent.html',
    styles: [`
        .collapsed { max-height: 32px; overflow: hidden; } 
        .collapsed::before {
            content: '';
            position:absolute;
            left:0; top:0;
            width:100%; height:100%;
            display:inline-block;
            background: linear-gradient(0deg, rgba(255,255,255,0.7) 0%, rgba(255,255,255,0.1) 50%, rgba(255,255,255,0) 100%);
        }
    `]
})
export class ExpandableAlertComponent {

    @Input() type: string = "info"; //expected something to append to alert- (e.g. alert-info alert-warning)
    @Input() innerHTML: SafeHtml;

    @ViewChild('alertDiv', {static: false}) alertDiv: ElementRef;

    collapsed: boolean = false;

    ngAfterViewInit() {
        //if alert exceed 100px, auto collapse it
        this.collapsed = this.alertDiv.nativeElement.clientHeight > 100;
    }

}