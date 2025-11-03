"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { ChevronDown } from "lucide-react";
import navItemsData from "@/lib/navItems";

export default function Sidebar({ mobile = false, onClose }) {
  const [expanded, setExpanded] = useState({});
  const router = useRouter();
  const pathname = router.pathname;

  const toggleItem = (name) => {
    setExpanded((prev) => ({ ...prev, [name]: !prev[name] }));
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
              className={`block p-2 rounded ${isActive ? "bg-blue-500 text-white" : "hover:bg-gray-700 text-white"}`}
              onClick={onClose}
            >
              {item.name}
            </Link>
          )}
        </div>
      );
    });

  return (
    <aside
      className={`${
        mobile ? "" : "w-[200px] flex-shrink-0 hidden md:flex flex-col"
      } bg-gray-900 text-white`}
    >
      <div className="p-4 text-xl font-bold border-b border-gray-700">
        Learning Shala CMS
      </div>
      <nav className="flex-1 overflow-y-auto p-4 space-y-2">
        {renderNavItems(navItemsData)}
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
