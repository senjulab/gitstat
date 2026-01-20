"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import OTPInput from "@/components/otp-input";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";

export default function VerifyPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [resending, setResending] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const storedEmail = sessionStorage.getItem("verification_email");
    if (!storedEmail) {
      router.push("/register");
    } else {
      setEmail(storedEmail);
    }
  }, [router]);

  const handleVerify = async (otp: string) => {
    setError("");
    setLoading(true);

    try {
      const { error } = await supabase.auth.verifyOtp({
        email,
        token: otp,
        type: "email",
      });

      if (error) throw error;

      // Clear stored email
      sessionStorage.removeItem("verification_email");

      // Redirect to onboarding
      router.push("/onboard/profile");
    } catch (err: any) {
      setError(err.message || "Invalid verification code");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResending(true);
    setError("");

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          shouldCreateUser: true,
        },
      });

      if (error) throw error;
    } catch (err: any) {
      setError(err.message || "Failed to resend code");
    } finally {
      setResending(false);
    }
  };

  if (!email) {
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-50 px-4 font-medium tracking-tight">
      <div className="w-full max-w-md space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-xl font-medium text-black">Sign up to GitStat</h1>
          <p className="text-[#666666] text-md font-normal">
            Simple, beautiful repository analytics.
          </p>
        </div>

        {/* Verification Message */}
        <div className="text-center space-y-6">
          <p className="text-[#666666] text-sm">
            We sent a verification code to{" "}
            <span className="font-medium text-black">{email}</span>
          </p>

          {/* OTP Input */}
          <OTPInput onComplete={handleVerify} />

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm">
              {error}
            </div>
          )}

          {/* Resend */}
          <p className="text-[#666666] text-sm">
            Didn't get it?{" "}
            <button
              onClick={handleResend}
              disabled={resending || loading}
              className="text-black font-medium hover:text-neutral-700 disabled:opacity-50"
            >
              {resending ? "Sending..." : "Resend"}
            </button>
          </p>

          {/* Back Button */}
          <Link href="/register">
            <Button
              variant="ghost"
              className="w-10 h-10 rounded-full hover:bg-[#f3f3f3]"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 20 20"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M12.5 15L7.5 10L12.5 5"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
