"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import toast from "react-hot-toast";

export default function VerifyOtpPage() {
  const { verifyOtp } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email");

  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [expiryTime, setExpiryTime] = useState(5 * 60); // 5 minutes in seconds
  const inputRefs = useRef([]);

  useEffect(() => {
    if (!email) {
      toast.error("Email is required");
      router.push("/login");
      return;
    }

    // Start countdown timer
    const timer = setInterval(() => {
      setExpiryTime((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // Start resend cooldown
    const resendTimer = setInterval(() => {
      setResendCooldown((prev) => {
        if (prev <= 1) {
          clearInterval(resendTimer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    setResendCooldown(30); // 30 seconds cooldown

    return () => {
      clearInterval(timer);
      clearInterval(resendTimer);
    };
  }, [email, router]);

  const handleOtpChange = (index, value) => {
    if (value.length > 1) {
      // Handle paste
      const pastedOtp = value.slice(0, 6).split("");
      const newOtp = [...otp];
      pastedOtp.forEach((digit, i) => {
        if (index + i < 6) {
          newOtp[index + i] = digit;
        }
      });
      setOtp(newOtp);
      // Focus on the last filled input or the last input
      const lastIndex = Math.min(index + pastedOtp.length - 1, 5);
      if (inputRefs.current[lastIndex]) {
        inputRefs.current[lastIndex].focus();
      }
      return;
    }

    // Single digit input
    if (!/^\d*$/.test(value)) return; // Only allow digits

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const otpString = otp.join("");
    
    if (otpString.length !== 6) {
      toast.error("Please enter a 6-digit OTP");
      return;
    }

    if (!email) {
      toast.error("Email is required");
      router.push("/login");
      return;
    }

    setLoading(true);
    try {
      await verifyOtp(email, otpString);
      toast.success("Login successful!");
    } catch (err) {
      const message =
        err.response?.data?.message || "Invalid OTP. Please try again.";
      toast.error(message);
      // Clear OTP on error
      setOtp(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (resendCooldown > 0) return;

    try {
      // Call login again to resend OTP
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/cms/users/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password: "" }), // Password validation is commented out in backend
      });

      if (res.ok) {
        toast.success("OTP resent to your email");
        setResendCooldown(30);
        setExpiryTime(5 * 60); // Reset expiry timer
      } else {
        const data = await res.json();
        toast.error(data.message || "Failed to resend OTP");
      }
    } catch (err) {
      toast.error("Failed to resend OTP. Please try again.");
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  if (!email) {
    return null;
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center"
      style={{
        background: "radial-gradient(circle at top, #232338 50%, #0f0f14 60%)",
      }}
    >
      <div className="bg-white shadow-xl rounded-2xl p-10 max-w-md w-full relative">
        {/* Logo/Brand */}
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-blue-900">LearningShala</h1>
          <p className="text-gray-500 mt-2 font-medium">
            Enter verification code
          </p>
        </div>

        {/* Email display */}
        <div className="mb-6 text-center">
          <p className="text-sm text-gray-600">
            We sent a 6-digit code to
          </p>
          <p className="text-sm font-semibold text-gray-800 mt-1">{email}</p>
        </div>

        {/* Expiry timer */}
        {expiryTime > 0 && (
          <div className="mb-4 text-center">
            <p className="text-xs text-gray-500">
              Code expires in: <span className="font-semibold">{formatTime(expiryTime)}</span>
            </p>
          </div>
        )}

        {expiryTime === 0 && (
          <div className="mb-4 text-center">
            <p className="text-xs text-red-500 font-semibold">
              Code expired. Please request a new one.
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* OTP Input */}
          <div className="flex justify-center gap-2">
            {otp.map((digit, index) => (
              <input
                key={index}
                ref={(el) => (inputRefs.current[index] = el)}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleOtpChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                onPaste={(e) => {
                  e.preventDefault();
                  const pastedData = e.clipboardData.getData("text");
                  handleOtpChange(0, pastedData);
                }}
                className="w-12 h-12 text-center text-xl font-semibold border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                disabled={loading || expiryTime === 0}
              />
            ))}
          </div>

          {/* Submit button */}
          <button
            type="submit"
            disabled={loading || expiryTime === 0}
            className="w-full bg-blue-900 text-white py-2 rounded-lg hover:bg-blue-850 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Verifying..." : "Verify OTP"}
          </button>

          {/* Resend OTP */}
          <div className="text-center">
            <button
              type="button"
              onClick={handleResendOtp}
              disabled={resendCooldown > 0 || loading}
              className="text-blue-900 text-sm hover:underline disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {resendCooldown > 0
                ? `Resend OTP in ${resendCooldown}s`
                : "Resend OTP"}
            </button>
          </div>

          {/* Back to login */}
          <div className="text-center">
            <button
              type="button"
              onClick={() => router.push("/login")}
              className="text-gray-600 text-sm hover:underline"
            >
              ← Back to login
            </button>
          </div>
        </form>

        {/* Optional footer */}
        <p className="mt-6 text-center text-gray-400 text-sm">
          &copy; {new Date().getFullYear()} Learning Shala. All rights reserved.
        </p>
      </div>
    </div>
  );
}
