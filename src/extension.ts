import * as vscode from 'vscode';
import { WebviewManager } from './core/services/WebviewManager';
import { CodeLensProvider } from './core/providers/CodeLensProvider';
import { TinkerRunner } from './core/services/TinkerRunner';
import { Config } from './core/utils/Config';

export class ExtensionManager {
    private webviewManager: WebviewManager;
    private tinkerRunner: TinkerRunner;
    private context: vscode.ExtensionContext;
    private config: Config;

    constructor(context: vscode.ExtensionContext) {
        this.context = context;
        this.webviewManager = new WebviewManager(context);
        this.tinkerRunner = new TinkerRunner(context, this.webviewManager);

        Config.init(context); // Initialize Config singleton
        this.config = Config.getInstance();
    }

    /**
     * Activates the extension and registers commands & providers.
     */
    public activate() {
        console.log("🚀 Laravel Tinker extension activated!");

        this.registerProviders();
        this.registerCommands();
    }

    /**
     * Registers the CodeLens provider for PHP files.
     */
    private registerProviders() {
        const provider = new CodeLensProvider();
        const providerRegistration = vscode.languages.registerCodeLensProvider(
            { language: 'php', scheme: 'file' },
            provider
        );
        this.context.subscriptions.push(providerRegistration);
    }

    /**
     * Registers VSCode commands for the extension.
     */
    private registerCommands() {
        const runPhpFileCommand = vscode.commands.registerCommand('myExtension.runPhpFile', (fileUri?: vscode.Uri) => {
            this.tinkerRunner.runPhpFile();
        });

        const clearOutputCommand = vscode.commands.registerCommand('myExtension.clearOutput', () => {
            if (this.webviewManager.outputPanel) {
                this.webviewManager.outputPanel.webview.postMessage({ command: 'clearOutput' });
            } else {
                vscode.window.showInformationMessage('No output to clear.');
            }
        });

        const focusSearchBarCommand = vscode.commands.registerCommand("myExtension.focusSearchBar", () => {
            if (this.webviewManager.outputPanel) {
                this.webviewManager.outputPanel.webview.postMessage({ command: "focusSearchBar" });
            } else {
                vscode.window.showInformationMessage("No output panel open.");
            }
        });

        const commands = [
            runPhpFileCommand,
            clearOutputCommand,
            focusSearchBarCommand
        ];

        this.context.subscriptions.push(...commands);
    }
}

/**
 * Called when the extension is activated.
 */
export function activate(context: vscode.ExtensionContext) {
    const extensionManager = new ExtensionManager(context);
    extensionManager.activate();
}

/**
 * Called when the extension is deactivated.
 */
export function deactivate() {
    //
}
