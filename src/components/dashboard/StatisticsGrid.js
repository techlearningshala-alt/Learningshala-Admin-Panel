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
      <div className="flex flex-col lg:flex-row gap-6 items-stretch">
        <div className="flex-[3.5] w-full lg:w-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => (
              <div key={i} className="h-32 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl shadow-md animate-pulse" />
            ))}
          </div>
        </div>
        <div className="flex-1 w-full lg:w-auto lg:max-w-sm">
          <div className="grid grid-cols-1 gap-6">
            {[1, 2].map((i) => (
              <div key={i} className="h-32 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl shadow-md animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!statistics) {
    return <div className="text-center py-8 text-gray-500">No statistics available</div>;
  }

  const isAdmin = userRole === "admin";
  const isLead = userRole === "lead";
  
  if (isLead) {
    return null;
  }

  // First div: University and Degree data (2 rows × 3 columns)
  const universityDegreeStats = [
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
      title: "Domains",
      value: statistics.domains || 0,
      icon: FolderOpen,
      color: "orange",
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
  ];

  // Second div: Other data
  const otherStats = [
    {
      title: "Partner University",
      value: statistics.partnerUniversities || 0,
      icon: Building2,
      color: "green",
    },
    {
      title: "Non Partner University",
      value: statistics.nonPartnerUniversities || 0,
      icon: Building2,
      color: "purple",
    },
  ];

  return (
    <div className="flex flex-col lg:flex-row gap-6 items-stretch">
      {/* First div: University and Degree data (2 rows × 3 columns) */}
      <div className="flex-[3.5] w-full lg:w-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {universityDegreeStats.map((stat, index) => (
            <StatCard
              key={index}
              title={stat.title}
              value={stat.value}
              icon={stat.icon}
              color={stat.color}
            />
          ))}
        </div>
      </div>

      {/* Second div: Other data (single column, parallel, same height) */}
      <div className="flex-1 w-full lg:w-auto lg:max-w-sm">
        <div className="grid grid-cols-1 gap-6">
          {otherStats.map((stat, index) => (
            <StatCard
              key={index}
              title={stat.title}
              value={stat.value}
              icon={stat.icon}
              color={stat.color}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

