"use client";

import StatCard from "./StatCard";
import {
  Users,
  GraduationCap,
  Building2,
  BookOpen,
  MessageSquare,
  FileText,
  Briefcase,
  CreditCard,
  Award,
  Star,
  Newspaper,
  FolderOpen,
} from "lucide-react";

export default function StatisticsGrid({ statistics, isLoading, userRole }) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
          <div key={i} className="h-32 bg-gray-200 rounded-lg animate-pulse" />
        ))}
      </div>
    );
  }

  if (!statistics) {
    return <div className="text-center py-8 text-gray-500">No statistics available</div>;
  }

  const isAdmin = userRole === "admin";
  const isLead = userRole === "lead";
  
  const stats = [
    // Non-lead stats - only for admin and other roles (not for lead)
    ...(!isLead ? [
      {
        title: "Universities",
        value: statistics.universities || 0,
        icon: Building2,
        color: "orange",
      },
      {
        title: "University Courses",
        value: statistics.universityCourses || 0,
        icon: BookOpen,
        color: "indigo",
      },
      {
        title: "Course Specializations",
        value: statistics.universityCourseSpecializations || 0,
        icon: GraduationCap,
        color: "blue",
      },
      {
        title: "Degree Courses",
        value: statistics.courses || 0,
        icon: BookOpen,
        color: "green",
      },
      {
        title: "Degree Specializations",
        value: statistics.specializations || 0,
        icon: GraduationCap,
        color: "purple",
      },
      {
        title: "Mentors",
        value: statistics.mentors || 0,
        icon: Users,
        color: "orange",
      },
      {
        title: "Testimonials",
        value: statistics.testimonials || 0,
        icon: Star,
        color: "indigo",
      },
      {
        title: "Media Spotlight",
        value: statistics.mediaSpotlight || 0,
        icon: Newspaper,
        color: "blue",
      },
      {
        title: "Placement Partners",
        value: statistics.placementPartners || 0,
        icon: Briefcase,
        color: "green",
      },
      {
        title: "EMI Partners",
        value: statistics.emiPartners || 0,
        icon: CreditCard,
        color: "purple",
      },
      {
        title: "Domains",
        value: statistics.domains || 0,
        icon: FolderOpen,
        color: "orange",
      },
    ] : []),
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, index) => (
        <StatCard
          key={index}
          title={stat.title}
          value={stat.value}
          icon={stat.icon}
          color={stat.color}
        />
      ))}
    </div>
  );
}

