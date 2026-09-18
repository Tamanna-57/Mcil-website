"use client";

import Image from "next/image";
import { useId, useRef, useState } from "react";
import type { Field } from "@/lib/admin/schema";

/**
 * The controls the dashboard is built from.
 *
 * Every editor here takes a value and an `onChange`, and knows nothing about
 * where in the content it sits — the parent holds the draft and replaces the
 * branch it was handed. That keeps the nesting (a document inside a
 * sub-category inside a category) from needing any special handling.
 */

type Json = Record<string, unknown>;

const isObject = (v: unknown): v is Json =>
  typeof v === "object" && v !== null && !Array.isArray(v);

export const inputClass =
  "w-full rounded-lg border border-steel-900/15 bg-white px-3 py-2 text-sm text-steel-900 " +
  "shadow-xs outline-none transition-colors placeholder:text-steel-800/40 " +
  "focus:border-brand-deep focus:ring-2 focus:ring-brand-deep/20";

const buttonClass =
  "inline-flex cursor-pointer items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs " +
  "font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-40";

const ghostButton = `${buttonClass} text-steel-800 hover:bg-steel-900/6`;

function Label({
  children,
  help,
  htmlFor,
}: {
  children: React.ReactNode;
  help?: string;
  htmlFor?: string;
}) {
  return (
    <div className="mb-1.5">
      <label
        htmlFor={htmlFor}
        className="text-[11px] font-semibold tracking-[0.1em] text-steel-800 uppercase"
      >
        {children}
      </label>
      {help ? (
        <p className="mt-1 text-xs leading-relaxed text-steel-800/70">{help}</p>
      ) : null}
    </div>
  );
}

/* ------------------------------------------------------------------ image */

