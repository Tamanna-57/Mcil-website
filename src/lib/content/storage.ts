import "server-only";

import type { Bucket } from "@google-cloud/storage";
import { flatName, type SafeName, type UploadKind } from "@/lib/admin/uploads";

/**
 * Where the admin panel's saved content and uploads live.
 *
 * Two interchangeable backends sit behind one small interface, chosen by
 * environment so the editing UX is fully testable on a laptop before anything
 * touches a cloud account:
 *
 * * `FileBackend` — a JSON file on disk (`content/site.json`, or wherever
 *   `CONTENT_DIR` points), with uploads in `uploads/` beside it. The default,
 *   and what local development uses.
 * * `GCSBackend` — a Cloud Storage bucket: the same JSON as one object, and
 *   uploads under `uploads/`. Selected when `GCS_BUCKET` is set, which is the
 *   production arrangement on Cloud Run.
 *
 * Both store one JSON document: the overrides an admin has saved. Nothing else
 * is persisted, so losing the store degrades the site to the copy in the repo
 * rather than breaking it.
 */

export type StoredDoc = {
  /** The override document, exactly as written by the admin panel. */
  data: unknown;
  /** ISO timestamp of the last write, or null when nothing is stored yet. */
  updatedAt: string | null;
};

export type BackendKind = "file" | "gcs";

export interface StorageBackend {
  readonly name: BackendKind;
  /** Where `saveFile` puts uploads, for the route that serves them back. */
  uploadDir?(): Promise<string>;
  read(): Promise<StoredDoc>;
  write(data: unknown): Promise<void>;
  /**
   * Save an upload and return the URL to reference it by. The backend decides
   * where it goes, so there is one layout per store rather than one per
   * caller.
   */
  saveFile(file: File, safe: SafeName, kind: UploadKind): Promise<string>;
}

/* ------------------------------------------------------------------ files */

class FileBackend implements StorageBackend {
  readonly name = "file" as const;

  private async paths() {
    const path = await import("node:path");
    const dir = process.env.CONTENT_DIR || path.join(process.cwd(), "content");
    return {
      path,
      dir,
      file: path.join(dir, "site.json"),
      // Uploads sit beside the content rather than in `public/`: Next only
      // serves `public/` as it stood at build time, so a file written there
      // afterwards 404s. One directory also means one volume to mount.
      uploadDir: path.join(dir, "uploads"),
    };
  }

  async read(): Promise<StoredDoc> {
    const fs = await import("node:fs/promises");
    const { file } = await this.paths();
    try {
      const [text, stat] = await Promise.all([
        fs.readFile(file, "utf8"),
        fs.stat(file),
      ]);
      return {
        data: text.trim() ? JSON.parse(text) : {},
        updatedAt: stat.mtime.toISOString(),
      };
    } catch {
      return { data: {}, updatedAt: null };
    }
  }

  async write(data: unknown): Promise<void> {
    const fs = await import("node:fs/promises");
    const { dir, file } = await this.paths();
    await fs.mkdir(dir, { recursive: true });
    // Write beside the target and rename, so a crash mid-write cannot leave a
    // half-written file where the site expects its content.
    const tmp = `${file}.${Date.now()}.tmp`;
    await fs.writeFile(tmp, `${JSON.stringify(data, null, 2)}\n`, "utf8");
    await fs.rename(tmp, file);
  }

  async uploadDir(): Promise<string> {
    return (await this.paths()).uploadDir;
  }

  async saveFile(file: File, safe: SafeName): Promise<string> {
    const fs = await import("node:fs/promises");
    const { path, uploadDir } = await this.paths();
    await fs.mkdir(uploadDir, { recursive: true });
    const filename = flatName(safe);
    // Streamed rather than buffered: a 30 MB annual report should not have to
    // sit in memory in one piece to be written to disk.
    const { Readable } = await import("node:stream");
    const { pipeline } = await import("node:stream/promises");
    const { createWriteStream } = await import("node:fs");
    await pipeline(
      Readable.fromWeb(file.stream() as Parameters<typeof Readable.fromWeb>[0]),
      createWriteStream(path.join(uploadDir, filename)),
    );
    // Served by the /media route, which reads this directory at request time.
    return `/media/${filename}`;
  }
}

