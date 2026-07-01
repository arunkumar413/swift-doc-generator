import type { Document } from "../model/Document";
import type { Section } from "../model/Section";

export interface SwiftDocumentationParserOptions {
  includeImports?: boolean;
}

type ScannerState = "Normal" | "InsideMultilineComment" | "EndComment";

interface StringContext {
  delimiter: '"' | '"""';
  escaped: boolean;
}

export class SwiftDocumentationParserError extends Error {
  public constructor(message: string) {
    super(message);
    this.name = "SwiftDocumentationParserError";
  }
}

export class SwiftDocumentationParser {
  public parse(source: string, options: SwiftDocumentationParserOptions = {}): Document {
    const sections: Section[] = [];
    let state: ScannerState = "Normal";
    let codeBuffer = "";
    let commentBuffer = "";
    let pendingMarkdown: string | undefined;
    let stringContext: StringContext | undefined;
    let insideLineComment = false;
    const includeImports = options.includeImports ?? true;

    for (let index = 0; index < source.length; index += 1) {
      const current = source.charAt(index);
      const next = source.charAt(index + 1);
      const afterNext = source.charAt(index + 2);

      if (state === "InsideMultilineComment") {
        if (current === "*" && next === "/") {
          state = "EndComment";
          index += 1;
          pendingMarkdown = normalizeComment(commentBuffer);
          commentBuffer = "";
          continue;
        }

        commentBuffer += current;
        continue;
      }

      if (state === "EndComment") {
        state = "Normal";
      }

      if (insideLineComment) {
        codeBuffer += current;
        if (current === "\n") {
          insideLineComment = false;
        }
        continue;
      }

      if (stringContext !== undefined) {
        codeBuffer += current;
        if (
          stringContext.delimiter === '"""' &&
          current === '"' &&
          next === '"' &&
          afterNext === '"'
        ) {
          codeBuffer += next + afterNext;
          index += 2;
          stringContext = undefined;
          continue;
        }

        stringContext = advanceStringContext(stringContext, current);
        continue;
      }

      if (current === "/" && next === "/") {
        insideLineComment = true;
        codeBuffer += current;
        continue;
      }

      if (current === '"') {
        const delimiter = next === '"' && afterNext === '"' ? '"""' : '"';
        stringContext = { delimiter, escaped: false };
        codeBuffer += current;
        if (delimiter === '"""') {
          codeBuffer += next + afterNext;
          index += 2;
        }
        continue;
      }

      if (current === "/" && next === "*") {
        if (pendingMarkdown !== undefined) {
          sections.push({
            markdown: pendingMarkdown,
            code: normalizeCode(codeBuffer, includeImports)
          });
        }

        pendingMarkdown = undefined;
        codeBuffer = "";
        state = "InsideMultilineComment";
        index += 1;
        continue;
      }

      if (pendingMarkdown !== undefined) {
        codeBuffer += current;
      }
    }

    if (state === "InsideMultilineComment") {
      throw new SwiftDocumentationParserError("Unterminated multiline comment.");
    }

    if (pendingMarkdown !== undefined) {
      sections.push({
        markdown: pendingMarkdown,
        code: normalizeCode(codeBuffer, includeImports)
      });
    }

    return { sections };
  }
}

function advanceStringContext(context: StringContext, current: string): StringContext | undefined {
  if (context.delimiter === '"""') {
    return context;
  }

  if (context.escaped) {
    return { ...context, escaped: false };
  }

  if (current === "\\") {
    return { ...context, escaped: true };
  }

  return current === '"' ? undefined : context;
}

function normalizeComment(comment: string): string {
  return removeCommonIndent(trimBlankLines(comment));
}

function normalizeCode(code: string, includeImports: boolean): string {
  const trimmed = trimBlankLines(code);
  const withoutImports = includeImports
    ? trimmed
    : trimmed
        .split(/\r?\n/u)
        .filter((line) => !line.trimStart().startsWith("import "))
        .join("\n");

  return removeIndentFromFirstLine(withoutImports).trimEnd();
}

function trimBlankLines(value: string): string {
  const normalized = value.replace(/\r\n?/gu, "\n");
  const lines = normalized.split("\n");

  while (lines.length > 0 && isBlank(lines[0] as string)) {
    lines.shift();
  }

  while (lines.length > 0 && isBlank(lines[lines.length - 1] as string)) {
    lines.pop();
  }

  return lines.join("\n");
}

function removeCommonIndent(value: string): string {
  const lines = value.split("\n");
  const indents = lines
    .filter((line) => !isBlank(line))
    .map((line) => leadingWhitespace(line).length);
  const indent = indents.length > 0 ? Math.min(...indents) : 0;

  if (indent === 0) {
    return value.trimEnd();
  }

  return lines
    .map((line) => (line.length >= indent ? line.slice(indent) : line))
    .join("\n")
    .trimEnd();
}

function removeIndentFromFirstLine(value: string): string {
  const lines = value.split("\n");
  const firstCodeLine = lines.find((line) => !isBlank(line));
  const indent = firstCodeLine === undefined ? "" : leadingWhitespace(firstCodeLine);

  if (indent.length === 0) {
    return value;
  }

  return lines
    .map((line) => (line.startsWith(indent) ? line.slice(indent.length) : line))
    .join("\n");
}

function leadingWhitespace(value: string): string {
  const match = /^[\t ]*/u.exec(value);
  return match === null ? "" : match[0];
}

function isBlank(value: string): boolean {
  return value.trim().length === 0;
}
