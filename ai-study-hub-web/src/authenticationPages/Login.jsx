import React from "react";
import { Link } from "react-router-dom";
import {
  GraduationCap,
  HelpCircle,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  Loader2,
  AlertCircle,
  X,
} from "lucide-react";
import { useLoginLogic } from "./useLoginLogic";
import loginBg from "./LoginTheme/2.png";

/**
 * Pixel-perfect Google "G" multi-colour icon
 */
const GoogleIcon = () => (
  <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" aria-hidden="true">
    <path
      fill="#4285F4"
      d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
    />
    <path
      fill="#34A853"
      d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
    />
    <path
      fill="#FBBC05"
      d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.16 0 9.98 0 12c0 2.02.45 3.84 1.25 5.42l4.03-3.15z"
    />
    <path
      fill="#EA4335"
      d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
    />
  </svg>
);

/**
 * Login Screen Component
 * Academic & Trust Cloud aesthetic with responsive layout and Tailwind CSS
 * Optimized scale to fit comfortably on 1920x1080 and laptop screens without vertical scrolling
 */
export default function Login() {
  const {
    register,
    handleSubmit,
    errors,
    isLoading,
    showPassword,
    toggleShowPassword,
    serverError,
    clearServerError,
    handleGoogleLogin,
  } = useLoginLogic();

  return (
    <div
      className="relative min-h-screen h-screen w-full flex items-center justify-center p-4 bg-cover bg-center bg-no-repeat overflow-hidden selection:bg-blue-600 selection:text-white"
      style={{ backgroundImage: `url(${loginBg})` }}
    >
      {/* Subtle overlay for natural lighting integration */}
      <div className="absolute inset-0 bg-slate-900/[0.02] backdrop-blur-[0.5px] pointer-events-none" />

      {/* ── 1. FIXED / ABSOLUTE TOP HEADER ────────────────────────────── */}
      <header className="absolute top-0 left-0 w-full px-6 py-4 md:px-10 md:py-5 z-20 flex items-center justify-between">
        {/* Left Branding */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-sm shadow-blue-500/20">
            <GraduationCap className="w-5 h-5 text-white" />
          </div>
          <span className="text-slate-900 font-bold text-base sm:text-lg tracking-tight">
            AI Study Hub
          </span>
        </div>

        {/* Right Utility */}
        <button
          type="button"
          onClick={() => window.open("mailto:support@aistudyhub.com")}
          className="flex items-center gap-1.5 text-xs sm:text-sm text-slate-500 hover:text-blue-600 transition-colors cursor-pointer group"
        >
          <HelpCircle className="w-4 h-4 text-slate-400 group-hover:text-blue-600 transition-colors" />
          <span className="font-medium">Need a hand?</span>
        </button>
      </header>

      {/* ── 2. MAIN CENTERED AUTH CARD ───────────────────────────────── */}
      <main className="w-full max-w-[440px] z-10 my-auto">
        <div className="bg-white rounded-3xl p-6 sm:p-7 md:p-8 shadow-[0_20px_50px_rgba(30,41,59,0.08)] border border-slate-100/80">

          {/* Top Card Branding */}
          <div className="flex flex-col items-center text-center">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-700 via-blue-600 to-indigo-500 flex items-center justify-center text-white shadow-md shadow-blue-500/25 mb-2.5">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-950 tracking-tight">
              AI Study Hub
            </h2>
            <p className="text-[11px] sm:text-xs text-slate-500 font-medium mt-0.5 tracking-wide">
              Your AI-Powered Learning Companion
            </p>
          </div>

          {/* Welcome Greeting */}
          <div className="text-center mt-3.5 mb-4">
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
              Welcome to AI Study Hub
            </h1>
            <p className="text-xs font-normal text-slate-500 max-w-xs mx-auto leading-relaxed mt-1">
              Access your study materials, get AI assistance, and achieve your goals — all in one place.
            </p>
          </div>

          {/* Server Error Alert Banner */}
          {serverError && (
            <div
              className="mb-3.5 p-2.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2 transition-all"
              role="alert"
            >
              <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
              <div className="flex-1 font-medium">{serverError}</div>
              <button
                type="button"
                onClick={clearServerError}
                className="text-red-400 hover:text-red-600 transition-colors p-0.5 cursor-pointer"
                aria-label="Dismiss error"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Sign In Form */}
          <form onSubmit={handleSubmit} noValidate className="space-y-3.5">

            {/* Email / Student ID field */}
            <div>
              <label
                htmlFor="identifier"
                className="block text-xs sm:text-sm font-medium text-slate-700 mb-1"
              >
                Email / Student ID
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Mail className="w-4 h-4 text-slate-400" />
                </div>
                <input
                  id="identifier"
                  type="text"
                  disabled={isLoading}
                  placeholder="Enter your email or student ID"
                  autoComplete="username"
                  {...register("identifier", {
                    required: "Email or Student ID is required.",
                    validate: (value) => {
                      const trimmed = value?.trim();
                      if (!trimmed) return "Email or Student ID cannot be empty.";
                      if (trimmed.includes("@")) {
                        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                        if (!emailRegex.test(trimmed)) {
                          return "Please enter a valid email address.";
                        }
                      }
                      return true;
                    },
                  })}
                  className={`w-full py-2.5 pl-10 pr-4 text-sm rounded-xl border ${
                    errors.identifier
                      ? "border-red-400 focus:border-red-500 focus:ring-red-500/20"
                      : "border-slate-200 focus:border-blue-500 focus:ring-blue-500/20"
                  } text-slate-800 placeholder-slate-400 outline-none focus:ring-2 transition-all bg-white disabled:bg-slate-50 disabled:text-slate-400 disabled:cursor-not-allowed`}
                />
              </div>
              {errors.identifier && (
                <p className="text-[11px] text-red-500 mt-1 flex items-center gap-1 font-medium">
                  <AlertCircle className="w-3 h-3 shrink-0" />
                  <span>{errors.identifier.message}</span>
                </p>
              )}
            </div>

            {/* Password field */}
            <div>
              <label
                htmlFor="password"
                className="block text-xs sm:text-sm font-medium text-slate-700 mb-1"
              >
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Lock className="w-4 h-4 text-slate-400" />
                </div>
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  disabled={isLoading}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  {...register("password", {
                    required: "Password is required.",
                    minLength: {
                      value: 6,
                      message: "Password must be at least 6 characters.",
                    },
                  })}
                  className={`w-full py-2.5 pl-10 pr-11 text-sm rounded-xl border ${
                    errors.password
                      ? "border-red-400 focus:border-red-500 focus:ring-red-500/20"
                      : "border-slate-200 focus:border-blue-500 focus:ring-blue-500/20"
                  } text-slate-800 placeholder-slate-400 outline-none focus:ring-2 transition-all bg-white disabled:bg-slate-50 disabled:text-slate-400 disabled:cursor-not-allowed`}
                />
                <button
                  type="button"
                  tabIndex={-1}
                  disabled={isLoading}
                  onClick={toggleShowPassword}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 transition-colors cursor-pointer disabled:cursor-not-allowed"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-[11px] text-red-500 mt-1 flex items-center gap-1 font-medium">
                  <AlertCircle className="w-3 h-3 shrink-0" />
                  <span>{errors.password.message}</span>
                </p>
              )}
            </div>

            {/* Checkbox Row (Options) */}
            <div className="flex items-center justify-between pt-0.5 pb-0.5">
              <label className="flex items-center gap-2 cursor-pointer select-none group">
                <input
                  type="checkbox"
                  disabled={isLoading}
                  {...register("rememberMe")}
                  className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-2 focus:ring-blue-500/20 accent-blue-600 cursor-pointer disabled:cursor-not-allowed transition-colors"
                />
                <span className="text-xs sm:text-sm text-slate-600 group-hover:text-slate-800 transition-colors">
                  Remember me
                </span>
              </label>
              <Link
                to="/forgot-password"
                className="text-xs sm:text-sm text-blue-600 font-semibold hover:text-blue-700 hover:underline transition-colors"
              >
                Forgot Password?
              </Link>
            </div>

            {/* Action Button: Sign In */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-semibold py-2.5 sm:py-3 rounded-xl text-sm transition-all shadow-md shadow-blue-500/10 hover:shadow-lg hover:shadow-blue-500/20 flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed group"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Signing In...</span>
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-4 flex items-center">
            <div className="flex-1 border-t border-slate-100" />
            <span className="mx-3.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wide">
              Or continue with
            </span>
            <div className="flex-1 border-t border-slate-100" />
          </div>

          {/* Social Logins: Google Only */}
          <div>
            <button
              type="button"
              disabled={isLoading}
              onClick={handleGoogleLogin}
              className="w-full bg-white border border-slate-200 hover:bg-slate-50 hover:border-slate-300 py-2.5 rounded-xl flex items-center justify-center gap-2.5 text-sm font-medium text-slate-700 transition-all shadow-sm hover:shadow cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <GoogleIcon />
              <span>Continue with Google</span>
            </button>
          </div>

          {/* Card Footer */}
          <p className="text-center text-xs sm:text-sm text-slate-500 mt-4">
            Don't have an account?{" "}
            <Link
              to="/register"
              className="text-blue-600 font-semibold hover:text-blue-700 hover:underline transition-colors ml-0.5"
            >
              Sign Up
            </Link>
          </p>
        </div>
      </main>

      {/* ── 3. FIXED / ABSOLUTE BOTTOM FOOTER ─────────────────────────── */}
      <footer className="absolute bottom-0 left-0 w-full px-6 py-3.5 md:px-10 md:py-4 z-20 flex flex-col sm:flex-row items-center justify-between gap-1.5 text-xs text-slate-500/80">
        <div>© 2026 AI Study Hub. Built for brighter minds.</div>
        <div className="flex items-center gap-3">
          <Link
            to="/privacy"
            className="hover:text-slate-800 hover:underline transition-colors"
          >
            Privacy Policy
          </Link>
          <span>·</span>
          <Link
            to="/terms"
            className="hover:text-slate-800 hover:underline transition-colors"
          >
            Terms of Service
          </Link>
        </div>
      </footer>
    </div>
  );
}
