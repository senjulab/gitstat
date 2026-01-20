"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createClient } from "@/lib/supabase/client";

export default function ProfilePage() {
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        throw new Error("Not authenticated");
      }

      const { error } = await supabase.auth.updateUser({
        data: { full_name: name },
      });

      if (error) throw error;

      // Redirect to next onboarding step
      router.push("/onboard/connect");
    } catch (err: any) {
      setError(err.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md space-y-8">
        <div className="flex items-center justify-center ">
          <span className="text-sm text-[#0006]  border-transparent h-[24px] min-w-[24px] bg-[#00000008] px-3 py-1 pl-2 pr-2 gap-1 rounded-sm font-medium flex items-center justify-center border border-[#00000008]">
            Account
          </span>
        </div>
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-medium text-black">
            Welcome to GitStat
          </h1>
          <p className="text-[#666666] text-md">Let's set up your profile</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <label
              htmlFor="name"
              className="text-sm font-medium text-[#666666]"
            >
              Your name
            </label>
            <Input
              id="name"
              type="text"
              placeholder="Enter your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              disabled={loading}
              className="border-none rounded-xl h-12 w-full bg-[#f3f3f3] text-base placeholder:text-[#b3b3b3] placeholder:font-medium"
            />
          </div>

          <div className="space-y-2">
            <label
              htmlFor="photo"
              className="text-sm font-medium text-[#666666]"
            >
              Profile photo (optional)
            </label>
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-[#f3f3f3] flex items-center justify-center text-2xl font-medium text-[#666666]">
                {name ? name[0].toUpperCase() : "?"}
              </div>
              <Button
                type="button"
                variant="outline"
                className="h-10 border-2 border-neutral-200 hover:bg-neutral-50 rounded-xl"
              >
                Upload photo
              </Button>
            </div>
          </div>

          <Button
            type="submit"
            disabled={loading || !name}
            className="w-full h-12 bg-indigo-200 hover:bg-indigo-300 text-white rounded-full text-base font-medium cursor-pointer disabled:opacity-50"
          >
            {loading ? "Saving..." : "Continue"}
          </Button>
        </form>
      </div>
    </div>
  );
}
