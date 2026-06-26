import { useEffect, useState } from "react";
import { Bug, Trash2, X, ChevronDown, ChevronUp } from "lucide-react";
import { subscribeAuthDebug, clearAuthDebug, type AuthDebugEntry, type AuthDebugLevel } from "@/lib/authDebugLog";

const LEVEL_STYLES: Record<AuthDebugLevel, string> = {
  auth: "bg-primary/10 text-primary border-primary/20",
  role: "bg-medicare-emerald/10 text-medicare-emerald border-medicare-emerald/20",
  redirect: "bg-medicare-amber/10 text-medicare-amber border-medicare-amber/30",
  warn: "bg-medicare-amber/15 text-medicare-amber border-medicare-amber/30",
  error: "bg-destructive/10 text-destructive border-destructive/30",
};

const STORAGE_KEY = "medicare_auth_debug_open";

/**
 * Floating, dismissible debug panel that streams auth + role-lookup events.
 * Hidden by default. Toggle with the floating bug button at the bottom-right
 * of the viewport, or via `?debug=auth` in the URL.
 */
export function AuthDebugPanel() {
  const [enabled, setEnabled] = useState(() => {
    if (typeof window === "undefined") return false;
    if (new URLSearchParams(window.location.search).get("debug") === "auth") return true;
    return localStorage.getItem(STORAGE_KEY) === "1";
  });
  const [open, setOpen] = useState(true);
  const [entries, setEntries] = useState<AuthDebugEntry[]>([]);

  useEffect(() => {
    if (!enabled) return;
    return subscribeAuthDebug(setEntries);
  }, [enabled]);

  const toggleEnabled = () => {
    setEnabled((v) => {
      const next = !v;
      try {
        localStorage.setItem(STORAGE_KEY, next ? "1" : "0");
      } catch {
        /* ignore */
      }
      return next;
    });
  };

  if (!enabled) {
    return (
      <button
        onClick={toggleEnabled}
        title="Open auth debug panel"
        aria-label="Open auth debug panel"
        className="fixed bottom-4 right-4 z-[9999] w-10 h-10 rounded-full bg-card border border-border shadow-md flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
      >
        <Bug size={16} />
      </button>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-[9999] w-[380px] max-w-[calc(100vw-2rem)] bg-card border border-border rounded-xl shadow-2xl overflow-hidden flex flex-col">
      <div className="flex items-center justify-between px-3 py-2 border-b border-border bg-muted/40">
        <div className="flex items-center gap-2 text-xs font-semibold text-foreground">
          <Bug size={14} />
          Auth debug
          <span className="text-[10px] font-normal text-muted-foreground">{entries.length} events</span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setOpen((v) => !v)}
            className="w-6 h-6 rounded hover:bg-muted text-muted-foreground hover:text-foreground flex items-center justify-center"
            aria-label={open ? "Collapse" : "Expand"}
          >
            {open ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
          </button>
          <button
            onClick={() => clearAuthDebug()}
            className="w-6 h-6 rounded hover:bg-muted text-muted-foreground hover:text-foreground flex items-center justify-center"
            aria-label="Clear"
            title="Clear log"
          >
            <Trash2 size={12} />
          </button>
          <button
            onClick={toggleEnabled}
            className="w-6 h-6 rounded hover:bg-muted text-muted-foreground hover:text-foreground flex items-center justify-center"
            aria-label="Close"
          >
            <X size={14} />
          </button>
        </div>
      </div>
      {open && (
        <div className="max-h-[320px] overflow-y-auto font-mono text-[11px] divide-y divide-border">
          {entries.length === 0 ? (
            <div className="px-3 py-6 text-center text-muted-foreground">
              No auth events yet. Sign in / out to see activity.
            </div>
          ) : (
            entries
              .slice()
              .reverse()
              .map((e) => (
                <div key={e.id} className="px-3 py-1.5">
                  <div className="flex items-baseline gap-2">
                    <span className="text-muted-foreground tabular-nums text-[10px]">
                      {new Date(e.ts).toLocaleTimeString(undefined, { hour12: false })}
                    </span>
                    <span className={`px-1.5 py-0.5 rounded border text-[10px] uppercase tracking-wide ${LEVEL_STYLES[e.level]}`}>
                      {e.level}
                    </span>
                    <span className="text-foreground font-sans">{e.label}</span>
                  </div>
                  {e.detail && (
                    <pre className="mt-1 ml-1 text-muted-foreground whitespace-pre-wrap break-all leading-snug">
                      {e.detail}
                    </pre>
                  )}
                </div>
              ))
          )}
        </div>
      )}
    </div>
  );
}
