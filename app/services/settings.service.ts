import { ApplicationSettings } from '@nativescript/core';

export interface Webhook {
    name: string;
    phrase: string;
    url: string;
}

export interface AppSettings {
    wakePhrases: string[];
    feedbackEnabled: boolean;
    sensitivity: number;
    webhooks: Webhook[];
}

export class SettingsService {
    private readonly SETTINGS_KEY = 'voice_assistant_settings';
    private readonly DEFAULT_SETTINGS: AppSettings = {
        wakePhrases: ['Hey asistente', 'Pomoc'],
        feedbackEnabled: true,
        sensitivity: 0.5,
        webhooks: [
            { name: "Světlo v obýváku", phrase: "rozsviť světlo v obýváku", url: "https://example.com/webhook/living-room-light-on" },
            { name: "Televize", phrase: "zapni televizi", url: "https://example.com/webhook/tv-on" }
        ]
    };

    public getSettings(): AppSettings {
        const settings = ApplicationSettings.getString(this.SETTINGS_KEY);
        if (settings) {
            const parsed = JSON.parse(settings);
            // Zajistíme, že i starší verze nastavení budou mít pole webhooks
            if (!parsed.webhooks) {
                parsed.webhooks = this.DEFAULT_SETTINGS.webhooks;
            }
            return parsed;
        }
        return this.DEFAULT_SETTINGS;
    }

    private saveSettings(settings: AppSettings) {
        ApplicationSettings.setString(this.SETTINGS_KEY, JSON.stringify(settings));
    }

    public updateWakePhrases(phrases: string[]) {
        const settings = this.getSettings();
        settings.wakePhrases = phrases;
        this.saveSettings(settings);
    }

    public updateFeedback(enabled: boolean) {
        const settings = this.getSettings();
        settings.feedbackEnabled = enabled;
        this.saveSettings(settings);
    }

    public updateSensitivity(value: number) {
        const settings = this.getSettings();
        settings.sensitivity = value;
        this.saveSettings(settings);
    }

    public getWebhooks(): Webhook[] {
        return this.getSettings().webhooks;
    }

    public addWebhook(webhook: Webhook) {
        const settings = this.getSettings();
        settings.webhooks.push(webhook);
        this.saveSettings(settings);
    }

    public updateWebhook(index: number, webhook: Webhook) {
        const settings = this.getSettings();
        if (index >= 0 && index < settings.webhooks.length) {
            settings.webhooks[index] = webhook;
            this.saveSettings(settings);
        }
    }

    public deleteWebhook(index: number) {
        const settings = this.getSettings();
        if (index >= 0 && index < settings.webhooks.length) {
            settings.webhooks.splice(index, 1);
            this.saveSettings(settings);
        }
    }
}