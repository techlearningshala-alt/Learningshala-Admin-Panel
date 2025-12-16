"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/header";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Verify user on app load
  useEffect(() => {
    const verifyUser = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        // Clear any stale user data
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
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setUser(null);
        // Do NOT redirect immediately on page load
      } finally {
        setLoading(false);
      }
    };

    verifyUser();
  }, []);

  // Login
  const login = async (email, password) => {
    // Clear any old tokens before login
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    
    const res = await api.post("/users/login", { email, password });
    console.log("🔍 Frontend - Login response:", res.data.data);
    const { accessToken, user } = res.data.data;
    console.log("🔍 Frontend - Setting user after login:", { id: user.id, email: user.email, role: user.role });

    localStorage.setItem("token", accessToken);
    localStorage.setItem("user", JSON.stringify(user));
    setUser(user);
    
    // Redirect based on user role
    if (user.role === "lead") {
      router.push("/leads");
    } else {
      router.push("/dashboard");
    }
  };

  // Logout
  const logout = async () => {
    try {
      await api.post("/users/logout"); // optional if backend expects refresh token
    } catch (e) {
      console.warn("Logout failed, ignoring:", e);
    }
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    router.push("/login");
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
