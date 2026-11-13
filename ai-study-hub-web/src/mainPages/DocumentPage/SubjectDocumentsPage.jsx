import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
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
  Cloud,
  Book,
} from "lucide-react";
import axiosClient from "../../api/axiosClient";
import styles from "./SubjectDocumentsPage.module.css";
import UploadDocumentModal from "./UploadDocumentModal";
import PreviewDocumentModal from "./PreviewDocumentModal";

// ─── Helpers ────────────────────────────────────────────────────────────────

/**
 * Map file extension -> icon component + colour scheme
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
    case "png":
    case "jpg":
    case "jpeg":
      return { Icon: ImageIcon, bg: "#fdf4ff", color: "#c026d3" };
    default:
      return { Icon: File, bg: "#f5f3ff", color: "#8b5cf6" };
  }
}

/**
 * Format bytes -> human-readable string (KB / MB)
 */
function formatFileSize(bytes) {
  if (!bytes) return "—";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

/**
 * Format ISO date string -> Vietnamese short date
 */
function formatDate(isoString) {
  if (!isoString) return "—";
  const d = new Date(isoString);
  return d.toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

/**
 * Map backend ProcessingStatus -> Vietnamese label + CSS modifier
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

export default function SubjectDocumentsPage() {
  const { subjectId } = useParams();
  const navigate = useNavigate();

  const [subject, setSubject] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFormat, setSelectedFormat] = useState("");

  // Modal & Actions
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [previewDoc, setPreviewDoc] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const handleOpenPreview = (documentItem) => {
    setPreviewDoc(documentItem);
    setPreviewModalOpen(true);
  };

  // ── Fetch Subject info & Documents for this subject ───────────────────────
  const fetchSubjectAndDocs = useCallback(async () => {
    if (!subjectId) return;
    setIsLoading(true);
    try {
      // 1. Fetch subject details from subjects list
      const subjectsRes = await axiosClient.get("/subjects").catch(() => null);
      if (subjectsRes?.data) {
        const rawSubjects =
          subjectsRes.data?.data ||
          subjectsRes.data?.Data ||
          (Array.isArray(subjectsRes.data) ? subjectsRes.data : []);
        const found = rawSubjects.find(
          (s) => (s.id || s.Id || "").toLowerCase() === subjectId.toLowerCase()
        );
        if (found) setSubject(found);
      }

      // 2. Fetch documents strictly belonging to this subject
      const docsRes = await axiosClient.get("/documents/me", {
        params: { subjectId },
      });
      const rawDocs =
        docsRes.data?.data ||
        docsRes.data?.Data ||
        (Array.isArray(docsRes.data) ? docsRes.data : []);
      setDocuments(Array.isArray(rawDocs) ? rawDocs : []);
    } catch (err) {
      console.error("Lỗi khi tải tài liệu môn học:", err);
      setDocuments([]);
    } finally {
      setIsLoading(false);
    }
  }, [subjectId]);

  useEffect(() => {
    fetchSubjectAndDocs();

    const handleDocumentUploaded = (e) => {
      // Re-fetch when an upload completes, especially if related to this subject
      const uploadedSubjectId = e.detail?.subjectId;
      if (!uploadedSubjectId || !subjectId || uploadedSubjectId.toLowerCase() === subjectId.toLowerCase()) {
        fetchSubjectAndDocs();
      }
    };

    window.addEventListener("document-uploaded", handleDocumentUploaded);
    return () => window.removeEventListener("document-uploaded", handleDocumentUploaded);
  }, [fetchSubjectAndDocs, subjectId]);

  // ── Delete Document ───────────────────────────────────────────────────────
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

  // ── Download Document ─────────────────────────────────────────────────────
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

  // ── AI Handlers ───────────────────────────────────────────────────────────
  const handleAIChat = (doc) => {
    navigate("/ai-assistant", {
      state: {
        attachedDocument: doc,
      },
    });
  };

  const handleAISummary = (doc) => {
    const docTitle = doc?.title || doc?.Title || doc?.Filename || "tài liệu này";
    navigate("/ai-assistant", {
      state: {
        attachedDocument: doc,
        initialQuery: `Hãy tóm tắt ngắn gọn và nêu các điểm chính của tài liệu "${docTitle}" giúp mình nhé.`,
        autoSendQuery: true,
      },
    });
  };

  const handleGenerateFlashcard = (doc) => {
    navigate("/flashcards", {
      state: {
        autoGenerateFromDoc: doc,
      },
    });
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

  const availableFormats = [
    ...new Set(
      documents.map((d) => {
        const f = d.Filename || d.FileName || d.filename || "";
        return f.split(".").pop().toLowerCase();
      }).filter(Boolean)
    ),
  ];

  const subjectName = subject?.Name || subject?.name || "Môn học";

  return (
    <div className={styles.pageContainer}>
      {/* ── Back Navigation ──────────────────────────────────────── */}
      <div className={styles.backNav}>
        <button
          type="button"
          onClick={() => navigate("/subjects")}
          className={styles.backBtn}
        >
          <ArrowLeft size={16} />
          <span>Quay lại danh sách môn học</span>
        </button>
      </div>

      {/* ── Page Header ─────────────────────────────────────────── */}
      <div className={styles.pageHeader}>
        <div className={styles.pageHeaderLeft}>
          <h1>
            <span>Tài liệu môn: {subjectName}</span>
            <span className={styles.subjectBadgeHeader}>
              <Book size={12} />
              Môn học
            </span>
          </h1>
          <p>
            {subject?.Description ||
              subject?.description ||
              "Quản lý toàn bộ tài liệu học tập và tài nguyên thuộc môn học này."}
          </p>
        </div>

        <button
          type="button"
          onClick={() => setUploadModalOpen(true)}
          className={styles.uploadBtn}
        >
          <Upload size={15} />
          Tải lên tài liệu
        </button>
      </div>

      {/* ── Toolbar ─────────────────────────────────────────────── */}
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
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                color: "#94a3b8",
                display: "flex",
              }}
            >
              <X size={14} />
            </button>
          )}
        </div>

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
      </div>

      {/* ── Stats Bar ───────────────────────────────────────────── */}
      <div className={styles.statsBar}>
        <div className={styles.statsLeft}>
          <span className={styles.statsBadge}>
            Tài liệu thuộc môn: <strong>{filteredDocuments.length}</strong> /{" "}
            {documents.length}
          </span>
          <div className={styles.statsDivider} />
          <span className={styles.savedStatus}>
            <Cloud size={13} />
            Mọi thay đổi đã được lưu vào đám mây
          </span>
        </div>
        <span className={styles.sortLabel}>Sắp xếp: Thêm gần đây</span>
      </div>

      {/* ── Document Grid ────────────────────────────────────────── */}
      {isLoading ? (
        <div className={styles.loadingState}>
          <div className={styles.spinner} />
          <p>Đang tải tài liệu của môn học...</p>
        </div>
      ) : filteredDocuments.length === 0 ? (
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>
            <FolderOpen size={24} />
          </div>
          <h3>
            {searchQuery || selectedFormat
              ? "Không tìm thấy tài liệu phù hợp"
              : "Môn học này chưa có tài liệu nào"}
          </h3>
          <p>
            {searchQuery || selectedFormat
              ? "Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm."
              : 'Nhấn "+ Tải lên tài liệu" để thêm tài liệu đầu tiên cho môn học này.'}
          </p>
        </div>
      ) : (
        <div className={styles.documentGrid}>
          {filteredDocuments.map((doc) => {
            const id = doc.Id || doc.id;
            const title = doc.title || doc.Title || "Không có tiêu đề";
            const filename = doc.Filename || doc.FileName || doc.filename || "";
            const uploadedAt = doc.UploadedAt || doc.uploadedAt;
            const processingStatus = doc.ProcessingStatus || doc.processingStatus || "";
            const fileSize = doc.FileSize || doc.fileSize;
            const fileExt =
              doc.FileExtension || doc.fileExtension || filename.split(".").pop() || "";

            const { Icon: FileIcon, bg: iconBg, color: iconColor } = getFileIconProps(
              filename,
              fileExt
            );
            const { label: statusLabel, cls: statusCls, Icon: StatusIcon } = mapStatus(
              processingStatus
            );
            const isDeleting = deletingId === id;

            return (
              <div key={id} className={styles.documentCard}>
                {/* Card Header */}
                <div className={styles.cardHeader}>
                  <div className={styles.fileIconBox} style={{ background: iconBg }}>
                    <FileIcon size={22} style={{ color: iconColor }} />
                  </div>
                  <div className={styles.cardBadges}>
                    <span className={styles.subjectBadge} title={subjectName}>
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
                  <p
                    className={styles.docTitle}
                    title={`${title} (Bấm để xem trước)`}
                    onClick={() => handleOpenPreview(doc)}
                  >
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
                          <span
                            style={{
                              background: "#f1f5f9",
                              padding: "0 5px",
                              borderRadius: 4,
                              marginLeft: 2,
                            }}
                          >
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
                      onClick={() => handleAIChat(doc)}
                      title="Hỏi Trợ lý AI về tài liệu này"
                    >
                      <Sparkles size={15} />
                    </button>
                    <button
                      type="button"
                      className={styles.aiActionBtn}
                      onClick={() => handleAISummary(doc)}
                      title="Tạo tóm tắt AI"
                    >
                      <BookOpen size={15} />
                    </button>
                    <button
                      type="button"
                      className={styles.aiActionBtn}
                      onClick={() => handleGenerateFlashcard(doc)}
                      title="Tạo Flashcard"
                    >
                      <MessageSquare size={15} />
                    </button>
                  </div>

                  {/* Utility Actions (Right) */}
                  <div className={styles.utilActions}>
                    <button
                      type="button"
                      className={`${styles.utilActionBtn} ${styles.previewBtn}`}
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
                        <Loader2
                          size={15}
                          style={{ animation: "spin 0.7s linear infinite" }}
                        />
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

      {/* ── Upload Modal ─────────────────────────────────────────── */}
      <UploadDocumentModal
        isOpen={uploadModalOpen}
        onClose={() => setUploadModalOpen(false)}
        onSuccess={fetchSubjectAndDocs}
        defaultSubjectId={subjectId}
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
