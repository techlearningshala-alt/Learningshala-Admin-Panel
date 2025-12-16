"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { ChevronDown } from "lucide-react";
import navItemsData from "@/lib/navItems";
import { useAuth } from "@/context/AuthContext";

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

  // Filter nav items based on user role
  const filterNavItemsByRole = (items) => {
    // Don't filter if still loading or no user
    if (loading || !user || !user.role) return [];
    
    // Normalize user role (trim and lowercase for comparison)
    const userRole = String(user.role).trim().toLowerCase();
    
    return items
      .filter((item) => {
        // Check if user role is in the item's roles array
        if (!item.roles || item.roles.length === 0) return true;
        // Normalize roles for comparison
        const normalizedRoles = item.roles.map(r => String(r).trim().toLowerCase());
        return normalizedRoles.includes(userRole);
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
        <div key={item.name} className={`pl-${level * 4}`}>
          {hasSub ? (
            <>
              <button
                onClick={() => toggleItem(item.name)}
                className="w-full flex justify-between items-center p-2 rounded hover:bg-gray-700 text-white"
              >
                {item.name}
                <ChevronDown className={`ml-2 transition-transform ${isOpen ? "rotate-180" : ""}`} />
              </button>
              {isOpen && (
                <div className="ml-2">{renderNavItems(item.subItems, level + 1)}</div>
              )}
            </>
          ) : (
            <Link
              href={item.href}
              className={`block p-2 rounded ${isActive ? "bg-blue-900 text-white" : "hover:bg-gray-700 text-white"}`}
              onClick={onClose}
            >
              {item.name}
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
        mobile ? "" : "w-[200px] flex-shrink-0 hidden md:flex flex-col"
      } bg-gray-900 text-white`}
    >
      <div className="bg-blue-900 p-4 text-md font-bold border-b border-gray-700">
        LearningShala Admin
      </div>
      <nav className="flex-1 overflow-y-auto p-4 space-y-2">
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
