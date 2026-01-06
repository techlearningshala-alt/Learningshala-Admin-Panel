"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, Users, MessageSquare } from "lucide-react";

export default function TodayStats({ todayStats, weekStats, statistics, isLoading, userRole }) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardHeader>
              <div className="h-6 bg-gray-200 rounded animate-pulse" />
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-gray-200 rounded animate-pulse" />
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
      {stats.map((stat, index) => (
        <Card key={index}>
          <CardHeader>
            <CardTitle className="flex items-center justify-between text-sm font-medium text-gray-600">
              <span>{stat.title}</span>
              <span className="text-gray-500 font-normal">Total: {stat.total}</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-3xl font-bold">Today: {stat.today}</p>
                <p className="text-sm text-gray-500 mt-1">
                  Yesterday: {stat.yesterday} • This week: {stat.week}
                </p>
              </div>
              <div className={`${stat.bgColor} p-3 rounded-lg`}>
                <stat.icon className={`h-6 w-6 ${stat.color}`} />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

