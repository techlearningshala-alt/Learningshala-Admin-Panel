"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { ChevronDown } from "lucide-react";
import navItemsData from "@/lib/navItems";
import { useAuth } from "@/context/AuthContext";
import {
  isSectionRestrictedUser,
  userHasSectionAccess,
} from "@/lib/sectionAccess";

export default function Sidebar({ mobile = false, onClose }) {
  const [expanded, setExpanded] = useState({});
  const router = useRouter();
  const pathname = router.pathname;
  const { user, loading } = useAuth();

  // Debug: Log user role changes (remove in production)
  useEffect(() => {
    if (user && user.role) {
      console.log("Sidebar: User role is", user.role);
    }
  }, [user]);

  const toggleItem = (name) => {
    setExpanded((prev) => ({ ...prev, [name]: !prev[name] }));
  };

  // Filter nav items based on user role + section access
  const filterNavItemsByRole = (items) => {
    // Don't filter if still loading or no user
    if (loading || !user || !user.role) return [];
    
    // Normalize user role (trim and lowercase for comparison)
    const userRole = String(user.role).trim().toLowerCase();
    const sectionRestricted = isSectionRestrictedUser(user);
    
    return items
      .filter((item) => {
        // Check if user role is in the item's roles array
        if (!item.roles || item.roles.length === 0) return true;
        // Normalize roles for comparison
        const normalizedRoles = item.roles.map(r => String(r).trim().toLowerCase());
        if (!normalizedRoles.includes(userRole)) return false;

        // Section-restricted users (e.g. mentor): only their allowed section tabs
        if (sectionRestricted) {
          if (!item.section) return false;
          return userHasSectionAccess(user, item.section);
        }

        // Admin/lead: section tags still respected if present (admin always has access)
        if (item.section && !userHasSectionAccess(user, item.section)) return false;
        return true;
      })
      .map((item) => {
        // If item has subItems, filter them too
        if (item.subItems && item.subItems.length > 0) {
          const filteredSubItems = filterNavItemsByRole(item.subItems);
          // Only include parent item if it has at least one visible subItem
          if (filteredSubItems.length > 0) {
            return { ...item, subItems: filteredSubItems };
          }
          return null;
        }
        return item;
      })
      .filter((item) => item !== null);
  };

  const renderNavItems = (items, level = 0) =>
    items.map((item) => {
      const hasSub = item.subItems?.length > 0;
      const isOpen = expanded[item.name];
      const isActive = item.href && pathname === item.href;

      return (
        <div key={item.name} className={`${level > 0 ? "ml-4" : ""}`}>
          {hasSub ? (
            <>
              <button
                onClick={() => toggleItem(item.name)}
                className={`w-full flex justify-between items-center p-3 rounded-md text-sm transition-all duration-200 ${
                  isOpen 
                    ? "bg-slate-800 text-white border-l-4 border-blue-500 shadow-sm" 
                    : "hover:bg-slate-800/50 text-slate-300 hover:text-white"
                }`}
              >
                <span className="font-medium">{item.name}</span>
                <ChevronDown className={`ml-2 h-4 w-4 transition-transform duration-300 ${isOpen ? "rotate-180 text-blue-400" : "text-slate-400"}`} />
              </button>
              {isOpen && (
                <div className="mt-1 ml-2 space-y-1 border-l-2 border-slate-700 pl-3">
                  {renderNavItems(item.subItems, level + 1)}
                </div>
              )}
            </>
          ) : (
            <Link
              href={item.href}
              className={`block p-3 rounded-md text-sm transition-all duration-200 relative ${
                isActive 
                  ? "bg-blue-600 text-white shadow-md border-l-4 border-blue-400 font-medium" 
                  : "hover:bg-slate-800/50 text-slate-300 hover:text-white"
              }`}
              onClick={onClose}
            >
              {isActive && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-blue-400 rounded-r-full"></span>
              )}
              <span className="relative">{item.name}</span>
            </Link>
          )}
        </div>
      );
    });

  // Filter nav items based on user role
  const filteredNavItems = filterNavItemsByRole(navItemsData);

  return (
    <aside
      className={`${
        mobile ? "" : "w-[215px] flex-shrink-0 hidden md:flex flex-col"
      } bg-slate-900 text-white shadow-2xl border-r border-slate-800`}
    >
      <Link
        href="/dashboard"
        className="bg-slate-800 border-b border-slate-700 p-4 text-md font-bold block hover:bg-slate-750 transition-colors duration-200 cursor-pointer"
        onClick={onClose}
      >
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
          <span className="bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
            LearningShala Admin
          </span>
        </div>
      </Link>
      <nav className="flex-1 overflow-y-auto p-3 space-y-1">
        {renderNavItems(filteredNavItems)}
      </nav>
    </aside>
  );
}

// Helper to get dynamic page title
Sidebar.getPageTitle = (pathname) => {
  const findTitle = (items) => {
    for (const item of items) {
      if (item.href === pathname) return item.name;
      if (item.subItems) {
        const sub = findTitle(item.subItems);
        if (sub) return sub;
      }
    }
    return null;
  };
  return findTitle(navItemsData) || "Dashboard";
};
