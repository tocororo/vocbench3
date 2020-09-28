import { RDFResourceRolesEnum } from "./ARTResources";

export enum Action {
    any = "any",
    creation = "creation",
    deletion = "deletion",
    update = "update",
}

export class Notification {
    resource: string;
    role: RDFResourceRolesEnum;
    action: Action;
    timestamp: Date;
}

export class CronDefinition {
    expression: string;
    zone?: string;
}

//map between role and enabled notification action
export interface NotificationPreferences { [key: string]: Action[] }