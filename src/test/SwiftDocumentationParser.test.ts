import { MarkdownWriter } from "../parser/MarkdownWriter";
import {
  SwiftDocumentationParser,
  SwiftDocumentationParserError
} from "../parser/SwiftDocumentationParser";

describe("SwiftDocumentationParser", () => {
  const parser = new SwiftDocumentationParser();

  it("returns no sections for an empty file", () => {
    expect(parser.parse("")).toEqual({ sections: [] });
  });

  it("parses one documentation block with following code", () => {
    expect(
      parser.parse(`
/*
# Person

Represents a person.
*/

public struct Person {}
`)
    ).toEqual({
      sections: [
        {
          markdown: "# Person\n\nRepresents a person.",
          code: "public struct Person {}"
        }
      ]
    });
  });

  it("associates multiple documentation blocks with the code that follows each block", () => {
    const document = parser.parse(`
/*
# Button

Creates a button.
*/

public struct Button {

    /*
    ## Tap

    Called when tapped.
    */

    func tap() {

    }
}
`);

    expect(document.sections).toEqual([
      {
        markdown: "# Button\n\nCreates a button.",
        code: "public struct Button {"
      },
      {
        markdown: "## Tap\n\nCalled when tapped.",
        code: "func tap() {\n\n}\n}"
      }
    ]);
  });

  it("preserves nested braces in code blocks", () => {
    const document = parser.parse(`
/*
# Logic
*/
func run() {
    if true {
        print("yes")
    }
}
`);

    expect(document.sections[0]?.code).toBe(
      'func run() {\n    if true {\n        print("yes")\n    }\n}'
    );
  });

  it("trims blank lines around markdown and code", () => {
    const document = parser.parse(`
/*

# Title

*/


let value = 1

`);

    expect(document.sections[0]).toEqual({
      markdown: "# Title",
      code: "let value = 1"
    });
  });

  it("keeps UTF-8 content intact", () => {
    const document = parser.parse(`
/*
# Café

Uses emoji-free Unicode like naïve and 東京.
*/
struct Café {}
`);

    expect(document.sections[0]?.markdown).toContain("東京");
    expect(document.sections[0]?.code).toBe("struct Café {}");
  });

  it("dedents comments with indentation while preserving relative indentation", () => {
    const document = parser.parse(`
    /*
        # Indented

            let example = true
    */
    let value = 1
`);

    expect(document.sections[0]?.markdown).toBe("# Indented\n\n    let example = true");
    expect(document.sections[0]?.code).toBe("let value = 1");
  });

  it("supports comments immediately followed by EOF", () => {
    expect(parser.parse("/*\n# Done\n*/")).toEqual({
      sections: [
        {
          markdown: "# Done",
          code: ""
        }
      ]
    });
  });

  it("ignores multiline comment markers inside strings", () => {
    const document = parser.parse(`
/*
# Pattern
*/
let pattern = "/* not documentation */"
let escaped = "quote: \\" and marker /* still string */"
let raw = """
/* also not documentation */
"""
`);

    expect(document.sections).toHaveLength(1);
    expect(document.sections[0]?.code).toContain('let pattern = "/* not documentation */"');
    expect(document.sections[0]?.code).toContain(
      'let escaped = "quote: \\" and marker /* still string */"'
    );
    expect(document.sections[0]?.code).toContain("/* also not documentation */");
  });

  it("supports empty documentation blocks and empty code", () => {
    expect(parser.parse("/**/")).toEqual({
      sections: [
        {
          markdown: "",
          code: ""
        }
      ]
    });
  });

  it("ignores multiline comment markers inside line comments", () => {
    const document = parser.parse(`
/*
# Pattern
*/
// /* not documentation */
let value = 1
`);

    expect(document.sections).toHaveLength(1);
    expect(document.sections[0]?.code).toContain("// /* not documentation */");
  });

  it("can exclude import statements from code blocks", () => {
    const document = parser.parse(
      `
/*
# Person
*/
import Foundation
struct Person {}
`,
      { includeImports: false }
    );

    expect(document.sections[0]?.code).toBe("struct Person {}");
  });

  it("throws a parser error for unterminated multiline comments", () => {
    expect(() => parser.parse("/*\n# Broken")).toThrow(SwiftDocumentationParserError);
  });
});

describe("MarkdownWriter", () => {
  it("renders markdown and Swift code fences without trailing whitespace", () => {
    const writer = new MarkdownWriter();

    expect(
      writer.write({
        sections: [
          {
            markdown: "# Person",
            code: "struct Person {}"
          },
          {
            markdown: "## Name",
            code: 'let name = "Ana"'
          }
        ]
      })
    ).toBe(
      '# Person\n\n```swift\nstruct Person {}\n```\n\n## Name\n\n```swift\nlet name = "Ana"\n```'
    );
  });

  it("uses a custom code fence language", () => {
    const writer = new MarkdownWriter();

    expect(
      writer.write(
        {
          sections: [
            {
              markdown: "# Person",
              code: "struct Person {}"
            }
          ]
        },
        { codeFenceLanguage: "swift-example" }
      )
    ).toContain("```swift-example");
  });
});
