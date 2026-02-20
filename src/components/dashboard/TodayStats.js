"use client";

import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, Users, MessageSquare } from "lucide-react";

// Match StatCard color config for gradient accent
const colorConfig = {
  blue: { bg: "bg-gradient-to-br from-blue-500 to-blue-600", iconBg: "bg-blue-100", iconColor: "text-blue-600" },
  green: { bg: "bg-gradient-to-br from-green-500 to-green-600", iconBg: "bg-green-100", iconColor: "text-green-600" },
  purple: { bg: "bg-gradient-to-br from-purple-500 to-purple-600", iconBg: "bg-purple-100", iconColor: "text-purple-600" },
};

export default function TodayStats({ todayStats, weekStats, statistics, isLoading, userRole }) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-32 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl shadow-md animate-pulse" />
        ))}
      </div>
    );
  }

  const isLead = userRole === "lead";
  
  const stats = isLead ? [
    {
      title: "Landing page",
      today: todayStats?.leadsToday || 0,
      yesterday: todayStats?.leadsYesterday || 0,
      week: weekStats?.leadsThisWeek || 0,
      total: statistics?.leads || 0,
      icon: Users,
      colorKey: "blue",
    },
    {
      title: "Website Leads",
      today: todayStats?.websiteLeadsToday || 0,
      yesterday: todayStats?.websiteLeadsYesterday || 0,
      week: weekStats?.websiteLeadsThisWeek || 0,
      total: statistics?.websiteLeads || 0,
      icon: TrendingUp,
      colorKey: "green",
    },
    {
      title: "Contact Messages",
      today: todayStats?.contactMessagesToday || 0,
      yesterday: todayStats?.contactMessagesYesterday || 0,
      week: weekStats?.contactMessagesThisWeek || 0,
      total: statistics?.contactUs || 0,
      icon: MessageSquare,
      colorKey: "purple",
    },
  ] : [];
  
  // If no stats to show (not lead role), return null
  if (!isLead) {
    return null;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {stats.map((stat, index) => {
        const changeFromYesterday = stat.yesterday > 0
          ? ((stat.today - stat.yesterday) / stat.yesterday * 100).toFixed(1)
          : stat.today > 0 ? 100 : 0;
        const isPositive = changeFromYesterday >= 0;
        const config = colorConfig[stat.colorKey] || colorConfig.blue;
        const Icon = stat.icon;

        return (
          <Card key={index} className="hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-0 shadow-md overflow-hidden group">
            <CardContent className="p-6 relative">
              {/* Background gradient accent - same as StatCard */}
              <div className={`absolute top-0 right-0 w-32 h-32 ${config.bg} opacity-10 rounded-full -mr-16 -mt-16 group-hover:opacity-20 transition-opacity`} />
              <div className="flex items-center justify-between relative z-10">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600 mb-1">{stat.title}</p>
                  <div className="flex items-baseline gap-2 mt-2">
                    <p className="text-3xl font-bold text-gray-900">{stat.today?.toLocaleString() || 0}</p>
                    {changeFromYesterday !== 0 && (
                      <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                        isPositive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                      }`}>
                        {isPositive ? "↑" : "↓"} {Math.abs(changeFromYesterday)}%
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-2 space-x-2">
                    <span>Yesterday: {stat.yesterday?.toLocaleString() || 0}</span>
                    <span>•</span>
                    <span>This week: {stat.week?.toLocaleString() || 0}</span>
                    <span>•</span>
                    <span>Total: {stat.total?.toLocaleString() || 0}</span>
                  </p>
                </div>
                <div className={`${config.iconBg} p-4 rounded-xl shadow-sm group-hover:scale-110 transition-transform duration-300`}>
                  <Icon className={`h-7 w-7 ${config.iconColor}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

