import { PluginConfiguration } from "./Plugins";

export class CollaborationCtx {

    public static jiraFactoryId: string = "it.uniroma2.art.semanticturkey.plugin.impls.collaboration.JiraBackendFactory";

    /* collaboration system could be enabled and configured (both settings and preferences) but not working:
    * settings or preferences could be invalid (invalid credentials or wrong serverURL), or the server could be unreachable */
    private working: boolean = false;
    private enabled: boolean = false;
    private linked: boolean = false; //if a collaboration project is linked to the VB project
    private settings: PluginConfiguration;
    private preferences: PluginConfiguration;

    public isConfigured(): boolean {
        //configured if both settings and preferences are configured
        return this.isSettingsConfigured() && this.isPreferencesConfigured();
    }

    public isSettingsConfigured(): boolean {
        return this.settings != null && !this.settings.requireConfiguration();
    }
    public isPreferencesConfigured(): boolean {
        return this.preferences != null && !this.preferences.requireConfiguration();
    }

    public isEnabled(): boolean {
        return this.enabled;
    }
    public setEnabled(enabled: boolean) {
        this.enabled = enabled;
    }

    public isWorking(): boolean {
        return this.working;
    }
    public setWorking(working: boolean) {
        this.working = working;
    }

    public isLinked(): boolean {
        return this.linked;
    }
    public setLinked(linked: boolean) {
        this.linked = linked;
    }
    
    public setSettings(settings: PluginConfiguration) {
        this.settings = settings;
    }
    public getSettings(): PluginConfiguration {
        return this.settings;
    }

    public setPreferences(preferences: PluginConfiguration) {
        this.preferences = preferences;
    }
    public getPreferences(): PluginConfiguration {
        return this.preferences;
    }

    public reset() {
        this.working = false;
        this.enabled = false;
        this.linked = false;
        this.settings = null;
        this.preferences = null;
    }
}

export class Issue {
    id: string;
    key: string;
    status: string;
    url: string;
    labels: string[];
    resolution: string;
    category: string;
}