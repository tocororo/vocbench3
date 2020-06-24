export enum Action {
    any = "any",
    creation = "creation",
    deletion = "deletion",
    update = "update",
}

//map between role and enabled notification action
export interface NotificationPreferences { [key: string]: Action[] }