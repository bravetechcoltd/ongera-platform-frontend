"use client";

import React from "react";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { store, persistor } from "@/lib/store";
import { ThemeProvider } from "./theme-provider";
import { toast, Toaster } from "sonner";


const DEDUP_WINDOW_MS = 800;
const _seen = new Map<string, number>();

const _sanitize = (msg: unknown): unknown => {
  if (typeof msg === "string") return msg;
  if (React.isValidElement(msg)) return msg;
  if (msg !== null && msg !== undefined) {
    if (typeof (msg as any).message === "string") return (msg as any).message;
    return String(msg);
  }
  return "";
};

const _isDuplicate = (msg: unknown): boolean => {
  // Only deduplicate plain-string messages (rich/custom content always shows)
  if (typeof msg !== "string" || msg === "") return false;
  const now = Date.now();
  const last = _seen.get(msg);
  if (last !== undefined && now - last < DEDUP_WINDOW_MS) return true;
  _seen.set(msg, now);
  // Keep the map small — evict entries older than the window
  _seen.forEach((ts, key) => {
    if (now - ts >= DEDUP_WINDOW_MS) _seen.delete(key);
  });
  return false;
};

(["error", "success", "warning", "info", "loading"] as const).forEach((method) => {
  const original = (toast as any)[method] as Function;
  if (typeof original !== "function") return;

  (toast as any)[method] = (msg: unknown, opts?: unknown) => {
    const safe = _sanitize(msg);
    if (_isDuplicate(safe)) return;
    return original.call(toast, safe, opts);
  };
});

// ─────────────────────────────────────────────────────────────────────────────

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Toaster richColors position="top-right" />
        </ThemeProvider>
      </PersistGate>
    </Provider>
  );
}