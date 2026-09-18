import "server-only";

/**
 * Where the admin panel's saved content lives.
 *
 * Two interchangeable backends sit behind one small interface, chosen by
 * environment so the editing UX is fully testable on a laptop before anything
 * touches a cloud account:
 *
 * * `FileBackend`  — a JSON file on disk (`content/site.json`, or wherever
 *   `CONTENT_DIR` points), with uploaded images in `uploads/` beside it. The
 *   default. Correct for local development and for any host with a persistent
 *   disk (Docker, Render, a VPS).
 * * `BlobBackend`  — Vercel Blob, over its REST API so there is no extra npm
 *   dependency to keep in step. Selected automatically when
 *   `BLOB_READ_WRITE_TOKEN` is set, which is the case on Vercel once a Blob
 *   store is attached to the project.
 *
 * Both store one JSON document: the overrides an admin has saved. Nothing else
 * is persisted, so losing the store degrades the site to the copy in the repo
 * rather than breaking it.
 */

const BLOB_API = "https://blob.vercel-storage.com";
const BLOB_API_VERSION = "7";

export type StoredDoc = {
  /** The override document, exactly as written by the admin panel. */
  data: unknown;
  /** ISO timestamp of the last write, or null when nothing is stored yet. */
  updatedAt: string | null;
};

export interface StorageBackend {
  readonly name: string;
  /** Where `saveImage` puts files, for the route that serves them back. */
  uploadDir?(): Promise<string>;
  read(): Promise<StoredDoc>;
  write(data: unknown): Promise<void>;
  /** Save an uploaded image and return the URL to reference it by. */
  saveImage(file: File, filename: string): Promise<string>;
}

/* ------------------------------------------------------------------ files */

class FileBackend implements StorageBackend {
  readonly name = "file";

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

  async saveImage(file: File, filename: string): Promise<string> {
    const fs = await import("node:fs/promises");
    const { path, uploadDir } = await this.paths();
    await fs.mkdir(uploadDir, { recursive: true });
    const buffer = Buffer.from(await file.arrayBuffer());
    await fs.writeFile(path.join(uploadDir, filename), buffer);
    // Served by the /media route, which reads this directory at request time.
    return `/media/${filename}`;
  }
}

/* ------------------------------------------------------------- vercel blob */

type BlobListItem = {
  url: string;
  pathname: string;
  uploadedAt: string;
};

class BlobBackend implements StorageBackend {
  readonly name = "blob";
  private readonly token: string;
  private readonly prefix: string;

  constructor(token: string) {
    this.token = token;
    this.prefix = process.env.BLOB_PREFIX || "mcil-content";
  }

  private get contentPath() {
    return `${this.prefix}/site.json`;
  }

  private headers(extra: Record<string, string> = {}) {
    return {
      authorization: `Bearer ${this.token}`,
      "x-api-version": BLOB_API_VERSION,
      ...extra,
    };
  }

  /** Locate a blob by exact pathname. Returns null when it does not exist. */
  private async head(pathname: string): Promise<BlobListItem | null> {
    const url = `${BLOB_API}?prefix=${encodeURIComponent(pathname)}&limit=1`;
    const res = await fetch(url, {
      headers: this.headers(),
      cache: "no-store",
    });
    if (!res.ok) {
      throw new Error(`Blob list failed: ${res.status} ${await res.text()}`);
    }
    const body = (await res.json()) as { blobs?: BlobListItem[] };
    return body.blobs?.find((b) => b.pathname === pathname) ?? null;
  }

  async read(): Promise<StoredDoc> {
    const blob = await this.head(this.contentPath);
    if (!blob) return { data: {}, updatedAt: null };

    // Blob URLs are served from a long-lived CDN cache. The listing above is
    // an authenticated API call and is always fresh, so its `uploadedAt` is
    // used as a cache buster — without it a save could stay invisible for
    // hours.
    const bust = encodeURIComponent(blob.uploadedAt);
    const res = await fetch(`${blob.url}?v=${bust}`, { cache: "no-store" });
    if (!res.ok) {
      throw new Error(`Blob read failed: ${res.status}`);
    }
    const text = await res.text();
    return {
      data: text.trim() ? JSON.parse(text) : {},
      updatedAt: blob.uploadedAt,
    };
  }

  private async put(
    pathname: string,
    body: BodyInit,
    contentType: string,
    { randomSuffix }: { randomSuffix: boolean },
  ): Promise<string> {
    const res = await fetch(`${BLOB_API}/${pathname}`, {
      method: "PUT",
      headers: this.headers({
        "x-content-type": contentType,
        "x-add-random-suffix": randomSuffix ? "1" : "0",
        "x-allow-overwrite": "1",
        "x-access": "public",
      }),
      body,
      cache: "no-store",
    });
    if (!res.ok) {
      throw new Error(`Blob write failed: ${res.status} ${await res.text()}`);
    }
    const saved = (await res.json()) as { url: string };
    return saved.url;
  }

  async write(data: unknown): Promise<void> {
    await this.put(
      this.contentPath,
      `${JSON.stringify(data, null, 2)}\n`,
      "application/json",
      { randomSuffix: false },
    );
  }

  async saveImage(file: File, filename: string): Promise<string> {
    return this.put(
      `${this.prefix}/uploads/${filename}`,
      await file.arrayBuffer(),
      file.type || "application/octet-stream",
      { randomSuffix: false },
    );
  }
}

/* ---------------------------------------------------------------- selection */

let backend: StorageBackend | null = null;

export function getBackend(): StorageBackend {
  if (!backend) {
    const token = process.env.BLOB_READ_WRITE_TOKEN;
    backend = token ? new BlobBackend(token) : new FileBackend();
  }
  return backend;
}
