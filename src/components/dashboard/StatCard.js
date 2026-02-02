"use client";

import { Card, CardContent } from "@/components/ui/card";

export default function StatCard({ title, value, icon: Icon, color = "blue" }) {
  const colorConfig = {
    blue: {
      bg: "bg-gradient-to-br from-blue-500 to-blue-600",
      iconBg: "bg-blue-100",
      iconColor: "text-blue-600",
      textColor: "text-blue-600",
    },
    green: {
      bg: "bg-gradient-to-br from-green-500 to-green-600",
      iconBg: "bg-green-100",
      iconColor: "text-green-600",
      textColor: "text-green-600",
    },
    purple: {
      bg: "bg-gradient-to-br from-purple-500 to-purple-600",
      iconBg: "bg-purple-100",
      iconColor: "text-purple-600",
      textColor: "text-purple-600",
    },
    orange: {
      bg: "bg-gradient-to-br from-orange-500 to-orange-600",
      iconBg: "bg-orange-100",
      iconColor: "text-orange-600",
      textColor: "text-orange-600",
    },
    red: {
      bg: "bg-gradient-to-br from-red-500 to-red-600",
      iconBg: "bg-red-100",
      iconColor: "text-red-600",
      textColor: "text-red-600",
    },
    indigo: {
      bg: "bg-gradient-to-br from-indigo-500 to-indigo-600",
      iconBg: "bg-indigo-100",
      iconColor: "text-indigo-600",
      textColor: "text-indigo-600",
    },
  };

  const config = colorConfig[color] || colorConfig.blue;

  return (
    <Card className="hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-0 shadow-md overflow-hidden group">
      <CardContent className="p-6 relative">
        {/* Background gradient accent */}
        <div className={`absolute top-0 right-0 w-32 h-32 ${config.bg} opacity-10 rounded-full -mr-16 -mt-16 group-hover:opacity-20 transition-opacity`} />
        
        <div className="flex items-center justify-between relative z-10">
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">{value?.toLocaleString() || 0}</p>
          </div>
          {Icon && (
            <div className={`${config.iconBg} p-4 rounded-xl shadow-sm group-hover:scale-110 transition-transform duration-300`}>
              <Icon className={`h-7 w-7 ${config.iconColor}`} />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

