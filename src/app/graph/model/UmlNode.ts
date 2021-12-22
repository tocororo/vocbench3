import { ARTResource, ARTURIResource, RDFResourceRolesEnum, ResAttribute } from './../../models/ARTResources';
import { Size } from './GraphConstants';
import { Node, NodeShape } from "./Node";
import { ARTNode } from '../../models/ARTResources';


export class UmlNode extends Node {

    listPropInfo: Array<PropInfo> = [];
    xlink: string
    explicit:boolean

    constructor(res: ARTNode) {
        super(res);
        this.explicit=res.getAdditionalProperty(ResAttribute.EXPLICIT) ||
            res.getAdditionalProperty(ResAttribute.EXPLICIT) == undefined;
            
        this.xlink = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAABPUlEQVR42mNkoBAwDk4D7hzr/v/q2mKGv78+g/nMbLwMYlpxDCpWJYwEDTi7wvM/69/nDEJCQgzsXMIMb189ZPjy5QvD9+/fGbiENBiMI7Yz4jQAZPO3+0sZFFSNGFikZBk4pRsYPh7xZ3j69CnYABCWNMgCuqSUEasBx+bo/Rfi52CQM3BgYJAWZWC4fo3h/u1LDH///gVjkEtA3rFKuYTdgMPTFP9z8YoxyMnJMbx7947h/5/PYI2/fv0CY5ALQHzngqe4DQD5nY2NDWwbiIYZANL88eNHsDqfyne4vcDG/AfMBmmEAZABIABy1a+/LAyh9W+xGwAKxOcXpmGNb5DtIFfImxUwmPm0YzcAFo3f3t2A80EugWmWUbFisEk8gDsa0RPSr+8fIKH//R+DjEEyg7FnC+GERCoYeAMAAHCnETraWggAAAAASUVORK5CYII="
        if (!this.explicit) {
            this.xlink = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAABTklEQVR42s2SvUoDQRSFz2ZcSFyza6KYIGyMgqI2CqJNIBai5DUs7H0ASyGtb2DpewhpLERfQIJBiGiUGPdndjIzzg6aQnYJYqG3Ge4w851zfwz8Moz/CejdX8pB9xqCBTrPmDnky9uYqdSMsYDOzbkk4h2Tlq0/Uu8FYRiARSFMqwx389BIBcTK9PkWhbkFkLwN096F377AoP8KxiINcdyaclI3EgHtqzNp5bKYKi2BTFvgj0/o9x4ghACkUE587aq6c5wMuGs1pZl14BRmQQMfECE45xB8CC6GCkA1aLl+kg6IayeEKLsUGTKh1bkCxPbD0NPv1vdO00sghvzMxOieRZE+fe9NOQE2Gs1kQNzEfqeVOO9YndEAxcV9uGuNZMDXGJnXHeVcSNWPAfgwglNaRXXrKH2M3xeJUV83jUYMxUoN8ysH4xfpp/H3gA9iGKIR2Fuw7gAAAABJRU5ErkJggg=="
        }
    }

    initNodeShape() {
        this.shape = NodeShape.rect;
    }

    initNodeMeasure() {
        this.measures = { width: Size.RectangleUml.base, height: Size.RectangleUml.height };
    }

}

export class NodePropRange {
    node: UmlNode;
    prop: PropInfo;
}

/**
 * This class is used to have cordinates of Properties
 */