/* -------------------------------------------------------- cloud storage */

class GCSBackend implements StorageBackend {
  readonly name = "gcs" as const;
  private bucketPromise: Promise<Bucket> | null = null;
  private readonly bucketName: string;
  private readonly prefix: string;

  constructor(bucketName: string) {
    this.bucketName = bucketName;
    this.prefix = (process.env.GCS_PREFIX ?? "").replace(/^\/+|\/+$/g, "");
  }

  /** Lazily built so importing this module never needs credentials. */
  private bucket(): Promise<Bucket> {
    if (!this.bucketPromise) {
      this.bucketPromise = import("@google-cloud/storage").then(({ Storage }) =>
        new Storage(
          // Credentials come from Application Default Credentials, which on
          // Cloud Run is the service account the revision runs as — nothing to
          // configure. `GCS_API_ENDPOINT` exists so the backend can be pointed
          // at an emulator and actually tested.
          process.env.GCS_API_ENDPOINT
            ? { apiEndpoint: process.env.GCS_API_ENDPOINT }
            : {},
        ).bucket(this.bucketName),
      );
    }
    return this.bucketPromise;
  }

  private path(...parts: string[]): string {
    return [this.prefix, ...parts].filter(Boolean).join("/");
  }

  private get contentPath() {
    return this.path("site.json");
  }

  async read(): Promise<StoredDoc> {
    const file = (await this.bucket()).file(this.contentPath);
    try {
      const [contents] = await file.download();
      const text = contents.toString("utf8");
      const [meta] = await file.getMetadata();
      return {
        data: text.trim() ? JSON.parse(text) : {},
        updatedAt: meta.updated ?? null,
      };
    } catch (error) {
      // Nothing saved yet is the normal first-run state, not a failure.
      if ((error as { code?: number }).code === 404) {
        return { data: {}, updatedAt: null };
      }
      throw error;
    }
  }

  async write(data: unknown): Promise<void> {
    const file = (await this.bucket()).file(this.contentPath);
    await file.save(`${JSON.stringify(data, null, 2)}\n`, {
      contentType: "application/json",
      // The panel is the only writer and it saves a whole section at a time,
      // so the useful guarantee is that a reader never sees a stale cached
      // copy — not that two writers are serialised.
      metadata: { cacheControl: "no-store" },
    });
  }

  async saveFile(
    file: File,
    safe: SafeName,
    kind: UploadKind,
  ): Promise<string> {
    const name = this.path("uploads", safe.token, safe.name);
    const target = (await this.bucket()).file(name);

    const { Readable } = await import("node:stream");
    const { pipeline } = await import("node:stream/promises");
    await pipeline(
      Readable.fromWeb(file.stream() as Parameters<typeof Readable.fromWeb>[0]),
      target.createWriteStream({
        resumable: file.size > 8 * 1024 * 1024,
        contentType: safe.contentType,
        metadata: {
          cacheControl: "public, max-age=31536000, immutable",
          // A filing should land in the visitor's downloads named the way it
          // was uploaded, rather than opening in a tab.
          ...(kind === "document"
            ? { contentDisposition: `attachment; filename="${safe.name}"` }
            : {}),
        },
      }),
    );

    return `https://storage.googleapis.com/${this.bucketName}/${name}`;
  }
}

/* ---------------------------------------------------------------- selection */

let backend: StorageBackend | null = null;

export function getBackend(): StorageBackend {
  if (!backend) {
    const bucket = process.env.GCS_BUCKET;
    backend = bucket ? new GCSBackend(bucket) : new FileBackend();
  }
  return backend;
}

/** Test seam: forget the chosen backend so the next call re-reads the env. */
export function resetBackend() {
  backend = null;
}
