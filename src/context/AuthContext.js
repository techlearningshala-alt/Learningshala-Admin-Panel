"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/header";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Function to verify and update user from token
  const verifyUser = async () => {
    // Use localStorage for token (shared across tabs) so new tabs can access the same session
    // Priority: localStorage (shared) > sessionStorage (fallback) > env token
    const token = typeof window !== "undefined" 
      ? localStorage.getItem("token") || sessionStorage.getItem("token")
      : null;
    
    if (!token) {
      // Clear any stale user data
      sessionStorage.removeItem("token");
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      // Decode JWT token to see what's in it (for debugging)
      try {
        const tokenParts = token.split('.');
        if (tokenParts.length === 3) {
          const payload = JSON.parse(atob(tokenParts[1]));
          console.log("🔍 Frontend - JWT token payload:", { id: payload.id, role: payload.role });
        }
      } catch (e) {
        console.warn("Could not decode token:", e);
      }
      
      const res = await api.get("/users/me");
      const freshUser = res.data.data;
      console.log("🔍 Frontend - /users/me response:", { id: freshUser.id, email: freshUser.email, role: freshUser.role });
      // Always update with fresh data from API (never trust localStorage)
      setUser(freshUser);
      localStorage.setItem("user", JSON.stringify(freshUser));
    } catch (err) {
      console.warn("Token invalid or expired", err);
      sessionStorage.removeItem("token");
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      setUser(null);
      // Do NOT redirect immediately on page load
    } finally {
      setLoading(false);
    }
  };

  // Verify user on app load
  useEffect(() => {
    verifyUser();
  }, []);

  // Listen for storage events to sync auth state across tabs
  useEffect(() => {
    const handleStorageChange = (e) => {
      // When token is set/removed in another tab, sync auth state
      if (e.key === "token" || e.key === "user") {
        verifyUser();
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  // OTP Login (commented out - restore previous direct login)
  // Login (Step 1: Validate credentials and send OTP)
  const login = async (email, password) => {
    // Clear any old tokens before login
    sessionStorage.removeItem("token");
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    
    const res = await api.post("/users/login", { email, password });
    console.log("🔍 Frontend - Login response:", res.data.data);
    
    // After successful email/password validation, redirect to OTP page
    // The backend now returns { message: "OTP sent to your email", email: email }
    // No tokens are returned yet
    return res.data.data; // Return email for OTP verification page
  };

  // Verify OTP (Step 2: Verify OTP and complete login)
  const verifyOtp = async (email, otp) => {
    const res = await api.post("/users/verify-otp", { email, otp });
    console.log("🔍 Frontend - OTP verification response:", res.data.data);
    const { accessToken, user } = res.data.data;
    console.log("🔍 Frontend - Setting user after OTP verification:", { id: user.id, email: user.email, role: user.role });

    // Store token in localStorage (shared across tabs) so new tabs can access the same session
    localStorage.setItem("token", accessToken);
    localStorage.setItem("user", JSON.stringify(user));
    // Also store in sessionStorage as fallback
    sessionStorage.setItem("token", accessToken);
    
    setUser(user);
    
    // Redirect based on user role
    if (user.role === "lead") {
      router.push("/leads");
    } else {
      router.push("/dashboard");
    }
  };

  // Previous direct login (restored - OTP temporarily disabled)
  // const login = async (email, password) => {
  //   // Clear any old tokens before login
  //   sessionStorage.removeItem("token");
  //   localStorage.removeItem("token");
  //   localStorage.removeItem("user");
    
  //   const res = await api.post("/users/login", { email, password });
  //   console.log("🔍 Frontend - Login response:", res.data.data);
  //   const { accessToken, user } = res.data.data;
  //   console.log("🔍 Frontend - Setting user after login:", { id: user.id, email: user.email, role: user.role });

  //   // Store token in sessionStorage (tab-specific) to prevent cross-tab interference
  //   sessionStorage.setItem("token", accessToken);
  //   // Don't store in localStorage to avoid cross-tab interference
  //   // localStorage.setItem("token", accessToken);
  //   localStorage.setItem("user", JSON.stringify(user));
    
  //   setUser(user);
    
  //   // Redirect based on user role
  //   if (user.role === "lead") {
  //     router.push("/leads");
  //   } else {
  //     router.push("/dashboard");
  //   }
  // };

  // Logout
  const logout = async () => {
    try {
      await api.post("/users/logout"); // optional if backend expects refresh token
    } catch (e) {
      console.warn("Logout failed, ignoring:", e);
    }
    sessionStorage.removeItem("token");
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    router.push("/login");
  };

  return (
    <AuthContext.Provider value={{ user, login, verifyOtp, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
