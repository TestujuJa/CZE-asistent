import { ApplicationSettings } from '@nativescript/core';

export interface AppSettings {
    wakePhrases: string[];
    feedbackEnabled: boolean;
    sensitivity: number;
}

export class SettingsService {
    private readonly SETTINGS_KEY = 'voice_assistant_settings';
    private readonly DEFAULT_SETTINGS: AppSettings = {
        wakePhrases: ['Hey asistente', 'Pomoc'],
        feedbackEnabled: true,
        sensitivity: 0.5
    };

    public getSettings(): AppSettings {
        const settings = ApplicationSettings.getString(this.SETTINGS_KEY);
        return settings ? JSON.parse(settings) : this.DEFAULT_SETTINGS;
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
}