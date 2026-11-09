import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  X,
  Download,
  Maximize2,
  Minimize2,
  ExternalLink,
  FileText,
  File,
  Image as ImageIcon,
  Loader2,
  AlertCircle,
  RefreshCw,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Clock,
  HardDrive,
  Book,
} from "lucide-react";
import axiosClient from "../../api/axiosClient";
import styles from "./PreviewDocumentModal.module.css";

// ─── Helpers ────────────────────────────────────────────────────────────────

/**
 * Format bytes -> human-readable string
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
 * Clean & normalize file extension
 */
function getNormalizedExt(doc) {
  if (!doc) return "";
  const raw =
    doc.FileExtension ||
    doc.fileExtension ||
    (doc.Filename || doc.FileName || doc.filename || "").split(".").pop() ||
    "";
  return raw.toLowerCase().replace(/^\./, "");
}

/**
 * Get icon & color scheme per file type
 */
function getFileTypeMeta(ext = "") {
  switch (ext) {
    case "pdf":
      return { Icon: FileText, label: "PDF", bg: "#fef2f2", color: "#ef4444" };
    case "docx":
    case "doc":
      return { Icon: File, label: "DOCX", bg: "#eff6ff", color: "#2563eb" };
    case "png":
    case "jpg":
    case "jpeg":
      return { Icon: ImageIcon, label: ext.toUpperCase(), bg: "#fdf4ff", color: "#c026d3" };
    case "txt":
      return { Icon: FileText, label: "TXT", bg: "#f8fafc", color: "#64748b" };
    case "md":
      return { Icon: FileText, label: "MARKDOWN", bg: "#f0fdf4", color: "#16a34a" };
    default:
      return { Icon: File, label: ext.toUpperCase() || "FILE", bg: "#f1f5f9", color: "#475569" };
  }
}

/**
 * Basic safe Markdown to HTML parser (no external heavy libraries required)
 */
function renderSimpleMarkdown(text = "") {
  if (!text) return "";

  // Split into lines
  const lines = text.split("\n");
  const htmlParts = [];
  let inCodeBlock = false;
  let codeBuffer = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Code block toggle
    if (line.trim().startsWith("```")) {
      if (inCodeBlock) {
        htmlParts.push(
          `<pre><code>${codeBuffer.join("\n").replace(/</g, "&lt;").replace(/>/g, "&gt;")}</code></pre>`
        );
        codeBuffer = [];
        inCodeBlock = false;
      } else {
        inCodeBlock = true;
      }
      continue;
    }

    if (inCodeBlock) {
      codeBuffer.push(line);
      continue;
    }

    // Headings
    if (line.startsWith("# ")) {
      htmlParts.push(`<h1>${escapeInline(line.slice(2))}</h1>`);
    } else if (line.startsWith("## ")) {
      htmlParts.push(`<h2>${escapeInline(line.slice(3))}</h2>`);
    } else if (line.startsWith("### ")) {
      htmlParts.push(`<h3>${escapeInline(line.slice(4))}</h3>`);
    } else if (line.startsWith("> ")) {
      htmlParts.push(`<blockquote>${escapeInline(line.slice(2))}</blockquote>`);
    } else if (line.startsWith("- ") || line.startsWith("* ")) {
      htmlParts.push(`<li>${escapeInline(line.slice(2))}</li>`);
    } else if (line.trim() === "") {
      htmlParts.push(`<br />`);
    } else {
      htmlParts.push(`<p>${escapeInline(line)}</p>`);
    }
  }

  return htmlParts.join("");
}

