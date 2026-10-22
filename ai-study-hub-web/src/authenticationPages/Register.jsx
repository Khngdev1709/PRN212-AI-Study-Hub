import React from "react";
import { Link } from "react-router-dom";
import {
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  GraduationCap,
  HelpCircle,
  Sparkles,
  Loader2,
  AlertCircle,
  CheckCircle2,
  X,
} from "lucide-react";
import { useRegisterLogic } from "./useRegisterLogic";
import loginBg from "./LoginTheme/2.png";
import "./Register.css";

/**
 * Register / Create Account Screen Component
 * Academic & Trust Cloud aesthetic with responsive layout and Tailwind CSS
 */
export default function Register() {
  const {
    fullName,
    setFullName,
    email,
    setEmail,
    password,
    setPassword,
    confirmPassword,
    setConfirmPassword,
    agreeTerms,
    setAgreeTerms,
    showPassword,
    toggleShowPassword,
    showConfirmPassword,
    toggleShowConfirmPassword,
    strength,
    isLoading,
    formErrors,
    setFormErrors,
    serverError,
    clearServerError,
    successMessage,
    handleSubmit,
  } = useRegisterLogic();

  return (
    <div
      className="relative min-h-screen w-full flex items-center justify-center p-4 py-14 sm:py-16 bg-cover bg-center bg-no-repeat overflow-y-auto selection:bg-blue-600 selection:text-white"
      style={{ backgroundImage: `url(${loginBg})` }}
    >
      {/* Subtle overlay for natural lighting integration */}
      <div className="absolute inset-0 bg-slate-900/[0.02] backdrop-blur-[0.5px] pointer-events-none" />

      {/* ── 1. FIXED / ABSOLUTE TOP HEADER ────────────────────────────── */}
      <header className="absolute top-0 left-0 w-full px-6 py-4 md:px-10 md:py-5 z-20 flex items-center justify-between">
        {/* Left Branding */}
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-sm shadow-blue-500/20 group-hover:bg-blue-700 transition-colors">
            <GraduationCap className="w-5 h-5 text-white" />
          </div>
          <span className="text-slate-900 font-bold text-base sm:text-lg tracking-tight">
            AI Study Hub<span className="text-blue-600">.</span>
          </span>
        </Link>

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

      {/* ── 2. MAIN CENTERED AUTH CARD CONTAINER ──────────────────────── */}
      <main className="w-full max-w-md z-10 my-auto register-fade-in">
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-2xl shadow-slate-200/50 border border-slate-100/80">
          
          {/* Branding Header */}
          <div className="flex flex-col items-center text-center mb-4">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-blue-700 via-blue-600 to-indigo-500 flex items-center justify-center text-white shadow-md shadow-blue-500/25 mb-2.5">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Create an Account
            </h1>
            <p className="text-xs text-slate-500 font-medium mt-1 max-w-xs mx-auto leading-relaxed">
              Join AI Study Hub to summarize lectures and study with AI
            </p>
          </div>

          {/* Server / Validation Alerts */}
          {serverError && (
            <div
              className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2 transition-all register-fade-in"
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

          {successMessage && (
            <div
              className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs flex items-center gap-2 transition-all register-fade-in"
              role="alert"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span className="font-medium">{successMessage}</span>
            </div>
          )}

          {/* Register Form */}
          <form onSubmit={handleSubmit} noValidate className="space-y-3.5">

            {/* Field 1: Full Name */}
            <div>
              <label htmlFor="fullName" className="block text-xs sm:text-sm font-medium text-slate-700 mb-1">
                Full Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <User className="w-4 h-4 text-slate-400" />
                </div>
                <input
                  id="fullName"
                  type="text"
                  disabled={isLoading}
                  value={fullName}
                  onChange={(e) => {
                    setFullName(e.target.value);
                    if (formErrors.fullName) setFormErrors({ ...formErrors, fullName: "" });
                  }}
                  placeholder="Enter your full name"
                  autoComplete="name"
                  className={`register-input ${formErrors.fullName ? "register-input-error" : ""}`}
                />
              </div>
              {formErrors.fullName && (
                <p className="text-[11px] text-red-500 mt-1 flex items-center gap-1 font-medium">
                  <AlertCircle className="w-3 h-3 shrink-0" />
                  <span>{formErrors.fullName}</span>
                </p>
              )}
            </div>

            {/* Field 2: Student Email */}
            <div>
              <label htmlFor="email" className="block text-xs sm:text-sm font-medium text-slate-700 mb-1">
                Student Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Mail className="w-4 h-4 text-slate-400" />
                </div>
                <input
                  id="email"
                  type="email"
                  disabled={isLoading}
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (formErrors.email) setFormErrors({ ...formErrors, email: "" });
                  }}
                  placeholder="yourname@fpt.edu.vn"
                  autoComplete="email"
                  className={`register-input ${formErrors.email ? "register-input-error" : ""}`}
                />
              </div>
              {formErrors.email && (
                <p className="text-[11px] text-red-500 mt-1 flex items-center gap-1 font-medium">
                  <AlertCircle className="w-3 h-3 shrink-0" />
                  <span>{formErrors.email}</span>
                </p>
              )}
            </div>

            {/* Field 3: Password */}
            <div>
              <label htmlFor="password" className="block text-xs sm:text-sm font-medium text-slate-700 mb-1">
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
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (formErrors.password) setFormErrors({ ...formErrors, password: "" });
                  }}
                  placeholder="Enter your password"
                  autoComplete="new-password"
                  className={`register-input ${formErrors.password ? "register-input-error" : ""}`}
                  style={{ paddingRight: "2.75rem" }}
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
              {formErrors.password && (
                <p className="text-[11px] text-red-500 mt-1 flex items-center gap-1 font-medium">
                  <AlertCircle className="w-3 h-3 shrink-0" />
                  <span>{formErrors.password}</span>
                </p>
              )}

              {/* ── Password Strength Meter ── */}
              <div className="mt-2.5">
                <div className="flex gap-1.5 items-center">
                  <div
                    className={`strength-bar ${
                      strength.score >= 1 ? strength.barClass : "strength-bar-inactive"
                    }`}
                  />
                  <div
                    className={`strength-bar ${
                      strength.score >= 2 ? strength.barClass : "strength-bar-inactive"
                    }`}
                  />
                  <div
                    className={`strength-bar ${
                      strength.score >= 3 ? strength.barClass : "strength-bar-inactive"
                    }`}
                  />
                </div>

                <div className="flex items-center justify-between text-xs mt-1.5 select-none">
                  <div className="text-slate-500 text-[11px]">
                    <span className={strength.score === 1 ? "font-bold text-amber-500" : ""}>Weak</span>
                    {" / "}
                    <span className={strength.score === 2 ? "font-bold text-blue-600" : ""}>Medium</span>
                    {" / "}
                    <span className={strength.score === 3 ? "font-bold text-emerald-600" : ""}>Strong</span>
                  </div>
                  <span className={`text-[11px] font-semibold transition-colors ${strength.color}`}>
                    {strength.text}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 mt-0.5 leading-tight">
                  Use 8+ characters with a number and a symbol.
                </p>
              </div>
            </div>

            {/* Field 4: Confirm Password */}
            <div>
              <label htmlFor="confirmPassword" className="block text-xs sm:text-sm font-medium text-slate-700 mb-1">
                Confirm Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Lock className="w-4 h-4 text-slate-400" />
                </div>
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  disabled={isLoading}
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    if (formErrors.confirmPassword) setFormErrors({ ...formErrors, confirmPassword: "" });
                  }}
                  placeholder="Re-enter your password"
                  autoComplete="new-password"
                  className={`register-input ${formErrors.confirmPassword ? "register-input-error" : ""}`}
                  style={{ paddingRight: "2.75rem" }}
                />
                <button
                  type="button"
                  tabIndex={-1}
                  disabled={isLoading}
                  onClick={toggleShowConfirmPassword}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 transition-colors cursor-pointer disabled:cursor-not-allowed"
                  aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {formErrors.confirmPassword && (
                <p className="text-[11px] text-red-500 mt-1 flex items-center gap-1 font-medium">
                  <AlertCircle className="w-3 h-3 shrink-0" />
                  <span>{formErrors.confirmPassword}</span>
                </p>
              )}
            </div>

            {/* Checkbox Area: Terms of Service */}
            <div className="pt-0.5 pb-0.5">
              <label className="flex items-start gap-2 cursor-pointer select-none group">
                <input
                  type="checkbox"
                  disabled={isLoading}
                  checked={agreeTerms}
                  onChange={(e) => {
                    setAgreeTerms(e.target.checked);
                    if (formErrors.agreeTerms) setFormErrors({ ...formErrors, agreeTerms: "" });
                  }}
                  className="w-4 h-4 mt-0.5 rounded border-slate-300 text-blue-600 focus:ring-2 focus:ring-blue-500/20 accent-blue-600 cursor-pointer disabled:cursor-not-allowed transition-colors"
                />
                <span className="text-xs text-slate-600 group-hover:text-slate-800 transition-colors leading-relaxed">
                  I agree to the{" "}
                  <Link
                    to="/terms"
                    className="text-blue-600 hover:text-blue-700 hover:underline font-medium transition-colors"
                  >
                    Terms of Service
                  </Link>{" "}
                  and{" "}
                  <Link
                    to="/privacy"
                    className="text-blue-600 hover:text-blue-700 hover:underline font-medium transition-colors"
                  >
                    Privacy Policy
                  </Link>
                </span>
              </label>
              {formErrors.agreeTerms && (
                <p className="text-[11px] text-red-500 mt-1 flex items-center gap-1 font-medium">
                  <AlertCircle className="w-3 h-3 shrink-0" />
                  <span>{formErrors.agreeTerms}</span>
                </p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="register-btn-primary"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Creating Account...</span>
                </>
              ) : (
                <span>Create Account</span>
              )}
            </button>
          </form>

          {/* Card Footer */}
          <p className="text-center text-xs sm:text-sm text-slate-500 mt-4">
            Already have an account?{" "}
            <Link
              to="/login"
              className="text-blue-600 font-semibold hover:text-blue-700 hover:underline transition-colors ml-0.5"
            >
              Log In
            </Link>
          </p>
        </div>

        {/* ── 3. ELEMENT BELOW CARD ──────────────────────────────────── */}
        <div className="flex items-center justify-center gap-1.5 text-xs text-slate-500 font-medium mt-3.5 select-none">
          <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0" />
          <span>Less busywork. More lightbulb moments.</span>
        </div>
      </main>

      {/* ── FIXED / ABSOLUTE BOTTOM FOOTER ─────────────────────────── */}
      <footer className="absolute bottom-0 left-0 w-full px-6 py-3.5 md:px-10 md:py-4 z-20 flex flex-col sm:flex-row items-center justify-between gap-1.5 text-xs text-slate-500/80">
        <div>© 2026 AI Study Hub</div>
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
