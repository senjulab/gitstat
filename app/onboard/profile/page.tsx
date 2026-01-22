"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createClient } from "@/lib/supabase/client";
import OnboardingProgress from "@/components/onboarding-progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function ProfilePage() {
  const [name, setName] = useState("");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const supabase = createClient();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file size (max 2MB)
      if (file.size > 2 * 1024 * 1024) {
        alert("File size must be less than 2MB");
        return;
      }

      // Validate file type
      if (!["image/png", "image/jpeg", "image/webp"].includes(file.type)) {
        alert("Only PNG, JPEG, and WebP images are allowed");
        return;
      }

      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const uploadAvatarInBackground = async (userId: string, file: File) => {
    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${userId}/${Date.now()}.${fileExt}`;

      // Upload to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(fileName, file, {
          upsert: true,
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const {
        data: { publicUrl },
      } = supabase.storage.from("avatars").getPublicUrl(fileName);

      // Update user metadata with avatar URL
      await supabase.auth.updateUser({
        data: { avatar_url: publicUrl },
      });
    } catch (error) {
      console.error("Failed to upload avatar:", error);
      // Silent fail - user already navigated away
    }
  };

  const saveProfileInBackground = async (
    userName: string,
    file: File | null,
  ) => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      // Update name in metadata
      await supabase.auth.updateUser({
        data: { full_name: userName },
      });

      // Upload avatar if provided
      if (file) {
        await uploadAvatarInBackground(user.id, file);
      }
    } catch (error) {
      console.error("Failed to save profile:", error);
      // Silent fail - user already navigated away
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Navigate immediately without waiting
    router.push("/onboard/connect");

    // Save data in background (non-blocking)
    saveProfileInBackground(name, avatarFile);
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="flex items-center justify-center">
          <span className="text-sm text-[#0006] border-transparent h-[24px] min-w-[24px] bg-[#00000008] px-3 py-1 pl-2 pr-2 gap-1 rounded-sm font-medium flex items-center justify-center border border-[#00000008]">
            Account
          </span>
        </div>

        {/* Header */}
        <div className="text-center ">
          <h1 className="text-2xl font-medium text-black">
            Welcome to GitStat
          </h1>
          <p className="text-[#666666] text-md">Let's set up your profile</p>
        </div>

        <div>
          <div className="space-y-2">
            <div className="flex items-center justify-center ">
              <div
                onClick={() => fileInputRef.current?.click()}
                className="cursor-pointer hover:opacity-80 transition-opacity"
              >
                <Avatar className="w-25 h-25">
                  <AvatarImage src={avatarPreview} alt="Profile" />
                  <AvatarFallback className="bg-[#f5f5f5] text-2xl font-medium text-[#b3b3b3]">
                    {name ? name[0].toUpperCase() : "?"}
                  </AvatarFallback>
                </Avatar>
                <p className="text-[#666666] text-xs text-center">optional</p>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label
                htmlFor="name"
                className="text-sm font-medium text-[#666666]"
              >
                Name
              </label>
              <Input
                id="name"
                type="text"
                placeholder="Enter your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="border-none rounded-xl h-12 w-full bg-[#f3f3f3] text-base placeholder:text-[#b3b3b3] placeholder:font-medium"
              />
            </div>

            <Button
              type="submit"
              disabled={!name}
              className="w-full h-12 bg-[#14141F] hover:bg-[#14141F99] text-white rounded-full text-base font-medium cursor-pointer"
            >
              Continue
            </Button>

            <OnboardingProgress currentStep={0} totalSteps={2} />
          </form>
        </div>
      </div>
    </div>
  );
}
