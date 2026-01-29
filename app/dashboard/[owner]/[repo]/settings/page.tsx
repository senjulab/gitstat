"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Copy, Check } from "lucide-react";
import { HugeiconsIcon } from "@hugeicons/react";
import { Delete02Icon } from "@hugeicons/core-free-icons";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { DashboardSidebar } from "@/app/components/DashboardSidebar";

export default function SettingsPage() {
  const params = useParams();
  const owner = params.owner as string;
  const repo = params.repo as string;
  const router = useRouter();
  const supabase = createClient();

  const [projectName, setProjectName] = useState(repo);
  const [originalProjectName, setOriginalProjectName] = useState(repo);
  const [isPublic, setIsPublic] = useState(false);
  const [copiedToken, setCopiedToken] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [teamMembers, setTeamMembers] = useState(["john", "sarah"]);
  const [inviteEmail, setInviteEmail] = useState("");
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const projectToken = "4a151b05-4d06-4b29-9592-2e828ebc86f2";
  const publicUrl = `gitstat.dev/s/${owner}/${repo}`;

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

  const handleInvite = () => {
    if (inviteEmail.trim()) {
      setTeamMembers([...teamMembers, inviteEmail.trim()]);
      setInviteEmail("");
    }
  };

  const handleRemoveMember = (username: string) => {
    setTeamMembers(teamMembers.filter((m) => m !== username));
  };

  // Fetch current display_name and is_public on mount
  useEffect(() => {
    const fetchRepoDetails = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) return;

        const { data, error } = await supabase
          .from("connected_repositories")
          .select("display_name, is_public")
          .eq("user_id", user.id)
          .eq("repo_owner", owner)
          .eq("repo_name", repo)
          .single();

        if (error) {
          console.error("Error fetching repo details:", error);
          return;
        }

        if (data) {
          setProjectName(data.display_name || repo);
          setOriginalProjectName(data.display_name || repo);
          setIsPublic(data.is_public || false);
        }
      } catch (err) {
        console.error("Unexpected error:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRepoDetails();
  }, [owner, repo, supabase]);

  const handleTogglePublic = async (checked: boolean) => {
    // 1. Optimistic update
    setIsPublic(checked);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from("connected_repositories")
        .update({ is_public: checked })
        .eq("user_id", user.id)
        .eq("repo_owner", owner)
        .eq("repo_name", repo);

      if (error) {
        throw error;
      }
    } catch (err) {
      console.error("Error updating public status:", err);
      // Revert on error
      setIsPublic(!checked);
    }
  };

  const handleSaveProjectName = async () => {
    if (projectName.trim() === originalProjectName.trim()) {
      return; // No changes
    }

    setIsSaving(true);
    setSaveError(null);
    setSaveSuccess(false);

    try {
      const response = await fetch("/api/settings/update-repo-name", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          owner,
          repo,
          displayName: projectName.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to update project name");
      }

      setOriginalProjectName(data.displayName);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err: any) {
      setSaveError(err.message || "Failed to update project name");
      setTimeout(() => setSaveError(null), 5000);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteProject = async () => {
    if (deleteConfirmText !== projectName) return;

    setIsDeleting(true);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      // Delete from connected_repositories
      const { error } = await supabase
        .from("connected_repositories")
        .delete()
        .eq("user_id", user.id)
        .eq("repo_owner", owner)
        .eq("repo_name", repo);

      if (error) throw error;

      // Get remaining repositories to redirect
      const { data: remainingRepos } = await supabase
        .from("connected_repositories")
        .select("repo_owner, repo_name")
        .eq("user_id", user.id)
        .limit(1);

      // Redirect to first available repo or onboard page
      if (remainingRepos && remainingRepos.length > 0) {
        router.push(
          `/dashboard/${remainingRepos[0].repo_owner}/${remainingRepos[0].repo_name}`,
        );
      } else {
        router.push("/onboard/connect");
      }
    } catch (err: any) {
      console.error("Failed to delete project:", err);
      alert("Failed to delete project. Please try again.");
      setIsDeleting(false);
      setShowDeleteDialog(false);
      setDeleteConfirmText("");
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-12 tracking-tight">
      <div className="text-center mb-8 sm:mb-12">
        <h1 className="text-2xl font-medium text-black mb-2">Settings</h1>
        <p className="text-[#666] font-normal">Manage your project.</p>
      </div>

      <div className="flex flex-col md:flex-row gap-4 md:gap-6">
        <DashboardSidebar />

        <div className="flex-1 min-w-0 space-y-4">
          {/* will make it in public after launch */}
          <div className="bg-white rounded-2xl shadow-sm border border-[#f7f7f7] overflow-hidden">
            <div className="px-4 py-4">
              <h2 className="text-base font-medium text-[#181925] mb-1">
                Project name
              </h2>
              <p className="text-sm text-[#999] mb-4">
                The name of your project.
              </p>
              <Input
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                maxLength={30}
                disabled={isLoading || isSaving}
                className="border-none rounded-xl h-11 bg-[#fafafa] text-base font-medium placeholder:text-[#b3b3b3] focus:ring-0"
              />
              {saveError && (
                <p className="text-xs text-red-600 mt-2">{saveError}</p>
              )}
              {saveSuccess && (
                <p className="text-xs text-green-600 mt-2">
                  Project name updated successfully!
                </p>
              )}
            </div>
            <div className="px-4 py-2 bg-white border-t border-[#f7f7f7] flex items-center justify-between h-12">
              <span className="text-xs text-[#999]">
                Maximum of 30 characters
              </span>
              <Button
                onClick={handleSaveProjectName}
                disabled={
                  isLoading ||
                  isSaving ||
                  projectName.trim() === originalProjectName.trim() ||
                  projectName.trim().length === 0
                }
                className="cursor-pointer select-none h-[30px] px-2.5 text-sm rounded-full font-medium bg-white hover:bg-white text-[#181925] border border-[#e0e0e0] hover:border-[#b3b3b3] active:bg-[#f5f5f5] active:scale-[0.99] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSaving ? "Saving..." : saveSuccess ? "Saved!" : "Save"}
              </Button>
            </div>
          </div>

          {/* will make it in public after launch */}
          <div className="bg-white rounded-2xl shadow-sm border border-[#f7f7f7] overflow-hidden">
            <div className="px-4 py-4">
              <h2 className="text-base font-medium text-[#181925] mb-1">
                Public stats
              </h2>
              <p className="text-sm text-[#999] mb-4">
                Share your repo stats with anyone.
              </p>
              <div className="flex items-center gap-3">
                <Switch
                  checked={isPublic}
                  onCheckedChange={handleTogglePublic}
                />
                <span className="text-sm text-[#666]">
                  {isPublic ? "Public" : "Private"}
                </span>
              </div>
            </div>
            <div className="px-4 py-2 bg-white border-t border-[#f7f7f7] flex items-center justify-between h-12">
              <span className="text-xs text-[#999]">{publicUrl}</span>
              <Button
                onClick={() => handleCopy(`https://${publicUrl}`, "url")}
                className="cursor-pointer select-none h-[30px] px-2.5 text-sm rounded-full font-medium bg-white hover:bg-white text-[#181925] border border-[#e0e0e0] hover:border-[#b3b3b3] active:bg-[#f5f5f5] active:scale-[0.99] transition-all duration-200"
              >
                {copiedUrl ? (
                  <>
                    <Check className="w-4 h-4 mr-1" />
                    Copied
                  </>
                ) : (
                  "Copy link"
                )}
              </Button>
            </div>
          </div>

          {/* will make it in public after launch */}
          {/* <div className="bg-white rounded-2xl shadow-sm border border-[#f7f7f7] overflow-hidden">
            <div className="px-4 py-4">
              <h2 className="text-base font-medium text-[#181925] mb-1">
                Team
              </h2>
              <p className="text-sm text-[#999] mb-4">
                Manage who has access to this project.
              </p>

              {teamMembers.length > 0 && (
                <div className="space-y-2 mb-4">
                  {teamMembers.map((member) => (
                    <div
                      key={member}
                      className="flex items-center justify-between py-2 px-3 bg-[#fafafa] rounded-xl"
                    >
                      <span className="text-sm font-medium text-[#181925]">
                        {member}
                      </span>
                      <button
                        onClick={() => handleRemoveMember(member)}
                        className="cursor-pointer text-[#999] hover:text-[#ff2f00] transition-colors"
                      >
                        <HugeiconsIcon icon={Delete02Icon} size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex gap-2">
                <Input
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="Enter email or username"
                  className="border-none rounded-xl h-11 bg-[#fafafa] text-base font-medium placeholder:text-[#b3b3b3] focus:ring-0"
                  onKeyDown={(e) => e.key === "Enter" && handleInvite()}
                />
                <Button
                  onClick={handleInvite}
                  className="cursor-pointer select-none h-11 px-4 text-sm rounded-full font-medium bg-white hover:bg-white text-[#181925] border border-[#e0e0e0] hover:border-[#b3b3b3] active:bg-[#f5f5f5] active:scale-[0.99] transition-all duration-200"
                >
                  Send invite
                </Button>
              </div>
            </div>
          </div> */}

          <div className="bg-white rounded-2xl shadow-sm border border-[#f7f7f7] overflow-hidden">
            <div className="px-4 py-4">
              <h2 className="text-base font-medium text-[#181925] mb-1">
                Remove project
              </h2>
              <p className="text-sm text-[#999]">
                Permanently delete your project. This action is immediate and
                cannot be undone.
              </p>
            </div>
            <div className="px-4 py-2 bg-white border-t border-[#f7f7f7] flex items-center justify-between h-12">
              <span className="text-xs text-[#999]">Proceed with caution</span>
              <Button
                onClick={() => setShowDeleteDialog(true)}
                className="cursor-pointer select-none h-[30px] px-2.5 text-sm rounded-full font-medium bg-[#ff2f00] hover:bg-[#ff2f00] text-white border border-[#ff2f00] hover:border-[#e02a00] active:bg-[#e02a00] active:scale-[0.99] transition-all duration-200"
              >
                Remove
              </Button>
            </div>
          </div>
        </div>
      </div>

      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent
          className="sm:max-w-md tracking-tight rounded-lg"
          showCloseButton={false}
        >
          <DialogHeader>
            <DialogTitle className="text-lg font-medium text-[#181925]">
              Remove project
            </DialogTitle>
            <DialogDescription className="text-sm text-[#666]">
              This action cannot be undone. This will permanently delete the
              project and all associated data.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <p className="text-sm text-[#666]">
              To confirm, type{" "}
              <span className="font-semibold text-[#181925]">
                {projectName}
              </span>{" "}
              below:
            </p>
            <Input
              value={deleteConfirmText}
              onChange={(e) => setDeleteConfirmText(e.target.value)}
              placeholder={projectName}
              className="border border-[#e0e0e0] rounded-xl h-11 bg-white text-base font-medium placeholder:text-[#b3b3b3] focus:ring-0"
            />
            <div className="flex gap-2 justify-end">
              <Button
                onClick={() => {
                  setShowDeleteDialog(false);
                  setDeleteConfirmText("");
                }}
                className="cursor-pointer select-none h-10 px-4 text-sm rounded-full font-medium bg-white hover:bg-white text-[#181925] border border-[#e0e0e0] hover:border-[#b3b3b3] active:bg-[#f5f5f5] active:scale-[0.99] transition-all duration-200"
              >
                Cancel
              </Button>
              <Button
                onClick={handleDeleteProject}
                disabled={deleteConfirmText !== projectName || isDeleting}
                className="cursor-pointer select-none h-10 px-4 text-sm rounded-full font-medium bg-[#ff2f00] hover:bg-[#e02a00] text-white border border-[#ff2f00] hover:border-[#e02a00] active:bg-[#cc2600] active:scale-[0.99] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isDeleting ? "Removing..." : "Remove project"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