function ImageField({
  value,
  onChange,
  onError,
}: {
  value: unknown;
  onChange: (next: string) => void;
  onError: (message: string) => void;
}) {
  const src = typeof value === "string" ? value : "";
  const fileRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);

  async function upload(file: File) {
    setBusy(true);
    try {
      const body = new FormData();
      body.append("file", file);
      const res = await fetch("/api/admin/upload", { method: "POST", body });
      const data = (await res.json()) as { url?: string; error?: string };
      if (!res.ok || !data.url) {
        onError(data.error || "Upload failed.");
        return;
      }
      onChange(data.url);
    } catch {
      onError("Upload failed — check the connection and try again.");
    } finally {
      setBusy(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  return (
    <div className="flex items-start gap-3">
      <div className="relative h-20 w-28 shrink-0 overflow-hidden rounded-lg bg-steel-900/6 ring-1 ring-steel-900/10">
        {src ? (
          <Image
            src={src}
            alt=""
            fill
            sizes="112px"
            className="object-cover"
            unoptimized
          />
        ) : (
          <span className="flex h-full items-center justify-center text-[10px] tracking-wider text-steel-800/50 uppercase">
            Empty
          </span>
        )}
      </div>

      <div className="min-w-0 flex-1">
        <input
          className={inputClass}
          value={src}
          placeholder="/images/hero-1.jpg"
          onChange={(e) => onChange(e.target.value)}
        />
        <div className="mt-2 flex flex-wrap items-center gap-1">
          <button
            type="button"
            className={ghostButton}
            disabled={busy}
            onClick={() => fileRef.current?.click()}
          >
            {busy ? "Uploading…" : "Upload"}
          </button>
          {src ? (
            <button
              type="button"
              className={ghostButton}
              onClick={() => onChange("")}
            >
              Clear
            </button>
          ) : null}
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) void upload(file);
            }}
          />
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------- list */

function newRow(field: Extract<Field, { type: "list" }>): Json {
  const row: Json = structuredClone(field.template ?? {});
  if (field.identify && row.id === undefined) {
    row.id = `item-${crypto.randomUUID().slice(0, 8)}`;
  }
  return row;
}

function rowTitle(
  field: Extract<Field, { type: "list" }>,
  row: unknown,
  index: number,
) {
  const raw = isObject(row) ? row[field.titleKey] : undefined;
  const text = typeof raw === "string" || typeof raw === "number" ? String(raw) : "";
  return text.trim() || `Item ${index + 1}`;
}

function ListField({
  field,
  value,
  onChange,
  onError,
}: {
  field: Extract<Field, { type: "list" }>;
  value: unknown;
  onChange: (next: unknown[]) => void;
  onError: (message: string) => void;
}) {
  const rows = Array.isArray(value) ? value : [];
  const [open, setOpen] = useState<number | null>(rows.length === 1 ? 0 : null);

  function replace(index: number, next: unknown) {
    const copy = [...rows];
    copy[index] = next;
    onChange(copy);
  }

  function move(index: number, by: number) {
    const target = index + by;
    if (target < 0 || target >= rows.length) return;
    const copy = [...rows];
    [copy[index], copy[target]] = [copy[target], copy[index]];
    onChange(copy);
    setOpen((current) => (current === index ? target : current));
  }

  function remove(index: number) {
    onChange(rows.filter((_, i) => i !== index));
    setOpen(null);
  }

  function duplicate(index: number) {
    const clone = structuredClone(rows[index]) as Json;
    if (field.identify && isObject(clone)) {
      clone.id = `item-${crypto.randomUUID().slice(0, 8)}`;
    }
    const copy = [...rows];
    copy.splice(index + 1, 0, clone);
    onChange(copy);
    setOpen(index + 1);
  }

  return (
    <div className="rounded-xl border border-steel-900/12 bg-steel-900/[0.02] p-3">
      {rows.length === 0 ? (
        <p className="px-1 py-3 text-xs text-steel-800/60">Nothing here yet.</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {rows.map((row, index) => {
            const expanded = open === index;
            return (
              <li
                key={
                  (isObject(row) && typeof row.id === "string" && row.id) ||
                  `row-${index}`
                }
                className="overflow-hidden rounded-lg border border-steel-900/12 bg-white"
              >
                <div className="flex items-center gap-1 px-2 py-1.5">
                  <button
                    type="button"
                    onClick={() => setOpen(expanded ? null : index)}
                    aria-expanded={expanded}
                    className="flex min-w-0 flex-1 cursor-pointer items-center gap-2 px-1 py-1 text-left"
                  >
                    <span
                      aria-hidden
                      className={`shrink-0 text-steel-800/50 transition-transform ${
                        expanded ? "rotate-90" : ""
                      }`}
                    >
                      ›
                    </span>
                    <span className="truncate text-sm font-medium text-steel-900">
                      {rowTitle(field, row, index)}
                    </span>
                  </button>

                  <button
                    type="button"
                    title="Move up"
                    className={ghostButton}
                    disabled={index === 0}
                    onClick={() => move(index, -1)}
                  >
                    ↑
                  </button>
                  <button
                    type="button"
                    title="Move down"
                    className={ghostButton}
                    disabled={index === rows.length - 1}
                    onClick={() => move(index, 1)}
                  >
                    ↓
                  </button>
                  <button
                    type="button"
                    title="Duplicate"
                    className={ghostButton}
                    onClick={() => duplicate(index)}
                  >
                    Copy
                  </button>
                  <button
                    type="button"
                    title="Delete"
                    className={`${buttonClass} text-red-700 hover:bg-red-50`}
                    onClick={() => {
                      if (
                        confirm(
                          `Delete “${rowTitle(field, row, index)}”? This cannot be undone once you save.`,
                        )
                      ) {
                        remove(index);
                      }
                    }}
                  >
                    Delete
                  </button>
                </div>

                {expanded ? (
                  <div className="border-t border-steel-900/10 bg-steel-900/[0.015] p-4">
                    <FieldList
                      fields={field.fields}
                      value={isObject(row) ? row : {}}
                      onChange={(next) => replace(index, next)}
                      onError={onError}
                    />
                  </div>
                ) : null}
              </li>
            );
          })}
        </ul>
      )}

      <button
        type="button"
        className={`${buttonClass} mt-3 border border-dashed border-steel-900/25 text-steel-800 hover:border-brand-deep hover:text-brand-deep`}
        onClick={() => {
          onChange([...rows, newRow(field)]);
          setOpen(rows.length);
        }}
      >
        + {field.addLabel}
      </button>
    </div>
  );
}

/* ------------------------------------------------------------------ group */

function GroupField({
  field,
  value,
  onChange,
  onError,
}: {
  field: Extract<Field, { type: "group" }>;
  value: unknown;
  onChange: (next: unknown) => void;
  onError: (message: string) => void;
}) {
  const present = isObject(value);

  if (field.optional && !present) {
    return (
      <button
        type="button"
        className={`${buttonClass} border border-dashed border-steel-900/25 text-steel-800 hover:border-brand-deep hover:text-brand-deep`}
        onClick={() => onChange({})}
      >
        + Add {field.label.toLowerCase()}
      </button>
    );
  }

  return (
    <div className="rounded-xl border border-steel-900/12 bg-steel-900/[0.02] p-4">
      {field.optional ? (
        <div className="mb-3 flex justify-end">
          <button
            type="button"
            className={`${buttonClass} text-red-700 hover:bg-red-50`}
            onClick={() => onChange(undefined)}
          >
            Remove {field.label.toLowerCase()}
          </button>
        </div>
      ) : null}
      <FieldList
        fields={field.fields}
        value={present ? value : {}}
        onChange={onChange}
        onError={onError}
      />
    </div>
  );
}

/* ---------------------------------------------------------------- control */

function Control({
  field,
  value,
  onChange,
  onError,
}: {
  field: Field;
  value: unknown;
  onChange: (next: unknown) => void;
  onError: (message: string) => void;
}) {
  const id = useId();
  const asText = typeof value === "string" ? value : "";

  switch (field.type) {
    case "textarea":
      return (
        <>
          <Label help={field.help} htmlFor={id}>
            {field.label}
          </Label>
          <textarea
            id={id}
            className={`${inputClass} min-h-24 resize-y leading-relaxed`}
            value={asText}
            placeholder={field.placeholder}
            onChange={(e) => onChange(e.target.value)}
          />
        </>
      );

    case "number": {
      const asNumber =
        typeof value === "number" ? String(value) : (asText ?? "");
      return (
        <>
          <Label help={field.help} htmlFor={id}>
            {field.label}
          </Label>
          <input
            id={id}
            type="number"
            inputMode="decimal"
            className={inputClass}
            value={asNumber}
            step={field.step}
            min={field.min}
            max={field.max}
            onChange={(e) => {
              const raw = e.target.value;
              // An empty box is "no value", not zero — writing 0 here would
              // silently change a figure the editor only meant to clear.
              onChange(raw === "" ? undefined : Number(raw));
            }}
          />
        </>
      );
    }

    case "select":
      return (
        <>
          <Label help={field.help} htmlFor={id}>
            {field.label}
          </Label>
          <select
            id={id}
            className={inputClass}
            value={asText}
            onChange={(e) =>
              onChange(e.target.value === "" ? undefined : e.target.value)
            }
          >
            {field.options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </>
      );

    case "boolean":
      return (
        <label className="flex cursor-pointer items-start gap-2.5 py-1">
          <input
            type="checkbox"
            className="mt-0.5 h-4 w-4 cursor-pointer accent-[var(--brand-deep)]"
            checked={value === true}
            onChange={(e) => onChange(e.target.checked || undefined)}
          />
          <span>
            <span className="text-sm font-medium text-steel-900">
              {field.label}
            </span>
            {field.help ? (
              <span className="mt-0.5 block text-xs leading-relaxed text-steel-800/70">
                {field.help}
              </span>
            ) : null}
          </span>
        </label>
      );

    case "strings": {
      const lines = Array.isArray(value) ? value.map(String) : [];
      return (
        <>
          <Label help={field.help} htmlFor={id}>
            {field.label}
          </Label>
          <textarea
            id={id}
            className={`${inputClass} min-h-20 resize-y leading-relaxed`}
            value={lines.join("\n")}
            onChange={(e) =>
              onChange(
                e.target.value
                  .split("\n")
                  .map((line) => line.trimEnd())
                  .filter((line, i, all) => line !== "" || i < all.length - 1),
              )
            }
          />
        </>
      );
    }

    case "image":
      return (
        <>
          <Label help={field.help}>{field.label}</Label>
          <ImageField
            value={value}
            onChange={onChange}
            onError={onError}
          />
        </>
      );

    case "group":
      return (
        <>
          <Label help={field.help}>{field.label}</Label>
          <GroupField
            field={field}
            value={value}
            onChange={onChange}
            onError={onError}
          />
        </>
      );

    case "list":
      return (
        <>
          <Label help={field.help}>{field.label}</Label>
          <ListField
            field={field}
            value={value}
            onChange={onChange}
            onError={onError}
          />
        </>
      );

    default:
      return (
        <>
          <Label help={field.help} htmlFor={id}>
            {field.label}
          </Label>
          <input
            id={id}
            type={field.type === "date" ? "date" : "text"}
            className={inputClass}
            value={asText}
            placeholder={field.placeholder}
            onChange={(e) => onChange(e.target.value)}
          />
        </>
      );
  }
}

/** Render a set of fields against one object, replacing it on every edit. */
export function FieldList({
  fields,
  value,
  onChange,
  onError,
}: {
  fields: Field[];
  value: Json;
  onChange: (next: Json) => void;
  onError: (message: string) => void;
}) {
  return (
    <div className="flex flex-col gap-5">
      {fields.map((field) => (
        <div key={field.key}>
          <Control
            field={field}
            value={value[field.key]}
            onChange={(next) => {
              const copy = { ...value };
              if (next === undefined) delete copy[field.key];
              else copy[field.key] = next;
              onChange(copy);
            }}
            onError={onError}
          />
        </div>
      ))}
    </div>
  );
}
