import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Copy, Check, Download, AlertTriangle, ShieldCheck } from "lucide-react";
import { downloadCodesAsText } from "@/lib/recoveryCodes";

interface Props {
  codes: string[];
  onAcknowledge: () => void;
  title?: string;
  subtitle?: string;
}

/**
 * One-time display of generated recovery codes.
 * User MUST tick "I have saved them" before continuing.
 */
export default function RecoveryCodesDisplay({ codes, onAcknowledge, title, subtitle }: Props) {
  const [copied, setCopied] = useState(false);
  const [acknowledged, setAcknowledged] = useState(false);

  const copyAll = () => {
    navigator.clipboard.writeText(codes.join("\n"));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-4 p-4 rounded-xl border border-medicare-amber/30 bg-medicare-amber-light/40">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-lg bg-medicare-amber/20 flex items-center justify-center flex-shrink-0">
          <ShieldCheck size={20} className="text-medicare-amber" />
        </div>
        <div>
          <h3 className="font-semibold text-foreground text-sm">{title || "Save your recovery codes"}</h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            {subtitle || "Each code can be used once if you lose your authenticator. We won't show them again."}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 p-3 rounded-lg bg-card border border-border">
        {codes.map((c, i) => (
          <code key={i} className="text-sm font-mono text-foreground tabular-nums">{c}</code>
        ))}
      </div>

      <div className="flex flex-wrap gap-2">
        <Button onClick={copyAll} variant="outline" size="sm" className="gap-2">
          {copied ? <Check size={14} /> : <Copy size={14} />}
          {copied ? "Copied" : "Copy all"}
        </Button>
        <Button onClick={() => downloadCodesAsText(codes)} variant="outline" size="sm" className="gap-2">
          <Download size={14} /> Download .txt
        </Button>
      </div>

      <div className="flex items-start gap-2 p-2.5 rounded-lg bg-medicare-amber/10">
        <AlertTriangle size={14} className="text-medicare-amber flex-shrink-0 mt-0.5" />
        <p className="text-xs text-foreground">
          Store these in a password manager or printed in a safe location. Anyone with these codes can sign in to your account.
        </p>
      </div>

      <label className="flex items-center gap-2 text-sm text-foreground cursor-pointer">
        <input
          type="checkbox"
          checked={acknowledged}
          onChange={(e) => setAcknowledged(e.target.checked)}
          className="rounded border-border"
        />
        I have saved my recovery codes in a safe place
      </label>

      <Button onClick={onAcknowledge} disabled={!acknowledged} className="w-full">
        Continue
      </Button>
    </div>
  );
}