function escapeInline(str = "") {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.*?)\*/g, "<em>$1</em>")
    .replace(/`(.*?)`/g, "<code>$1</code>");
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function PreviewDocumentModal({ isOpen, onClose, document: doc }) {
  const [previewUrl, setPreviewUrl] = useState("");
  const [textContent, setTextContent] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [imageZoom, setImageZoom] = useState(1);
  const [isDownloading, setIsDownloading] = useState(false);

  const docId = doc?.Id || doc?.id;
  const docTitle = doc?.title || doc?.Title || "Tài liệu";
  const docFilename = doc?.Filename || doc?.FileName || doc?.filename || "";
  const ext = useMemo(() => getNormalizedExt(doc), [doc]);
  const typeMeta = useMemo(() => getFileTypeMeta(ext), [ext]);

  // ── Lock background scroll ────────────────────────────────────────────────
  useEffect(() => {
    if (isOpen) {
      const originalStyle = window.getComputedStyle(window.document.body).overflow;
      window.document.body.style.overflow = "hidden";
      return () => {
        window.document.body.style.overflow = originalStyle;
      };
    }
  }, [isOpen]);

  // ── Fetch preview URL & text content ─────────────────────────────────────
  const loadPreview = useCallback(async () => {
    if (!docId) return;
    setIsLoading(true);
    setError("");
    setTextContent("");
    setImageZoom(1);

    try {
      // 1. Fetch preview URL from Backend API
      const res = await axiosClient.get(`/documents/${docId}/preview`);
      const url =
        res.data?.data?.previewUrl ||
        res.data?.data?.PreviewUrl ||
        res.data?.previewUrl ||
        res.data?.data;

      if (!url) {
        throw new Error("Không tìm thấy đường dẫn xem trước của tài liệu.");
      }

      setPreviewUrl(url);

      // 2. For text / markdown formats, fetch raw text directly
      if (ext === "txt" || ext === "md") {
        try {
          const textRes = await axiosClient.get(`/documents/${docId}/download`, {
            responseType: "text",
          });
          setTextContent(typeof textRes.data === "string" ? textRes.data : JSON.stringify(textRes.data));
        } catch (textErr) {
          console.warn("Could not fetch text content directly via download:", textErr);
          // Fallback to fetch via previewUrl
          const fallbackRes = await fetch(url);
          const rawText = await fallbackRes.text();
          setTextContent(rawText);
        }
      }
    } catch (err) {
      console.error("Lỗi khi tải bản xem trước tài liệu:", err);
      const msg =
        err.response?.data?.message ||
        err.response?.data?.Message ||
        err.message ||
        "Không thể tải bản xem trước tài liệu.";
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  }, [docId, ext]);

  useEffect(() => {
    if (isOpen && docId) {
      loadPreview();
    } else {
      setPreviewUrl("");
      setTextContent("");
      setIsFullscreen(false);
    }
  }, [isOpen, docId, loadPreview]);

  // ── Keyboard: Escape to close / exit fullscreen ─────────────────────────
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        if (isFullscreen) {
          setIsFullscreen(false);
        } else {
          onClose?.();
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, isFullscreen, onClose]);

  // ── Download Document ─────────────────────────────────────────────────────
  const handleDownload = async () => {
    if (!docId) return;
    setIsDownloading(true);
    try {
      const res = await axiosClient.get(`/documents/${docId}/download`, {
        responseType: "blob",
      });
      const blobUrl = window.URL.createObjectURL(new Blob([res.data]));
      const link = window.document.createElement("a");
      link.href = blobUrl;
      link.setAttribute("download", docFilename || `document-${docId}.${ext}`);
      window.document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(blobUrl);
    } catch (err) {
      console.error("Lỗi khi tải xuống tài liệu:", err);
      alert("Tải xuống thất bại. Vui lòng thử lại.");
    } finally {
      setIsDownloading(false);
    }
  };

  // ── Open in new tab ───────────────────────────────────────────────────────
  const handleOpenExternal = () => {
    if (previewUrl) {
      window.open(previewUrl, "_blank", "noopener,noreferrer");
    }
  };

  if (!isOpen) return null;

  // ── Render Content Viewport ───────────────────────────────────────────────
  const renderViewerContent = () => {
    if (isLoading) {
      return (
        <div className={styles.loadingContainer}>
          <div className={styles.spinner} />
          <span>Đang tải nội dung xem trước...</span>
        </div>
      );
    }

    if (error) {
      return (
        <div className={styles.errorContainer}>
          <div className={styles.errorIconBox}>
            <AlertCircle size={26} />
          </div>
          <h3 className={styles.errorTitle}>Không thể tải bản xem trước trực tiếp</h3>
          <p className={styles.errorDesc}>
            {error}. Bạn có thể thử tải lại hoặc tải file về máy để xem nội dung đầy đủ.
          </p>
          <div className={styles.errorActions}>
            <button
              type="button"
              className={styles.actionButton}
              onClick={loadPreview}
            >
              <RefreshCw size={14} />
              <span>Thử lại</span>
            </button>
            <button
              type="button"
              className={`${styles.actionButton} ${styles.downloadButton}`}
              onClick={handleDownload}
            >
              <Download size={14} />
              <span>Tải file về máy</span>
            </button>
          </div>
        </div>
      );
    }

    // 1. PDF Viewer
    if (ext === "pdf") {
      return (
        <iframe
          src={`${previewUrl}#toolbar=1&navpanes=0`}
          className={styles.pdfFrame}
          title={docTitle}
        />
      );
    }

    // 2. Image Viewer (.png, .jpg, .jpeg)
    if (ext === "png" || ext === "jpg" || ext === "jpeg") {
      return (
        <div className={styles.imageViewerContainer}>
          <img
            src={previewUrl}
            alt={docTitle}
            className={styles.imagePreview}
            style={{ transform: `scale(${imageZoom})` }}
          />

          {/* Floating Zoom Controls */}
          <div className={styles.imageControls}>
            <button
              type="button"
              className={styles.imageControlBtn}
              onClick={() => setImageZoom((prev) => Math.max(0.4, prev - 0.2))}
              title="Thu nhỏ"
            >
              <ZoomOut size={15} />
            </button>
            <span className={styles.zoomLabel}>{Math.round(imageZoom * 100)}%</span>
            <button
              type="button"
              className={styles.imageControlBtn}
              onClick={() => setImageZoom((prev) => Math.min(3, prev + 0.2))}
              title="Phóng to"
            >
              <ZoomIn size={15} />
            </button>
            <button
              type="button"
              className={styles.imageControlBtn}
              onClick={() => setImageZoom(1)}
              title="Khôi phục kích thước"
            >
              <RotateCcw size={14} />
            </button>
          </div>
        </div>
      );
    }

    // 3. Text & Markdown Viewer (.txt, .md)
    if (ext === "txt" || ext === "md") {
      const lineCount = textContent.split("\n").length;
      const wordCount = textContent.trim() ? textContent.trim().split(/\s+/).length : 0;

      return (
        <div className={styles.textViewerContainer}>
          <div className={styles.textContentWrapper}>
            <div className={styles.textToolbar}>
              <div className={styles.textStats}>
                <span>{lineCount} dòng</span>
                <span>•</span>
                <span>{wordCount} từ</span>
              </div>
              <span className={styles.formatBadge}>{ext.toUpperCase()}</span>
            </div>

            {ext === "md" ? (
              <div
                className={styles.markdownBody}
                dangerouslySetInnerHTML={{ __html: renderSimpleMarkdown(textContent) }}
              />
            ) : (
              <pre className={styles.textPre}>{textContent}</pre>
            )}
          </div>
        </div>
      );
    }

    // 4. Word Document (.docx, .doc) via Google Docs Viewer
    if (ext === "docx" || ext === "doc") {
      const googleViewerUrl = `https://docs.google.com/viewer?url=${encodeURIComponent(
        previewUrl
      )}&embedded=true`;

      return (
        <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column" }}>
          <div className={styles.officeFallbackNotice}>
            <span>
              Tài liệu Microsoft Word đang được hiển thị qua trình xem trực tuyến bảo mật.
            </span>
            <button
              type="button"
              className={styles.actionButton}
              style={{ height: 26, padding: "0 8px", fontSize: "0.6875rem" }}
              onClick={handleDownload}
            >
              <Download size={12} />
              <span>Tải file gốc</span>
            </button>
          </div>
          <iframe
            src={googleViewerUrl}
            className={styles.officeFrame}
            title={docTitle}
          />
        </div>
      );
    }

    // Fallback for other formats
    return (
      <iframe
        src={previewUrl}
        className={styles.pdfFrame}
        title={docTitle}
      />
    );
  };

  const TypeIcon = typeMeta.Icon;

  return (
    <div
      className={styles.backdrop}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose?.();
      }}
    >
      <div
        className={`${styles.modal} ${isFullscreen ? styles.modalFullscreen : ""}`}
        role="dialog"
        aria-modal="true"
      >
        {/* ── Modal Header ───────────────────────────────────────── */}
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <div
              className={styles.fileIconBox}
              style={{ background: typeMeta.bg, color: typeMeta.color }}
            >
              <TypeIcon size={20} />
            </div>
            <div className={styles.headerMeta}>
              <h2 className={styles.docTitle} title={docTitle}>
                {docTitle}
              </h2>
              <div className={styles.subMetaRow}>
                <span className={styles.formatBadge} style={{ color: typeMeta.color }}>
                  .{ext.toUpperCase()}
                </span>
                <span className={styles.metaDot} />
                <span>{formatFileSize(doc?.FileSize || doc?.fileSize)}</span>
                {doc?.SubjectName || doc?.subjectName ? (
                  <>
                    <span className={styles.metaDot} />
                    <span style={{ color: "#2563eb", fontWeight: 600 }}>
                      {doc.SubjectName || doc.subjectName}
                    </span>
                  </>
                ) : null}
              </div>
            </div>
          </div>

          {/* Action buttons (Right) */}
          <div className={styles.headerActions}>
            {/* Open External Tab */}
            {previewUrl && (
              <button
                type="button"
                className={styles.iconOnlyButton}
                onClick={handleOpenExternal}
                title="Mở trong tab mới"
              >
                <ExternalLink size={15} />
              </button>
            )}

            {/* Direct Download Button */}
            <button
              type="button"
              className={`${styles.actionButton} ${styles.downloadButton}`}
              onClick={handleDownload}
              disabled={isDownloading}
              title="Tải tài liệu về máy"
            >
              {isDownloading ? (
                <Loader2 size={14} className={styles.spinner} style={{ width: 14, height: 14 }} />
              ) : (
                <Download size={14} />
              )}
              <span className="hidden sm:inline">Tải về</span>
            </button>

            {/* Fullscreen Toggle */}
            <button
              type="button"
              className={styles.iconOnlyButton}
              onClick={() => setIsFullscreen((prev) => !prev)}
              title={isFullscreen ? "Thu nhỏ cửa sổ" : "Phóng to toàn màn hình"}
            >
              {isFullscreen ? <Minimize2 size={15} /> : <Maximize2 size={15} />}
            </button>

            {/* Close Button */}
            <button
              type="button"
              className={styles.closeButton}
              onClick={onClose}
              title="Đóng (Esc)"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* ── Viewport ───────────────────────────────────────────── */}
        <div className={styles.viewport}>{renderViewerContent()}</div>

        {/* ── Modal Footer ───────────────────────────────────────── */}
        <div className={styles.footer}>
          <div className={styles.footerLeft}>
            <div className={styles.footerItem}>
              <HardDrive size={12} />
              <span>{docFilename || "tài liệu"}</span>
            </div>
            {doc?.UploadedAt || doc?.uploadedAt ? (
              <div className={styles.footerItem}>
                <Clock size={12} />
                <span>Ngày tải: {formatDate(doc.UploadedAt || doc.uploadedAt)}</span>
              </div>
            ) : null}
          </div>
          <div className={styles.footerRight}>
            <span className={styles.footerTag}>AI Study Hub Cloud Preview</span>
          </div>
        </div>
      </div>
    </div>
  );
}
