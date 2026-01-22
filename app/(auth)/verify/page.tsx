"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { getOnboardingRedirect } from "@/lib/auth/redirect";
import Link from "next/link";
import { Logo } from "@/components/logo";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";

function VerifyContent() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [resending, setResending] = useState(false);
  const [otp, setOtp] = useState("");
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();

  useEffect(() => {
    const emailParam = searchParams.get("email");
    const storedEmail = sessionStorage.getItem("verification_email");
    const finalEmail = emailParam || storedEmail;

    if (!finalEmail) {
      router.push("/register");
    } else {
      setEmail(finalEmail);
    }
  }, [router, searchParams]);

  const getRedirectPath = async (userId: string) => {
    return await getOnboardingRedirect(userId);
  };

  const handleVerify = async (otp: string) => {
    setError("");
    setLoading(true);

    try {
      const { error, data } = await supabase.auth.verifyOtp({
        email,
        token: otp,
        type: "email",
      });

      if (error) throw error;

      sessionStorage.removeItem("verification_email");

      const redirectPath = await getRedirectPath(data.user?.id || "");
      router.push(redirectPath);
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
    <div className="min-h-screen flex items-center justify-center bg-neutral-50 px-4 tracking-tight">
      <div className="w-full max-w-md space-y-8">
        <div className="flex justify-center">
          <Logo size={48} />
        </div>
        <div className="text-center space-y-2">
          <h1 className="text-xl font-medium text-black">Verify your email</h1>
          <p className="text-[#666666] text-md">
            Simple, beautiful repository analytics.
          </p>
        </div>

        <div className="text-center space-y-6">
          <p className="text-[#666666] text-sm">
            We sent a verification code to{" "}
            <span className="font-medium text-black">{email}</span>
          </p>

          <div className="flex items-center justify-center">
            <InputOTP
              maxLength={6}
              value={otp}
              onChange={(value) => {
                setOtp(value);
                if (value.length === 6) {
                  handleVerify(value);
                }
              }}
            >
              <InputOTPGroup>
                <InputOTPSlot index={0} />
                <InputOTPSlot index={1} />
                <InputOTPSlot index={2} />
                <InputOTPSlot index={3} />
                <InputOTPSlot index={4} />
                <InputOTPSlot index={5} />
              </InputOTPGroup>
            </InputOTP>
          </div>

          {error && <div className="text-red-600 text-sm">{error}</div>}

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

export default function VerifyPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          Loading...
        </div>
      }
    >
      <VerifyContent />
    </Suspense>
  );
}
