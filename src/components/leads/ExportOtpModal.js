"use client";

import { useState, useEffect, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import toast from "react-hot-toast";
import api from "@/lib/header";

const FIXED_EMAIL = "aashish@learningshala.in";

export default function ExportOtpModal({ open, onClose, onVerified }) {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [expiryTime, setExpiryTime] = useState(5 * 60); // 5 minutes in seconds
  const inputRefs = useRef([]);

  // Auto-send OTP when modal opens
  useEffect(() => {
    if (open) {
      setOtp(["", "", "", "", "", ""]);
      setExpiryTime(5 * 60);
      setResendCooldown(0);
      sendOtp();
    }
  }, [open]);

  // Countdown timers
  useEffect(() => {
    if (!open) return;

    const timer = setInterval(() => {
      setExpiryTime((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    const resendTimer = setInterval(() => {
      setResendCooldown((prev) => {
        if (prev <= 1) {
          clearInterval(resendTimer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      clearInterval(timer);
      clearInterval(resendTimer);
    };
  }, [open]);

  const sendOtp = async () => {
    setSendingOtp(true);
    try {
      const res = await api.post("/leads/send-export-otp");
      toast.success("OTP sent to " + FIXED_EMAIL);
      setExpiryTime(5 * 60);
      setResendCooldown(30);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to send OTP");
    } finally {
      setSendingOtp(false);
    }
  };

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

  const handleVerify = async () => {
    const otpString = otp.join("");

    if (otpString.length !== 6) {
      toast.error("Please enter a 6-digit OTP");
      return;
    }

    setLoading(true);
    try {
      const res = await api.post("/leads/verify-export-otp", { otp: otpString });
      toast.success("OTP verified successfully!");
      onVerified();
      onClose();
    } catch (error) {
      toast.error(error.response?.data?.message || "Invalid OTP. Please try again.");
      // Clear OTP on error
      setOtp(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (resendCooldown > 0) return;
    await sendOtp();
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Verify OTP to Export</DialogTitle>
          <DialogDescription>
            Enter the 6-digit OTP sent to {FIXED_EMAIL}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Email display */}
          <div className="text-center">
            <p className="text-sm text-gray-600">
              OTP sent to <span className="font-semibold">{FIXED_EMAIL}</span>
            </p>
          </div>

          {/* Expiry timer */}
          {expiryTime > 0 && (
            <div className="text-center">
              <p className="text-xs text-gray-500">
                Code expires in: <span className="font-semibold">{formatTime(expiryTime)}</span>
              </p>
            </div>
          )}

          {expiryTime === 0 && (
            <div className="text-center">
              <p className="text-xs text-red-500 font-semibold">
                Code expired. Please request a new one.
              </p>
            </div>
          )}

          {/* OTP Input */}
          <div className="flex justify-center gap-2">
            {otp.map((digit, index) => (
              <Input
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
                className="w-12 h-12 text-center text-xl font-semibold"
                disabled={loading || expiryTime === 0}
              />
            ))}
          </div>

          {/* Verify button */}
          <Button
            onClick={handleVerify}
            disabled={loading || expiryTime === 0}
            className="w-full"
          >
            {loading ? "Verifying..." : "Verify OTP"}
          </Button>

          {/* Resend OTP */}
          <div className="text-center">
            <Button
              type="button"
              variant="ghost"
              onClick={handleResendOtp}
              disabled={resendCooldown > 0 || loading || sendingOtp}
              className="text-sm"
            >
              {sendingOtp
                ? "Sending..."
                : resendCooldown > 0
                ? `Resend OTP in ${resendCooldown}s`
                : "Resend OTP"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
