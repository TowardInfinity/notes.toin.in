import { describe, expect, it } from "vitest";
import { defaultSchema } from "rehype-sanitize";
import { mdSanitizeSchema } from "./mdSchema";

describe("mdSanitizeSchema", () => {
  it("permits the math wrapper classNames via the '*' entry", () => {
    const starEntry = mdSanitizeSchema.attributes?.["*"]?.find(
      (attr): attr is [string, ...string[]] =>
        Array.isArray(attr) && attr[0] === "className",
    );
    expect(starEntry).toBeDefined();
    for (const cls of ["math", "math-inline", "math-display"]) {
      expect(starEntry).toContain(cls);
    }
  });

  it("adds exactly the three math classes beyond defaults", () => {
    const defaultStar = (defaultSchema.attributes?.["*"] ?? []).filter(
      (attr) => Array.isArray(attr) && attr[0] === "className",
    );
    const star = mdSanitizeSchema.attributes?.["*"] ?? [];
    const classNames = star.filter(
      (attr): attr is [string, ...string[]] =>
        Array.isArray(attr) && attr[0] === "className",
    );
    // one default className entry (if any) plus our single allowlist entry
    expect(classNames.length).toBe(defaultStar.length + 1);
    const ours = classNames[classNames.length - 1];
    expect(ours.slice(1).sort()).toEqual([
      "math",
      "math-display",
      "math-inline",
    ]);
  });

  it("does not allow script tags", () => {
    expect(mdSanitizeSchema.tagNames).toBeDefined();
    expect(mdSanitizeSchema.tagNames).not.toContain("script");
  });

  it("preserves default protocol handling (javascript: hrefs stay blocked)", () => {
    expect(mdSanitizeSchema.protocols).toEqual(defaultSchema.protocols);
    expect(mdSanitizeSchema.protocols?.href).toBeDefined();
    expect(mdSanitizeSchema.protocols?.href).not.toContain("javascript");
  });

  it("spreads all other default schema sections unchanged", () => {
    expect(mdSanitizeSchema.tagNames).toEqual(defaultSchema.tagNames);
    expect(mdSanitizeSchema.strip).toEqual(defaultSchema.strip);
    expect(mdSanitizeSchema.clobber).toEqual(defaultSchema.clobber);
  });
});
