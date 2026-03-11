// src/pages/dashboard/index.js
"use client";

import { useAuth } from "@/context/AuthContext";
import DashboardLayout from "./layout";
import { useQuery } from "@tanstack/react-query";
import { fetchDashboardData } from "@/lib/api";
import StatisticsGrid from "@/components/dashboard/StatisticsGrid";
import RecentActivity from "@/components/dashboard/RecentActivity";
import TodayStats from "@/components/dashboard/TodayStats";
import WebsiteLeadsOverview from "@/components/dashboard/WebsiteLeadsOverview";
import { Loader2 } from "lucide-react";

export default function DashboardPage() {
  const { user } = useAuth();

  const { data, isLoading, error } = useQuery({
    queryKey: ["dashboard"],
    queryFn: async () => {
      const response = await fetchDashboardData();
      return response.data; // { statistics, recentActivity, todayStats, weekStats }
    },
    refetchOnWindowFocus: false,
    staleTime: 30000, // Refetch every 30 seconds
  });

  return (
    <DashboardLayout>
      <div className="space-y-4 p-3">
        {/* Welcome Header */}
        <div className="bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 rounded-xl px-5 py-3 text-white shadow-lg ">
          <h2 className="text-6xl font-bold mb-1">
            Welcome back, {user?.name || "User"} 🎉
          </h2>
          <p className="text-blue-100 text-lg">
            Here is what&apos;s happening with your platform today.
          </p>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            <span className="ml-2 text-gray-600">Loading dashboard...</span>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800">
              Failed to load dashboard data. Please try again.
            </p>
          </div>
        )}

        {/* Dashboard Content */}
        {!isLoading && !error && data && (
          <>
            {/* Today's Statistics - Only for lead role (same section styling as admin) */}
            {user?.role === "lead" && (
              <div>
                <h3 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <span className="w-1 h-8 bg-gradient-to-b from-blue-600 to-indigo-600 rounded-full"></span>
                  Overview Statistics
                </h3>
                <TodayStats
                  todayStats={data.todayStats}
                  weekStats={data.weekStats}
                  statistics={data.statistics}
                  isLoading={isLoading}
                  userRole={user?.role}
                />
              </div>
            )}

            {/* Main Statistics Grid - Hidden for lead role */}
            {user?.role !== "lead" && (
              <div>
                <h3 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <span className="w-1 h-8 bg-gradient-to-b from-blue-600 to-indigo-600 rounded-full"></span>
                  Overview Statistics
                </h3>
                <StatisticsGrid
                  statistics={data.statistics}
                  isLoading={isLoading}
                  userRole={user?.role}
                />
              </div>
            )}

            {/* Website Leads Overview (below Overview Statistics) - only for admin (not lead) */}
            {user?.role !== "lead" && data.websiteLeadsOverview && (
              <div>
                <h3 className="text-xl font-semibold text-gray-800 mb-3 flex items-center gap-2 mt-2">
                  <span className="w-1 h-6 bg-gradient-to-b from-green-500 to-emerald-500 rounded-full"></span>
                  Website Leads Overview
                </h3>
                <WebsiteLeadsOverview
                  overview={data.websiteLeadsOverview}
                  isLoading={isLoading}
                />
              </div>
            )}

            {/* Recent Activity */}
            <div>
              <h3 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <span className="w-1 h-8 bg-gradient-to-b from-purple-600 to-pink-600 rounded-full"></span>
                Recent Activity
              </h3>
              <RecentActivity
                data={data.recentActivity}
                isLoading={isLoading}
                userRole={user?.role}
              />
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
