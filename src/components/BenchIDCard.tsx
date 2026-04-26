"use client";

import { useState } from "react";
import { Clipboard } from "lucide-react";

type BenchIdCardProps = {
  postId: string;
  section: string;
};

function getBenchPrefix(section: string) {
  const prefixes: Record<string, string> = {
    showcase: "SCS",
    "sewing-pony": "SPY",
    "draft-desk": "DSK",
    "tool-rack": "TLR",
    tannery: "TNY",
    "scrap-bin": "SCP",
  };

  return prefixes[section] ?? "AWL";
}

export default function BenchIdCard({ postId, section }: BenchIdCardProps) {
  const [copied, setCopied] = useState(false);

  const benchNumber =
    (parseInt(postId.replace(/-/g, "").slice(0, 6), 16) % 1000) + 1;

  const prefix = getBenchPrefix(section);

  const benchId = `${prefix}-${benchNumber}`;

  async function handleCopy() {
    await navigator.clipboard.writeText(postId);
    setCopied(true);

    setTimeout(() => {
      setCopied(false);
    }, 1500);
  }

  return (
    <div className="mb-4 flex flex-wrap items-center gap-3 rounded-xl border border-stone-800 bg-stone-950 px-4 py-2 text-xs text-stone-500">
      <span>
        Bench ID:{" "}
        <span className="font-mono font-bold text-amber-500">{benchId}</span>
      </span>

      <button
        type="button"
        onClick={handleCopy}
        className="inline-flex items-center gap-1 font-semibold text-stone-300 transition hover:text-amber-400"
      >
        <Clipboard className="h-4 w-4" />
        {copied ? "Copied!" : "Copy UUID"}
      </button>
    </div>
  );
}
