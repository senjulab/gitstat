"use client";

import { useState } from "react";
import { Copy, Check } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { DashboardSidebar } from "@/app/components/DashboardSidebar";

export default function SettingsPage() {
  const [projectName, setProjectName] = useState("salim");
  const [isPublic, setIsPublic] = useState(false);
  const [copiedToken, setCopiedToken] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState(false);

  const projectToken = "4a151b05-4d06-4b29-9592-2e828ebc86f2";
  const publicUrl = "visitors.now/s/salim.dev";

  const handleCopy = async (text: string, type: "token" | "url") => {
    await navigator.clipboard.writeText(text);
    if (type === "token") {
      setCopiedToken(true);
      setTimeout(() => setCopiedToken(false), 2000);
    } else {
      setCopiedUrl(true);
      setTimeout(() => setCopiedUrl(false), 2000);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-6 py-12 tracking-tight">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-2xl font-medium text-black mb-2">Settings</h1>
        <p className="text-[#666] font-normal">Manage your project.</p>
      </div>

      {/* Content */}
      <div className="flex gap-6">
        {/* Sidebar */}
        <DashboardSidebar />

        {/* Main Content */}
        <div className="flex-1 space-y-4">
          {/* Project Name Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-[#f7f7f7] overflow-hidden">
            <div className="px-4 py-4">
              <h2 className="text-base font-medium text-[#181925] mb-1">
                Project name
              </h2>
              <p className="text-sm text-[#999] mb-4">The name of your project.</p>
              <Input
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                maxLength={30}
                className="border-none rounded-xl h-11 bg-[#fafafa] text-base font-medium placeholder:text-[#b3b3b3] focus:ring-0"
              />
            </div>
            <div className="px-4 py-2 bg-white border-t border-[#f7f7f7] flex items-center justify-between h-12">
              <span className="text-xs text-[#999]">Maximum of 30 characters</span>
              <Button
                className="select-none h-[30px] px-2.5 text-sm rounded-full font-medium bg-white hover:bg-white text-[#181925] border border-[#e0e0e0] hover:border-[#b3b3b3] active:bg-[#f5f5f5] active:scale-[0.99] transition-all duration-200"
              >
                Save
              </Button>
            </div>
          </div>

          {/* Project Token Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-[#f7f7f7] overflow-hidden">
            <div className="px-4 py-4">
              <h2 className="text-base font-medium text-[#181925] mb-1">
                Project token
              </h2>
              <p className="text-sm text-[#999] mb-4">
                A unique token assigned to your project.
              </p>
              <Input
                value={projectToken}
                readOnly
                className="border-none rounded-xl h-11 bg-[#fafafa] text-base font-medium text-[#666] cursor-default focus:ring-0"
              />
            </div>
            <div className="px-4 py-2 bg-white border-t border-[#f7f7f7] flex items-center justify-between h-12">
              <span className="text-xs text-[#999]">Used to identify your project</span>
              <Button
                onClick={() => handleCopy(projectToken, "token")}
                className="select-none h-[30px] px-2.5 text-sm rounded-full font-medium bg-white hover:bg-white text-[#181925] border border-[#e0e0e0] hover:border-[#b3b3b3] active:bg-[#f5f5f5] active:scale-[0.99] transition-all duration-200"
              >
                {copiedToken ? (
                  <>
                    <Check className="w-4 h-4 mr-1" />
                    Copied
                  </>
                ) : (
                  "Copy"
                )}
              </Button>
            </div>
          </div>

          {/* Public Stats Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-[#f7f7f7] overflow-hidden">
            <div className="px-4 py-4">
              <h2 className="text-base font-medium text-[#181925] mb-1">
                Public stats
              </h2>
              <p className="text-sm text-[#999] mb-4">
                Share your project stats with the public.
              </p>
              <div className="flex items-center gap-3">
                <Switch checked={isPublic} onCheckedChange={setIsPublic} />
                <span className="text-sm text-[#666]">
                  {isPublic ? "Currently public" : "Currently private"}
                </span>
              </div>
            </div>
            <div className="px-4 py-2 bg-white border-t border-[#f7f7f7] flex items-center justify-between h-12">
              <span className="text-xs text-[#999]">{publicUrl}</span>
              <Button
                onClick={() => handleCopy(`https://${publicUrl}`, "url")}
                className="select-none h-[30px] px-2.5 text-sm rounded-full font-medium bg-white hover:bg-white text-[#181925] border border-[#e0e0e0] hover:border-[#b3b3b3] active:bg-[#f5f5f5] active:scale-[0.99] transition-all duration-200"
              >
                {copiedUrl ? (
                  <>
                    <Check className="w-4 h-4 mr-1" />
                    Copied
                  </>
                ) : (
                  "Copy"
                )}
              </Button>
            </div>
          </div>

          {/* Delete Project Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-[#f7f7f7] overflow-hidden">
            <div className="px-4 py-4">
              <h2 className="text-base font-medium text-[#181925] mb-1">
                Delete project
              </h2>
              <p className="text-sm text-[#999]">
                Permanently delete your project. This action is practically
                immediate, and cannot be undone.
              </p>
            </div>
            <div className="px-4 py-2 bg-white border-t border-[#f7f7f7] flex items-center justify-between h-12">
              <span className="text-xs text-[#999]">Proceed with caution</span>
              <Button className="select-none h-[30px] px-2.5 text-sm rounded-full font-medium bg-[#ff2f00] hover:bg-[#ff2f00] text-white border border-[#ff2f00] hover:border-[#e02a00] active:bg-[#e02a00] active:scale-[0.99] transition-all duration-200">
                Delete
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
