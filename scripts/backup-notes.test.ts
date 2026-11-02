import { describe, expect, it } from "vitest";
import { backupFilename, resolveCredential } from "./backup-notes.mjs";

describe("backupFilename", () => {
  it("formats date into notes-YYYY-MM-DD.json", () => {
    const fixedDate = new Date("2026-11-03T12:00:00Z");
    expect(backupFilename(fixedDate)).toBe("notes-2026-11-03.json");
  });

  it("defaults to current date", () => {
    const filename = backupFilename();
    expect(filename).toMatch(/^notes-\d{4}-\d{2}-\d{2}\.json$/);
  });
});

describe("resolveCredential", () => {
  it("parses valid JSON from FIREBASE_SERVICE_ACCOUNT", () => {
    const fakeKey = { project_id: "toin-notes", client_email: "test@toin-notes.iam.gserviceaccount.com" };
    const env = { FIREBASE_SERVICE_ACCOUNT: JSON.stringify(fakeKey) };
    expect(resolveCredential(env)).toEqual(fakeKey);
  });

  it("throws descriptive error when FIREBASE_SERVICE_ACCOUNT is invalid JSON", () => {
    const env = { FIREBASE_SERVICE_ACCOUNT: "not-json" };
    expect(() => resolveCredential(env)).toThrow(
      "FIREBASE_SERVICE_ACCOUNT is set but is not valid JSON."
    );
  });

  it("returns null when GOOGLE_APPLICATION_CREDENTIALS points to a file", () => {
    const env = { GOOGLE_APPLICATION_CREDENTIALS: "/tmp/fake-key.json" };
    expect(resolveCredential(env)).toBeNull();
  });

  it("throws error when GOOGLE_APPLICATION_CREDENTIALS is empty", () => {
    const env = { GOOGLE_APPLICATION_CREDENTIALS: "   " };
    expect(() => resolveCredential(env)).toThrow(
      "GOOGLE_APPLICATION_CREDENTIALS is empty."
    );
  });

  it("throws when neither credential source is present", () => {
    const env = {};
    expect(() => resolveCredential(env)).toThrow(
      "No credentials found."
    );
  });

  it("prefers FIREBASE_SERVICE_ACCOUNT when both are set", () => {
    const fakeKey = { project_id: "toin-notes" };
    const env = {
      FIREBASE_SERVICE_ACCOUNT: JSON.stringify(fakeKey),
      GOOGLE_APPLICATION_CREDENTIALS: "/tmp/fake-key.json",
    };
    expect(resolveCredential(env)).toEqual(fakeKey);
  });
});
