"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter, useSearchParams } from "next/navigation";
import toast from "react-hot-toast";

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const errorMsg = searchParams.get("error");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (errorMsg) toast.error(errorMsg);
  }, [errorMsg]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Email and password are required.");
      return;
    }

    setLoading(true);
    try {
      await login(email, password); // sends OTP only
      toast.success("OTP sent to your email!");
      router.push(`/login/verify-otp?email=${encodeURIComponent(email)}`);
    } catch (err) {
      const message =
        err.response?.data?.message || "Login failed. Please try again.";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: "radial-gradient(circle at top, #232338 50%, #0f0f14 60%)" }}>
      <div className="bg-white shadow-xl rounded-2xl p-10 max-w-md w-full relative">
        {/* Logo/Brand */}
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-blue-900">LearningShala</h1>
          <p className="text-gray-500 mt-2 font-medium">Empowering your learning journey</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block mb-1 font-medium text-gray-700">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full border-0 border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block mb-1 font-medium text-gray-700">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="********"
              className="w-full border-0 border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-900 text-white py-2 rounded-lg hover:bg-blue-850 transition"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        {/* Optional footer */}
        <p className="mt-6 text-center text-gray-400 text-sm">
          &copy; {new Date().getFullYear()} Learning Shala. All rights reserved.
        </p>
      </div>
    </div>
  );
}
