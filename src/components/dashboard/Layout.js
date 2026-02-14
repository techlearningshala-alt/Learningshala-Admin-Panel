// components/Layout.js
"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/router";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useHeader } from "@/context/HeaderContext";
import Sidebar from "./Sidebar"; // extracted
import toast from "react-hot-toast";

export default function Layout({ children }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { logout } = useAuth();
  const router = useRouter();
  const pathname = router.pathname;
  const { actionButton, setActionButton, totalCount, setTotalCount } = useHeader();

  const handleLogout = () => {
    logout();
    toast.success("Logged out successfully!");
  };

  // Calculate page title dynamically
  const pageTitle = useMemo(() => {
    return Sidebar.getPageTitle(pathname);
  }, [pathname]);

  // Don't clear header state on route change - let each page manage its own state
  // This avoids race conditions where Layout clears after page sets the button

  return (
    <>
      <div className="flex min-h-screen bg-gray-100">
        {/* Sidebar for desktop */}
        <Sidebar mobile={false} />

        {/* Main content */}
        <div className="flex-1 overflow-x-auto">
          {/* Topbar */}
          <header className="bg-white text-blue-900 shadow p-4 flex justify-between items-center sticky top-0 z-10">
            <div className="flex items-center gap-4">
              <h3 className="text-md font-bold">{pageTitle}</h3>
              {totalCount !== null && (
                <span className="text-sm text-gray-600 font-medium">
                  Total: <span className="text-blue-600 font-semibold">{totalCount}</span>
                </span>
              )}
            </div>
            <div className="flex items-center gap-3">
              {actionButton && (
                <div className="flex items-center">
                  {actionButton}
                </div>
              )}
              <Button variant="destructive" onClick={handleLogout}>
                Logout
              </Button>
            </div>
          </header>

          <main className="min-w-[800px]">{children}</main>
        </div>
      </div>

      {/* Mobile sidebar */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden fixed top-4 left-4 z-50"
          >
            <Menu className="h-6 w-6" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-64 p-4 bg-gray-900 text-white">
          <Sidebar mobile={true} onClose={() => setMobileOpen(false)} />
        </SheetContent>
      </Sheet>
    </>
  );
}
