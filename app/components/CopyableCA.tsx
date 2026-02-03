"use client";

import { useState } from "react";
import { Copy, Check } from "lucide-react";

interface CopyableCAProps {
  ca: string;
}

export function CopyableCA({ ca }: CopyableCAProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(ca);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }
  };

  return (
    <div className="my-6 p-4 bg-[#F5F5F7] rounded-lg border border-[#E5E5E5] flex items-center justify-between gap-4">
      <div className="min-w-0 flex-1">
        <span className="block text-xs font-semibold text-[#888888] uppercase tracking-wider mb-1">
          Official Contract Address (CA)
        </span>
        <code className="block text-sm font-mono text-[#1a1a1a] break-all">
          {ca}
        </code>
      </div>
      <button
        onClick={handleCopy}
        className="shrink-0 p-2 text-[#666666] hover:text-[#1a1a1a] hover:bg-white bg-transparent rounded-md border border-transparent hover:border-[#EAEAEA] transition-all duration-200 cursor-pointer"
        aria-label="Copy to clipboard"
        title="Copy address"
      >
        {copied ? (
          <Check className="w-4 h-4 text-green-600" />
        ) : (
          <Copy className="w-4 h-4" />
        )}
      </button>
    </div>
  );
}
