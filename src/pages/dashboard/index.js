// src/pages/dashboard/index.js
"use client";

import { useAuth } from "@/context/AuthContext";
import DashboardLayout from "./layout";
import { useQuery } from "@tanstack/react-query";
import { fetchDashboardData } from "@/lib/api";
import StatisticsGrid from "@/components/dashboard/StatisticsGrid";
import RecentActivity from "@/components/dashboard/RecentActivity";
import TodayStats from "@/components/dashboard/TodayStats";
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
      <div className="space-y-6">
        {/* Welcome Header */}
        <div>
          <h2 className="text-3xl font-bold text-gray-900">
            Welcome back, {user?.name || "User"} 🎉
          </h2>
          <p className="mt-2 text-gray-600">
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
            {/* Today's Statistics - Only for admin and lead */}
            {(user?.role === "admin" || user?.role === "lead") && (
              <TodayStats
                todayStats={data.todayStats}
                weekStats={data.weekStats}
                statistics={data.statistics}
                isLoading={isLoading}
                userRole={user?.role}
              />
            )}

            {/* Main Statistics Grid - Hidden for lead role */}
            {user?.role !== "lead" && (
              <div>
                <h3 className="text-xl font-semibold mb-4">Overview Statistics</h3>
                <StatisticsGrid
                  statistics={data.statistics}
                  isLoading={isLoading}
                  userRole={user?.role}
                />
              </div>
            )}

            {/* Recent Activity */}
            <div>
              <h3 className="text-xl font-semibold mb-4">Recent Activity</h3>
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
