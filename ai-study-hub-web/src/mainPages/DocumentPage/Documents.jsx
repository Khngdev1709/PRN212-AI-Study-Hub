import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  Search,
  Upload,
  FileText,
  File,
  FileSpreadsheet,
  Presentation,
  Download,
  Trash2,
  Eye,
  Image as ImageIcon,
  Sparkles,
  BookOpen,
  MessageSquare,
  CheckCircle2,
  Clock,
  AlertCircle,
  X,
  Loader2,
  FolderOpen,
  Settings,
  Cloud,
} from "lucide-react";
import axiosClient from "../../api/axiosClient";
import styles from "./Documents.module.css";
import UploadDocumentModal from "./UploadDocumentModal";
import ManageSubjectsModal from "./ManageSubjectsModal";
import PreviewDocumentModal from "./PreviewDocumentModal";

// ─── Helpers ────────────────────────────────────────────────────────────────

/**
 * Map file extension → icon component + colour scheme
 */
function getFileIconProps(filename = "", extension = "") {
  const ext = (extension || filename.split(".").pop() || "").toLowerCase();
  switch (ext) {
    case "pdf":
      return { Icon: FileText, bg: "#fef2f2", color: "#ef4444" };
    case "doc":
    case "docx":
      return { Icon: File, bg: "#eff6ff", color: "#3b82f6" };
    case "ppt":
    case "pptx":
      return { Icon: Presentation, bg: "#fff7ed", color: "#f97316" };
    case "xls":
    case "xlsx":
      return { Icon: FileSpreadsheet, bg: "#f0fdf4", color: "#22c55e" };
    case "txt":
    case "md":
      return { Icon: File, bg: "#f8fafc", color: "#64748b" };
    default:
      return { Icon: File, bg: "#f5f3ff", color: "#8b5cf6" };
  }
}

/**
 * Format bytes → human-readable string (KB / MB)
 */
