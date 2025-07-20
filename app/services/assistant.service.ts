import { SettingsService, Webhook } from './settings.service';
import { knownFolders, path } from '@nativescript/core';

export class AssistantService {
    private settingsService: SettingsService;

    constructor() {
        this.settingsService = new SettingsService();
    }

    public async processCommand(command: string): Promise<boolean> {
        const lowerCaseCommand = command.toLowerCase();
        const webhooks = this.settingsService.getWebhooks();

        const matchedWebhook = webhooks.find(webhook =>
            lowerCaseCommand.includes(webhook.phrase.toLowerCase())
        );

        if (matchedWebhook) {
            console.log(`Příkaz nalezen: "${matchedWebhook.name}". Volám webhook: ${matchedWebhook.url}`);
            try {
                const response = await fetch(matchedWebhook.url, {
                    method: 'POST' // Předpokládáme POST, ale může být i GET
                });

                if (response.ok) {
                    console.log(`Webhook ${matchedWebhook.name} úspěšně zavolán.`);
                    this.logToFile(`[SUCCESS] ${new Date().toISOString()}: ${matchedWebhook.name} - ${matchedWebhook.url}`);
                    return true;
                } else {
                    console.error(`Chyba při volání webhooku ${matchedWebhook.name}: ${response.statusText}`);
                    this.logToFile(`[ERROR] ${new Date().toISOString()}: ${matchedWebhook.name} - ${response.statusText}`);
                    return false;
                }
            } catch (error) {
                console.error(`Chyba sítě při volání webhooku ${matchedWebhook.name}:`, error);
                this.logToFile(`[NETWORK ERROR] ${new Date().toISOString()}: ${matchedWebhook.name} - ${error}`);
                return false;
            }
        } else {
            console.log(`Pro příkaz "${command}" nebyl nalezen žádný webhook.`);
            return false;
        }
    }

    private logToFile(message: string) {
        const documents = knownFolders.documents();
        const file = documents.getFile("webhook_log.txt");
        file.writeTextSync(message + "\n", null, 'utf8');
    }
}