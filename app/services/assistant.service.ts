import { SettingsService, Action } from './settings.service';
import { TaskerService } from './tasker.service';
import { HistoryService, CommandStatus } from './history.service';
import { TextToSpeechService } from './text-to-speech.service';
import { CacheService } from './cache.service';
import { OfflineService } from './offline.service';
import { NotificationService } from './notification.service';
import { knownFolders } from '@nativescript/core';

export class AssistantService {
    private settingsService: SettingsService;
    private taskerService: TaskerService;
    private historyService: HistoryService;
    private ttsService: TextToSpeechService;
    private cacheService: CacheService;
    private offlineService: OfflineService;
    private notificationService: NotificationService;

    constructor() {
        this.settingsService = new SettingsService();
        this.taskerService = new TaskerService();
        this.historyService = new HistoryService();
        this.ttsService = new TextToSpeechService();
        this.cacheService = new CacheService();
        this.offlineService = new OfflineService();
        this.notificationService = new NotificationService();
    }

    public async processCommand(command: string): Promise<boolean> {
        const lowerCaseCommand = command.toLowerCase();
        const actions = this.settingsService.getActions();

        const matchedAction = actions.find(action =>
            lowerCaseCommand.includes(action.phrase.toLowerCase())
        );

        if (matchedAction) {
            // Check if we're offline
            if (!this.isOnline()) {
                this.offlineService.queueCommand(
                    command,
                    matchedAction.name,
                    matchedAction.type,
                    matchedAction.url,
                    matchedAction.taskName
                );
                
                if (this.notificationService.isEnabled()) {
                    this.notificationService.showWarning(
                        'Offline režim',
                        `Příkaz "${command}" byl uložen do fronty pro pozdější zpracování.`
                    );
                }
                
                if (this.ttsService.isEnabled()) {
                    await this.ttsService.speak("Jsem offline. Příkaz byl uložen do fronty.");
                }
                
                return false;
            }

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

    private isOnline(): boolean {
        try {
            if (global.android) {
                const connectivityManager = global.android.context?.getSystemService(
                    global.android.context?.CONNECTIVITY_SERVICE
                );
                if (connectivityManager) {
                    const networkInfo = connectivityManager.getActiveNetworkInfo();
                    return networkInfo != null && networkInfo.isConnected();
                }
            }
            // Fallback - assume online if we can't check
            return true;
        } catch (error) {
            console.error('Error checking connectivity:', error);
            return true; // Assume online on error
        }
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
            if (this.notificationService.isEnabled()) {
                this.notificationService.showSuccess(
                    'Úspěch',
                    `Akce ${action.name} byla úspěšně provedena.`
                );
            }
        } else {
            this.logToFile(`[ERROR] ${new Date().toISOString()}: Nepodařilo se spustit úlohu v Taskeru: ${action.name} - ${action.taskName}`);
            if (this.notificationService.isEnabled()) {
                this.notificationService.showError(
                    'Chyba',
                    `Nepodařilo se spustit úlohu ${action.name} v Taskeru.`
                );
            }
            if (this.ttsService.isEnabled()) {
                this.ttsService.speak(`Nepodařilo se spustit úlohu ${action.name} v Taskeru.`);
            }
        }
        return success;
    }

    private async executeWebhook(action: Action): Promise<boolean> {
        console.log(`Příkaz nalezen: "${action.name}". Volám webhook: ${action.url}`);
        
        // Check cache first
        const cacheKey = `webhook_${action.url}`;
        const cachedResponse = this.cacheService.getWebhookCache(action.url);
        
        if (cachedResponse) {
            console.log(`Using cached response for ${action.url}`);
            this.historyService.addCommand(
                action.phrase,
                action.name,
                'webhook',
                'success'
            );
            return true;
        }
        
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
                
                // Cache successful response
                this.cacheService.setWebhookCache(action.url, {
                    status: response.status,
                    statusText: response.statusText
                }, 300000); // Cache for 5 minutes
                
                if (this.notificationService.isEnabled()) {
                    this.notificationService.showSuccess(
                        'Úspěch',
                        `Webhook ${action.name} byl úspěšně zavolán.`
                    );
                }
                
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
                
                if (this.notificationService.isEnabled()) {
                    this.notificationService.showError(
                        'Chyba webhooku',
                        `Nepodařilo se zavolat webhook ${action.name}: ${response.statusText}`
                    );
                }
                
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
            
            if (this.notificationService.isEnabled()) {
                this.notificationService.showError(
                    'Síťová chyba',
                    `Chyba sítě při volání webhooku ${action.name}`
                );
            }
            
            return false;
        }
    }

    public async processOfflineQueue(): Promise<{ processed: number; failed: number }> {
        if (this.isOnline()) {
            return this.offlineService.processAllCommands(
                async (url: string) => {
                    try {
                        const response = await fetch(url, { method: 'POST' });
                        return response.ok;
                    } catch {
                        return false;
                    }
                },
                (taskName: string) => this.taskerService.executeTask(taskName)
            );
        }
        return { processed: 0, failed: 0 };
    }

    public getOfflineQueueCount(): number {
        return this.offlineService.getQueueCount();
    }

    public isOfflineModeActive(): boolean {
        return this.offlineService.isOfflineModeActive();
    }

    private logToFile(message: string) {
        const documents = knownFolders.documents();
        const file = documents.getFile("webhook_log.txt");
        file.readText().then((content) => {
            file.writeText(content + message + "\n");
        });
    }
}
