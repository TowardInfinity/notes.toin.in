import { describe, expect, it } from "vitest";
import { QueryDocumentSnapshot, DocumentReference } from "firebase/firestore";
import {
  buildEditPatch,
  createNoteObject,
  deriveTitle,
  getDateInLocalString,
  getCompactDate,
  noteConverter,
  stripMarkdown,
} from "./helper";
import { NoteType } from "./types";

const fakeSnapshot = (data: unknown): QueryDocumentSnapshot =>
  ({
    data: () => data,
    ref: {} as DocumentReference,
  }) as unknown as QueryDocumentSnapshot;

describe("buildEditPatch", () => {
  it("returns exactly the trimmed body field patch", () => {
    expect(buildEditPatch("  hello world  ")).toEqual({
      "note.body": "hello world",
    });
  });

  it("does not touch id, title, or noteType (the corruption vector)", () => {
    const patch = buildEditPatch("updated");
    expect(Object.keys(patch)).not.toContain("note.id");
    expect(Object.keys(patch)).not.toContain("note.title");
    expect(Object.keys(patch)).not.toContain("noteType");
    expect(Object.keys(patch)).toEqual(["note.body"]);
  });
});

describe("noteConverter.toFirestore", () => {
  it("emits the nested shape with noteType", () => {
    const note = createNoteObject("body text", "MARKDOWN").note;
    const out = noteConverter.toFirestore(note);
    expect(out).toEqual({
      note: {
        id: note.id,
        title: note.title,
        body: "body text",
        noteType: "MARKDOWN",
      },
    });
  });
});

describe("noteConverter round-trip", () => {
  it("preserves id/title/body/noteType through toFirestore -> fromFirestore", () => {
    const original: NoteType = {
      id: "1700000000000",
      ref: null as never,
      title: "1700000000000",
      body: "# Heading",
      noteType: "MARKDOWN",
    };
    const serialized = noteConverter.toFirestore(original);
    const restored = noteConverter.fromFirestore(
      fakeSnapshot(serialized),
      {}
    );
    expect(restored.id).toBe(original.id);
    expect(restored.title).toBe(original.title);
    expect(restored.body).toBe(original.body);
    expect(restored.noteType).toBe("MARKDOWN");
  });

  it("defaults missing noteType to QUICK on read", () => {
    const restored = noteConverter.fromFirestore(
      fakeSnapshot({ note: { id: "1", title: "1", body: "b" } }),
      {}
    );
    expect(restored.noteType).toBe("QUICK");
  });
});

describe("createNoteObject", () => {
  it("returns a nested note with QUICK default", () => {
    const obj = createNoteObject("hello");
    expect(obj.note.noteType).toBe("QUICK");
    expect(obj.note.body).toBe("hello");
    expect(typeof obj.note.id).toBe("string");
    expect(obj.note.id).toBe(obj.note.title);
  });
});

describe("getDateInLocalString", () => {
  it("formats an epoch string without producing Invalid Date", () => {
    const formatted = getDateInLocalString("1700000000000");
    expect(formatted).not.toContain("Invalid Date");
    expect(formatted.length).toBeGreaterThan(0);
  });

  it("formats an epoch number consistently with its string form", () => {
    expect(getDateInLocalString(1700000000000)).toBe(
      getDateInLocalString("1700000000000")
    );
  });
});

describe("deriveTitle", () => {
  it("uses the first non-empty line, trimmed", () => {
    expect(deriveTitle("\n\n  hello world\nsecond line")).toBe("hello world");
  });

  it("truncates long first lines to ~48 chars with an ellipsis", () => {
    const long = "a".repeat(80);
    const title = deriveTitle(long);
    expect(title.length).toBe(49); // 48 chars + ellipsis
    expect(title.endsWith("…")).toBe(true);
  });

  it("falls back to (untitled note) for whitespace-only bodies", () => {
    expect(deriveTitle("   \n\t\n  ")).toBe("(untitled note)");
    expect(deriveTitle("")).toBe("(untitled note)");
  });
});

describe("getCompactDate", () => {
  it("returns a short format without seconds", () => {
    const formatted = getCompactDate(0);
    expect(formatted).not.toMatch(/:\d{2}:\d{2}/); // no H:mm:ss pattern
  });

  it("accepts epoch strings and numbers identically", () => {
    expect(getCompactDate("1700000000000")).toBe(getCompactDate(1700000000000));
  });
});

describe("stripMarkdown", () => {
  it("converts links to their text", () => {
    expect(stripMarkdown("see [docs](https://example.com) now")).toBe("see docs now");
  });

  it("converts images to their alt text", () => {
    expect(stripMarkdown("![cat photo](https://x.com/cat.png)")).toBe("cat photo");
  });

  it("strips headers, bold, italics and inline code", () => {
    expect(stripMarkdown("## Heading\n**bold** *it* `code`")).toBe(
      "Heading bold it code"
    );
  });

  it("removes code fences and blockquotes", () => {
    expect(stripMarkdown("> quoted\n```\nconst x = 1;\n```")).toBe("quoted");
  });

  it("collapses multiline whitespace into single spaces", () => {
    expect(stripMarkdown("one\n\ntwo\n\nthree")).toBe("one two three");
  });
});
