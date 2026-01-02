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
          <Card key={i}>
            <CardHeader>
              <div className="h-6 bg-gray-200 rounded animate-pulse" />
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[1, 2, 3].map((j) => (
                  <div key={j} className="h-16 bg-gray-100 rounded animate-pulse" />
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
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Recent Leads</span>
            <Link
              href="/leads"
              className="text-sm text-blue-600 hover:underline"
            >
              View All
            </Link>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {data?.recentLeads?.length > 0 ? (
            <div className="space-y-3">
              {data.recentLeads.slice(0, 5).map((lead) => (
                <div
                  key={lead.id}
                  className="p-3 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <p className="font-medium text-sm">{lead.name || "N/A"}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {lead.phone || lead.email || "No contact"}
                      </p>
                      {lead.course && (
                        <p className="text-xs text-gray-600 mt-1">
                          Course: {lead.course}
                        </p>
                      )}
                    </div>
                    <span className="text-xs text-gray-400">
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
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Recent Contact Messages</span>
            <Link
              href="/contact-us"
              className="text-sm text-blue-600 hover:underline"
            >
              View All
            </Link>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {data?.recentContactMessages?.length > 0 ? (
            <div className="space-y-3">
              {data.recentContactMessages.slice(0, 5).map((contact) => (
                <div
                  key={contact.id}
                  className="p-3 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <p className="font-medium text-sm">{contact.name}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {contact.email || contact.phone || "No contact"}
                      </p>
                    </div>
                    <span className="text-xs text-gray-400">
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
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Recent Website Leads</span>
              <Link
                href="/website-leads"
                className="text-sm text-blue-600 hover:underline"
              >
                View All
              </Link>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.recentWebsiteLeads.slice(0, 5).map((lead) => (
                <div
                  key={lead.id}
                  className="p-3 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <p className="font-medium text-sm">{lead.name}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {lead.phone || lead.email || "No contact"}
                      </p>
                      {lead.course && (
                        <p className="text-xs text-gray-600 mt-1">
                          Course: {lead.course}
                        </p>
                      )}
                    </div>
                    <span className="text-xs text-gray-400">
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
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Recent Universities</span>
              <Link
                href="/universities"
                className="text-sm text-blue-600 hover:underline"
              >
                View All
              </Link>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.recentUniversities.slice(0, 5).map((university) => (
                <div
                  key={university.id}
                  className="p-3 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <p className="font-medium text-sm">{university.name}</p>
                    </div>
                    <span className="text-xs text-gray-400">
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
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Recent Courses</span>
              <Link
                href="/university-courses"
                className="text-sm text-blue-600 hover:underline"
              >
                View All
              </Link>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.recentCourses.slice(0, 5).map((course) => (
                <div
                  key={course.id}
                  className="p-3 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <p className="font-medium text-sm">{course.name}</p>
                    </div>
                    <span className="text-xs text-gray-400">
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

