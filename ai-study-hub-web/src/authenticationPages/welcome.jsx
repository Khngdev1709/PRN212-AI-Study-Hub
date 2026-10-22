import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  GraduationCap,
  FileText,
  MessageSquare,
  Layers,
  Upload,
  Cpu,
  Brain,
  CheckCircle,
  Bell,
  User,
  Sparkles,
  BookOpen,
  ArrowRight,
  Play,
  Menu,
  X,
  ChevronDown,
  Lock,
  Mail,
  Loader2,
  AlertCircle,
  Check,
  LogOut,
} from "lucide-react";
import { useAuth } from "../api/useAuth";
import "./welcome.css";

export default function Welcome() {
  const navigate = useNavigate();
  const { user, isAuthenticated, login, register: authRegister, logout, isLoading: authLoading } = useAuth();

  // Mobile menu state
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Quick Auth Modal state
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState("login"); // "login" | "register"
  const [modalLoading, setModalLoading] = useState(false);
  const [modalError, setModalError] = useState("");
  const [modalSuccess, setModalSuccess] = useState("");

  // Auth form states for in-page modal
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [regFullName, setRegFullName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regConfirmPassword, setRegConfirmPassword] = useState("");

  // FAQ open items state
  const [openFaq, setOpenFaq] = useState(null);

  const toggleFaq = (index) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const openAuth = (mode = "login") => {
    setAuthMode(mode);
    setModalError("");
    setModalSuccess("");
    setAuthModalOpen(true);
  };

  // Handle Quick Login API call
  const handleQuickLogin = async (e) => {
    e.preventDefault();
    setModalError("");
    setModalSuccess("");

    if (!loginEmail.trim() || !loginPassword.trim()) {
      setModalError("Please enter your email and password.");
      return;
    }

    setModalLoading(true);
    try {
      const res = await login(loginEmail.trim(), loginPassword);
      if (res.success) {
        setModalSuccess("Login successful! Redirecting...");
        setTimeout(() => {
          setAuthModalOpen(false);
          navigate("/login");
        }, 800);
      } else {
        setModalError(res.message || "Invalid credentials. Please try again.");
      }
    } catch (err) {
      setModalError("Connection error. Please try again later.");
    } finally {
      setModalLoading(false);
    }
  };

  // Handle Quick Register API call
  const handleQuickRegister = async (e) => {
    e.preventDefault();
    setModalError("");
    setModalSuccess("");

    if (!regFullName.trim() || !regEmail.trim() || !regPassword.trim()) {
      setModalError("Please fill in all required fields.");
      return;
    }
    if (regPassword.length < 6) {
      setModalError("Password must be at least 6 characters.");
      return;
    }
    if (regPassword !== regConfirmPassword) {
      setModalError("Passwords do not match.");
      return;
    }

    setModalLoading(true);
    try {
      const res = await authRegister({
        fullName: regFullName.trim(),
        email: regEmail.trim(),
        password: regPassword,
        confirmPassword: regConfirmPassword,
      });

      if (res.success) {
        setModalSuccess("Account created successfully! Switching to login...");
        setTimeout(() => {
          setAuthMode("login");
          setLoginEmail(regEmail);
          setModalSuccess("");
        }, 1200);
      } else {
        setModalError(res.message || "Registration failed. Please try again.");
      }
    } catch (err) {
      setModalError("Server connection error. Please try again later.");
    } finally {
      setModalLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 antialiased selection:bg-blue-600 selection:text-white relative">
      
      {/* ══════════════════════════════════════════════════════════
          1. STICKY GLASSMORPHIC HEADER
      ══════════════════════════════════════════════════════════ */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-100 transition-all">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          
          {/* Left Branding */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20 group-hover:bg-blue-700 transition-colors">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <span className="text-slate-900 font-bold text-lg tracking-tight">AI Study Hub</span>
          </Link>

          {/* Center Nav (Desktop) */}
          <nav className="hidden md:flex items-center gap-8">
            <a
              href="#features"
              className="text-slate-600 hover:text-blue-600 text-sm font-medium transition-colors cursor-pointer"
            >
              Features
            </a>
            <a
              href="#how-it-works"
              className="text-slate-600 hover:text-blue-600 text-sm font-medium transition-colors cursor-pointer"
            >
              How it Works
            </a>
            <a
              href="#faq"
              className="text-slate-600 hover:text-blue-600 text-sm font-medium transition-colors cursor-pointer"
            >
              FAQ
            </a>
          </nav>

          {/* Right Actions */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated ? (
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 border border-slate-200/80 text-xs text-slate-700">
                  <div className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-[10px]">
                    {user?.fullName ? user.fullName[0].toUpperCase() : "U"}
                  </div>
                  <span className="font-medium max-w-[120px] truncate">{user?.fullName || user?.email || "Student"}</span>
                </div>
                <button
                  type="button"
                  onClick={logout}
                  className="flex items-center gap-1 text-slate-500 hover:text-red-600 text-xs font-medium px-2 py-1.5 rounded-lg transition-colors cursor-pointer"
                  title="Logout"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Logout</span>
                </button>
              </div>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-slate-700 hover:text-blue-600 font-medium text-sm px-4 py-2 transition-colors cursor-pointer"
                >
                  Log In
                </Link>
                <Link
                  to="/register"
                  className="bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm px-5 py-2.5 rounded-full shadow-sm hover:shadow-md transition-all cursor-pointer"
                >
                  Register
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center gap-2">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-slate-600 hover:bg-slate-100 transition-colors"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-slate-100 bg-white px-6 py-4 flex flex-col gap-3 shadow-lg animate-fadeIn">
            <a
              href="#features"
              onClick={() => setMobileMenuOpen(false)}
              className="text-slate-700 hover:text-blue-600 py-2 text-sm font-medium"
            >
              Features
            </a>
            <a
              href="#how-it-works"
              onClick={() => setMobileMenuOpen(false)}
              className="text-slate-700 hover:text-blue-600 py-2 text-sm font-medium"
            >
              How it Works
            </a>
            <a
              href="#faq"
              onClick={() => setMobileMenuOpen(false)}
              className="text-slate-700 hover:text-blue-600 py-2 text-sm font-medium"
            >
              FAQ
            </a>
            <div className="pt-2 border-t border-slate-100 flex flex-col gap-2">
              <Link
                to="/login"
                className="w-full text-center py-2.5 text-sm font-medium text-slate-700 border border-slate-200 rounded-xl hover:bg-slate-50"
              >
                Log In
              </Link>
              <Link
                to="/register"
                className="w-full text-center py-2.5 text-sm font-medium text-white bg-blue-600 rounded-xl hover:bg-blue-700 shadow-sm"
              >
                Register
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* ══════════════════════════════════════════════════════════
          2. HERO SECTION
      ══════════════════════════════════════════════════════════ */}
      <section className="py-16 md:py-24 text-center relative overflow-hidden welcome-hero-mesh">
        <div className="max-w-7xl mx-auto px-6 relative z-10">

          {/* Pill Badge */}
          <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-100 text-blue-700 text-xs font-semibold px-3.5 py-1.5 rounded-full mb-6 shadow-sm">
            <span>✨</span>
            <span>Your AI-Powered Learning Companion</span>
          </div>

          {/* Main Heading */}
          <h1 className="text-4xl md:text-6xl font-extrabold text-slate-900 tracking-tight max-w-4xl mx-auto leading-tight md:leading-tight">
            Better Learning, <span className="text-blue-600">Brighter Future</span> with AI.
          </h1>

          {/* Sub-heading */}
          <p className="text-slate-500 text-base md:text-lg max-w-2xl mx-auto mt-4 leading-relaxed">
            Upload lectures, PDFs, and notes. Let AI summarize key takeaways, answer questions with 100% academic accuracy, and generate interactive flashcards.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-8">
            <Link
              to="/register"
              className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-semibold px-6 py-3.5 rounded-xl shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30 transition-all flex items-center justify-center gap-2 group cursor-pointer"
            >
              <span>Get Started Free</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Link>
            <button
              type="button"
              onClick={() => openAuth("login")}
              className="w-full sm:w-auto bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 font-semibold px-6 py-3.5 rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer"
            >
              <Play className="w-4 h-4 fill-slate-700 text-slate-700" />
              <span>Watch Demo / Quick Sign In</span>
            </button>
          </div>

          {/* ══════════════════════════════════════════════════════════
              3. HERO MOCKUP & FLOATING BADGES CONTAINER
          ══════════════════════════════════════════════════════════ */}
          <div className="mt-14 max-w-5xl mx-auto relative px-4">
            
            {/* ── Left Floating Badges (Desktop) ── */}
            <div className="hidden lg:flex flex-col gap-6 absolute -left-8 top-12 z-20 pointer-events-none">
              {/* Badge 1: Instant Summaries */}
              <div className="bg-white/95 backdrop-blur-md p-3.5 rounded-2xl shadow-xl border border-slate-100 flex items-center gap-3 animate-float-slow w-56 text-left">
                <div className="w-9 h-9 rounded-xl bg-violet-100 text-violet-600 flex items-center justify-center shrink-0">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-800">Instant Summary</div>
                  <div className="text-[10px] text-slate-400 font-medium">Under 3 seconds</div>
                </div>
              </div>

              {/* Badge 2: Dual Engine AI */}
              <div className="bg-white/95 backdrop-blur-md p-3.5 rounded-2xl shadow-xl border border-slate-100 flex items-center gap-3 animate-float-medium w-60 text-left ml-4">
                <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                  <Brain className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-800">RAG Academic Engine</div>
                  <div className="text-[10px] text-slate-400 font-medium">DeepSeek & Gemini AI</div>
                </div>
              </div>

              {/* Badge 3: 100+ Formats */}
              <div className="bg-white/95 backdrop-blur-md p-3.5 rounded-2xl shadow-xl border border-slate-100 flex items-center gap-3 animate-float-fast w-56 text-left">
                <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-800">100+ Formats</div>
                  <div className="text-[10px] text-slate-400 font-medium">PDF, DOCX, Slides</div>
                </div>
              </div>
            </div>

            {/* ── Right Floating Badges (Desktop) ── */}
            <div className="hidden lg:flex flex-col gap-6 absolute -right-8 top-12 z-20 pointer-events-none">
              {/* Badge 4: Flashcard Mastery */}
              <div className="bg-white/95 backdrop-blur-md p-3.5 rounded-2xl shadow-xl border border-slate-100 flex items-center gap-3 animate-float-medium w-56 text-left ml-auto">
                <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
                  <Layers className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-800">Flashcard Mastery</div>
                  <div className="text-[10px] text-slate-400 font-medium">Spaced Repetition</div>
                </div>
              </div>

              {/* Badge 5: Strict Citations */}
              <div className="bg-white/95 backdrop-blur-md p-3.5 rounded-2xl shadow-xl border border-slate-100 flex items-center gap-3 animate-float-slow w-60 text-left -ml-4">
                <div className="w-9 h-9 rounded-xl bg-teal-100 text-teal-600 flex items-center justify-center shrink-0">
                  <CheckCircle className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-800">Academic Accuracy</div>
                  <div className="text-[10px] text-slate-400 font-medium">100% cited answers</div>
                </div>
              </div>

              {/* Badge 6: Active Community */}
              <div className="bg-white/95 backdrop-blur-md p-3.5 rounded-2xl shadow-xl border border-slate-100 flex items-center gap-3 animate-float-fast w-56 text-left ml-auto">
                <div className="w-9 h-9 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-800">Student Community</div>
                  <div className="text-[10px] text-slate-400 font-medium">Across all campuses</div>
                </div>
              </div>
            </div>

            {/* ── Central Mockup Card ── */}
            <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-2xl max-w-xl mx-auto text-left relative z-10 transition-all hover:shadow-blue-500/5">
              
              {/* Header row: Mockup App Bar */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center text-white">
                    <GraduationCap className="w-4 h-4" />
                  </div>
                  <span className="font-bold text-sm text-slate-900 tracking-tight">AI Study Hub</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="relative p-1.5 text-slate-400 hover:text-slate-600 rounded-lg">
                    <Bell className="w-4 h-4" />
                    <span className="w-1.5 h-1.5 bg-red-500 rounded-full absolute top-1 right-1" />
                  </div>
                  <div className="w-7 h-7 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-600 font-bold text-xs">
                    <User className="w-3.5 h-3.5" />
                  </div>
                </div>
              </div>

              {/* Widget 1: AI Summary Preview */}
              <div className="bg-slate-50/80 rounded-2xl p-4 border border-slate-100/90 mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-700 text-[10px] font-bold tracking-wider uppercase">
                    <Sparkles className="w-3 h-3" />
                    AI Summary
                  </span>
                  <span className="text-[11px] text-slate-400 font-medium">2 mins ago</span>
                </div>
                <h4 className="font-bold text-sm text-slate-900 tracking-tight">
                  Neural Networks, Simplified
                </h4>
                <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                  Deep multilayer perceptrons learn hierarchical representations of input data through automated backpropagation gradients.
                </p>
                <div className="mt-3 flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-200/50">
                  <span className="flex items-center gap-1 text-blue-600 font-medium">
                    <CheckCircle className="w-3 h-3" /> 92% Key concepts extracted
                  </span>
                  <span>4 pages processed</span>
                </div>
              </div>

              {/* Widget 2: 2-column Grid */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="bg-slate-50/80 p-3.5 rounded-2xl border border-slate-100">
                  <div className="flex items-center gap-2 text-blue-600 mb-1">
                    <BookOpen className="w-4 h-4" />
                    <span className="text-xl font-extrabold text-slate-900">24</span>
                  </div>
                  <div className="text-xs font-semibold text-slate-700">Lectures Uploaded</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">+4 added this week</div>
                </div>

                <div className="bg-slate-50/80 p-3.5 rounded-2xl border border-slate-100">
                  <div className="flex items-center gap-2 text-emerald-600 mb-1">
                    <FileText className="w-4 h-4" />
                    <span className="text-xl font-extrabold text-slate-900">18</span>
                  </div>
                  <div className="text-xs font-semibold text-slate-700">Summaries Ready</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">100% academic cited</div>
                </div>
              </div>

              {/* Widget 3: Flashcard Sets Preview */}
              <div>
                <div className="flex items-center justify-between text-xs mb-2">
                  <span className="font-bold text-slate-800">Flashcard Sets</span>
                  <span className="text-blue-600 font-medium text-[11px]">View All</span>
                </div>
                <div className="grid grid-cols-2 gap-2.5">
                  <div className="p-3 rounded-xl border border-slate-200/70 bg-white hover:border-blue-300 transition-colors">
                    <div className="font-semibold text-xs text-slate-800 truncate">Neural Networks</div>
                    <div className="flex items-center justify-between mt-1 text-[10px] text-slate-400">
                      <span>48 cards</span>
                      <span className="text-emerald-600 font-bold">94% Mastered</span>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl border border-slate-200/70 bg-white hover:border-blue-300 transition-colors">
                    <div className="font-semibold text-xs text-slate-800 truncate">Binary Trees</div>
                    <div className="flex items-center justify-between mt-1 text-[10px] text-slate-400">
                      <span>32 cards</span>
                      <span className="text-blue-600 font-bold">88% Mastered</span>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>

        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          4. CORE FEATURES SECTION
      ══════════════════════════════════════════════════════════ */}
      <section id="features" className="py-20 max-w-7xl mx-auto px-6 scroll-mt-20">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto">
          <span className="inline-block px-3 py-1 bg-blue-50 border border-blue-100 rounded-full text-blue-600 text-xs font-bold uppercase tracking-wider mb-3">
            EVERYTHING YOU NEED TO MASTER YOUR SUBJECTS
          </span>
          <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">
            Everything You Need to Master Your Subjects
          </h2>
          <p className="text-slate-500 text-base md:text-lg mt-3 leading-relaxed">
            One clean workspace for summaries, tutoring, flashcards, and study progress — all powered by academic-grade AI.
          </p>
        </div>

        {/* 3-Column Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-14">
          
          {/* Card 1: Instant Document Summaries */}
          <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm welcome-card-lift">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-6">
              <FileText className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">
              Instant Document Summaries
            </h3>
            <p className="text-slate-500 text-sm leading-relaxed">
              Turn 100-page PDFs into structured summaries and key takeaways in seconds. Keep what matters most.
            </p>
          </div>

          {/* Card 2: RAG-Powered AI Tutor */}
          <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm welcome-card-lift">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-6">
              <MessageSquare className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">
              RAG-Powered AI Tutor
            </h3>
            <p className="text-slate-500 text-sm leading-relaxed">
              Chat directly with your uploaded materials without hallucinations. Strictly cited answers backed by your slides.
            </p>
          </div>

          {/* Card 3: Interactive Flashcard Sets */}
          <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm welcome-card-lift">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mb-6">
              <Layers className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">
              Interactive Flashcard Sets
            </h3>
            <p className="text-slate-500 text-sm leading-relaxed">
              Auto-generate or manually create custom flashcard sets. Track your mastery status effortlessly with spaced repetition.
            </p>
          </div>

        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          5. HOW IT WORKS SECTION
      ══════════════════════════════════════════════════════════ */}
      <section id="how-it-works" className="py-20 bg-slate-100/60 border-y border-slate-200/50 scroll-mt-20">
        <div className="max-w-7xl mx-auto px-6">
          
          {/* Header */}
          <div className="text-center max-w-2xl mx-auto">
            <span className="inline-block px-3 py-1 bg-blue-100/70 border border-blue-200/60 rounded-full text-blue-700 text-xs font-bold uppercase tracking-wider mb-3">
              HOW IT WORKS
            </span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">
              How it Works
            </h2>
            <p className="text-slate-500 text-base mt-2">
              Three simple steps from raw materials to mastered knowledge.
            </p>
          </div>

          {/* 3-Column Steps Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-14">
            
            {/* Step 1 */}
            <div className="bg-white p-8 rounded-3xl border border-slate-200/70 shadow-sm relative">
              <div className="w-9 h-9 rounded-full bg-blue-600 text-white font-extrabold text-sm flex items-center justify-center mb-5 shadow-sm shadow-blue-500/20">
                1
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-1">
                Upload Materials
              </h3>
              <div className="text-xs font-semibold text-blue-600 mb-3">
                PDFs, Word docs, lecture slides
              </div>
              <p className="text-slate-500 text-sm leading-relaxed">
                Drop your PDFs, Word docs, or lecture slides into the workspace. AI handles formatting and structures index tables automatically.
              </p>
            </div>

            {/* Step 2 */}
            <div className="bg-white p-8 rounded-3xl border border-slate-200/70 shadow-sm relative">
              <div className="w-9 h-9 rounded-full bg-blue-600 text-white font-extrabold text-sm flex items-center justify-center mb-5 shadow-sm shadow-blue-500/20">
                2
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-1">
                AI Processes Data
              </h3>
              <div className="text-xs font-semibold text-blue-600 mb-3">
                DeepSeek & Gemini AI
              </div>
              <p className="text-slate-500 text-sm leading-relaxed">
                DeepSeek & Gemini AI extract facts, build knowledge graphs, and cross-reference citations with zero academic hallucination.
              </p>
            </div>

            {/* Step 3 */}
            <div className="bg-white p-8 rounded-3xl border border-slate-200/70 shadow-sm relative">
              <div className="w-9 h-9 rounded-full bg-blue-600 text-white font-extrabold text-sm flex items-center justify-center mb-5 shadow-sm shadow-blue-500/20">
                3
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-1">
                Study & Master
              </h3>
              <div className="text-xs font-semibold text-blue-600 mb-3">
                Summaries, chat, flashcards
              </div>
              <p className="text-slate-500 text-sm leading-relaxed">
                Read structured summaries, ask tricky questions to your personal tutor, and practice with active recall flashcards until 100% mastered.
              </p>
            </div>

          </div>

        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          6. FAQ SECTION
      ══════════════════════════════════════════════════════════ */}
      <section id="faq" className="py-20 max-w-4xl mx-auto px-6 scroll-mt-20">
        <div className="text-center mb-12">
          <span className="inline-block px-3 py-1 bg-blue-50 border border-blue-100 rounded-full text-blue-600 text-xs font-bold uppercase tracking-wider mb-3">
            FREQUENTLY ASKED QUESTIONS
          </span>
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Got Questions? We’ve Got Answers.
          </h2>
          <p className="text-slate-500 text-sm mt-2">
            Everything you need to know about AI Study Hub and how it empowers your learning.
          </p>
        </div>

        <div className="space-y-4">
          {[
            {
              q: "How does AI Study Hub guarantee academic accuracy?",
              a: "We utilize Retrieval-Augmented Generation (RAG) powered by Gemini and DeepSeek. The AI answers strictly based on your uploaded document content with direct page references, eliminating hallucinations.",
            },
            {
              q: "What document formats are currently supported?",
              a: "You can upload PDF files, Microsoft Word (.docx), PowerPoint slide decks (.pptx), Markdown notes (.md), and plain text documents.",
            },
            {
              q: "Is there a free plan available for students?",
              a: "Yes! Students can sign up for free, upload up to 10 course documents per month, and generate unlimited summaries and flashcards.",
            },
            {
              q: "Can I use AI Study Hub on mobile devices?",
              a: "Absolutely. AI Study Hub is fully responsive and designed to work smoothly on mobile browsers, tablets, and desktop workstations.",
            },
          ].map((item, idx) => (
            <div
              key={idx}
              className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm transition-all"
            >
              <button
                type="button"
                onClick={() => toggleFaq(idx)}
                className="w-full flex items-center justify-between text-left font-semibold text-slate-900 text-sm cursor-pointer"
              >
                <span>{item.q}</span>
                <ChevronDown
                  className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${
                    openFaq === idx ? "rotate-180 text-blue-600" : ""
                  }`}
                />
              </button>
              {openFaq === idx && (
                <p className="mt-3 text-xs sm:text-sm text-slate-500 leading-relaxed pt-2 border-t border-slate-100">
                  {item.a}
                </p>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          7. BOTTOM FOOTER
      ══════════════════════════════════════════════════════════ */}
      <footer className="py-8 border-t border-slate-200/60 bg-white">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div>© 2026 AI Study Hub. Built for brighter minds.</div>
          <div className="flex items-center gap-6">
            <Link to="/privacy" className="hover:text-slate-800 transition-colors">
              Privacy Policy
            </Link>
            <span>·</span>
            <Link to="/terms" className="hover:text-slate-800 transition-colors">
              Terms of Service
            </Link>
          </div>
        </div>
      </footer>

      {/* ══════════════════════════════════════════════════════════
          8. QUICK AUTH MODAL (LOGIN & REGISTER API INTEGRATION)
      ══════════════════════════════════════════════════════════ */}
      {authModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 max-w-md w-full p-6 sm:p-8 relative">
            
            {/* Close Button */}
            <button
              type="button"
              onClick={() => setAuthModalOpen(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 p-1 rounded-lg transition-colors cursor-pointer"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Modal Header & Tabs */}
            <div className="text-center mb-6">
              <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center mx-auto mb-2 shadow-sm shadow-blue-500/20">
                <GraduationCap className="w-5 h-5" />
              </div>
              <h3 className="text-xl font-bold text-slate-900">
                {authMode === "login" ? "Welcome Back" : "Join AI Study Hub"}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                {authMode === "login"
                  ? "Sign in to access your study materials"
                  : "Create your student account to get started"}
              </p>

              {/* Tab Selector */}
              <div className="flex rounded-xl bg-slate-100 p-1 mt-4">
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode("login");
                    setModalError("");
                    setModalSuccess("");
                  }}
                  className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                    authMode === "login"
                      ? "bg-white text-slate-900 shadow-sm"
                      : "text-slate-500 hover:text-slate-900"
                  }`}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode("register");
                    setModalError("");
                    setModalSuccess("");
                  }}
                  className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                    authMode === "register"
                      ? "bg-white text-slate-900 shadow-sm"
                      : "text-slate-500 hover:text-slate-900"
                  }`}
                >
                  Create Account
                </button>
              </div>
            </div>

            {/* Alerts */}
            {modalError && (
              <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{modalError}</span>
              </div>
            )}
            {modalSuccess && (
              <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs flex items-center gap-2">
                <Check className="w-4 h-4 shrink-0" />
                <span>{modalSuccess}</span>
              </div>
            )}

            {/* Form: Quick Login */}
            {authMode === "login" ? (
              <form onSubmit={handleQuickLogin} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Email / Student ID
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      placeholder="Enter email or student ID"
                      className="w-full py-2.5 pl-9 pr-3 text-sm rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="password"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      placeholder="Enter password"
                      className="w-full py-2.5 pl-9 pr-3 text-sm rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={modalLoading}
                  className="w-full bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-semibold py-2.5 rounded-xl text-sm transition-all shadow-md shadow-blue-500/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                >
                  {modalLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Signing In...</span>
                    </>
                  ) : (
                    <span>Sign In</span>
                  )}
                </button>

                <div className="text-center mt-3 pt-2 border-t border-slate-100">
                  <Link
                    to="/login"
                    onClick={() => setAuthModalOpen(false)}
                    className="text-xs text-blue-600 hover:underline font-medium"
                  >
                    Go to Full Login Page →
                  </Link>
                </div>
              </form>
            ) : (
              /* Form: Quick Register */
              <form onSubmit={handleQuickRegister} className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={regFullName}
                    onChange={(e) => setRegFullName(e.target.value)}
                    placeholder="Nguyen Van A"
                    className="w-full py-2 px-3 text-sm rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    placeholder="student@example.com"
                    className="w-full py-2 px-3 text-sm rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Password
                  </label>
                  <input
                    type="password"
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    placeholder="Minimum 6 characters"
                    className="w-full py-2 px-3 text-sm rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    value={regConfirmPassword}
                    onChange={(e) => setRegConfirmPassword(e.target.value)}
                    placeholder="Re-enter password"
                    className="w-full py-2 px-3 text-sm rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={modalLoading}
                  className="w-full bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-semibold py-2.5 rounded-xl text-sm transition-all shadow-md shadow-blue-500/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                >
                  {modalLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Creating Account...</span>
                    </>
                  ) : (
                    <span>Register Account</span>
                  )}
                </button>

                <div className="text-center mt-3 pt-2 border-t border-slate-100">
                  <Link
                    to="/register"
                    onClick={() => setAuthModalOpen(false)}
                    className="text-xs text-blue-600 hover:underline font-medium"
                  >
                    Go to Full Registration Page →
                  </Link>
                </div>
              </form>
            )}

          </div>
        </div>
      )}

    </div>
  );
}