export class PropInfo {
    id: string;
    x?: number = 0;
    y?: number = 0;
    property: ARTURIResource;
    range: ARTResource;
    show?: string;
    normalizedShow?: string;
    xlink?: string;
    constructor(property: ARTURIResource, range: ARTResource) {
        this.property = property;
        this.range = range;
        //generate random id for the instances
        let token = '';
        let chars = "0123456789abcdefghijklmnopqrstuvwxyz";
        for (var i = 0; i < 10; i++) {
            let idx = Math.round(Math.random() * (chars.length - 1));
            token = token + chars[idx];
        }
        this.id = token
        let role = property.getRole();
        let deprecated: boolean = property.isDeprecated();
        var explicit: boolean = property.getAdditionalProperty(ResAttribute.EXPLICIT) ||
            property.getAdditionalProperty(ResAttribute.EXPLICIT) == undefined;
        if (role == RDFResourceRolesEnum.property) {
            this.xlink = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAABNElEQVR42mNkoBAwDi4DjFJnqLCwsDD8/fsXyPvP8P8/RJqR8T9c6f///xnOzc64g2EAUHM9kHIRExOz+fLlCwMzMzPDz5+/GH7//glWBtQHNAhswBGgwB6gIY1wA4zTZsoBJZbunZVuc/wVA8Pdu78Yzp49y/DixQuG79+/MXz58hXF2SBDGBkZo8/OSn8EN4CVlfVhdXUiw+nTTxmOHDnC8PHjR0Lel0cxgImJ6WFycjLD2rVrGd69e4dX5/fv3xk4OTkRBgD9Lwf080MDAwOw0+EBxMgIDjR0zaBA5uHhkQeGA6oXhISEGF6+fInT5l+/fsG9JioqiuoFUCACnWXz48cPrJpBMQOyHWSAsrIyaiAiRyNQwgaXZhCWlZXFjEYYALrEnJjUB7T5JNaUSA4YeAMABKCiERklUHkAAAAASUVORK5CYII=";
            if (!explicit) {
                this.xlink = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAABDklEQVR42mNkoBAwDi4D5u+8osIEFPn3n4EBRoMAMhsEEt117mAYANRcD6RceLjYbX79/s3AxMTM8OfPX4Z///6haAaCI0C8B2hII9wAoGY5ILU0wk3b5s0PBoaPH34zPHv5huHj568MIMN+/f6H7nKQIdFAQx7BDWBhZnpoZ67G8OL1N4YHj58zfPvxm5D35VEMAPrzoZmBBsOVm/cZvnz7iVcnyFVsrKyYBshKijA8fPaGoGZQmHCwoRkA8gIHOyte2//8/cvw4yfEazxcHKgGgAKRjZXJBkuAwW3+9fsvw+dvPxgkRQRQAxE5GoHYBpfmH79+M4gI8GJGI5Ih5oSCHpqQTmIkJHLBwBsAAM6MjhFjOKJoAAAAAElFTkSuQmCC";
                if (deprecated) {
                    this.xlink = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAEHSURBVDhPYxhmYPPuIyrEYKhyVACUqAfiw/uOnf+/ff/x/zsPnvy/dd/x/0AxdHwYiOuh2iAAKCAHkvj1////D99//T+3c9//eeFR/2cEhv6fFZ/8f+XMBdgMkYNqhxgAsu3tl+//bz188X/t5Jn/l/VMBites3TN/xmxif/XrdqMbgiqASDBZ+++/gd5AaQZZgAIL588C4W/bvt+7Aacu3YPrACfASDNa7ZhMQDkBZDtIEXIBoCcPictG0xv2Hno/4qNu8AYwwAgPgwKfZAmkI1TfAPAGOR/UCCCbAZpnLtsA0gNaiCCAFAAHI0gA9AxTPPC1VthmlGjEQaAEubEYKjy4QEYGAB2WG70riFcdwAAAABJRU5ErkJggg==";
                }
            } else if (deprecated) {
                this.xlink = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAEKSURBVDhPYxhmICQxTyUirVgFROPDUOWoAChRD8SHsyvb/8fnVv1PzK/9H5VR+h8oho4PA3E9VBsEAAXkQBJf//z5f/XZ2/9rJ8393yAl+79aVPx/qYLy/ziPIGyGyEG1QwwA2Xb5ydv/y7cf/5/rFfw/yd4DrDg6MPp/kYzC/8jQBHRDUA0ISy74f/Tqs/+Z5a1gzTADQDjBxReF7xmaiN2AvjmrwQrwGQDS7BoQg2kAyAt5NV0YBoCcnq+sAab9otL+27gHgTGGAUB8ODa7AqwJZGO5oDAYg/wPCkT34DiwRm0TW5Aa1EAEAaAAOBpBBqBjmGZDa1eYZtRohAGghDkxGKp8eAAGBgDcUPI2SI7rSgAAAABJRU5ErkJggg==";
            }

        } else if (role == RDFResourceRolesEnum.objectProperty) {
            this.xlink = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAABR0lEQVR42mNkoBAwDi4DjFJnqLCwsDD8/fsXyPvP8P8/RJqR8T9c6f///xnOzc64g2EAUHM9kHIRExOz+fLlCwMzMzPDz5+/GH7//glWBtQHNAhswBGgwB6gIY1wA4zTZsoBJZYenpVuAxL4BXTA5ct3GFrXXGb4/v0bw5cvX1GcDTKEkZEx+uys9EdwA1hZWR9WV0czeEqyMbz7zsCQ3bWG4d6zd/i8L49iABMT08Pk5GQGfw1Gho+fPjLUzt6N04Dv378zcHJyIgwA+l8O6OeHBgYGDMW+qmBFMANAgYauGRTIPDw88sBwQPWCkJAQQ1+GA4oByODXr18MHz9+BLNFRUVRvQAKRKCzbOaW+zOAYiG9dyuKZpAYyHaQAcrKyqiBiByNQAkbdD/DNIOwrKwsZjTCANAl5sSkPqDNJ7GmRHLAwBsAALUKqhEyJXIIAAAAAElFTkSuQmCC";
            if (!explicit) {
                this.xlink = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAABJUlEQVR42mNkoBAwDi4D5u+8osIEFPn3n4EBRoMAMhsEEt117mAYANRcD6RceLjYbX79/s3AxMTM8OfPX4Z///6haAaCI0C8B2hII9wAoGY5ILU02k3bBsT/+4+B4f27jwxHb7xmABn26/c/dJeDDIkGGvIIbgALM9NDO0s1BmkuZoaffxgY9p+9w/D640983pdHMQDoz4dmBhoMcgLMDD9+/mA4fvUJTgNArmJjZcU0QFZShEFfgR+sCJcBIM2gMOFgQzMA5AUOdlYGJwMZnAb8+fsX6LrfYDYPFweqAaBAZGNlsvEwVWT4A7Rl2+lHGDb/+v2X4fO3HwySIgKogYgcjUBsg83ZIM0/fv1mEBHgxYxGJEPMiUl9QM0nsaZEcsDAGwAAWfGWEYq7oC0AAAAASUVORK5CYII=";
                if (deprecated) {
                    this.xlink = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAEMSURBVDhPYxhmYPPuIyrEYKhyVACUqAfiw/uOnf+/ff/x/zsPnvy/dd/x/0AxdHwYiOuh2iAAKCAHkvjz//9/EL5/4uT/1YlJ/2cEhv6fFZ/8f+XMBdgMkYNqhxgAsu3t1+9gA+7sO/B/44y5YMVrlq75PyM28f+6VZvRDUE1ACT47N3X/7+AJlzbsRNuAAgvnzzr/7KeyXD+uu37sRtw7tq9/5+ArsBnAEjzmm1YDAB5ARSA6AaAnD4nLRtMb9h56P+KjbvAGMMAID4MCn2QAVf37vs/xTcAjEH+BwUiyGaQxrnLNoA0owYiCAAFwNEIxGCbkTFM88LVW2GaUaMRBoAS5sRgqPLhARgYAC6/dV7Hn3ksAAAAAElFTkSuQmCC";
                }
            } else if (deprecated) {
                this.xlink = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAEUSURBVDhPYxhmICQxTyUirVgFROPDUOWoAChRD8SHsyvb/8fnVv1PzK/9H5VR+h8oho4PA3E9VBsEAAXkQBK//v//D8IXN2z436Oq+r9aVPx/qYLy/ziPIGyGyEG1QwwA2Xbx0Yv/f4AGnFq4+H9ZUBRYcXRg9P8iGYX/kaEJ6IagGhCWXPD/6NVn/z98/fV//7SZcANAOMHF93+SvQec7xmaiN2Avjmr/z989hqvASDNrgExmAaAvJBX04VhAMjp+coaYNovKu2/jXsQGGMYAMSHY7MrwAbsnjn7f7mgMBiD/A8KRPfgOLBGbRNbkGbUQAQBoAA4GoEYbDMyhmk2tHaFaUaNRhgASpgTg6HKhwdgYAAA+zn/7fDhmB4AAAAASUVORK5CYII=";
            }

        } else if (role == RDFResourceRolesEnum.annotationProperty) {
            this.xlink = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAA5UlEQVR42mNkoBAwDi4D/q9hUGFgATL+wgSwqAKKMYYw3MEwAKi5Hki5MIgx2DB8AbKYgfgnEP9GMowRTB8BknuAhjTCDfi/lkEOKLGUIRioGQZuA/ELIP4OxF/Q3A0yhJEhmjGY4RHCAFaGhwy+UFtBdnwk6H15VAOYgAYEADkHgPgdAa0gV3EiG7AGaAAz0AADIOcsWhD/x6IZFMg8QANC0L0gBOS8xGPzLySviaJ7ARSInMBA/IFD8xeo7SADlNECESUaGZFiAl0zCMtiiUa4IWsZzAmGPUhTMMNJ5GCiCAy8AQCXyk0RhxpIKAAAAABJRU5ErkJggg==";
            if (!explicit) {
                this.xlink = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAA20lEQVR42mNkoBAwDi4Dft1ZoIIi8h+LKqAYm0rCHQwDgJrrgZQLAyeDDcNvIIsJiP8C8T8kwxjB9BEguQdoSCPcgF93F8gBJZYyyAE1w8AnIP4JNeQ3mrtBhjAyRLMpJzxCGMDE8JBBGqrhNRZNmEAe1QAGoAGyQPIlSICAVpAlzMgG3AEawAg0QBDIeYcWxP+xaGaAGqCC7gU2IOcHAZv/QNns6F4ABSILMBD/4tD8B2oAyHs8aIGIEo2MSDGBrhmEObFEI9yQuwvMCYY9EABtPokcTBSBgTcAAFdiVRFX/THeAAAAAElFTkSuQmCC";
                if (deprecated) {
                    this.xlink = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAADvSURBVDhP3ZGxCsIwEIb7JE6+g8/RUd0619nRl3BzEh0KIpQizkIpQqHgorVVEMyDnPcnV0mjgnMPPkJy9//JXbyOhaqyvqotsP9yJuXt4MSMSdU9I3UTaovqvaaoFZkJTvR0QnEBUyQLisY+RSOf4klAp2TpmqXQiFwMkIDBM6N8PdfgrDxsKQ4Dqo+7tslPA27BNgDFZtHaSzuWQSUGD5PMV2zANMXaAHsIrwJrRG69AAPk1X4Bnr6fhqYFGJTCRwsYjEweN0ZDHiKD/vUQcSuEZ8YdIoIPzTfiJS6N+MKgxv3GJrh48A9S3o3wvBeiEpDfUcNdoAAAAABJRU5ErkJggg==";
                }
            } else if (deprecated) {
                this.xlink = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAD/SURBVDhP3ZGtDsJAEIT7FDiKqSYBg+IhUCg8pgSDbDCYJhhCgiWEwPFXBAFFTvFgy8x1C21BoNnky2XvduZu97w/C2uiwO5yMP+yp+XFwMEYPOw5EnsEJ7AHO8W81gdrVZYGDnx3YFEADpOuxLWKxH5FZs1Akqj3NspMoFG5GvA2GtwjMcOOmEHHFV+mfZk1ArnNw6LJhwE3aZDAAOLMgBxG3UJut27NGRg1uAL0akIYALeH3Bkw5xw2CjQqz7XAAUKUfwGfvmjX0xZ481r5aIGD4fQh4o1xFUME7N8NkbdSuATlITKwmX4jn10mE68Aa8rfmAWKW7+g5f8RnvcE5a5BsdCi0w8AAAAASUVORK5CYII=";
            }

        } else if (role == RDFResourceRolesEnum.ontologyProperty) {
            this.xlink = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAABK0lEQVR42mNkoBAwDi4DmrK8VJiZWRj+/v0DlfqPpOw/XF3dtG13MAwAaq4HUi7iYqI2n798ZWBlYWb49v0nw+/fv1E0A8ERIN4DNKQRbgBQsxyQWlrbt9YGouYfw61bVxkOrJvK8O3bd4bPX76guxxkSDTQkEdwA1hZ2R5mppQy8GuZMzD8+sIwq7eC4eWzR/i8L49iADMT88Pc7DQGLnkrho/vPzCsmd+N04DPX74z8PJwYhpgamLEYOwaB1aEywCQ5n///jLw8/HIY3hBVESIITCpGqcBP37+ZngPdB0ISEqIohoACkQODk6b5OIucKAtmliJovnjpy/gAH334RODtoYyaiAiRyMQ26A7G6b589dvDGrK8pjRiGSIOTGpD6j5JNaUSA4YeAMAswqUEUY7AdAAAAAASUVORK5CYII=";
            if (!explicit) {
                this.xlink = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAABEUlEQVR42mNkoBAwDi4DzuxbrUKMJhOn0DsYBgA11wMpFw5Obpvfv34xMDEzMfz7+4fh79+/6PqPAPEeoCGNcAOAmuWA1FJjG38bsBImBoaPH98zPLl1lgFk2N+/v7EZEg005BHcAGZm5ofaulYMrPwiDAz/fjNcv3CU4dvn9/h8Io9iAJB6qK1nwsAhIMHw4/tPhvs3zuA0AOQqVjY2TAPEJWUZRGQ0wIpwGQDSzPD/HwMrO4c8hhdY2TgYlHWscBrwFxioP3/8ALO5uHkwXLCUmZnVRsPIgeH3n98Mt84fwLD59+9fDD++fWEQEpVADUTkaARiG2zOBmkG0fyCQpjRiGSIOZEJ6SRGQiIXDLwBABZfjBFcAuzKAAAAAElFTkSuQmCC";
                if (deprecated) {
                    this.xlink = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAENSURBVDhPYxhm4NDebSrEYKhyVACUqAfiw2dOHPp//NDu/yeP7P1/ZP/O/0AxdHwYiOuh2iAAKCAHkvj/589/EH58/Nj/tUkJ/+cF+f9flBD7f+usqdgMkYNqhxgAsu37pw/////98//+3j3/90I17Vq24P+CuKj/e9YsQzcE1QCQ4Kd3L4EG/Pp/c8c2uAEgvHlK//+NfZ1w/t4dG7EbcO/m5f/fv37CawBI897t6zENAHkBFIDoBoCcviQ9GUzv37Xl/45Nq8EYwwAgPgwKfbABe3f9n+XrBcYg/4MCEWQzSOPa5QtAmlEDEQSAAuBoBGKwzcgYpnnTWnBAYkYjDAAlzInBUOXDAzAwAADUhHalqJBFpAAAAABJRU5ErkJggg==";
                }
            } else if (deprecated) {
                this.xlink = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAEeSURBVDhPYxhmIC0+XCU7NUYFRGcmRYJpdDYIQ5WjAqBEPRAfbqjI/1+ck/y/ojD9f1563H+g5v9AcWR8GIjrodogACggB5L4//vXfxC+sWH9/z5Vlf/1osL/axRk/+e4O2IzRA6qHWIAyLZnt6/+///3z/8Lixb8bwryBSvO8vf4Xy4t+T8z2AfdEFQDslOi/z++df7/r++f/h+dPhVuAAjnOtn+z7OzgPMjIYZhGrBs3pT/r58/wWsASHOInzumASAvtNYWYxgAcnqZsgKYjosI+O/uZA3GGAYA8eGCzASwAQdnTvtfJcAPxiD/gwIRZCtIo7G+JkgzaiCCAFAAHI1ADLYZGcM0W5sZwDSjRiMMACXMicFQ5cMDMDAAADvi/ViVyndCAAAAAElFTkSuQmCC";
            }

        } else if (role == RDFResourceRolesEnum.datatypeProperty) {
            this.xlink = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAABIUlEQVR42mNkoBAwDi4DjGYWq7AwMzP8+fuXgQko9Y/hP1gcmQ0C59J772AYANRcD6RcREVEbb5++8bAzMzE8OPHD4a/v/+gaAaCI0C8B2hII9wAoGY5ILV0X1q9zVGGxwz3fv9nOHP2LMOLZ88ZvgMN+/LtK7rLQYZEAw15BDeAlZX1YXViHMPpJy8Yjh49yvDh4wdC3pdHMYCZmflhSnIKw+o1qxnevXuHV+f3b98ZOLk4MQ0wNDAEOv0MQc1/gYHMw8sjj+EFYSFhhhcvX+DU/Of3b6DXPoLZIiIiqAaAApGTg9Pm+4/vWDV//fyF4fvPHwwfP3xkUFZRRg1E5GgEYhtcmr9//cYgKy+HGY1IhpgTCnpoQjqJkZDIBQNvAAAG2JAR8W6wDAAAAABJRU5ErkJggg==";
            if (!explicit) {
                this.xlink = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAABDElEQVR42mNkoBAwDi4D5l85oMIEFPrH8J8BRoMAMhsEEnUc7mAYANRcD6RceNi5bH79/sXAxMzE8OfvX4Z///6haAaCI0C8B2hII9wAoGY5ILU0QtvC5g3Dd4aPv/8yPHvziuHj1y8MIMN+/fuD7nKQIdFAQx7BDWBhYn5op6bN8OLbV4YHz58wfPv9k5D35VEMAPrzoZmGHsOV+7cZvvz8hlfnr9+/GdhYWTENkBWRYHj45jlBzaAw4WBlk8fwAgcrO17bQYH6AxgmIMDDwYlqACgQ2ZhYbLAEGNzmX3//MHz+8Y1BUkAYNRCRoxGIbXBpBtkuwsuPGY1IhpgTCnpoQjqJkZDIBQNvAADVzI4Rz7nPqQAAAABJRU5ErkJggg==";
                if (deprecated) {
                    this.xlink = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAEJSURBVDhPYxhmYPORfSrEYKhyVACUqAfiw/vOn/y//fjB/ztPHv6/9fiB/0AxdHwYiOuh2iAAKCAHkvj1/9f/D7++/D+3b9f/eVER/2eEBv2flZzwf+WC2dgMkYNqhxgAsu3t90//b714/H/tzKn/l03uBytes2b5/xmJcf/XbV6LbgiqASDBZ18//Ad5AaQZZgAIL5+FMBCE1+3fid2Ac/dugBXgMwCkec3+HZgGgLwAsh2kCNkAkNPnZGeA6Q2Hdv9fsWszGGMYAMSHQaEP0gSycUqAHxiD/A8KRJDNII1zN6wEqUENRBAACoCjEWQAOoZpXrh1HUwzajTCAFDCnBgMVT48AAMDAPwVcDaZM+/UAAAAAElFTkSuQmCC";
                }
            } else if (deprecated) {
                this.xlink = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAEMSURBVDhPYxhmICQvRSWiOFMFROPDUOWoAChRD8SHs9tr/8dXFf5PrC3+H1Wa/R8oho4PA3E9VBsEAAXkQBJf/3z7f/Xtg/9r50793yAr/b9aXOx/qbLi/7ggL2yGyEF0AwGIA7Lt8tv7/5cf3/0/N9j3f5KHI1hxdHTw/yIF2f+RCeHohqAaEFaQ/v/os1v/M1urwJphBoBwgq8bCt8zMQK7AX2rF4AV4DMApNk1JhjTAJAX8roaMAwAOT1fQwVM+6XF/rcBhgcIYxgAxIdjK/LAmkA2lgsLgjHI/6BAdI8LA2vUtjUDqUENRBAACoCjEWQAOoZpNnS1g2lGjUYYAEqYE4OhyocHYGAAAHg284Hj1OwvAAAAAElFTkSuQmCC";
            }

        }
    }
}
