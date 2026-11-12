import React, { useState, useEffect, useRef, useCallback } from "react";
import ReactDOM from "react-dom";
import {
  Sparkles,
  PanelLeftClose,
  PanelLeftOpen,
  Plus,
  ArrowUp,
  MoreVertical,
  Pencil,
  Trash2,
  FileText,
  X,
  Copy,
  Check,
  AlertCircle,
  Loader2,
  MessageSquare,
  HelpCircle,
  ExternalLink,
  BookOpen,
  Layers,
} from "lucide-react";
import axiosClient from "../../api/axiosClient";
import styles from "./ChatboxPage.module.css";

/**
 * =========================================================================
 * AI CONTENT RENDERER
 * Parses JSON responses or Markdown into elegant paragraphs, bullet points,
 * headings, and code snippets with copy button. Never displays raw JSON.
 * =========================================================================
 */
function AIContentRenderer({ content }) {
  const [copiedCodeIdx, setCopiedCodeIdx] = useState(null);

  if (!content) return null;

  // Helper to copy code snippet
  const handleCopyCode = (codeText, idx) => {
    navigator.clipboard.writeText(codeText);
    setCopiedCodeIdx(idx);
    setTimeout(() => setCopiedCodeIdx(null), 2000);
  };

  // 1. Try parsing as JSON first
  let parsedJson = null;
  const trimmed = content.trim();
  if (
    (trimmed.startsWith("{") && trimmed.endsWith("}")) ||
    (trimmed.startsWith("[") && trimmed.endsWith("]"))
  ) {
    try {
      parsedJson = JSON.parse(trimmed);
    } catch {
      parsedJson = null;
    }
  }

  // If valid JSON, render as structured rich content
  if (parsedJson) {
    // Case A: JSON Object with primary text fields (answer / content / summary / message)
    if (typeof parsedJson === "object" && !Array.isArray(parsedJson)) {
      const mainText =
        parsedJson.answer ||
        parsedJson.response ||
        parsedJson.content ||
        parsedJson.summary ||
        parsedJson.message ||
        null;

      const takeaways =
        parsedJson.keyTakeaways ||
        parsedJson.takeaways ||
        parsedJson.bullets ||
        parsedJson.points ||
        parsedJson.highlights ||
        null;

      const explanation = parsedJson.explanation || parsedJson.details || null;

      if (mainText || takeaways || explanation) {
        return (
          <div className="space-y-3">
            {mainText && (
              <p className="text-slate-800 leading-relaxed whitespace-pre-line">
                {mainText}
              </p>
            )}

            {Array.isArray(takeaways) && takeaways.length > 0 && (
              <div className="bg-blue-50/70 border border-blue-100 rounded-xl p-3 my-2 space-y-1.5">
                <span className="text-xs font-semibold text-blue-800 uppercase tracking-wider block">
                  Điểm trọng tâm:
                </span>
                <ul className="space-y-1 pl-1">
                  {takeaways.map((item, idx) => (
                    <li
                      key={idx}
                      className="text-xs text-slate-700 flex items-start gap-1.5"
                    >
                      <span className="text-blue-500 font-bold shrink-0">•</span>
                      <span>{typeof item === "string" ? item : JSON.stringify(item)}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {explanation && (
              <div className="text-xs text-slate-600 bg-slate-50 border border-slate-200/80 rounded-lg p-2.5">
                <span className="font-semibold text-slate-700 block mb-0.5">
                  Giải thích chi tiết:
                </span>
                {explanation}
              </div>
            )}
          </div>
        );
      }

      // Fallback for other JSON objects: render key-value sections
      return (
        <div className="space-y-2.5">
          {Object.entries(parsedJson).map(([key, value], idx) => {
            const label = key
              .replace(/([A-Z])/g, " $1")
              .replace(/^./, (str) => str.toUpperCase());
            return (
              <div
                key={idx}
                className="bg-slate-50 border border-slate-200/60 rounded-xl p-3"
              >
                <div className="text-xs font-bold text-slate-700 mb-1">
                  {label}
                </div>
                {Array.isArray(value) ? (
                  <ul className="space-y-1 pl-1">
                    {value.map((v, i) => (
                      <li key={i} className="text-xs text-slate-600 flex items-start gap-1.5">
                        <span className="text-blue-500">•</span>
                        <span>{typeof v === "object" ? JSON.stringify(v) : v}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-xs text-slate-600 whitespace-pre-line">
                    {typeof value === "object" ? JSON.stringify(value, null, 2) : String(value)}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      );
    }

    // Case B: JSON Array of items (e.g. quiz or list of points)
    if (Array.isArray(parsedJson)) {
      return (
        <div className="space-y-2">
          {parsedJson.map((item, idx) => (
            <div
              key={idx}
              className="bg-slate-50/80 border border-slate-200/80 rounded-xl p-2.5 text-xs text-slate-700"
            >
              {typeof item === "object" && item !== null ? (
                <div className="space-y-1">
                  {Object.entries(item).map(([k, v], i) => (
                    <div key={i}>
                      <span className="font-semibold text-slate-800">{k}: </span>
                      <span>{String(v)}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex items-start gap-2">
                  <span className="font-bold text-blue-600">{idx + 1}.</span>
                  <span>{String(item)}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      );
    }
  }

  // 2. Parse Markdown formatting (Headings, Code blocks, Lists, Bold, Italic)
  const lines = content.split("\n");
  const renderedElements = [];
  let inCodeBlock = false;
  let codeBuffer = [];
  let codeLanguage = "";
  let currentList = [];
  let codeBlockCounter = 0;

  const flushList = () => {
    if (currentList.length > 0) {
      renderedElements.push(
        <ul key={`list-${renderedElements.length}`} className="my-2 space-y-1 pl-2">
          {currentList.map((li, idx) => (
            <li key={idx} className="text-slate-700 flex items-start gap-2 text-sm leading-relaxed">
              <span className="text-blue-500 font-bold shrink-0 mt-0.5">•</span>
              <span>{renderInlineMarkdown(li)}</span>
            </li>
          ))}
        </ul>
      );
      currentList = [];
    }
  };

  const renderInlineMarkdown = (text) => {
    if (!text) return "";
    // Bold: **text**
    const parts = text.split(/(\*\*.*?\*\*|`.*?`)/g);
    return parts.map((part, index) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return (
          <strong key={index} className="font-semibold text-slate-900">
            {part.slice(2, -2)}
          </strong>
        );
      }
      if (part.startsWith("`") && part.endsWith("`")) {
        return (
          <code
            key={index}
            className="px-1.5 py-0.5 rounded bg-slate-100 text-blue-700 font-mono text-xs border border-slate-200"
          >
            {part.slice(1, -1)}
          </code>
        );
      }
      return part;
    });
  };

  lines.forEach((line, lineIndex) => {
    const trimmedLine = line.trim();

    // Check code blocks
    if (trimmedLine.startsWith("```")) {
      if (inCodeBlock) {
        // End code block
        const codeText = codeBuffer.join("\n");
        const codeId = codeBlockCounter++;
        renderedElements.push(
          <div
            key={`code-${codeId}`}
            className="my-3 rounded-xl overflow-hidden border border-slate-800 bg-slate-950 text-slate-100 text-xs shadow-md"
          >
            <div className="flex items-center justify-between px-3 py-1.5 bg-slate-900 border-b border-slate-800 text-slate-400">
              <span className="font-mono text-[11px] uppercase">{codeLanguage || "code"}</span>
              <button
                type="button"
                onClick={() => handleCopyCode(codeText, codeId)}
                className="flex items-center gap-1 hover:text-white transition-colors cursor-pointer text-[11px]"
              >
                {copiedCodeIdx === codeId ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400">Đã sao chép</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Sao chép</span>
                  </>
                )}
              </button>
            </div>
            <pre className="p-3 overflow-x-auto font-mono text-xs leading-relaxed text-slate-200">
              <code>{codeText}</code>
            </pre>
          </div>
        );
        codeBuffer = [];
        inCodeBlock = false;
        codeLanguage = "";
      } else {
        // Start code block
        flushList();
        inCodeBlock = true;
        codeLanguage = trimmedLine.replace("```", "").trim();
      }
      return;
    }

    if (inCodeBlock) {
      codeBuffer.push(line);
      return;
    }

    // Bullet list items (- or * or •)
    if (/^[-*•]\s+/.test(trimmedLine)) {
      currentList.push(trimmedLine.replace(/^[-*•]\s+/, ""));
      return;
    }

    // Numbered list items
    if (/^\d+\.\s+/.test(trimmedLine)) {
      flushList();
      const numMatch = trimmedLine.match(/^(\d+)\.\s+(.*)/);
      if (numMatch) {
        renderedElements.push(
          <div key={`num-${lineIndex}`} className="flex items-start gap-2 text-sm my-1 text-slate-700">
            <span className="font-bold text-blue-600 shrink-0 text-xs mt-0.5">{numMatch[1]}.</span>
            <span>{renderInlineMarkdown(numMatch[2])}</span>
          </div>
        );
      }
      return;
    }

    flushList();

    // Headings
    if (trimmedLine.startsWith("### ")) {
      renderedElements.push(
        <h4 key={lineIndex} className="text-sm font-bold text-slate-900 mt-3 mb-1">
          {renderInlineMarkdown(trimmedLine.replace("### ", ""))}
        </h4>
      );
      return;
    }
    if (trimmedLine.startsWith("## ")) {
      renderedElements.push(
        <h3 key={lineIndex} className="text-base font-bold text-slate-900 mt-4 mb-1.5 text-blue-700">
          {renderInlineMarkdown(trimmedLine.replace("## ", ""))}
        </h3>
      );
      return;
    }
    if (trimmedLine.startsWith("# ")) {
      renderedElements.push(
        <h2 key={lineIndex} className="text-lg font-extrabold text-slate-900 mt-4 mb-2">
          {renderInlineMarkdown(trimmedLine.replace("# ", ""))}
        </h2>
      );
      return;
    }

    // Callout / Blockquote (> )
    if (trimmedLine.startsWith("> ")) {
      renderedElements.push(
        <blockquote
          key={lineIndex}
          className="border-l-4 border-blue-500 bg-blue-50/50 rounded-r-lg px-3 py-2 text-xs text-slate-700 my-2 italic"
        >
          {renderInlineMarkdown(trimmedLine.replace("> ", ""))}
        </blockquote>
      );
      return;
    }

    // Regular line / Paragraph
    if (trimmedLine.length > 0) {
      renderedElements.push(
        <p key={lineIndex} className="text-sm text-slate-800 leading-relaxed my-1.5">
          {renderInlineMarkdown(line)}
        </p>
      );
    }
  });

  flushList();

  return <div className="space-y-1">{renderedElements}</div>;
}

/**
 * =========================================================================
 * CONTEXT MENU PORTAL COMPONENT
 * Renders Rename and Delete options using React Portal to prevent clipping
 * by sidebar scrollable overflow.
 * =========================================================================
 */
function ContextMenuPortal({ position, onClose, onRename, onDelete }) {
  const menuRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        onClose();
      }
    }
    function handleKeyDown(event) {
      if (event.key === "Escape") {
        onClose();
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("scroll", onClose, true);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("scroll", onClose, true);
    };
  }, [onClose]);

  if (!position) return null;

  return ReactDOM.createPortal(
    <div
      ref={menuRef}
      className={styles.portalDropdown}
      style={{
        top: `${position.top}px`,
        left: `${position.left}px`,
      }}
    >
      <button
        type="button"
        className={styles.dropdownItem}
        onClick={(e) => {
          e.stopPropagation();
          onRename();
        }}
      >
        <Pencil className="w-3.5 h-3.5 text-slate-500" />
        <span>Đổi tên</span>
      </button>

      <button
        type="button"
        className={`${styles.dropdownItem} ${styles.dropdownItemDanger}`}
        onClick={(e) => {
          e.stopPropagation();
          onDelete();
        }}
      >
        <Trash2 className="w-3.5 h-3.5" />
        <span>Xóa</span>
      </button>
    </div>,
    document.body
  );
}

/**
 * =========================================================================
 * MAIN COMPONENT: ChatboxPage
 * =========================================================================
 */
export default function ChatboxPage() {
  // Sidebar state
  const [isSidebarOpen, setIsSidebarOpen] = useState(() => {
    if (typeof window !== "undefined") {
      return window.innerWidth >= 768;
    }
    return true;
  });

  // Chat sessions & active state
  const [sessions, setSessions] = useState([]);
  const [activeSessionId, setActiveSessionId] = useState(null);
  const [activeSession, setActiveSession] = useState(null);
  const [messages, setMessages] = useState([]);

  // Input & attachments
  const [inputText, setInputText] = useState("");
  const [attachedDocument, setAttachedDocument] = useState(null); // Single active chip as specified
  const [isAiThinking, setIsAiThinking] = useState(false);
  const [isLoadingSessions, setIsLoadingSessions] = useState(true);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);

  // Document selection modal state
  const [isDocModalOpen, setIsDocModalOpen] = useState(false);
  const [userDocuments, setUserDocuments] = useState([]);
  const [isLoadingDocs, setIsLoadingDocs] = useState(false);
  const [docSearchQuery, setDocSearchQuery] = useState("");

  // Context menu (3-dot dropdown)
  const [contextMenu, setContextMenu] = useState({
    isOpen: false,
    session: null,
    position: null,
  });

  // Rename modal state
  const [renameModal, setRenameModal] = useState({
    isOpen: false,
    session: null,
    title: "",
    isSubmitting: false,
  });

  // Delete modal state
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    session: null,
    isSubmitting: false,
  });

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Auto-scroll to bottom on new message or thinking state
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isAiThinking, scrollToBottom]);

  /**
   * 1. FETCH ALL USER CHAT SESSIONS
   */
  const fetchSessions = useCallback(async () => {
    try {
      setIsLoadingSessions(true);
      const res = await axiosClient.get("/chat/sessions");
      const data = res.data?.data || res.data || [];
      setSessions(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Lỗi khi tải danh sách phiên chat:", err);
    } finally {
      setIsLoadingSessions(false);
    }
  }, []);

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  /**
   * 2. LOAD SPECIFIC CHAT MESSAGES
   */
  const loadSessionMessages = useCallback(async (sessionId) => {
    if (!sessionId) return;
    try {
      setIsLoadingMessages(true);
      setActiveSessionId(sessionId);

      const res = await axiosClient.get(`/chat/session/${sessionId}/messages`);
      const payload = res.data?.data || res.data || {};

      const sessionInfo = payload.session || payload.Session || null;
      const msgs = payload.messages || payload.Messages || [];

      setActiveSession(sessionInfo);
      setMessages(Array.isArray(msgs) ? msgs : []);

      // If session has attached document, pick the first one as active chip
      if (sessionInfo?.documents && sessionInfo.documents.length > 0) {
        setAttachedDocument(sessionInfo.documents[0]);
      } else if (sessionInfo?.Documents && sessionInfo.Documents.length > 0) {
        setAttachedDocument(sessionInfo.Documents[0]);
      } else {
        setAttachedDocument(null);
      }
    } catch (err) {
      console.error("Lỗi khi tải tin nhắn phiên chat:", err);
    } finally {
      setIsLoadingMessages(false);
      // Auto focus input
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, []);

  /**
   * 3. START A NEW CHAT
   */
  const handleStartNewChat = () => {
    setActiveSessionId(null);
    setActiveSession(null);
    setMessages([]);
    setInputText("");
    // Keep or clear attached document depending on user preference
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  /**
   * 4. FETCH USER DOCUMENTS FOR ATTACHMENT MODAL
   */
  const handleOpenDocModal = async () => {
    setIsDocModalOpen(true);
    setIsLoadingDocs(true);
    try {
      const res = await axiosClient.get("/documents/me");
      const docs = res.data?.data || res.data || [];
      setUserDocuments(Array.isArray(docs) ? docs : []);
    } catch (err) {
      console.error("Lỗi khi tải danh sách tài liệu cá nhân:", err);
    } finally {
      setIsLoadingDocs(false);
    }
  };

  /**
   * 5. ATTACH DOCUMENT
   */
  const handleSelectDocument = async (doc) => {
    setAttachedDocument(doc);
    setIsDocModalOpen(false);

    // If we're inside an active session, also sync with backend API
    if (activeSessionId) {
      try {
        await axiosClient.post(`/chat/session/${activeSessionId}/documents`, {
          documentIds: [doc.id || doc.Id],
        });
      } catch (err) {
        console.warn("Lỗi khi cập nhật tài liệu đính kèm phiên:", err);
      }
    }
  };

  /**
   * 6. REMOVE ATTACHED DOCUMENT
   */
  const handleRemoveAttachment = async () => {
    setAttachedDocument(null);
    if (activeSessionId) {
      try {
        await axiosClient.post(`/chat/session/${activeSessionId}/documents`, {
          documentIds: [],
        });
      } catch (err) {
        console.warn("Lỗi khi gỡ tài liệu khỏi phiên:", err);
      }
    }
  };

  /**
   * 7. SEND MESSAGE / QUERY AI
   */
  const handleSendMessage = async (customPrompt) => {
    const textToSend = typeof customPrompt === "string" ? customPrompt : inputText;
    if (!textToSend.trim() || isAiThinking) return;

    const userMessageContent = textToSend.trim();
    setInputText("");

    // Optimistically add User message to local message state
    const optimisticUserMsg = {
      id: `temp-${Date.now()}`,
      sender: "User",
      content: userMessageContent,
      sentAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, optimisticUserMsg]);
    setIsAiThinking(true);

    try {
      let targetSessionId = activeSessionId;

      // If no active session, dynamically create one first
      if (!targetSessionId) {
        // Derive clean title from first ~35 characters of message
        const initialTitle =
          userMessageContent.length > 35
            ? `${userMessageContent.substring(0, 32)}...`
            : userMessageContent;

        const docIds = attachedDocument ? [attachedDocument.id || attachedDocument.Id] : [];

        const createRes = await axiosClient.post("/chat/session", {
          title: initialTitle,
          documentIds: docIds,
        });

        const newSessionId = createRes.data?.data || createRes.data;
        targetSessionId = newSessionId;
        setActiveSessionId(newSessionId);

        // Refresh sessions list in background
        fetchSessions();
      }

      // Query AI via backend RAG pipeline
      const queryRes = await axiosClient.post("/chat/query", {
        sessionId: targetSessionId,
        message: userMessageContent,
      });

      const aiResponseText = queryRes.data?.data || queryRes.data || "Không có câu trả lời.";

      const aiMsg = {
        id: `ai-${Date.now()}`,
        sender: "AI",
        content: aiResponseText,
        sentAt: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, aiMsg]);

      // Re-fetch sessions to update message counts & timestamps in sidebar
      fetchSessions();
    } catch (err) {
      console.error("Lỗi khi gọi AI Query:", err);
      const serverMsg =
        err.response?.data?.message ||
        (typeof err.response?.data === "string" ? err.response.data : null);
      const errorMsg =
        serverMsg ||
        "Rất tiếc, đã xảy ra lỗi khi kết nối tới Trợ lý AI. Vui lòng thử lại sau ít phút!";

      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          sender: "AI",
          content: `⚠️ ${errorMsg}`,
          sentAt: new Date().toISOString(),
        },
      ]);
    } finally {
      setIsAiThinking(false);
    }
  };

  /**
   * 8. CONTEXT MENU & MODAL HANDLERS
   */
  const handleOpenContextMenu = (e, session) => {
    e.stopPropagation();
    const rect = e.currentTarget.getBoundingClientRect();
    setContextMenu({
      isOpen: true,
      session,
      position: {
        top: rect.bottom + 4,
        left: Math.min(rect.left, window.innerWidth - 150),
      },
    });
  };

  const handleOpenRename = () => {
    const s = contextMenu.session;
    setContextMenu({ isOpen: false, session: null, position: null });
    if (!s) return;
    setRenameModal({
      isOpen: true,
      session: s,
      title: s.title || s.Title || "",
      isSubmitting: false,
    });
  };

  const handleSaveRename = async (e) => {
    e.preventDefault();
    if (!renameModal.title.trim() || renameModal.isSubmitting) return;

    setRenameModal((prev) => ({ ...prev, isSubmitting: true }));
    try {
      await axiosClient.put(`/chat/session/${renameModal.session.id}`, {
        title: renameModal.title.trim(),
      });

      // Update in local sessions state
      setSessions((prev) =>
        prev.map((s) =>
          s.id === renameModal.session.id ? { ...s, title: renameModal.title.trim() } : s
        )
      );

      // If active, update active session as well
      if (activeSessionId === renameModal.session.id) {
        setActiveSession((prev) => (prev ? { ...prev, title: renameModal.title.trim() } : prev));
      }

      setRenameModal({ isOpen: false, session: null, title: "", isSubmitting: false });
    } catch (err) {
      console.error("Lỗi khi đổi tên phiên chat:", err);
      alert("Không thể đổi tên đoạn chat. Vui lòng thử lại!");
      setRenameModal((prev) => ({ ...prev, isSubmitting: false }));
    }
  };

  const handleOpenDelete = () => {
    const s = contextMenu.session;
    setContextMenu({ isOpen: false, session: null, position: null });
    if (!s) return;
    setDeleteModal({
      isOpen: true,
      session: s,
      isSubmitting: false,
    });
  };

  const handleConfirmDelete = async () => {
    if (deleteModal.isSubmitting) return;
    setDeleteModal((prev) => ({ ...prev, isSubmitting: true }));

    try {
      await axiosClient.delete(`/chat/session/${deleteModal.session.id}`);

      setSessions((prev) => prev.filter((s) => s.id !== deleteModal.session.id));

      if (activeSessionId === deleteModal.session.id) {
        handleStartNewChat();
      }

      setDeleteModal({ isOpen: false, session: null, isSubmitting: false });
    } catch (err) {
      console.error("Lỗi khi xóa phiên chat:", err);
      alert("Không thể xóa đoạn chat. Vui lòng thử lại!");
      setDeleteModal((prev) => ({ ...prev, isSubmitting: false }));
    }
  };

  /**
   * 9. DATE GROUPING LOGIC FOR CHAT LIST
   */
  const groupedSessions = React.useMemo(() => {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const sevenDaysAgo = new Date(startOfToday.getTime() - 7 * 24 * 60 * 60 * 1000);

    const todayItems = [];
    const sevenDaysItems = [];
    const olderItems = [];

    sessions.forEach((s) => {
      const itemDate = new Date(s.updatedAt || s.createdAt || Date.now());
      if (itemDate >= startOfToday) {
        todayItems.push(s);
      } else if (itemDate >= sevenDaysAgo) {
        sevenDaysItems.push(s);
      } else {
        olderItems.push(s);
      }
    });

    return {
      today: todayItems,
      sevenDays: sevenDaysItems,
      older: olderItems,
    };
  }, [sessions]);

  // Filtered documents in attachment modal
  const filteredDocs = userDocuments.filter((doc) => {
    const title = (doc.title || doc.Title || doc.fileName || "").toLowerCase();
    return title.includes(docSearchQuery.toLowerCase());
  });

  return (
    <div className={styles.chatContainer}>
      {/* ══════════════════════════════════════════════════════════
          1. COLLAPSIBLE LEFT SIDEBAR (HISTORY PANEL)
      ══════════════════════════════════════════════════════════ */}
      <aside
        className={`${styles.sidebar} ${
          isSidebarOpen ? styles.sidebarOpen : styles.sidebarClosed
        }`}
        aria-label="Lịch sử đoạn chat"
      >
        {/* Top Header of Sidebar */}
        <div className="h-14 px-3 flex items-center justify-between border-b border-slate-200 shrink-0">
          <div className="flex items-center gap-2 text-slate-800 font-semibold text-sm pl-1">
            <Sparkles className="w-4 h-4 text-blue-600" />
            <span>Trợ Lý AI</span>
          </div>

          <button
            type="button"
            onClick={() => setIsSidebarOpen(false)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors cursor-pointer"
            title="Đóng thanh lịch sử"
            aria-label="Đóng thanh lịch sử"
          >
            <PanelLeftClose className="w-4 h-4" />
          </button>
        </div>

        {/* "+ New Chat" Action Button */}
        <div className="p-3 border-b border-slate-200/60">
          <button
            type="button"
            onClick={handleStartNewChat}
            className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs shadow-xs hover:shadow transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>+ Đoạn chat mới</span>
          </button>
        </div>

        {/* Scrollable Chat Sessions List */}
        <div className={styles.sidebarScroll}>
          {isLoadingSessions ? (
            <div className="flex flex-col items-center justify-center py-8 text-slate-400 gap-2">
              <Loader2 className="w-5 h-5 animate-spin text-blue-500" />
              <span className="text-xs">Đang tải lịch sử...</span>
            </div>
          ) : sessions.length === 0 ? (
            <div className="text-center py-8 px-4 text-slate-400 text-xs">
              <MessageSquare className="w-8 h-8 mx-auto mb-2 text-slate-300 stroke-[1.5]" />
              <p>Chưa có đoạn chat nào.</p>
              <p className="mt-1 text-[11px] text-slate-400">
                Hãy bắt đầu cuộc trò chuyện mới!
              </p>
            </div>
          ) : (
            <>
              {/* Group: Hôm nay */}
              {groupedSessions.today.length > 0 && (
                <div>
                  <div className={styles.dateGroupHeader}>Hôm nay</div>
                  {groupedSessions.today.map((s) => (
                    <div
                      key={s.id}
                      onClick={() => loadSessionMessages(s.id)}
                      className={`${styles.chatItem} ${
                        activeSessionId === s.id ? styles.chatItemActive : ""
                      }`}
                    >
                      <span className="truncate flex-1 pr-1">
                        {s.title || "Đoạn chat không tên"}
                      </span>
                      <button
                        type="button"
                        onClick={(e) => handleOpenContextMenu(e, s)}
                        className={styles.moreButton}
                        aria-label="Tùy chọn đoạn chat"
                      >
                        <MoreVertical className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Group: 7 ngày qua */}
              {groupedSessions.sevenDays.length > 0 && (
                <div className="mt-3">
                  <div className={styles.dateGroupHeader}>7 ngày qua</div>
                  {groupedSessions.sevenDays.map((s) => (
                    <div
                      key={s.id}
                      onClick={() => loadSessionMessages(s.id)}
                      className={`${styles.chatItem} ${
                        activeSessionId === s.id ? styles.chatItemActive : ""
                      }`}
                    >
                      <span className="truncate flex-1 pr-1">
                        {s.title || "Đoạn chat không tên"}
                      </span>
                      <button
                        type="button"
                        onClick={(e) => handleOpenContextMenu(e, s)}
                        className={styles.moreButton}
                        aria-label="Tùy chọn đoạn chat"
                      >
                        <MoreVertical className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Group: Cũ hơn */}
              {groupedSessions.older.length > 0 && (
                <div className="mt-3">
                  <div className={styles.dateGroupHeader}>Cũ hơn</div>
                  {groupedSessions.older.map((s) => (
                    <div
                      key={s.id}
                      onClick={() => loadSessionMessages(s.id)}
                      className={`${styles.chatItem} ${
                        activeSessionId === s.id ? styles.chatItemActive : ""
                      }`}
                    >
                      <span className="truncate flex-1 pr-1">
                        {s.title || "Đoạn chat không tên"}
                      </span>
                      <button
                        type="button"
                        onClick={(e) => handleOpenContextMenu(e, s)}
                        className={styles.moreButton}
                        aria-label="Tùy chọn đoạn chat"
                      >
                        <MoreVertical className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </aside>

      {/* ══════════════════════════════════════════════════════════
          2. MAIN CHAT AREA
      ══════════════════════════════════════════════════════════ */}
      <main className={styles.mainChat}>
        {/* Top Header of Main Chat */}
        <div className={styles.chatHeader}>
          <div className="flex items-center gap-3">
            {/* Toggle button when sidebar is closed */}
            {!isSidebarOpen && (
              <button
                type="button"
                onClick={() => setIsSidebarOpen(true)}
                className={styles.floatingOpenBtn}
                title="Mở thanh lịch sử"
                aria-label="Mở thanh lịch sử"
              >
                <PanelLeftOpen className="w-4 h-4" />
              </button>
            )}

            <div>
              <h2 className="text-sm font-semibold text-slate-800 line-clamp-1">
                {activeSession?.title || "Đoạn chat mới với Trợ Lý AI"}
              </h2>
              <p className="text-[11px] text-slate-400">
                {attachedDocument
                  ? `Đang tham chiếu: ${attachedDocument.title || attachedDocument.fileName}`
                  : "Chưa gắn tài liệu tham chiếu"}
              </p>
            </div>
          </div>

          {/* Quick document attach button at header */}
          <button
            type="button"
            onClick={handleOpenDocModal}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 hover:text-slate-900 text-xs font-medium transition-colors shadow-2xs cursor-pointer"
          >
            <FileText className="w-3.5 h-3.5 text-blue-600" />
            <span className="hidden sm:inline">
              {attachedDocument ? "Đổi tài liệu" : "Chọn tài liệu"}
            </span>
          </button>
        </div>

        {/* ── Messages Scroll Area ── */}
        <div className={styles.messagesContainer}>
          {isLoadingMessages ? (
            <div className="flex flex-col items-center justify-center flex-1 py-16 gap-3">
              <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
              <span className="text-xs text-slate-400">Đang tải cuộc trò chuyện...</span>
            </div>
          ) : messages.length === 0 ? (
            /* ── EMPTY STATE ── */
            <div className="flex flex-col items-center justify-center flex-1 my-auto max-w-lg mx-auto text-center px-4 animate-in fade-in duration-300">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/20 mb-4">
                <Sparkles className="w-7 h-7" />
              </div>

              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                Trợ Lý AI
              </h1>
              <p className="text-sm text-slate-500 mt-2 mb-6 leading-relaxed">
                Đặt câu hỏi, tạo bản tóm tắt hoặc tự làm bài kiểm tra dựa trên tài liệu của bạn.
              </p>

              {/* Document selection CTA if no doc attached */}
              {!attachedDocument ? (
                <div className="w-full bg-white border border-blue-100 rounded-2xl p-4 shadow-sm mb-6 flex flex-col items-center">
                  <div className="flex items-center gap-2 text-xs font-semibold text-blue-800 mb-1">
                    <BookOpen className="w-4 h-4 text-blue-600" />
                    <span>Tăng độ chính xác với tài liệu học tập của bạn</span>
                  </div>
                  <p className="text-xs text-slate-500 mb-3">
                    Đính kèm tài liệu từ thư viện để AI trả lời dựa trên nội dung bài giảng.
                  </p>
                  <button
                    type="button"
                    onClick={handleOpenDocModal}
                    className="flex items-center gap-1.5 px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Đính kèm tài liệu ngay</span>
                  </button>
                </div>
              ) : (
                <div className="w-full bg-blue-50/60 border border-blue-200/80 rounded-2xl p-3.5 mb-6 flex items-center justify-between text-left">
                  <div className="flex items-center gap-2.5 overflow-hidden">
                    <div className="p-2 rounded-xl bg-blue-600 text-white shrink-0">
                      <FileText className="w-4 h-4" />
                    </div>
                    <div className="overflow-hidden">
                      <p className="text-xs font-semibold text-blue-900 truncate">
                        {attachedDocument.title || attachedDocument.fileName}
                      </p>
                      <p className="text-[11px] text-blue-600">Đã kết nối dữ liệu RAG</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleRemoveAttachment}
                    className="p-1 text-blue-400 hover:text-blue-700 transition-colors cursor-pointer"
                    title="Gỡ tài liệu"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* Prompt Suggestions */}
              <div className="w-full space-y-2 text-left">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block px-1">
                  Gợi ý câu hỏi:
                </span>
                {[
                  "Tóm tắt các điểm chính trong tài liệu này",
                  "Tạo 5 câu hỏi ôn tập dựa trên tài liệu",
                  "Giải thích các khái niệm quan trọng nhất",
                ].map((prompt, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSendMessage(prompt)}
                    className="w-full text-left p-3 rounded-xl bg-white hover:bg-slate-50 border border-slate-200/80 hover:border-blue-300 text-xs text-slate-700 hover:text-blue-700 transition-all flex items-center justify-between shadow-2xs group cursor-pointer"
                  >
                    <span>{prompt}</span>
                    <ArrowUp className="w-3.5 h-3.5 text-slate-300 group-hover:text-blue-600 transition-colors rotate-45" />
                  </button>
                ))}
              </div>
            </div>
          ) : (
            /* ── CHAT MESSAGES LIST ── */
            <>
              {messages.map((msg, index) => {
                const isUser =
                  (msg.sender || msg.Sender || "").toLowerCase() === "user";

                return isUser ? (
                  // User Message (Right)
                  <div key={msg.id || index} className={styles.userRow}>
                    <div className={styles.userBubble}>
                      <p className="whitespace-pre-line">{msg.content || msg.Content}</p>
                    </div>
                  </div>
                ) : (
                  // AI Message (Left)
                  <div key={msg.id || index} className={styles.aiRow}>
                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shrink-0 shadow-sm mt-0.5">
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <div className={styles.aiBubble}>
                      <AIContentRenderer content={msg.content || msg.Content} />
                    </div>
                  </div>
                );
              })}

              {/* AI Thinking Animation */}
              {isAiThinking && (
                <div className={styles.aiRow}>
                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shrink-0 shadow-sm mt-0.5 animate-pulse">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div className={styles.aiBubble}>
                    <div className="flex items-center gap-2 py-1">
                      <div className="flex items-center gap-1">
                        <span className={styles.typingDot} />
                        <span className={styles.typingDot} />
                        <span className={styles.typingDot} />
                      </div>
                      <span className="text-xs text-slate-400 font-medium">
                        AI đang đọc tài liệu và phản hồi...
                      </span>
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </>
          )}
        </div>

        {/* ══════════════════════════════════════════════════════════
            3. INPUT & ATTACHMENT ZONE (BOTTOM FIXED)
        ══════════════════════════════════════════════════════════ */}
        <div className={styles.inputZone}>
          <div className={styles.inputInnerWrapper}>
            {/* Attachment Chip floating above the input bar */}
            {attachedDocument && (
              <div className={styles.attachmentChip}>
                <FileText className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                <span className="max-w-[260px] sm:max-w-md truncate font-medium">
                  {attachedDocument.title || attachedDocument.fileName}
                </span>
                <button
                  type="button"
                  onClick={handleRemoveAttachment}
                  className="text-slate-400 hover:text-red-500 transition-colors cursor-pointer"
                  title="Gỡ tài liệu đính kèm"
                  aria-label="Gỡ tài liệu"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* Pill-shaped Input Bar */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className={styles.inputBar}
            >
              {/* "+" button to trigger document selection modal */}
              <button
                type="button"
                onClick={handleOpenDocModal}
                className={styles.plusButton}
                title="Đính kèm tài liệu"
                aria-label="Đính kèm tài liệu"
              >
                <Plus className="w-4 h-4" />
              </button>

              {/* Text input field */}
              <input
                ref={inputRef}
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Hỏi tôi bất cứ điều gì về tài liệu đính kèm..."
                className={styles.textInput}
                disabled={isAiThinking}
              />

              {/* Solid blue upward arrow button to send message */}
              <button
                type="submit"
                disabled={!inputText.trim() || isAiThinking}
                className={styles.sendButton}
                title="Gửi câu hỏi"
                aria-label="Gửi câu hỏi"
              >
                {isAiThinking ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <ArrowUp className="w-4 h-4" />
                )}
              </button>
            </form>

            {/* Disclaimer text */}
            <p className={styles.disclaimerText}>
              AI có thể mắc lỗi. Hãy xác minh các thông tin quan trọng.
            </p>
          </div>
        </div>
      </main>

      {/* ══════════════════════════════════════════════════════════
          4. CONTEXT MENU DROPDOWN (PORTAL)
      ══════════════════════════════════════════════════════════ */}
      {contextMenu.isOpen && (
        <ContextMenuPortal
          position={contextMenu.position}
          onClose={() =>
            setContextMenu({ isOpen: false, session: null, position: null })
          }
          onRename={handleOpenRename}
          onDelete={handleOpenDelete}
        />
      )}

      {/* ══════════════════════════════════════════════════════════
          5. DOCUMENT SELECTION MODAL
      ══════════════════════════════════════════════════════════ */}
      {isDocModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[85vh]">
            {/* Modal Header */}
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900 text-sm">
                  Chọn tài liệu học tập
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Đính kèm tài liệu để AI làm cơ sở dữ liệu ngữ cảnh (RAG)
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsDocModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Search filter input */}
            <div className="p-3 border-b border-slate-100 bg-slate-50">
              <input
                type="text"
                value={docSearchQuery}
                onChange={(e) => setDocSearchQuery(e.target.value)}
                placeholder="Tìm theo tên tài liệu..."
                className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
            </div>

            {/* Documents List */}
            <div className="flex-1 overflow-y-auto p-3 space-y-2">
              {isLoadingDocs ? (
                <div className="py-8 flex flex-col items-center justify-center gap-2 text-slate-400">
                  <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
                  <span className="text-xs">Đang tải tài liệu của bạn...</span>
                </div>
              ) : filteredDocs.length === 0 ? (
                <div className="py-8 text-center text-slate-400 text-xs">
                  <FileText className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                  <p>Không tìm thấy tài liệu phù hợp.</p>
                  <p className="mt-1 text-[11px] text-slate-400">
                    Hãy tải tài liệu lên trang "Tài liệu của tôi" trước nhé!
                  </p>
                </div>
              ) : (
                filteredDocs.map((doc) => {
                  const isSelected =
                    attachedDocument &&
                    (attachedDocument.id === doc.id ||
                      attachedDocument.Id === doc.id);

                  return (
                    <div
                      key={doc.id || doc.Id}
                      onClick={() => handleSelectDocument(doc)}
                      className={`p-3 rounded-xl border text-left cursor-pointer transition-all flex items-center justify-between ${
                        isSelected
                          ? "bg-blue-50/80 border-blue-400 shadow-xs"
                          : "bg-white border-slate-200 hover:border-blue-300 hover:bg-slate-50"
                      }`}
                    >
                      <div className="flex items-center gap-3 overflow-hidden">
                        <div
                          className={`p-2 rounded-lg shrink-0 ${
                            isSelected
                              ? "bg-blue-600 text-white"
                              : "bg-slate-100 text-slate-600"
                          }`}
                        >
                          <FileText className="w-4 h-4" />
                        </div>
                        <div className="overflow-hidden">
                          <p className="text-xs font-semibold text-slate-800 truncate">
                            {doc.title || doc.Title || doc.fileName}
                          </p>
                          <p className="text-[11px] text-slate-400 truncate mt-0.5">
                            {doc.fileName || doc.FileName}
                            {doc.subjectName ? ` · ${doc.subjectName}` : ""}
                          </p>
                        </div>
                      </div>

                      {isSelected && (
                        <Check className="w-4 h-4 text-blue-600 shrink-0 ml-2" />
                      )}
                    </div>
                  );
                })
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-5 py-3 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
              <span className="text-[11px] text-slate-400">
                {filteredDocs.length} tài liệu khả dụng
              </span>
              <button
                type="button"
                onClick={() => setIsDocModalOpen(false)}
                className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-white text-xs font-medium transition-colors cursor-pointer"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════
          6. RENAME CHAT MODAL
      ══════════════════════════════════════════════════════════ */}
      {renameModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-2xl border border-slate-200">
            <h3 className="font-bold text-slate-900 text-sm mb-1">
              Đổi tên đoạn chat
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Nhập tiêu đề mới cho đoạn hội thoại này
            </p>

            <form onSubmit={handleSaveRename}>
              <input
                type="text"
                autoFocus
                value={renameModal.title}
                onChange={(e) =>
                  setRenameModal((prev) => ({ ...prev, title: e.target.value }))
                }
                placeholder="Nhập tên mới..."
                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs text-slate-800 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 mb-4"
              />

              <div className="flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() =>
                    setRenameModal({
                      isOpen: false,
                      session: null,
                      title: "",
                      isSubmitting: false,
                    })
                  }
                  className="px-3 py-1.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-medium cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={!renameModal.title.trim() || renameModal.isSubmitting}
                  className="px-4 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium shadow-xs disabled:opacity-50 cursor-pointer flex items-center gap-1.5"
                >
                  {renameModal.isSubmitting ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : null}
                  <span>Lưu</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════
          7. DELETE CONFIRMATION MODAL
      ══════════════════════════════════════════════════════════ */}
      {deleteModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-2xl border border-slate-200">
            <div className="w-10 h-10 rounded-full bg-red-50 text-red-600 flex items-center justify-center mb-3">
              <Trash2 className="w-5 h-5" />
            </div>

            <h3 className="font-bold text-slate-900 text-sm mb-1">
              Xóa đoạn chat này?
            </h3>
            <p className="text-xs text-slate-500 mb-4 leading-relaxed">
              Bạn có chắc chắn muốn xóa đoạn chat này không? Tất cả các câu hỏi
              và câu trả lời trong phiên này sẽ bị xóa vĩnh viễn.
            </p>

            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() =>
                  setDeleteModal({
                    isOpen: false,
                    session: null,
                    isSubmitting: false,
                  })
                }
                className="px-3 py-1.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-medium cursor-pointer"
              >
                Hủy
              </button>
              <button
                type="button"
                disabled={deleteModal.isSubmitting}
                onClick={handleConfirmDelete}
                className="px-4 py-1.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-medium shadow-xs disabled:opacity-50 cursor-pointer flex items-center gap-1.5"
              >
                {deleteModal.isSubmitting ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : null}
                <span>Xóa</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
