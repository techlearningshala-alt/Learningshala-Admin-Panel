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
        setLoading(false);
        return;
      }

      try {
        const res = await api.get("/users/me");
        setUser(res.data.data); // assuming { data: user }
        localStorage.setItem("user", JSON.stringify(res.data.data));
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
    const res = await api.post("/users/login", { email, password });
    console.log(res.data.data,"logindata")
    const { accessToken, user } = res.data.data;

    localStorage.setItem("token", accessToken);
    localStorage.setItem("user", JSON.stringify(user));
    setUser(user);
    router.push("/dashboard");
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
