import * as vscode from 'vscode'
import { NewComponentFromCodeCommand } from '../commands/newComponentFromCodeCommand'

export class NewComponentFromCodeProvider implements vscode.CodeActionProvider {
  static activate(context: vscode.ExtensionContext) {
    context.subscriptions.push(
      vscode.languages.registerCodeActionsProvider('typescriptreact', new NewComponentFromCodeProvider(), {
        providedCodeActionKinds: [vscode.CodeActionKind.QuickFix]
      })
    )
  }

  provideCodeActions(
    document: vscode.TextDocument,
    range: vscode.Range,
    context: vscode.CodeActionContext,
    token: vscode.CancellationToken
  ): vscode.CodeAction[] {
    return context.diagnostics
      .filter((diagnostic) => diagnostic.source === 'ts' && diagnostic.code === 2304)
      .map((diagnostic) => this.createCommandCodeAction(document, diagnostic))
  }

  private createCommandCodeAction(document: vscode.TextDocument, diagnostic: vscode.Diagnostic): vscode.CodeAction {
    const componentName = document.getText(diagnostic.range)

    const actionTitle = `PowerReact: Create new component <${componentName}>`
    const action = new vscode.CodeAction(actionTitle, vscode.CodeActionKind.QuickFix)
    action.command = { command: NewComponentFromCodeCommand.COMMAND_ID, title: actionTitle }
    action.diagnostics = [diagnostic]
    return action
  }
}
