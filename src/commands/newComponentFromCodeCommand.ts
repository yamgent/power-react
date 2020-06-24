import * as vscode from 'vscode'

export class NewComponentFromCodeCommand {
  static readonly COMMAND_ID = 'power-react.newComponentFromCode'

  static activate(context: vscode.ExtensionContext) {
    context.subscriptions.push(vscode.commands.registerCommand(this.COMMAND_ID, this.invoke))
  }

  static invoke() {
    // TODO
    vscode.window.showInformationMessage('Hi')
  }
}
