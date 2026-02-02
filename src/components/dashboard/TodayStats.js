"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, Users, MessageSquare } from "lucide-react";

export default function TodayStats({ todayStats, weekStats, statistics, isLoading, userRole }) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="border-0 shadow-md">
            <CardHeader className="bg-gradient-to-r from-gray-50 to-white pb-3">
              <div className="h-5 bg-gray-200 rounded animate-pulse" />
            </CardHeader>
            <CardContent className="pt-4">
              <div className="h-10 bg-gray-200 rounded animate-pulse mb-2" />
              <div className="h-4 bg-gray-100 rounded animate-pulse w-3/4" />
            </CardContent>
          </Card>
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
      color: "text-blue-600",
      bgColor: "bg-blue-100",
    },
    {
      title: "Website Leads",
      today: todayStats?.websiteLeadsToday || 0,
      yesterday: todayStats?.websiteLeadsYesterday || 0,
      week: weekStats?.websiteLeadsThisWeek || 0,
      total: statistics?.websiteLeads || 0,
      icon: TrendingUp,
      color: "text-green-600",
      bgColor: "bg-green-100",
    },
    {
      title: "Contact Messages",
      today: todayStats?.contactMessagesToday || 0,
      yesterday: todayStats?.contactMessagesYesterday || 0,
      week: weekStats?.contactMessagesThisWeek || 0,
      total: statistics?.contactUs || 0,
      icon: MessageSquare,
      color: "text-purple-600",
      bgColor: "bg-purple-100",
    },
  ] : [];
  
  // If no stats to show (not lead role), return null
  if (!isLead) {
    return null;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {stats.map((stat, index) => {
        const changeFromYesterday = stat.yesterday > 0 
          ? ((stat.today - stat.yesterday) / stat.yesterday * 100).toFixed(1)
          : stat.today > 0 ? 100 : 0;
        const isPositive = changeFromYesterday >= 0;

        return (
          <Card key={index} className="hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-0 shadow-md overflow-hidden group">
            <CardHeader className="bg-gradient-to-r from-gray-50 to-white pb-3">
              <CardTitle className="flex items-center justify-between text-sm font-semibold text-gray-700">
                <span>{stat.title}</span>
                <span className="text-xs text-gray-500 font-normal bg-gray-100 px-2 py-1 rounded-full">
                  Total: {stat.total?.toLocaleString() || 0}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-baseline gap-2">
                    <p className="text-4xl font-bold text-gray-900">{stat.today?.toLocaleString() || 0}</p>
                    {changeFromYesterday !== 0 && (
                      <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                        isPositive 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-red-100 text-red-700'
                      }`}>
                        {isPositive ? '↑' : '↓'} {Math.abs(changeFromYesterday)}%
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-2 space-x-2">
                    <span>Yesterday: {stat.yesterday?.toLocaleString() || 0}</span>
                    <span>•</span>
                    <span>This week: {stat.week?.toLocaleString() || 0}</span>
                  </p>
                </div>
                <div className={`${stat.bgColor} p-4 rounded-xl shadow-sm group-hover:scale-110 transition-transform duration-300`}>
                  <stat.icon className={`h-7 w-7 ${stat.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

