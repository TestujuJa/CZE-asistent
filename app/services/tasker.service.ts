import { Application, Utils } from "@nativescript/core";
declare var android: any;

export class TaskerService {

    private readonly TASKER_PACKAGE_NAME = "net.dinglisch.android.taskerm";
    private readonly ACTION_EXECUTE_TASK = "net.dinglisch.android.taskerm.ACTION_TASK";
    private readonly EXTRA_TASK_NAME = "task_name";

    /**
     * Zjistí, zda je Tasker nainstalován v zařízení.
     */
    public isTaskerInstalled(): boolean {
        if (!Application.android) {
            return false;
        }
        const context = Application.android.context;
        const packageManager = context.getPackageManager();
        try {
            packageManager.getPackageInfo(this.TASKER_PACKAGE_NAME, 0);
            return true;
        } catch (e) {
            return false;
        }
    }

    /**
     * Spustí zadanou úlohu v Taskeru.
     * @param taskName Název úlohy, která se má spustit.
     * @returns Vrací `true`, pokud byl příkaz k spuštění úspěšně odeslán, jinak `false`.
     */
    public executeTask(taskName: string): boolean {
        if (!Application.android || !this.isTaskerInstalled()) {
            console.log("Tasker není nainstalován nebo aplikace neběží na Androidu.");
            return false;
        }

        try {
            const context = Application.android.context;
            const intent = new android.content.Intent(this.ACTION_EXECUTE_TASK);
            intent.putExtra(this.EXTRA_TASK_NAME, taskName);
            // Přidáme flag, protože aktivitu voláme z vnějšku (mimo naši hlavní aktivitu)
            intent.addFlags(android.content.Intent.FLAG_ACTIVITY_NEW_TASK);

            context.startActivity(intent);

            console.log(`Příkaz ke spuštění úlohy "${taskName}" v Taskeru byl odeslán.`);
            return true;
        } catch (error) {
            console.error(`Nepodařilo se odeslat příkaz do Taskeru pro úlohu "${taskName}".`, error);
            return false;
        }
    }
}
