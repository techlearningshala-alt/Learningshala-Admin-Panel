"use client";

import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp } from "lucide-react";

export default function WebsiteLeadsOverview({ overview, isLoading }) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className="h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl shadow-md animate-pulse"
          />
        ))}
      </div>
    );
  }

  if (!overview) return null;

  const cards = [
    { label: "Today", value: overview.today || 0 },
    { label: "Yesterday", value: overview.yesterday || 0 },
    { label: "Current Month", value: overview.thisMonth || 0 },
    { label: "Organic", value: overview.organic || 0 },
    { label: "Total Leads", value: overview.total || 0 },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
      {cards.map((card) => (
        <Card
          key={card.label}
          className="border-0 shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden group"
        >
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-600 mb-1">
                {card.label}
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {card.value.toLocaleString()}
              </p>
            </div>
            <div
              className={`p-3 rounded-xl shadow-sm group-hover:scale-110 transition-transform duration-300 ${
                card.label === "Organic" ? "bg-emerald-50" : "bg-blue-50"
              }`}
            >
              <TrendingUp
                className={`h-5 w-5 ${
                  card.label === "Organic" ? "text-emerald-600" : "text-blue-600"
                }`}
              />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

