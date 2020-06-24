import * as vscode from 'vscode'
import { NewComponentFromCodeProvider } from './providers/newComponentFromCodeProvider'
import { NewComponentFromCodeCommand } from './commands/newComponentFromCodeCommand'

export function activate(context: vscode.ExtensionContext) {
  NewComponentFromCodeCommand.activate(context)
  NewComponentFromCodeProvider.activate(context)
}

// this method is called when your extension is deactivated
export function deactivate() {}
