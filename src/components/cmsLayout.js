// components/CMSLayout.js
"use client";

import Layout from "./dashboard/Layout";
import ProtectedRoute from "./auth/ProtectedRoute";
import { HeaderProvider } from "@/context/HeaderContext";

export default function CMSLayout({ children, roles = ["admin", "mentor", "editor", "lead"] }) {
  return (
    <ProtectedRoute roles={roles}>
      <HeaderProvider>
        <Layout>{children}</Layout>
      </HeaderProvider>
    </ProtectedRoute>
  );
}
