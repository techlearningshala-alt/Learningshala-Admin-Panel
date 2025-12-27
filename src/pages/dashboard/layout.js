// src/pages/dashboard/layout.js
"use client";

import Layout from "@/components/dashboard/Layout";
import ProtectedRoute from "@/components/auth/ProtectedRoute";

export default function DashboardLayout({ children }) {
  return (
    <ProtectedRoute roles={["admin", "mentor", "lead"]}>
      <Layout>{children}</Layout>
    </ProtectedRoute>
  );
}
