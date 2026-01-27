"use client";

import { useState, useEffect, useRef } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Check } from "lucide-react";
import { HugeiconsIcon } from "@hugeicons/react";
import { Download01Icon, Copy01Icon } from "@hugeicons/core-free-icons";
import { toPng } from "html-to-image";
import { Logo } from "@/components/logo";
import { GeistMono } from "geist/font/mono";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

// Helper to wrap numbers in mono font spans
function formatSubtitleWithMonoNumbers(text: string) {
  const parts = text.split(/(\d[\d,]*)/g);
  return parts.map((part, i) => {
    if (/^\d[\d,]*$/.test(part)) {
      return (
        <span key={i} className={`${GeistMono.className} text-[#181925]`}>
          {part}
        </span>
      );
    }
    return part;
  });
}

interface ExportPreviewModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  chartRef: React.RefObject<HTMLDivElement | null>;
  filename: string;
  title?: string;
  subtitle?: string;
  owner?: string;
  repo?: string;
}

export function ExportPreviewModal({
  open,
  onOpenChange,
  chartRef,
  filename,
  title,
  subtitle,
  owner,
  repo,
}: ExportPreviewModalProps) {
  const [chartDataUrl, setChartDataUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [copying, setCopying] = useState(false);
  const [copied, setCopied] = useState(false);
  const [hideAvatarForExport, setHideAvatarForExport] = useState(false);
  const previewCardRef = useRef<HTMLDivElement>(null);

  // Capture the chart when modal opens
  useEffect(() => {
    if (open && chartRef.current) {
      setLoading(true);
      setChartDataUrl(null);
      setCopied(false);

      toPng(chartRef.current, {
        backgroundColor: "#ffffff",
        pixelRatio: 2,
        cacheBust: true,
      })
        .then((dataUrl) => {
          setChartDataUrl(dataUrl);
          setLoading(false);
        })
        .catch((err) => {
          console.error("Failed to capture chart:", err);
          setLoading(false);
        });
    }
  }, [open, chartRef]);

  const handleDownload = async () => {
    if (!previewCardRef.current || downloading) return;

    setDownloading(true);
    setHideAvatarForExport(true);
    
    try {
      // Wait for DOM update
      await new Promise((resolve) => setTimeout(resolve, 200));

      const dataUrl = await toPng(previewCardRef.current, {
        backgroundColor: "#fafafa",
        pixelRatio: 2,
        cacheBust: true,
        quality: 1,
      });

      if (!dataUrl || dataUrl === "data:," || !dataUrl.startsWith("data:image")) {
        throw new Error(`Failed to generate image data URL. Got: ${dataUrl?.substring(0, 50)}...`);
      }

      const link = document.createElement("a");
      link.href = dataUrl;
      link.download = filename;
      link.style.display = "none";
      document.body.appendChild(link);
      link.click();
      setTimeout(() => {
        document.body.removeChild(link);
      }, 100);
    } catch (err: any) {
      const errorMessage = err?.message || err?.toString() || "Unknown error";
      const errorDetails = err?.stack || JSON.stringify(err);
      console.error("Failed to download:", {
        message: errorMessage,
        details: errorDetails,
        error: err,
        previewCardExists: !!previewCardRef.current,
      });
      alert(`Failed to download image: ${errorMessage}. Please try again.`);
    } finally {
      setDownloading(false);
      setHideAvatarForExport(false);
    }
  };

  const handleCopy = async () => {
    if (!previewCardRef.current || copying) return;

    setCopying(true);
    setHideAvatarForExport(true);
    
    try {
      // Wait for DOM update
      await new Promise((resolve) => setTimeout(resolve, 200));

      const dataUrl = await toPng(previewCardRef.current, {
        backgroundColor: "#fafafa",
        pixelRatio: 2,
        cacheBust: true,
        quality: 1,
      });

      if (!dataUrl || dataUrl === "data:," || !dataUrl.startsWith("data:image")) {
        throw new Error(`Failed to generate image data URL. Got: ${dataUrl?.substring(0, 50)}...`);
      }

      // Convert data URL to blob
      const response = await fetch(dataUrl);
      const blob = await response.blob();

      await navigator.clipboard.write([
        new ClipboardItem({
          "image/png": blob,
        }),
      ]);

      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err: any) {
      console.error("Failed to copy:", err);
      // Fallback: try copying just the chart image if full card fails
      if (chartDataUrl) {
        try {
          const response = await fetch(chartDataUrl);
          const blob = await response.blob();
          await navigator.clipboard.write([
            new ClipboardItem({
              "image/png": blob,
            }),
          ]);
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        } catch (fallbackErr: any) {
          console.error("Fallback copy also failed:", fallbackErr);
        }
      }
    } finally {
      setCopying(false);
      setHideAvatarForExport(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl p-0 overflow-visible" showCloseButton={false}>
        <DialogTitle className="sr-only">Export Preview</DialogTitle>
        <div className="relative">
          {/* Preview area */}
          <div className="p-8 bg-[#f5f5f5] rounded-lg flex items-center justify-center min-h-[400px]">
            {loading ? (
              <div className="text-sm text-[#999]">Generating preview...</div>
            ) : chartDataUrl ? (
              <div
                ref={previewCardRef}
                className="bg-[#fafafa] rounded-xl p-6 flex flex-col items-center shadow-sm max-w-full tracking-tight"
              >
                {/* Repo info with avatar */}
                {owner && repo && !hideAvatarForExport && (
                  <div className="flex items-center gap-2 mb-3">
                    <Avatar className="h-6 w-6">
                      <AvatarImage
                        src={`https://github.com/${owner}.png`}
                        alt={owner}
                      />
                      <AvatarFallback className="text-xs bg-[#e5e5e5] text-[#666]">
                        {owner.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm font-medium text-[#181925]">
                      {owner}/{repo}
                    </span>
                  </div>
                )}
                {/* Repo info without avatar (for export) */}
                {owner && repo && hideAvatarForExport && (
                  <div className="flex items-center gap-2 mb-3">
                    <div className="h-6 w-6 rounded-full bg-[#e5e5e5] flex items-center justify-center">
                      <span className="text-xs text-[#666]">
                        {owner.slice(0, 2).toUpperCase()}
                      </span>
                    </div>
                    <span className="text-sm font-medium text-[#181925]">
                      {owner}/{repo}
                    </span>
                  </div>
                )}

                {/* Title and subtitle */}
                {(title || subtitle) && (
                  <div className="text-center mb-4">
                    {title && (
                      <h3 className="text-lg font-medium text-[#181925] tracking-tight">
                        {title}
                      </h3>
                    )}
                    {subtitle && (
                      <p className="text-sm text-[#666666] mt-1">
                        {formatSubtitleWithMonoNumbers(subtitle)}
                      </p>
                    )}
                  </div>
                )}

                {/* Chart image */}
                <img
                  src={chartDataUrl}
                  alt="Chart preview"
                  className="rounded-lg max-w-full h-auto"
                  style={{ maxHeight: "320px" }}
                />

                {/* Footer */}
                <div className="flex items-center gap-2 mt-4 pt-2">
                  <Logo size={18} variant="dark" />
                  <span className="text-sm text-[#666666] font-medium">
                    by gitstat.dev
                  </span>
                </div>
              </div>
            ) : (
              <div className="text-sm text-[#999]">Failed to load preview</div>
            )}
          </div>

          {/* Action buttons - outside modal on the right */}
          <div className="absolute -right-14 top-1/2 -translate-y-1/2 flex flex-col gap-2">
            <button
              onClick={handleDownload}
              disabled={!chartDataUrl || loading || downloading}
              className="h-10 w-10 rounded-md shadow-lg cursor-pointer bg-[#181925] text-white flex items-center justify-center transition-colors duration-200 ease-out hover:bg-[#2a2b3d] disabled:opacity-50 disabled:cursor-not-allowed"
              title={downloading ? "Downloading..." : "Download"}
            >
              {downloading ? (
                <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <HugeiconsIcon icon={Download01Icon} size={16} />
              )}
            </button>

            <button
              onClick={handleCopy}
              disabled={!chartDataUrl || loading || copying}
              className="h-10 w-10 rounded-md shadow-lg cursor-pointer bg-white border border-[#e5e5e5] text-[#181925] flex items-center justify-center transition-colors duration-200 ease-out hover:bg-[#f5f5f5] hover:border-[#d0d0d0] disabled:opacity-50 disabled:cursor-not-allowed"
              title={copied ? "Copied!" : copying ? "Copying..." : "Copy to clipboard"}
            >
              {copied ? (
                <Check className="h-4 w-4 text-green-600" />
              ) : copying ? (
                <div className="h-4 w-4 border-2 border-[#181925]/30 border-t-[#181925] rounded-full animate-spin" />
              ) : (
                <HugeiconsIcon icon={Copy01Icon} size={16} />
              )}
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
