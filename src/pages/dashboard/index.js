// src/pages/dashboard/index.js
"use client";

import { useAuth } from "@/context/AuthContext";
import DashboardLayout from "./layout"; 

export default function DashboardPage() {
  const { user } = useAuth();

  return (
    <DashboardLayout>
      <div>
        <h2 className="text-2xl font-bold">Welcome back, {user?.name || "User"} 🎉</h2>
        <p className="mt-2 text-gray-600">This is your dashboard overview.</p>
      </div>
    </DashboardLayout>
  );
}
