# Swift Markdown Documentation Generator

Generate Markdown documentation from Swift multiline comments directly inside Visual Studio Code.

## Features

- Explorer context menu for `.swift` files: **Generate Markdown Documentation**
- Editor context menu for Swift files: **Generate Markdown Documentation**
- Command Palette command: **Swift Docs: Generate Markdown**
- Generates `FileName.md` next to `FileName.swift` by default
- Optional overwrite, output folder, import inclusion, generated file opening, and code fence language settings

## How It Works

The extension scans Swift source character by character and treats every multiline comment block as Markdown:

```swift
/*
# Button

Creates a button.
*/

public struct Button {}
```

Generates:

````markdown
# Button

Creates a button.

```swift
public struct Button {}
```
````

Each documentation block owns the Swift code that follows it until the next documentation block or the end of the file.

## Settings

| Setting                      | Default   | Description                                                         |
| ---------------------------- | --------- | ------------------------------------------------------------------- |
| `swiftDoc.outputFolder`      | `""`      | Optional output folder. Empty writes next to the Swift source file. |
| `swiftDoc.overwrite`         | `false`   | Overwrite existing Markdown without confirmation.                   |
| `swiftDoc.openAfterGenerate` | `true`    | Open the generated Markdown file after generation.                  |
| `swiftDoc.includeImports`    | `true`    | Include Swift `import` statements in generated code fences.         |
| `swiftDoc.codeFenceLanguage` | `"swift"` | Language identifier for Markdown code fences.                       |

## Development

```bash
npm install
npm run compile
npm test
npm run lint
```

Package for the Marketplace:

```bash
npm run package
```

## Examples

See `examples/Person.swift` and `examples/Person.md`.
