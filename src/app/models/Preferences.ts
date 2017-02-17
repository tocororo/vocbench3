export type PropertyLevel = "USER" | "PROJECT" | "SYSTEM";
export const PropertyLevel = {
    USER: "USER" as PropertyLevel,
    PROJECT: "PROJECT" as PropertyLevel,
    SYSTEM: "SYSTEM" as PropertyLevel
}

export type ResourceViewMode = "tabbed" | "splitted";
export const ResourceViewMode = {
    tabbed: "tabbed" as ResourceViewMode,
    splitted: "splitted" as ResourceViewMode
}