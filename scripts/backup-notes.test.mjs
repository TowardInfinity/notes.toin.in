import { describe, expect, it } from "vitest";
import { backupFilename, resolveCredential } from "./backup-notes.mjs";

describe("backupFilename", () => {
  it("formats a dated notes-YYYY-MM-DD.json name in UTC", () => {
    // 2026-08-26T03:04:05Z
    const d = new Date(Date.UTC(2026, 7, 26, 3, 4, 5));
    expect(backupFilename(d)).toBe("notes-2026-08-26.json");
  });

  it("zero-pads single-digit months and days", () => {
    const d = new Date(Date.UTC(2027, 0, 5));
    expect(backupFilename(d)).toBe("notes-2027-01-05.json");
  });
});

describe("resolveCredential", () => {
  it("prefers FIREBASE_SERVICE_ACCOUNT and parses its JSON", () => {
    const sa = { client_email: "sa@toin.iam.gserviceaccount.com" };
    const cred = resolveCredential({
      FIREBASE_SERVICE_ACCOUNT: JSON.stringify(sa),
      GOOGLE_APPLICATION_CREDENTIALS: "/tmp/ignored.json",
    });
    expect(cred).toEqual(sa);
  });

  it("falls back to application default credentials via path env", () => {
    // null means "no explicit cert; let firebase-admin use ADC"
    expect(
      resolveCredential({ GOOGLE_APPLICATION_CREDENTIALS: "/tmp/sa.json" })
    ).toBeNull();
  });

  it("throws with guidance when neither variable is set", () => {
    expect(() => resolveCredential({})).toThrow(/No credentials found/);
  });

  it("throws when GOOGLE_APPLICATION_CREDENTIALS is empty", () => {
    expect(() => resolveCredential({ GOOGLE_APPLICATION_CREDENTIALS: "  " }))
      .toThrow(/empty/);
  });

  it("throws when FIREBASE_SERVICE_ACCOUNT is not valid JSON", () => {
    expect(() =>
      resolveCredential({ FIREBASE_SERVICE_ACCOUNT: "{not json" })
    ).toThrow(/not valid JSON/);
  });
});
