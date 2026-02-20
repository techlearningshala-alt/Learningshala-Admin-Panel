"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";

// Simple date formatting without date-fns dependency
const formatDate = (dateString) => {
  if (!dateString) return "N/A";
  try {
    const date = new Date(dateString);
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const day = date.getDate().toString().padStart(2, "0");
    const month = months[date.getMonth()];
    const year = date.getFullYear();
    const hours = date.getHours().toString().padStart(2, "0");
    const minutes = date.getMinutes().toString().padStart(2, "0");
    return `${month} ${day}, ${year} ${hours}:${minutes}`;
  } catch {
    return dateString;
  }
};

export default function RecentActivity({ data, isLoading, userRole }) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[1, 2].map((i) => (
          <Card key={i} className="border-0 shadow-md">
            <CardHeader className="bg-gradient-to-r from-gray-50 to-white border-b">
              <div className="h-6 bg-gray-200 rounded animate-pulse" />
            </CardHeader>
            <CardContent className="pt-4">
              <div className="space-y-3">
                {[1, 2, 3, 4, 5].map((j) => (
                  <div key={j} className="h-20 bg-gradient-to-r from-gray-100 to-gray-50 rounded-lg animate-pulse border border-gray-100" />
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }


  const isLead = userRole === "lead";
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Recent Leads - Only for lead role */}
      {isLead && (
        <Card>
        <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b h-15">
          <CardTitle className="flex items-center justify-between text-lg font-semibold py-3">
            <span className="text-gray-800">Recent Leads</span>
            <Link
              href="/leads"
              className="text-sm text-blue-600 hover:text-blue-700 font-medium hover:underline transition-colors"
            >
              View All →
            </Link>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {data?.recentLeads?.length > 0 ? (
            <div className="space-y-3">
              {data.recentLeads.slice(0, 5).map((lead) => (
                <div
                  key={lead.id}
                  className="p-4 border border-gray-200 rounded-lg hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 transition-all duration-200 hover:shadow-md hover:border-blue-200 cursor-pointer"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <p className="font-semibold text-sm text-gray-900">{lead.name || "N/A"}</p>
                      <p className="text-xs text-gray-600 mt-1.5">
                        {lead.phone || lead.email || "No contact"}
                      </p>
                      {lead.course && (
                        <p className="text-xs text-blue-600 font-medium mt-1.5 bg-blue-50 px-2 py-0.5 rounded-md inline-block">
                          {lead.course}
                        </p>
                      )}
                    </div>
                    <span className="text-xs text-gray-400 ml-2 whitespace-nowrap">
                      {formatDate(lead.created_at || lead.created_on)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500 text-center py-4">
              No recent leads
            </p>
          )}
        </CardContent>
      </Card>
      )}

      {/* Recent Contact Messages - Only for lead role */}
      {isLead && (
        <Card>
        <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 border-b h-15">
          <CardTitle className="flex items-center justify-between text-lg font-semibold py-3">
            <span className="text-gray-800">Recent Contact Messages</span>
            <Link
              href="/contact-us"
              className="text-sm text-purple-600 hover:text-purple-700 font-medium hover:underline transition-colors"
            >
              View All →
            </Link>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {data?.recentContactMessages?.length > 0 ? (
            <div className="space-y-3">
              {data.recentContactMessages.slice(0, 5).map((contact) => (
                <div
                  key={contact.id}
                  className="p-4 border border-gray-200 rounded-lg hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 transition-all duration-200 hover:shadow-md hover:border-purple-200 cursor-pointer"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <p className="font-semibold text-sm text-gray-900">{contact.name}</p>
                      <p className="text-xs text-gray-600 mt-1.5">
                        {contact.email || contact.phone || "No contact"}
                      </p>
                    </div>
                    <span className="text-xs text-gray-400 ml-2 whitespace-nowrap">
                      {formatDate(contact.created_at)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500 text-center py-4">
              No recent messages
            </p>
          )}
        </CardContent>
      </Card>
      )}

      {/* Recent Website Leads - Only for lead role */}
      {isLead && data?.recentWebsiteLeads?.length > 0 && (
        <Card>
          <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 border-b h-15">
            <CardTitle className="flex items-center justify-between text-lg font-semibold py-3">
              <span className="text-gray-800">Recent Website Leads</span>
              <Link
                href="/website-leads"
                className="text-sm text-green-600 hover:text-green-700 font-medium hover:underline transition-colors"
              >
                View All →
              </Link>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.recentWebsiteLeads.slice(0, 5).map((lead) => (
                <div
                  key={lead.id}
                  className="p-4 border border-gray-200 rounded-lg hover:bg-gradient-to-r hover:from-green-50 hover:to-emerald-50 transition-all duration-200 hover:shadow-md hover:border-green-200 cursor-pointer"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <p className="font-semibold text-sm text-gray-900">{lead.name}</p>
                      <p className="text-xs text-gray-600 mt-1.5">
                        {lead.phone || lead.email || "No contact"}
                      </p>
                      {lead.course && (
                        <p className="text-xs text-green-600 font-medium mt-1.5 bg-green-50 px-2 py-0.5 rounded-md inline-block">
                          {lead.course}
                        </p>
                      )}
                    </div>
                    <span className="text-xs text-gray-400 ml-2 whitespace-nowrap">
                      {formatDate(lead.created_at)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Universities - Visible to all except lead */}
      {!isLead && data?.recentUniversities?.length > 0 && (
        <Card>
          <CardHeader className="bg-gradient-to-r from-orange-50 to-amber-50 border-b h-15">
            <CardTitle className="flex items-center justify-between text-lg font-semibold  py-2">
              <span className="text-gray-800 py-2">Recent Universities</span>
              <Link
                href="/universities"
                className="text-sm text-orange-600 hover:text-orange-700 font-medium hover:underline transition-colors"
              >
                View All →
              </Link>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {data.recentUniversities.slice(0, 5).map((university) => (
                <div
                  key={university.id}
                  className="p-4 border border-gray-200 rounded-lg hover:bg-gradient-to-r hover:from-orange-50 hover:to-amber-50 transition-all duration-200 hover:shadow-md hover:border-orange-200 cursor-pointer mb-2"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <p className="font-semibold text-sm text-gray-900">{university.name}</p>
                    </div>
                    <span className="text-xs text-gray-400 ml-2 whitespace-nowrap">
                      {formatDate(university.created_at)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Courses - Visible to all except lead */}
      {!isLead && data?.recentCourses?.length > 0 && (
        <Card>
          <CardHeader className="bg-gradient-to-r from-indigo-50 to-blue-50 border-b h-15">
            <CardTitle className="flex items-center justify-between text-lg font-semibold py-2">
              <span className="text-gray-800 py-2">Recent Courses</span>
              <Link
                href="/university-courses"
                className="text-sm text-indigo-600 hover:text-indigo-700 font-medium hover:underline transition-colors"
              >
                View All →
              </Link>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {data.recentCourses.slice(0, 5).map((course) => (
                <div
                  key={course.id}
                  className="p-4 border border-gray-200 rounded-lg hover:bg-gradient-to-r hover:from-indigo-50 hover:to-blue-50 transition-all duration-200 hover:shadow-md hover:border-indigo-200 cursor-pointer"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <p className="font-semibold text-sm text-gray-900">{course.name}</p>
                    </div>
                    <span className="text-xs text-gray-400 ml-2 whitespace-nowrap">
                      {formatDate(course.created_at)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

