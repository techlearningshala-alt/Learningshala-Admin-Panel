// components/CMSLayout.js
"use client";

import Layout from "./dashboard/Layout";
import ProtectedRoute from "./auth/ProtectedRoute";

export default function CMSLayout({ children, roles = ["admin", "mentor", "editor"] }) {
  return (
    <ProtectedRoute roles={roles}>
      <Layout>{children}</Layout>
    </ProtectedRoute>
  );
}
