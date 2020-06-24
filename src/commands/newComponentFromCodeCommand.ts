import * as vscode from 'vscode'
import * as ts from 'typescript'
import { parseDocument } from '../helpers/parser'
import { Attribute, generateSource } from '../helpers/generator'
import * as path from 'path'

type JsxTagElement = ts.JsxSelfClosingElement | ts.JsxOpeningElement

export class NewComponentFromCodeCommand {
  static readonly COMMAND_ID = 'power-react.newComponentFromCode'

  static activate(context: vscode.ExtensionContext) {
    context.subscriptions.push(vscode.commands.registerCommand(this.COMMAND_ID, this.invoke))
  }

  static async invoke(document: vscode.TextDocument, range: vscode.Range) {
    if (!document || !range) {
      vscode.window.showErrorMessage('This command can only be invoked through Quick Fix.')
      return
    }

    if (document.uri.scheme !== 'file') {
      vscode.window.showErrorMessage('This command can only be run on an actual file')
      return
    }

    const componentName = document.getText(range)

    const parseResult = parseDocument(document.uri)
    if (!parseResult.source) {
      vscode.window.showErrorMessage(`Fail to generate AST for ${document.uri.fsPath}`)
      return
    }

    const componentJsxNode = NewComponentFromCodeCommand.findJsxNode(componentName, parseResult.source)
    if (!componentJsxNode) {
      vscode.window.showErrorMessage(`Fail to find ${componentName} in AST tree.`)
      return
    }

    const attributes = NewComponentFromCodeCommand.collectAttributes(componentJsxNode.attributes, parseResult.checker)

    const newFilePath = await NewComponentFromCodeCommand.generateFiles(document.uri, componentName, attributes)
    await NewComponentFromCodeCommand.insertImportStatement(document, componentName)
    await vscode.window.showTextDocument(newFilePath)
  }

  static getFirstNonImportLineNumber(document: vscode.TextDocument): number {
    for (let i = 0; i < document.lineCount; i++) {
      const lineText = document.lineAt(i).text.trim()
      if (!lineText.startsWith('import')) {
        return i
      }
    }

    return document.lineCount
  }

  static async insertImportStatement(document: vscode.TextDocument, componentName: string) {
    const fileEdits = new vscode.WorkspaceEdit()
    fileEdits.insert(document.uri, new vscode.Position(this.getFirstNonImportLineNumber(document), 0), `import ${componentName} from './${componentName}'\n`)
    await vscode.workspace.applyEdit(fileEdits)
  }

  static async generateFiles(documentUri: vscode.Uri, componentName: string, attributes: Attribute[]): Promise<vscode.Uri> {
    const parentFolder = vscode.Uri.file(path.dirname(documentUri.fsPath))

    const fileEdits = new vscode.WorkspaceEdit()

    const newComponentSource = generateSource(componentName, attributes)
    const newComponentSourcePath = vscode.Uri.joinPath(parentFolder, componentName, 'index.tsx')
    fileEdits.createFile(newComponentSourcePath)
    fileEdits.insert(newComponentSourcePath, new vscode.Position(0, 0), newComponentSource)

    fileEdits.createFile(vscode.Uri.joinPath(parentFolder, componentName, 'index.scss'))

    await vscode.workspace.applyEdit(fileEdits)
    return newComponentSourcePath
  }

  static collectAttributes(attributes: ts.JsxAttributes, checker: ts.TypeChecker): Attribute[] {
    return attributes.properties.map(
      (attribute): Attribute => {
        if (attribute.name) {
          const name = attribute.name.getText()

          const attributeSymbol = checker.getSymbolAtLocation(attribute.name)
          const type = attributeSymbol ? checker.typeToString(checker.getTypeOfSymbolAtLocation(attributeSymbol, attributeSymbol.valueDeclaration!)) : 'any'
          return { name, type }
        }

        return { name: 'unknownAttribute', type: 'any' }
      }
    )
  }

  static findJsxNode(componentName: string, source: ts.SourceFile): JsxTagElement | null {
    let result = null

    const visit = (node: ts.Node) => {
      if (node.kind === ts.SyntaxKind.JsxSelfClosingElement || node.kind === ts.SyntaxKind.JsxOpeningElement) {
        if ((node as JsxTagElement).tagName.getText() === componentName) {
          result = node
          return
        }
      }

      ts.forEachChild(node, visit)
    }

    ts.forEachChild(source, visit)
    return result
  }
}
