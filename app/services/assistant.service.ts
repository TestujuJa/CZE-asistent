import { SettingsService, Action } from './settings.service';
import { TaskerService } from './tasker.service';
import { knownFolders } from '@nativescript/core';

export class AssistantService {
    private settingsService: SettingsService;
    private taskerService: TaskerService;

    constructor() {
        this.settingsService = new SettingsService();
        this.taskerService = new TaskerService();
    }

    public async processCommand(command: string): Promise<boolean> {
        const lowerCaseCommand = command.toLowerCase();
        const actions = this.settingsService.getActions();

        const matchedAction = actions.find(action =>
            lowerCaseCommand.includes(action.phrase.toLowerCase())
        );

        if (matchedAction) {
            if (matchedAction.type === 'webhook') {
                return this.executeWebhook(matchedAction);
            } else if (matchedAction.type === 'tasker') {
                return this.executeTaskerTask(matchedAction);
            }
        }

        console.log(`Pro příkaz "${command}" nebyla nalezena žádná akce.`);
        return false;
    }

    private executeTaskerTask(action: Action): boolean {
        console.log(`Příkaz nalezen: "${action.name}". Spouštím úlohu v Taskeru: ${action.taskName}`);
        const success = this.taskerService.executeTask(action.taskName);
        if (success) {
            this.logToFile(`[SUCCESS] ${new Date().toISOString()}: Spuštěna úloha v Taskeru: ${action.name} - ${action.taskName}`);
        } else {
            this.logToFile(`[ERROR] ${new Date().toISOString()}: Nepodařilo se spustit úlohu v Taskeru: ${action.name} - ${action.taskName}`);
        }
        return success;
    }

    private async executeWebhook(action: Action): Promise<boolean> {
        console.log(`Příkaz nalezen: "${action.name}". Volám webhook: ${action.url}`);
        try {
            const response = await fetch(action.url, {
                method: 'POST'
            });

            if (response.ok) {
                console.log(`Webhook ${action.name} úspěšně zavolán.`);
                this.logToFile(`[SUCCESS] ${new Date().toISOString()}: ${action.name} - ${action.url}`);
                return true;
            } else {
                console.error(`Chyba při volání webhooku ${action.name}: ${response.statusText}`);
                this.logToFile(`[ERROR] ${new Date().toISOString()}: ${action.name} - ${response.statusText}`);
                return false;
            }
        } catch (error) {
            console.error(`Chyba sítě při volání webhooku ${action.name}:`, error);
            this.logToFile(`[NETWORK ERROR] ${new Date().toISOString()}: ${action.name} - ${error}`);
            return false;
        }
    }

    private logToFile(message: string) {
        const documents = knownFolders.documents();
        const file = documents.getFile("webhook_log.txt");
        file.append(message + "\n");
    }
}