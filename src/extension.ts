import * as vscode from "vscode";
import { GenerateMarkdownCommand } from "./commands/GenerateMarkdownCommand";
import { MarkdownWriter } from "./parser/MarkdownWriter";
import { SwiftDocumentationParser } from "./parser/SwiftDocumentationParser";
import { FileUtil } from "./util/FileUtil";

export function activate(context: vscode.ExtensionContext): void {
  const command = new GenerateMarkdownCommand(
    new SwiftDocumentationParser(),
    new MarkdownWriter(),
    new FileUtil()
  );

  context.subscriptions.push(
    vscode.commands.registerCommand("swiftDoc.generateMarkdown", (uri?: vscode.Uri) =>
      command.execute(uri)
    ),
    vscode.commands.registerCommand("swiftDoc.generateMarkdownFromContext", (uri?: vscode.Uri) =>
      command.execute(uri)
    )
  );
}

export function deactivate(): void {
  // No resources to release.
}
