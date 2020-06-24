import * as vscode from 'vscode'
import * as ts from 'typescript'

interface ParseResult {
  source?: ts.SourceFile
  checker: ts.TypeChecker
}

export const parseDocument = (documentUri: vscode.Uri): ParseResult => {
  const documentPath = documentUri.fsPath
  const program = ts.createProgram([documentPath], { target: ts.ScriptTarget.ES5, module: ts.ModuleKind.CommonJS })

  return { source: program.getSourceFile(documentPath), checker: program.getTypeChecker() }
}
