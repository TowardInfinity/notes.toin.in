#!/usr/bin/env node
/**
 * Disaster-insurance export of the Firestore `notes` collection to a dated
 * JSON file. Strictly READ-ONLY: this script never writes, updates, or
 * deletes documents.
 *
 * Credentials (either):
 *   - GOOGLE_APPLICATION_CREDENTIALS: path to a service-account JSON file
 *   - FIREBASE_SERVICE_ACCOUNT:       the service-account JSON itself
 *
 * Usage:
 *   node scripts/backup-notes.mjs [--dry-run]
 */

import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";

const COLLECTION_ID = "notes";
const BACKUP_DIR = "backups";

/** Dated filename for a backup run, e.g. notes-2026-08-26.json. */
export function backupFilename(date = new Date()) {
  const iso = date.toISOString().slice(0, 10);
  return `notes-${iso}.json`;
}

/**
 * Resolve service-account credentials from the environment into an object
 * consumable by admin.credential.cert(). Throws when nothing usable is set.
 */
export function resolveCredential(env = process.env) {
  const { GOOGLE_APPLICATION_CREDENTIALS, FIREBASE_SERVICE_ACCOUNT } = env;
  if (FIREBASE_SERVICE_ACCOUNT) {
    try {
      return JSON.parse(FIREBASE_SERVICE_ACCOUNT);
    } catch {
      throw new Error(
        "FIREBASE_SERVICE_ACCOUNT is set but is not valid JSON."
      );
    }
  }
  if (GOOGLE_APPLICATION_CREDENTIALS) {
    // firebase-admin reads this path natively via application default
    // credentials; return null and initializeApp() with no explicit cert.
    if (GOOGLE_APPLICATION_CREDENTIALS.trim() === "") {
      throw new Error("GOOGLE_APPLICATION_CREDENTIALS is empty.");
    }
    return null;
  }
  throw new Error(
    "No credentials found. Set GOOGLE_APPLICATION_CREDENTIALS to a " +
      "service-account JSON file path, or FIREBASE_SERVICE_ACCOUNT to the " +
      "service-account JSON contents."
  );
}

async function main() {
  const dryRun = process.argv.includes("--dry-run");

  const credential = resolveCredential();
  const { initializeApp, cert } = await import("firebase-admin/app");
  const firestore = await import("firebase-admin/firestore");

  const app = initializeApp(
    credential ? { credential: cert(credential) } : {}
  );
  const db = firestore.getFirestore(app);

  // Stream documents one at a time instead of materialising the whole
  // snapshot in one shot — single-user scale today, safe at any size.
  const records = [];
  let firstId = null;
  const stream = db.collection(COLLECTION_ID).stream();
  for await (const doc of stream) {
    if (firstId === null) firstId = doc.id;
    records.push({ id: doc.id, data: doc.data() });
  }

  console.log(`Fetched ${records.length} document(s) from "${COLLECTION_ID}".`);
  console.log(`First document id: ${firstId ?? "(collection empty)"}`);

  if (dryRun) {
    console.log("--dry-run: skipping file write.");
    return;
  }

  await mkdir(BACKUP_DIR, { recursive: true });
  const outPath = path.join(BACKUP_DIR, backupFilename());
  await writeFile(outPath, JSON.stringify(records, null, 2) + "\n", "utf8");
  console.log(`Wrote ${outPath}`);
}
const isMain =
  process.argv[1] &&
  import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href;

if (isMain) {
  main().catch((err) => {
    console.error(`backup failed: ${err.message}`);
    process.exit(1);
  });
}
