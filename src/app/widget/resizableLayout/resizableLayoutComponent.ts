import { Component, ViewChild, ElementRef, Input, HostBinding } from '@angular/core';

@Component({
    selector: 'resizable-layout',
    templateUrl: './resizableLayoutComponent.html',
    styleUrls: ['./resizableLayoutComponent.css'],
    host: {
        '(mousemove)': 'onMousemove($event)',
        '(mouseup)': 'onMouseup()',
        '(mouseleave)': 'onMouseup()'
    }
})
export class ResizableLayoutComponent {

    /**
     * == Explanation ==
     * There are two div:
     * - main div: the flex value varies between "minFlex" and "maxFlex"
     * - secondary div: the flex value is fixed to "secondaryFlex".
     * 
     * When resizing, it is changed just "mainFlex" between "minFlex" and "maxFlex".
     * The proportion between the two panels main:secondary stays between minFlex:secondaryFlex and maxFlex:secondaryFlex
     * 
     * The layout is customizable in:
     * - the orientation, that could be horizontal or vertical
     * - the size of the main div related the secondary. By default the main-secondary ratio is 2:4 (namely the main is half the secondary).
     */

    @Input() orientation: "H" | "V"; //determines if the layout can be resized horizontally or vertically
    @Input() mainFlex: number = 2;

    //the following are used in order to set dinamically the host class (see https://stackoverflow.com/a/34643330/5805661)
    @HostBinding('class.hbox') horizontalLayout: boolean = false;
    @HostBinding('class.vbox') verticalLayout: boolean = false;

    @ViewChild('maindiv', { static: false }) private mainDiv: ElementRef;
    @ViewChild('secondarydiv', { static: false }) private secondaryDiv: ElementRef;

    readonly secondaryFlex: number = 4;

    private readonly minFlex: number = 1;
    private readonly maxFlex: number = 16;

    private dragging: boolean = false;
    private startMousedown: number;

    constructor() { }

    ngOnInit() {
        this.horizontalLayout = (this.orientation == "H");
        this.verticalLayout = (this.orientation == "V");
        //fix the input mainFlex if out of admitted range 1:16
        if (this.mainFlex < this.minFlex) {
            this.mainFlex = this.minFlex;
        } else if (this.mainFlex > this.maxFlex) {
            this.mainFlex = this.maxFlex;
        }
    }

    private onMousedown(event: MouseEvent) {
        event.preventDefault();
        this.dragging = true;
        this.startMousedown = (this.orientation == "H") ? event.clientX : event.clientY;
        this.onMousemove = this.draggingHandler; //set listener on mousemove
    }
    private onMouseup() {
        if (this.dragging) { //remove listener on mousemove
            this.onMousemove = (event: MouseEvent) => { };
            this.dragging = false;
        }
    }
    private onMousemove(event: MouseEvent) { }
    private draggingHandler(event: MouseEvent) {
        if (this.orientation == "H") {
            let endMousedownX = event.clientX;
            let diffX: number = this.startMousedown - endMousedownX;

            let leftDivWidth: number = this.mainDiv.nativeElement.offsetWidth;
            let rightDivWidth: number = this.secondaryDiv.nativeElement.offsetWidth;

            /**
             * Compute the mainFlex based on the following mathematical proportion:
             * leftDivWidth:rightDivWidth = mainFlex:secondaryFlex
             * secondaryFlex is fixed, main and secondary divWidth are retrieved => compute mainFlex
             */
            this.mainFlex = (leftDivWidth - diffX) / (rightDivWidth + diffX) * this.secondaryFlex;

            //ensure that leftFlex stays between min and max flex
            if (this.mainFlex > this.maxFlex) {
                this.mainFlex = this.maxFlex;
            }
            else if (this.mainFlex < this.minFlex) {
                this.mainFlex = this.minFlex;
            }
            //update the initial X position of the cursor
            this.startMousedown = event.clientX;
        } else {
            let endMousedownY = event.clientY;
            let diffY: number = this.startMousedown - endMousedownY;

            let topDivHeight: number = this.mainDiv.nativeElement.offsetHeight;
            let bottomDivHeight: number = this.secondaryDiv.nativeElement.offsetHeight;

            /**
             * Compute the mainFlex based on the following mathematical proportion:
             * leftDivWidth:rightDivWidth = mainFlex:secondaryFlex
             * secondaryFlex is fixed, main and secondary divWidth are retrieved => compute mainFlex
             */
            this.mainFlex = (topDivHeight - diffY) / (bottomDivHeight + diffY) * this.secondaryFlex;

            //ensure that leftFlex stays between min and max flex
            if (this.mainFlex > this.maxFlex) {
                this.mainFlex = this.maxFlex;
            }
            else if (this.mainFlex < this.minFlex) {
                this.mainFlex = this.minFlex;
            }
            //update the initial Y position of the cursor
            this.startMousedown = event.clientY;
        }
    }

    /* UTILS */

    /**
     * Returns true if the second div has been provided in the parent template
     */
    secondaryProvided(): boolean {
        return this.secondaryDiv != null && this.secondaryDiv.nativeElement && this.secondaryDiv.nativeElement.children.length > 0;
    }


}
