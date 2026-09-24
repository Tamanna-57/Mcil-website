"use client";

import { useSyncExternalStore } from "react";

/**
 * Whether the in-page editor is switched on, for components that animate on
 * their own — a carousel moving on while someone is typing into it would take
 * the text they are editing off the screen.
 */

let editing = false;
const listeners = new Set<() => void>();

export function setEditing(on: boolean) {
  if (editing === on) return;
  editing = on;
  for (const listener of listeners) listener();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function useEditing() {
  return useSyncExternalStore(
    subscribe,
    () => editing,
    () => false,
  );
}
