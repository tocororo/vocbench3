import { RDFResourceRolesEnum, ARTResource } from "./ARTResources";

export enum Action {
    any = "any",
    creation = "creation",
    deletion = "deletion",
    update = "update",
}

export class Notification {
    resource: string;
    annotatedRes?: ARTResource;
    role: RDFResourceRolesEnum;
    action: Action;
    timestamp: Date;
    timestampLocal?: string;
}

//map between role and enabled notification action
export interface NotificationPreferences { [key: string]: Action[] }