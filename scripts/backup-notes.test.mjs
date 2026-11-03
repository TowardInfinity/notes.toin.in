import { describe, expect, it } from "vitest";
import {
  backupFilename,
  buildAppOptions,
  DEFAULT_PROJECT_ID,
  resolveCredential,
} from "./backup-notes.mjs";

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

describe("buildAppOptions", () => {
  it("extracts projectId from service account JSON if present", () => {
    const sa = { project_id: "custom-project", client_email: "test@example.com" };
    const options = buildAppOptions(sa, {});
    expect(options).toEqual({
      projectId: "custom-project",
      credential: sa,
    });
  });

  it("prioritizes FIREBASE_PROJECT_ID environment variable", () => {
    const options = buildAppOptions(null, { FIREBASE_PROJECT_ID: "override-project" });
    expect(options).toEqual({
      projectId: "override-project",
    });
  });

  it("prioritizes GOOGLE_CLOUD_PROJECT environment variable", () => {
    const options = buildAppOptions(null, { GOOGLE_CLOUD_PROJECT: "gcp-project" });
    expect(options).toEqual({
      projectId: "gcp-project",
    });
  });

  it("falls back to DEFAULT_PROJECT_ID when no override or key project_id", () => {
    const options = buildAppOptions(null, {});
    expect(options).toEqual({
      projectId: DEFAULT_PROJECT_ID,
    });
  });

  it("attaches credential when provided without project_id", () => {
    const sa = { client_email: "test@example.com" };
    const options = buildAppOptions(sa, {});
    expect(options).toEqual({
      projectId: DEFAULT_PROJECT_ID,
      credential: sa,
    });
  });
});
