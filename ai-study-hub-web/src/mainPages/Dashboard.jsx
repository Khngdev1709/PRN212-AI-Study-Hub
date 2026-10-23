import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  File,
  Book,
  Clock,
  ChevronRight,
  UploadCloud,
  FolderPlus,
  Sparkles,
  Share2,
  Settings,
  Cloud,
  ArrowRight,
  Loader2,
} from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import axiosClient from "../api/axiosClient";
import bannerImg from "./MainTheme/Educational Cloud AI login page.png";

export default function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();

  // State for user profile and dynamic counts
  const [firstName, setFirstName] = useState(() => {
    return user?.firstName || user?.FirstName || "Bạn";
  });
  const [stats, setStats] = useState({
    documentCount: null,
    subjectCount: null,
    recentCount: 0, // Mocked as 0 per specifications
  });
  const [isLoadingStats, setIsLoadingStats] = useState(true);

  /**
   * Fetch authenticated user's profile to extract FirstName directly from AppUser
   * and fetch personal documents to calculate strictly owned document & subject counts.
   */
  const loadDashboardData = useCallback(async () => {
    setIsLoadingStats(true);
    try {
      // 1. Fetch current user profile (/api/v1/auth/me)
      const userPromise = axiosClient.get("/auth/me").catch((err) => {
        console.warn("Could not fetch user profile from API, using auth context:", err);
        return null;
      });

      // 2. Fetch documents strictly belonging to the currently logged-in user (/api/v1/documents/me)
      const docsPromise = axiosClient.get("/documents/me").catch((err) => {
        console.error("Failed to fetch user documents:", err);
        return null;
      });

      const [userRes, docsRes] = await Promise.all([userPromise, docsPromise]);

      // Extract user's real FirstName from AppUser entity via UserDto
      if (userRes?.data) {
        const userData = userRes.data?.data || userRes.data?.Data || userRes.data;
        const fetchedFirstName = userData?.firstName || userData?.FirstName;
        if (fetchedFirstName) {
          setFirstName(fetchedFirstName);
        }
      } else if (user?.firstName || user?.FirstName) {
        setFirstName(user.firstName || user.FirstName);
      }

      // Calculate document count & unique subject count for this user
      if (docsRes?.data) {
        const rawDocs = docsRes.data?.data || docsRes.data?.Data || (Array.isArray(docsRes.data) ? docsRes.data : []);
        const docs = Array.isArray(rawDocs) ? rawDocs : [];

        // Count of Document IDs strictly belonging to logged-in user
        const documentCount = docs.length;

        // Count of distinct Subject IDs strictly present in user's documents
        const uniqueSubjectIds = new Set(
          docs
            .map((d) => d.subjectId || d.SubjectId)
            .filter((id) => id && id !== "00000000-0000-0000-0000-000000000000")
        );
        const subjectCount = uniqueSubjectIds.size;

        setStats({
          documentCount,
          subjectCount,
          recentCount: 0, // Mocked/temporary
        });
      } else {
        // Fallback default if API is empty or error
        setStats({
          documentCount: 0,
          subjectCount: 0,
          recentCount: 0,
        });
      }
    } catch (error) {
      console.error("Error loading dashboard data:", error);
      setStats({
        documentCount: 0,
        subjectCount: 0,
        recentCount: 0,
      });
    } finally {
      setIsLoadingStats(false);
    }
  }, [user]);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  // Quick Access items mapping
  const quickAccessItems = [
    {
      title: "Tải lên tài liệu",
      icon: UploadCloud,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      onClick: () => navigate("/documents"),
    },
    {
      title: "Tạo môn học mới",
      icon: FolderPlus,
      color: "text-slate-600",
      bgColor: "bg-slate-100",
      onClick: () => navigate("/courses"),
    },
    {
      title: "Hỏi Trợ lý AI",
      icon: Sparkles,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      onClick: () => navigate("/ai-assistant"),
    },
    {
      title: "Chia sẻ tài liệu",
      icon: Share2,
      color: "text-slate-600",
      bgColor: "bg-slate-100",
      onClick: () => navigate("/shared"),
    },
    {
      title: "Cài đặt tài khoản",
      icon: Settings,
      color: "text-slate-600",
      bgColor: "bg-slate-100",
      onClick: () => navigate("/settings"),
    },
  ];

  return (
    <div className="max-w-[1920px] max-h-[1080px] mx-auto w-full flex flex-col justify-between space-y-4 lg:space-y-5 animate-in fade-in duration-200">
      
      {/* ══════════════════════════════════════════════════════════
          1. HEADER SECTION (DYNAMIC GREETING)
      ══════════════════════════════════════════════════════════ */}
      <div>
        <p className="text-xs sm:text-sm text-slate-500 font-medium">
          Xin chào, {firstName}
        </p>
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 mt-0.5 tracking-tight">
          Không gian học tập của bạn
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
          Quản lí tài liệu, môn học và hỗ trợ học tập tại một nơi.
        </p>
      </div>

      {/* ══════════════════════════════════════════════════════════
          2. STATS GRID (DYNAMIC DOCUMENTS, SUBJECTS & RECENT)
      ══════════════════════════════════════════════════════════ */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-5 mt-2">
        
        {/* Card 1: Tài liệu (Strictly owned by current user) */}
        <div
          onClick={() => navigate("/documents")}
          className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-100 shadow-xs flex items-center justify-between hover:-translate-y-0.5 hover:shadow-md transition-all cursor-pointer group select-none"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
              <File className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium">Tài liệu</p>
              <div className="text-xl sm:text-2xl font-bold text-slate-900 mt-0.5 flex items-center gap-2">
                {isLoadingStats ? (
                  <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                ) : (
                  stats.documentCount ?? 0
                )}
              </div>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all" />
        </div>

        {/* Card 2: Môn học (Distinct subject IDs for this user) */}
        <div
          onClick={() => navigate("/courses")}
          className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-100 shadow-xs flex items-center justify-between hover:-translate-y-0.5 hover:shadow-md transition-all cursor-pointer group select-none"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center shrink-0">
              <Book className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium">Môn học</p>
              <div className="text-xl sm:text-2xl font-bold text-slate-900 mt-0.5 flex items-center gap-2">
                {isLoadingStats ? (
                  <Loader2 className="w-4 h-4 animate-spin text-purple-600" />
                ) : (
                  stats.subjectCount ?? 0
                )}
              </div>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-purple-600 group-hover:translate-x-0.5 transition-all" />
        </div>

        {/* Card 3: Gần đây (Mocked as 0 per specs) */}
        <div
          onClick={() => navigate("/documents?filter=recent")}
          className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-100 shadow-xs flex items-center justify-between hover:-translate-y-0.5 hover:shadow-md transition-all cursor-pointer group select-none"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium">Gần đây</p>
              <div className="text-xl sm:text-2xl font-bold text-slate-900 mt-0.5 flex items-center gap-2">
                {isLoadingStats ? (
                  <Loader2 className="w-4 h-4 animate-spin text-emerald-600" />
                ) : (
                  stats.recentCount ?? 0
                )}
              </div>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-emerald-600 group-hover:translate-x-0.5 transition-all" />
        </div>

      </div>

      {/* ══════════════════════════════════════════════════════════
          3. MAIN CONTENT GRID (BANNER + QUICK ACCESS)
      ══════════════════════════════════════════════════════════ */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-5">
        
        {/* Left Banner (Spans 2 columns — image acts as full background) */}
        <div className="lg:col-span-2 relative overflow-hidden rounded-3xl border border-blue-100/90 shadow-xs min-h-[220px]">
          {/* Full-cover banner image */}
          <img
            src={bannerImg}
            alt="AI Study Illustration"
            className="w-full h-full object-cover absolute inset-0 pointer-events-none select-none"
          />

          {/* "Khám phá ngay" CTA — floated over the image */}
          <button
            type="button"
            onClick={() => navigate("/ai-assistant")}
            className="absolute bottom-7 left-7 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white px-5 py-2.5 rounded-xl text-xs sm:text-sm font-medium inline-flex items-center gap-2 transition-all shadow-md shadow-blue-500/20 hover:shadow-lg hover:shadow-blue-500/30 cursor-pointer group z-10"
          >
            <span>Khám phá ngay</span>
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </button>
        </div>

        {/* Right Quick Access (Spans 1 column) */}
        <div className="lg:col-span-1 bg-white rounded-3xl p-5 sm:p-6 border border-slate-100 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-slate-900 mb-3 text-sm sm:text-base tracking-tight">
              Truy cập nhanh
            </h3>
            <div className="space-y-0.5">
              {quickAccessItems.map((item, index) => {
                const Icon = item.icon;
                return (
                  <div
                    key={index}
                    onClick={item.onClick}
                    className="flex items-center gap-3 py-2.5 border-b border-slate-50 last:border-0 hover:bg-slate-50 rounded-lg px-2 cursor-pointer transition-colors group select-none"
                  >
                    <div className={`p-1.5 rounded-lg ${item.bgColor} ${item.color} shrink-0`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="text-xs sm:text-sm font-medium text-slate-700 group-hover:text-slate-900 flex-1">
                      {item.title}
                    </span>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-slate-600 group-hover:translate-x-0.5 transition-all" />
                  </div>
                );
              })}
            </div>
          </div>
        </div>

      </div>

      {/* ══════════════════════════════════════════════════════════
          4. BOTTOM TRUST BANNER
      ══════════════════════════════════════════════════════════ */}
      <div className="bg-white rounded-2xl p-3.5 sm:p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border border-slate-100 shadow-xs">
        {/* Left side */}
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-blue-50 text-blue-600 shrink-0">
            <Cloud className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <div>
            <p className="font-semibold text-xs sm:text-sm text-slate-900">
              Tài liệu của bạn được lưu trữ an toàn trên Cloud
            </p>
            <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5">
              Truy cập mọi lúc, mọi nơi, trên mọi thiết bị.
            </p>
          </div>
        </div>

        {/* Right side */}
        <button
          type="button"
          onClick={() => navigate("/documents")}
          className="text-xs sm:text-sm text-blue-600 font-medium hover:bg-blue-50 px-3.5 py-1.5 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 shrink-0"
        >
          <span>Tìm hiểu thêm</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

    </div>
  );
}
