// components/Layout.js
"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/router";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import Sidebar from "./Sidebar"; // extracted
import toast from "react-hot-toast";

export default function Layout({ children }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { logout } = useAuth();
  const router = useRouter();
  const pathname = router.pathname;

  const handleLogout = () => {
    logout();
    toast.success("Logged out successfully!");
  };

  // Calculate page title dynamically
  const pageTitle = useMemo(() => {
    return Sidebar.getPageTitle(pathname);
  }, [pathname]);

  return (
    <>
      <div className="flex min-h-screen bg-gray-100">
        {/* Sidebar for desktop */}
        <Sidebar mobile={false} />

        {/* Main content */}
        <div className="flex-1 overflow-x-auto">
          {/* Topbar */}
          <header className="bg-white shadow p-4 flex justify-between items-center sticky top-0 z-10">
            <h1 className="text-lg font-bold">{pageTitle}</h1>
            <Button variant="destructive" onClick={handleLogout}>
              Logout
            </Button>
          </header>

          <main className="p-6 min-w-[800px]">{children}</main>
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
