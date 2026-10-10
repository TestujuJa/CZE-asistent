import { SettingsService, Action } from './settings.service';
import { TaskerService } from './tasker.service';
import { HistoryService, CommandStatus } from './history.service';
import { TextToSpeechService } from './text-to-speech.service';
import { knownFolders } from '@nativescript/core';

export class AssistantService {
    private settingsService: SettingsService;
    private taskerService: TaskerService;
    private historyService: HistoryService;
    private ttsService: TextToSpeechService;

    constructor() {
        this.settingsService = new SettingsService();
        this.taskerService = new TaskerService();
        this.historyService = new HistoryService();
        this.ttsService = new TextToSpeechService();
    }

    public async processCommand(command: string): Promise<boolean> {
        const lowerCaseCommand = command.toLowerCase();
        const actions = this.settingsService.getActions();

        const matchedAction = actions.find(action =>
            lowerCaseCommand.includes(action.phrase.toLowerCase())
        );

        if (matchedAction) {
            if (matchedAction.type === 'webhook') {
                const success = await this.executeWebhook(matchedAction);
                if (success && this.ttsService.isEnabled()) {
                    await this.ttsService.speak(`Akce ${matchedAction.name} byla úspěšně provedena.`);
                }
                return success;
            } else if (matchedAction.type === 'tasker') {
                const success = this.executeTaskerTask(matchedAction);
                if (success && this.ttsService.isEnabled()) {
                    await this.ttsService.speak(`Akce ${matchedAction.name} byla úspěšně provedena.`);
                }
                return success;
            }
        }

        console.log(`Pro příkaz "${command}" nebyla nalezena žádná akce.`);
        if (this.ttsService.isEnabled()) {
            await this.ttsService.speak("Bohužel jsem nenašel odpovídající akci.");
        }
        return false;
    }

    private executeTaskerTask(action: Action): boolean {
        console.log(`Příkaz nalezen: "${action.name}". Spouštím úlohu v Taskeru: ${action.taskName}`);
        const success = this.taskerService.executeTask(action.taskName);
        const status: CommandStatus = success ? 'success' : 'error';
        this.historyService.addCommand(
            action.phrase,
            action.name,
            'tasker',
            status,
            success ? undefined : `Nepodařilo se spustit úlohu: ${action.taskName}`
        );
        if (success) {
            this.logToFile(`[SUCCESS] ${new Date().toISOString()}: Spuštěna úloha v Taskeru: ${action.name} - ${action.taskName}`);
        } else {
            this.logToFile(`[ERROR] ${new Date().toISOString()}: Nepodařilo se spustit úlohu v Taskeru: ${action.name} - ${action.taskName}`);
            if (this.ttsService.isEnabled()) {
                this.ttsService.speak(`Nepodařilo se spustit úlohu ${action.name} v Taskeru.`);
            }
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
                this.historyService.addCommand(
                    action.phrase,
                    action.name,
                    'webhook',
                    'success'
                );
                return true;
            } else {
                console.error(`Chyba při volání webhooku ${action.name}: ${response.statusText}`);
                this.logToFile(`[ERROR] ${new Date().toISOString()}: ${action.name} - ${response.statusText}`);
                this.historyService.addCommand(
                    action.phrase,
                    action.name,
                    'webhook',
                    'error',
                    response.statusText
                );
                return false;
            }
        } catch (error) {
            console.error(`Chyba sítě při volání webhooku ${action.name}:`, error);
            this.logToFile(`[NETWORK ERROR] ${new Date().toISOString()}: ${action.name} - ${error}`);
            this.historyService.addCommand(
                action.phrase,
                action.name,
                'webhook',
                'network_error',
                error instanceof Error ? error.message : String(error)
            );
            return false;
        }
    }

    private logToFile(message: string) {
        const documents = knownFolders.documents();
        const file = documents.getFile("webhook_log.txt");
        file.readText().then((content) => {
            file.writeText(content + message + "\n");
        });
    }
}