function formatFileSize(bytes) {
  if (!bytes) return "—";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

/**
 * Format ISO date string → Vietnamese short date
 */
function formatDate(isoString) {
  if (!isoString) return "—";
  const d = new Date(isoString);
  return d.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" });
}

/**
 * Map backend ProcessingStatus → Vietnamese label + CSS modifier
 */
function mapStatus(status = "") {
  switch (status.toLowerCase()) {
    case "completed":
    case "processed":
      return { label: "Đã xử lý", cls: styles.statusProcessed, Icon: CheckCircle2 };
    case "processing":
    case "pending":
      return { label: "Đang xử lý", cls: styles.statusProcessing, Icon: Clock };
    case "failed":
    case "error":
      return { label: "Thất bại", cls: styles.statusFailed, Icon: AlertCircle };
    default:
      return { label: "Đang xử lý", cls: styles.statusProcessing, Icon: Clock };
  }
}

// ─── Main Component ──────────────────────────────────────────────────────────

export default function Documents() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // ── State ──────────────────────────────────────────────────────────────────
  const [documents, setDocuments] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [isLoadingDocs, setIsLoadingDocs] = useState(true);
  const [isLoadingSubjects, setIsLoadingSubjects] = useState(true);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSubjectId, setSelectedSubjectId] = useState("");
  const [selectedFormat, setSelectedFormat] = useState("");

  // Upload modal visibility — now delegates to UploadDocumentModal component
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  // Manage subjects modal visibility
  const [manageSubjectsOpen, setManageSubjectsOpen] = useState(false);

  // Auto-open manage subjects modal if ?manageSubjects=1
  useEffect(() => {
    if (searchParams.get("manageSubjects") === "1") {
      setManageSubjectsOpen(true);
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          next.delete("manageSubjects");
          return next;
        },
        { replace: true }
      );
    }
  }, [searchParams, setSearchParams]);

  const [deletingId, setDeletingId] = useState(null);

  // ── API: Fetch documents (GET /api/v1/documents/me) ───────────────────────
  const fetchDocuments = useCallback(async () => {
    setIsLoadingDocs(true);
    try {
      const params = {};
      if (selectedSubjectId) params.subjectId = selectedSubjectId;

      const res = await axiosClient.get("/documents/me", { params });
      const raw = res.data?.data || res.data?.Data || (Array.isArray(res.data) ? res.data : []);
      setDocuments(Array.isArray(raw) ? raw : []);
    } catch (err) {
      console.error("Lỗi khi tải danh sách tài liệu:", err);
      setDocuments([]);
    } finally {
      setIsLoadingDocs(false);
    }
  }, [selectedSubjectId]);

  // ── API: Fetch subjects (GET /api/v1/subjects) ────────────────────────────
  const fetchSubjects = useCallback(async () => {
    setIsLoadingSubjects(true);
    try {
      const res = await axiosClient.get("/subjects");
      const raw = res.data?.data || res.data?.Data || (Array.isArray(res.data) ? res.data : []);
      setSubjects(Array.isArray(raw) ? raw : []);
    } catch (err) {
      console.error("Lỗi khi tải danh sách môn học:", err);
      setSubjects([]);
    } finally {
      setIsLoadingSubjects(false);
    }
  }, []);

  useEffect(() => {
    fetchDocuments();
    fetchSubjects();
  }, [fetchDocuments, fetchSubjects]);

  // ── API: Upload is handled by UploadDocumentModal component ──────────────
  // onSuccess callback triggers a re-fetch of documents
  const handleUploadSuccess = () => {
    fetchDocuments();
  };

  // ── API: Delete document (DELETE /api/v1/documents/{id}) ─────────────────
  const handleDelete = async (id) => {
    if (!window.confirm("Bạn có chắc muốn xóa tài liệu này không?")) return;
    setDeletingId(id);
    try {
      await axiosClient.delete(`/documents/${id}`);
      setDocuments((prev) => prev.filter((d) => (d.Id || d.id) !== id));
    } catch (err) {
      console.error("Lỗi khi xóa tài liệu:", err);
      alert("Xóa tài liệu thất bại. Vui lòng thử lại.");
    } finally {
      setDeletingId(null);
    }
  };

  // ── API: Download document (GET /api/v1/documents/{id}/download) ──────────
  const handleDownload = async (id, filename) => {
    try {
      const res = await axiosClient.get(`/documents/${id}/download`, {
        responseType: "blob",
      });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", filename || `document-${id}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Lỗi khi tải xuống tài liệu:", err);
      alert("Tải xuống thất bại. Vui lòng thử lại.");
    }
  };

  // ── AI Placeholder Handlers ───────────────────────────────────────────────
  const handleAIChat = (id) => {
    // TODO: Navigate to AI chat session pre-loaded with this document
    navigate(`/ai-assistant?documentId=${id}`);
  };

  const handleGenerateFlashcard = (id) => {
    // TODO: Call POST /api/v1/ai/flashcards with documentId
    console.info("[AI] Tạo flashcard cho tài liệu:", id);
    alert("Tính năng tạo flashcard đang được phát triển.");
  };

  const handleAISummary = (id) => {
    // TODO: Call POST /api/v1/ai/summary with documentId
    console.info("[AI] Tạo tóm tắt cho tài liệu:", id);
    alert("Tính năng tóm tắt AI đang được phát triển.");
  };

  // ── Client-side filter & search ───────────────────────────────────────────
  const filteredDocuments = documents.filter((doc) => {
    const title = (doc.title || doc.Title || "").toLowerCase();
    const filename = (doc.Filename || doc.FileName || doc.filename || "").toLowerCase();
    const ext = (doc.FileExtension || doc.fileExtension || filename.split(".").pop() || "").toLowerCase();

    const matchesSearch =
      !searchQuery ||
      title.includes(searchQuery.toLowerCase()) ||
      filename.includes(searchQuery.toLowerCase());

    const matchesFormat =
      !selectedFormat || ext === selectedFormat.toLowerCase();

    return matchesSearch && matchesFormat;
  });

  // Unique formats from loaded documents (for filter dropdown)
  const availableFormats = [
    ...new Set(
      documents.map((d) => {
        const f = d.Filename || d.FileName || d.filename || "";
        return f.split(".").pop().toLowerCase();
      }).filter(Boolean)
    ),
  ];

  // Distinct subject count across all loaded (pre-filter) docs
  const distinctSubjectCount = new Set(
    documents
      .map((d) => d.SubjectId || d.subjectId)
      .filter((id) => id && id !== "00000000-0000-0000-0000-000000000000")
  ).size;

  // ── Open upload modal ─────────────────────────────────────────────────────
  const openUploadModal = () => setUploadModalOpen(true);

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className={styles.pageContainer}>

      {/* ── Page Header ─────────────────────────────────────────────────── */}
      <div className={styles.pageHeader}>
        <div className={styles.pageHeaderLeft}>
          <h1>Kho Tài Liệu &amp; Môn Học</h1>
          <p>Kiến thức của bạn, được sắp xếp. Biến mọi tài liệu thành lợi thế học tập.</p>
        </div>
        <button
          type="button"
          onClick={openUploadModal}
          className={styles.uploadBtn}
        >
          <Upload size={15} />
          + Tải lên tài liệu
        </button>
      </div>

      {/* ── Toolbar ─────────────────────────────────────────────────────── */}
      <div className={styles.toolbar}>
        {/* Search */}
        <div className={styles.searchWrapper}>
          <Search size={15} />
          <input
            type="text"
            className={styles.searchInput}
            placeholder="Tìm kiếm tài liệu theo tiêu đề hoặc từ khóa..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              style={{ background: "none", border: "none", cursor: "pointer", color: "#94a3b8", display: "flex" }}
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Subject filter */}
        <select
          className={styles.toolbarSelect}
          value={selectedSubjectId}
          onChange={(e) => setSelectedSubjectId(e.target.value)}
          disabled={isLoadingSubjects}
        >
          <option value="">Tất cả môn học</option>
          {subjects.map((s) => (
            <option key={s.id || s.Id} value={s.id || s.Id}>
              {s.Name || s.name}
            </option>
          ))}
        </select>

        {/* Format filter */}
        <select
          className={styles.toolbarSelect}
          value={selectedFormat}
          onChange={(e) => setSelectedFormat(e.target.value)}
        >
          <option value="">Tất cả định dạng</option>
          {availableFormats.map((fmt) => (
            <option key={fmt} value={fmt}>
              .{fmt.toUpperCase()}
            </option>
          ))}
        </select>

        {/* Manage subjects */}
        <button
          type="button"
          className={styles.manageSubjectsBtn}
          onClick={() => setManageSubjectsOpen(true)}
        >
          <Settings size={14} />
          Quản lý môn học
        </button>
      </div>

      {/* ── Stats Bar ───────────────────────────────────────────────────── */}
      <div className={styles.statsBar}>
        <div className={styles.statsLeft}>
          <span className={styles.statsBadge}>
            <strong>Tất cả tài liệu</strong>
          </span>
          <div className={styles.statsDivider} />
          <span className={styles.statsBadge}>
            trong <strong>{distinctSubjectCount}</strong> môn học
          </span>
          <div className={styles.statsDivider} />
          <span className={styles.savedStatus}>
            <Cloud size={13} />
            Mọi thay đổi đã được lưu vào đám mây
          </span>
        </div>
        <span className={styles.sortLabel}>Sắp xếp: Thêm gần đây</span>
      </div>

      {/* ── Content ─────────────────────────────────────────────────────── */}
      {isLoadingDocs ? (
        <div className={styles.loadingState}>
          <div className={styles.spinner} />
          <p>Đang tải tài liệu...</p>
        </div>
      ) : filteredDocuments.length === 0 ? (
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>
            <FolderOpen size={24} />
          </div>
          <h3>
            {searchQuery || selectedSubjectId || selectedFormat
              ? "Không tìm thấy tài liệu phù hợp"
              : "Chưa có tài liệu nào"}
          </h3>
          <p>
            {searchQuery || selectedSubjectId || selectedFormat
              ? "Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm."
              : "Nhấn \"+ Tải lên tài liệu\" để bắt đầu xây dựng kho tài liệu của bạn."}
          </p>
        </div>
      ) : (
        <div className={styles.documentGrid}>
          {filteredDocuments.map((doc) => {
            const id = doc.Id || doc.id;
            const title = doc.title || doc.Title || "Không có tiêu đề";
            const filename = doc.Filename || doc.FileName || doc.filename || "";
            const subjectName = doc.SubjectName || doc.subjectName || "—";
            const uploadedAt = doc.UploadedAt || doc.uploadedAt;
            const processingStatus = doc.ProcessingStatus || doc.processingStatus || "";
            const fileSize = doc.FileSize || doc.fileSize;
            const fileExt = doc.FileExtension || doc.fileExtension || filename.split(".").pop() || "";

            const { Icon: FileIcon, bg: iconBg, color: iconColor } = getFileIconProps(filename, fileExt);
            const { label: statusLabel, cls: statusCls, Icon: StatusIcon } = mapStatus(processingStatus);
            const isDeleting = deletingId === id;

            return (
              <div key={id} className={styles.documentCard}>

                {/* Card Header */}
                <div className={styles.cardHeader}>
                  <div
                    className={styles.fileIconBox}
                    style={{ background: iconBg }}
                  >
                    <FileIcon size={22} style={{ color: iconColor }} />
                  </div>
                  <div className={styles.cardBadges}>
                    <span
                      className={styles.subjectBadge}
                      title={subjectName}
                    >
                      {subjectName}
                    </span>
                    <span className={`${styles.statusBadge} ${statusCls}`}>
                      <StatusIcon size={10} />
                      {statusLabel}
                    </span>
                  </div>
                </div>

                {/* Card Body */}
                <div className={styles.cardBody}>
                  <p className={styles.docTitle} title={title}>
                    {title}
                  </p>
                  <div className={styles.cardMeta}>
                    <span className={styles.metaRow}>
                      <Clock size={11} />
                      {formatDate(uploadedAt)}
                    </span>
                    {fileSize && (
                      <span className={styles.metaRow}>
                        <File size={11} />
                        {formatFileSize(fileSize)}
                        {fileExt && (
                          <span style={{ background: "#f1f5f9", padding: "0 5px", borderRadius: 4, marginLeft: 2 }}>
                            .{fileExt.toUpperCase()}
                          </span>
                        )}
                      </span>
                    )}
                  </div>
                </div>

                {/* Card Footer */}
                <div className={styles.cardFooter}>
                  {/* AI Actions (Left) */}
                  <div className={styles.aiActions}>
                    <button
                      type="button"
                      className={styles.aiActionBtn}
                      onClick={() => handleAIChat(id)}
                      title="Hỏi Trợ lý AI về tài liệu này"
                    >
                      <Sparkles size={15} />
                    </button>
                    <button
                      type="button"
                      className={styles.aiActionBtn}
                      onClick={() => handleAISummary(id)}
                      title="Tạo tóm tắt AI"
                    >
                      <BookOpen size={15} />
                    </button>
                    <button
                      type="button"
                      className={styles.aiActionBtn}
                      onClick={() => handleGenerateFlashcard(id)}
                      title="Tạo Flashcard"
                    >
                      <MessageSquare size={15} />
                    </button>
                  </div>

                  {/* Utility Actions (Right) */}
                  <div className={styles.utilActions}>
                    <button
                      type="button"
                      className={styles.utilActionBtn}
                      onClick={() => handleOpenPreview(doc)}
                      title="Xem trước tài liệu"
                    >
                      <Eye size={15} />
                    </button>
                    <button
                      type="button"
                      className={styles.utilActionBtn}
                      onClick={() => handleDownload(id, filename)}
                      title="Tải xuống"
                    >
                      <Download size={15} />
                    </button>
                    <button
                      type="button"
                      className={`${styles.utilActionBtn} ${styles.deleteBtn}`}
                      onClick={() => handleDelete(id)}
                      title="Xóa tài liệu"
                      disabled={isDeleting}
                    >
                      {isDeleting ? (
                        <Loader2 size={15} style={{ animation: "spin 0.7s linear infinite" }} />
                      ) : (
                        <Trash2 size={15} />
                      )}
                    </button>
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* ── Upload Modal (delegated to UploadDocumentModal component) ──── */}
      <UploadDocumentModal
        isOpen={uploadModalOpen}
        onClose={() => setUploadModalOpen(false)}
        onSuccess={handleUploadSuccess}
      />

      {/* ── Manage Subjects Modal ────────────────────────────────────────── */}
      <ManageSubjectsModal
        isOpen={manageSubjectsOpen}
        onClose={() => setManageSubjectsOpen(false)}
        onSubjectsUpdated={fetchSubjects}
      />

      {/* ── Preview Document Modal ─────────────────────────────────── */}
      <PreviewDocumentModal
        isOpen={previewModalOpen}
        onClose={() => setPreviewModalOpen(false)}
        document={previewDoc}
      />

    </div>
  );
}
