export interface ChartData {
    name: string;
    value: number;
    extra?: {[key:string]:any};
}

export interface ChartSeries {
    name: string;
    series: ChartData[];
}

export enum ColorSetEnum {
    vivid = "vivid",
    natural = "natural",
    cool = "cool",
    fire = "fire",
    solar = "solar",
    air = "air",
    aqua = "aqua",
    flame = "flame",
    ocean = "ocean",
    forest = "forest",
    horizon = "horizon",
    neons = "neons",
    picnic = "picnic",
    night = "night",
    nightLights = "nightLights",
}

export interface ColorSet {
    name?: string;
    selectable?: boolean;
    group?: string;
    domain: string[];
}

export class NgxChartsUtils {
    /**
     * @param numOfSteps: Total number steps to get color, means total colors
     * @param step: The step number, means the order of the color
     */
    static getRandColor(numOfSteps: number, step: number) {
        return '#'+(0x1000000+Math.random()*0xffffff).toString(16).substring(1,7)
        // // This function generates vibrant, "evenly spaced" colours (i.e. no clustering). This is ideal for creating easily distinguishable vibrant markers in Google Maps and other apps.
        // // Adam Cole, 2011-Sept-14
        // // HSV to RBG adapted from: http://mjijackson.com/2008/02/rgb-to-hsl-and-rgb-to-hsv-color-model-conversion-algorithms-in-javascript
        // let r, g, b;
        // let h = step / numOfSteps;
        // let i = ~~(h * 6);
        // let f = h * 6 - i;
        // let q = 1 - f;
        // switch (i % 6) {
        //     case 0: r = 1; g = f; b = 0; break;
        //     case 1: r = q; g = 1; b = 0; break;
        //     case 2: r = 0; g = 1; b = f; break;
        //     case 3: r = 0; g = q; b = 1; break;
        //     case 4: r = f; g = 0; b = 1; break;
        //     case 5: r = 1; g = 0; b = q; break;
        // }
        // let c = "#" + ("00" + (~ ~(r * 255)).toString(16)).slice(-2) + ("00" + (~ ~(g * 255)).toString(16)).slice(-2) + ("00" + (~ ~(b * 255)).toString(16)).slice(-2);
        // return (c);
    }
}
