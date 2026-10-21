import React from "react";
import { Link } from "react-router-dom";
import {
  GraduationCap,
  HelpCircle,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ShieldCheck,
  Loader2,
  AlertCircle,
  X,
} from "lucide-react";
import { useLoginLogic } from "./useLoginLogic";
import "./Login.css";

/** Google "G" multi-colour icon */
const GoogleIcon = () => (
  <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
  </svg>
);

/**
 * Login — "Soft AI Gradient & Glassmorphism" design
 * Centered single-card layout on a mesh gradient background
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
    handleFptLogin,
  } = useLoginLogic();

  return (
    <div className="login-gradient-bg">

      {/* ── Decorative ambient orbs ────────────────────────────── */}
      <div className="login-orb login-orb-1" aria-hidden="true" />
      <div className="login-orb login-orb-2" aria-hidden="true" />

      {/* ── Floating top header ────────────────────────────────── */}
      <header className="w-full max-w-md flex items-center justify-between mb-6 px-1">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-xl bg-white/70 backdrop-blur-sm border border-indigo-100 text-indigo-600 shadow-sm">
            <GraduationCap className="w-4 h-4" />
          </div>
          <span className="font-bold text-sm text-slate-700 tracking-tight">AI Study Hub</span>
        </div>

        <button
          type="button"
          onClick={() => window.open("mailto:support@aistudyhub.com")}
          className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-indigo-600 transition-colors duration-200 cursor-pointer"
        >
          <HelpCircle className="w-3.5 h-3.5" />
          <span>Need a hand?</span>
        </button>
      </header>

      {/* ══════════════════════════════════════════════════
          GLASSMORPHISM CARD
      ══════════════════════════════════════════════════ */}
      <div className="login-glass-card w-full max-w-md">

        {/* Logo + Brand */}
        <div className="flex flex-col items-center text-center mb-7">
          <div className="login-logo-gradient mb-3">
            <GraduationCap className="w-6 h-6" />
          </div>
          <h1 className="text-lg font-bold text-slate-800 tracking-tight">AI Study Hub</h1>
          <p className="text-xs text-indigo-400 font-medium mt-0.5 uppercase tracking-wider">
            Empower Your Learning with AI
          </p>
        </div>

        {/* Greeting */}
        <div className="text-center mb-7">
          <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Welcome back 👋</h2>
          <p className="text-sm text-slate-500 mt-1">Your next breakthrough starts here.</p>
        </div>

        {/* Server Error Banner */}
        {serverError && (
          <div className="login-error-glass" role="alert">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-500" />
            <div className="flex-1 text-sm text-red-700">{serverError}</div>
            <button
              type="button"
              onClick={clearServerError}
              className="text-red-400 hover:text-red-600 transition-colors cursor-pointer"
              aria-label="Đóng thông báo"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* ── Form ── */}
        <form onSubmit={handleSubmit} className="space-y-4" noValidate>

          {/* Email / Student ID */}
          <div>
            <label htmlFor="identifier" className="block text-sm font-medium text-slate-600 mb-1.5">
              Email / Student ID
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <Mail className="w-4 h-4 text-indigo-400" />
              </div>
              <input
                id="identifier"
                type="text"
                placeholder="Enter your email or student ID"
                autoComplete="username"
                {...register("identifier", {
                  required: "Email hoặc mã số sinh viên không được để trống.",
                })}
                className={`login-input ${errors.identifier ? "login-input-error" : ""}`}
                style={{ paddingLeft: "2.5rem" }}
              />
            </div>
            {errors.identifier && (
              <p className="text-red-500 text-xs mt-1.5 flex items-center gap-1">
                <AlertCircle className="w-3 h-3 shrink-0" />
                {errors.identifier.message}
              </p>
            )}
          </div>

          {/* Password */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-slate-600 mb-1.5">
              Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <Lock className="w-4 h-4 text-indigo-400" />
              </div>
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                autoComplete="current-password"
                {...register("password", {
                  required: "Mật khẩu không được để trống.",
                  minLength: { value: 6, message: "Mật khẩu phải có ít nhất 6 ký tự." },
                })}
                className={`login-input ${errors.password ? "login-input-error" : ""}`}
                style={{ paddingLeft: "2.5rem", paddingRight: "2.75rem" }}
              />
              <button
                type="button"
                tabIndex={-1}
                onClick={toggleShowPassword}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-indigo-500 transition-colors cursor-pointer"
                aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {errors.password && (
              <p className="text-red-500 text-xs mt-1.5 flex items-center gap-1">
                <AlertCircle className="w-3 h-3 shrink-0" />
                {errors.password.message}
              </p>
            )}
          </div>

          {/* Remember me + Forgot password */}
          <div className="flex items-center justify-between pt-1">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                {...register("rememberMe")}
                className="w-4 h-4 rounded border-indigo-200 accent-indigo-600 cursor-pointer"
              />
              <span className="text-sm text-slate-600">Remember me</span>
            </label>
            <Link
              to="/forgot-password"
              className="text-sm text-indigo-600 hover:text-indigo-700 hover:underline font-medium transition-colors duration-200"
            >
              Forgot Password?
            </Link>
          </div>

          {/* Sign In — Gradient CTA */}
          <button type="submit" disabled={isLoading} className="login-btn-gradient">
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Signing In...</span>
              </>
            ) : (
              <span>Sign In</span>
            )}
          </button>
        </form>

        {/* Divider */}
        <div className="relative my-6 flex items-center">
          <div className="flex-1 border-t border-indigo-100" />
          <span className="mx-4 text-xs text-slate-400 font-medium whitespace-nowrap">Or continue with</span>
          <div className="flex-1 border-t border-indigo-100" />
        </div>

        {/* Social Buttons */}
        <div className="space-y-2.5">
          <button type="button" onClick={handleGoogleLogin} className="login-social-glass">
            <GoogleIcon />
            <span>Continue with Google</span>
          </button>
          <button type="button" onClick={handleFptLogin} className="login-social-glass">
            <GraduationCap className="w-4 h-4 text-orange-500 shrink-0" />
            <span>Sign in with FPT Student Account</span>
          </button>
        </div>

        {/* Sign Up link */}
        <p className="text-center text-sm text-slate-500 mt-6">
          Don't have an account?{" "}
          <Link
            to="/register"
            className="text-indigo-600 hover:text-indigo-700 font-semibold hover:underline transition-colors duration-200"
          >
            Sign Up
          </Link>
        </p>
      </div>
      {/* ── /Glass Card ── */}

      {/* Trust Badge */}
      <div className="flex items-center justify-center gap-1.5 mt-6 text-xs text-slate-400">
        <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
        <span>Your learning, securely in sync.</span>
      </div>

      {/* Bottom Footer */}
      <footer className="w-full max-w-md flex flex-col sm:flex-row items-center justify-between gap-2 mt-8 px-1 text-xs text-slate-400">
        <div>© 2026 AI Study Hub. Built for brighter minds.</div>
        <div className="flex items-center gap-3">
          <Link to="/privacy" className="hover:text-slate-700 transition-colors duration-200">Privacy Policy</Link>
          <span>·</span>
          <Link to="/terms" className="hover:text-slate-700 transition-colors duration-200">Terms of Service</Link>
        </div>
      </footer>

    </div>
  );
}
