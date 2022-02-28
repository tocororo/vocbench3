import { ARTNode, ARTResource, ARTURIResource } from "src/app/models/ARTResources";

export interface ChartData {
    name: string;
    value: number;
    extra?: {
        valueDatatype: string,
        nameResource: ARTNode
    };
}

export interface ChartSeries {
    resource: ARTResource;
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

    public static getDataItem(dataList: ChartData[], data: ChartData) {
        return dataList.find(d => this.chartDataEquals(d, data));
    }

    public static chartDataEquals(d1: ChartData, d2: ChartData): boolean {
        // console.log(d1, d2);
        //return true if the elements have same name, value, extra.resource (if any)
        let r1 = d1.extra && d1.extra.nameResource ? d1.extra.nameResource : null;
        let r2 = d2.extra && d2.extra.nameResource ? d2.extra.nameResource : null;
        return d1.name == d2.name && d1.value == d2.value && (r1 == null || r2 == null || r1.equals(r2));
    }
}
