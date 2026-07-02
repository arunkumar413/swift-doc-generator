# Swift Markdown Documentation Generator

Generate Markdown documentation from Swift multiline comments directly inside Visual Studio Code. 


If you're a learning the language and wants to create notes, tutorial for your library this is for you. 

Just put the markdown content in the multi-line comment, right click in the file editor and click on the **Generate Markdown Documentation** option. It'll create a markdown file. No need to context switch between the swift file and markdown file for creating the notes/tutorial.

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

`npm run package` will create a `.vsix` extension package. 

1) Go to vs code
2) Click on the extensions Icon
3) Select `Install from VSIX` otpion and select the packaged `.vsix` file to install the extension.


## Examples

See `examples/Person.swift` and `examples/Person.md`.
