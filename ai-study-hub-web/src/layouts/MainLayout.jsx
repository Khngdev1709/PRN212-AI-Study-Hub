import React, { useState, useRef, useEffect } from "react";
import { Outlet, NavLink, Link, useNavigate, useLocation } from "react-router-dom";
import {
  GraduationCap,
  Search,
  Bell,
  Home,
  FileText,
  Book,
  Sparkles,
  Users,
  Settings,
  Menu,
  X,
  ChevronDown,
  LogOut,
  User as UserIcon,
} from "lucide-react";
import { useAuth } from "../hooks/useAuth";

/**
 * Main navigation items for sidebar
 */
const NAV_ITEMS = [
  { label: "Tổng quan", icon: Home, to: "/dashboard" },
  { label: "Tài liệu của tôi", icon: FileText, to: "/documents" },
  { label: "Môn học", icon: Book, to: "/courses" },
  { label: "Trợ lý AI", icon: Sparkles, to: "/ai-assistant" },
  { label: "Đã chia sẻ", icon: Users, to: "/shared" },
];

const BOTTOM_NAV_ITEMS = [
  { label: "Cài đặt", icon: Settings, to: "/settings" },
];

export default function MainLayout() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const profileRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  // Close mobile drawer on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  // Close profile dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setProfileDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Display name & avatar initial directly derived from user entity
  const displayName =
    user?.fullName ||
    (user?.firstName ? `${user.firstName} ${user?.lastName || ""}`.trim() : "") ||
    (user?.FirstName ? `${user.FirstName} ${user?.LastName || ""}`.trim() : "") ||
    "Nguyễn Minh Anh";
  const avatarLetter = displayName.trim() ? displayName.trim().charAt(0).toUpperCase() : "N";

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/documents?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  /**
   * Helper to render NavLink with requested active/inactive styling
   */
  const renderNavItem = (item) => {
    const Icon = item.icon;
    return (
      <NavLink
        key={item.to}
        to={item.to}
        className={({ isActive }) =>
          `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm transition-all duration-150 select-none ${
            isActive
              ? "bg-blue-50 text-blue-700 font-semibold shadow-xs"
              : "text-slate-600 hover:bg-slate-50 hover:text-slate-900 font-medium"
          }`
        }
      >
        <Icon className="w-5 h-5 shrink-0" />
        <span className="truncate">{item.label}</span>
      </NavLink>
    );
  };

  return (
    <div className="flex h-screen bg-[#F8FAFC] overflow-hidden antialiased">
      
      {/* ══════════════════════════════════════════════════════════
          1. DESKTOP SIDEBAR (FIXED LEFT)
      ══════════════════════════════════════════════════════════ */}
      <aside className="w-64 bg-white border-r border-slate-200 hidden md:flex flex-col flex-shrink-0 select-none">
        
        {/* Top Logo Area */}
        <div className="h-16 flex items-center px-6 gap-2 border-b border-slate-100 flex-shrink-0">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-sm shadow-blue-500/20 group-hover:bg-blue-700 transition-colors">
              <GraduationCap className="w-5 h-5" />
            </div>
            <span className="text-slate-900 font-bold text-lg tracking-tight">
              AI Study Hub
            </span>
          </Link>
        </div>

        {/* Navigation Menu */}
        <div className="flex-1 flex flex-col justify-between p-4 overflow-y-auto">
          {/* Main Items */}
          <nav className="space-y-1.5" aria-label="Main Navigation">
            {NAV_ITEMS.map(renderNavItem)}
          </nav>

          {/* Bottom Items with Divider */}
          <div className="pt-4 border-t border-slate-200 mt-4 space-y-1.5">
            {BOTTOM_NAV_ITEMS.map(renderNavItem)}
          </div>
        </div>
      </aside>

      {/* ══════════════════════════════════════════════════════════
          2. MOBILE SIDEBAR DRAWER (OVERLAY)
      ══════════════════════════════════════════════════════════ */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileMenuOpen(false)}
            aria-hidden="true"
          />

          {/* Drawer Content */}
          <aside className="relative w-64 max-w-[80vw] bg-white h-full shadow-2xl flex flex-col z-50">
            {/* Drawer Header */}
            <div className="h-16 flex items-center justify-between px-6 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-sm shadow-blue-500/20">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <span className="text-slate-900 font-bold text-lg tracking-tight">
                  AI Study Hub
                </span>
              </div>
              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                aria-label="Close sidebar"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Drawer Navigation Menu */}
            <div className="flex-1 flex flex-col justify-between p-4 overflow-y-auto">
              <nav className="space-y-1.5">
                {NAV_ITEMS.map(renderNavItem)}
              </nav>

              <div className="pt-4 border-t border-slate-200 mt-4 space-y-1.5">
                {BOTTOM_NAV_ITEMS.map(renderNavItem)}
              </div>
            </div>
          </aside>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════
          3. RIGHT COLUMN (HEADBAR + MAIN CONTENT AREA)
      ══════════════════════════════════════════════════════════ */}
      <div className="flex flex-col flex-1 overflow-hidden min-w-0">
        
        {/* Headbar (Top - Fixed) */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 sm:px-6 flex-shrink-0 z-10">
          
          {/* Left section: Mobile menu icon + Search bar */}
          <div className="flex items-center gap-3 flex-1 max-w-xl">
            {/* Mobile Hamburger Menu Icon */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors md:hidden cursor-pointer"
              aria-label="Open navigation menu"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Search Bar */}
            <form onSubmit={handleSearchSubmit} className="max-w-md w-full">
              <div className="bg-slate-100 hover:bg-slate-100/80 focus-within:bg-white focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-500 border border-transparent rounded-full flex items-center px-4 py-2 gap-2.5 transition-all">
                <Search className="w-4 h-4 text-slate-400 shrink-0" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Tìm tài liệu, môn học hoặc nội dung..."
                  className="bg-transparent outline-none text-sm w-full text-slate-800 placeholder:text-slate-400"
                />
              </div>
            </form>
          </div>

          {/* Right Profile Area */}
          <div className="flex items-center gap-2 sm:gap-4 ml-4">
            
            {/* Notification Bell Icon */}
            <div className="relative">
              <button
                type="button"
                className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors cursor-pointer relative"
                aria-label="Notifications"
              >
                <Bell className="w-5 h-5" />
                {/* Red dot notification indicator */}
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
              </button>
            </div>

            {/* Vertical subtle divider on larger screens */}
            <div className="h-6 w-[1px] bg-slate-200 hidden sm:block" />

            {/* User Profile Container & Dropdown */}
            <div className="relative" ref={profileRef}>
              <button
                type="button"
                onClick={() => setProfileDropdownOpen((prev) => !prev)}
                className="flex items-center gap-2.5 p-1 sm:p-1.5 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer select-none text-left"
                aria-expanded={profileDropdownOpen}
                aria-haspopup="true"
              >
                {/* Avatar: Blue circle with white letter */}
                <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm shadow-xs shrink-0">
                  {avatarLetter}
                </div>

                {/* User Name */}
                <span className="text-sm font-medium text-slate-800 hidden sm:block truncate max-w-[140px]">
                  {displayName}
                </span>

                {/* Chevron icon */}
                <ChevronDown
                  className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${
                    profileDropdownOpen ? "rotate-180 text-blue-600" : ""
                  }`}
                />
              </button>

              {/* Profile Dropdown Menu */}
              {profileDropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-100 py-1.5 z-50 animate-in fade-in slide-in-from-top-1 duration-150">
                  <div className="px-4 py-2.5 border-b border-slate-100 sm:hidden">
                    <p className="text-sm font-semibold text-slate-900 truncate">{displayName}</p>
                    <p className="text-xs text-slate-500 truncate">{user?.email || "student@fpt.edu.vn"}</p>
                  </div>

                  <Link
                    to="/profile"
                    onClick={() => setProfileDropdownOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-2 text-xs sm:text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                  >
                    <UserIcon className="w-4 h-4 text-slate-400" />
                    <span>Hồ sơ cá nhân</span>
                  </Link>

                  <Link
                    to="/settings"
                    onClick={() => setProfileDropdownOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-2 text-xs sm:text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                  >
                    <Settings className="w-4 h-4 text-slate-400" />
                    <span>Cài đặt tài khoản</span>
                  </Link>

                  <div className="my-1 border-t border-slate-100" />

                  <button
                    type="button"
                    onClick={() => {
                      setProfileDropdownOpen(false);
                      handleLogout();
                    }}
                    className="w-full flex items-center gap-2.5 px-4 py-2 text-xs sm:text-sm text-red-600 hover:bg-red-50 transition-colors text-left cursor-pointer font-medium"
                  >
                    <LogOut className="w-4 h-4 text-red-500" />
                    <span>Đăng xuất</span>
                  </button>
                </div>
              )}
            </div>

          </div>
        </header>

        {/* Main Content Area: Scrollable with dynamic page content */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8">
          <Outlet />
        </main>

      </div>
    </div>
  );
}
