import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Upload,
  X,
  FileText,
  File,
  Sparkles,
  Lock,
  AlertCircle,
  Loader2,
  CheckCircle2,
} from "lucide-react";
import axiosClient from "../../api/axiosClient";
import styles from "./UploadDocumentModal.module.css";

// ─── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Strip file extension from a filename string.
 * e.g. "Giáo trình Giải tích 1.pdf" → "Giáo trình Giải tích 1"
 */
function stripExtension(filename = "") {
  const lastDot = filename.lastIndexOf(".");
  return lastDot > 0 ? filename.slice(0, lastDot) : filename;
}

/**
 * Format bytes → human-readable string (KB / MB)
 */
function formatFileSize(bytes = 0) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * UploadDocumentModal
 *
 * Props:
 *  - isOpen           {boolean}  Controls visibility.
 *  - onClose          {function} Called when user closes/cancels.
 *  - onSuccess        {function} Called after a successful upload (parent refreshes list).
 *  - defaultSubjectId {string}   Pre-selected subject id.
 */
export default function UploadDocumentModal({
  isOpen,
  onClose,
  onSuccess,
  defaultSubjectId,
}) {
  // ── Form state ─────────────────────────────────────────────────────────────
  const [file, setFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [subjectId, setSubjectId] = useState(defaultSubjectId || "");
  const [isPublic, setIsPublic] = useState(false);

  // ── Subjects state ─────────────────────────────────────────────────────────
  const [subjects, setSubjects] = useState([]);
  const [isLoadingSubjects, setIsLoadingSubjects] = useState(false);

  // ── Upload progress state ──────────────────────────────────────────────────
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0); // 0-100
  const [uploadDone, setUploadDone] = useState(false);
  const [error, setError] = useState("");

  const fileInputRef = useRef(null);

  // ── Reset all state when modal opens ──────────────────────────────────────
  useEffect(() => {
    if (isOpen) {
      setFile(null);
      setIsDragging(false);
      setTitle("");
      setDescription("");
      setSubjectId(defaultSubjectId || "");
      setIsPublic(false);
      setError("");
      setUploadProgress(0);
      setUploadDone(false);
      setIsUploading(false);
    }
  }, [isOpen, defaultSubjectId]);

  // ── API: Fetch subjects (GET /api/v1/subjects) ─────────────────────────────
  const fetchSubjects = useCallback(async () => {
    setIsLoadingSubjects(true);
    try {
      const res = await axiosClient.get("/subjects");
      const raw =
        res.data?.data ||
        res.data?.Data ||
        (Array.isArray(res.data) ? res.data : []);
      const list = Array.isArray(raw) ? raw : [];
      setSubjects(list);
      // Pre-select first subject if none chosen
      if (list.length > 0 && !subjectId) {
        setSubjectId(list[0].id || list[0].Id || "");
      }
    } catch (err) {
      console.error("Lỗi khi tải danh sách môn học:", err);
    } finally {
      setIsLoadingSubjects(false);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (isOpen) fetchSubjects();
  }, [isOpen, fetchSubjects]);

  // ── File helpers ───────────────────────────────────────────────────────────

  /** Store a file in state and auto-fill title from filename */
  const applyFile = (picked) => {
    if (!picked) return;
    setFile(picked);
    // Auto-extract title from filename (without extension) only if title is empty
    setTitle((prev) => (prev.trim() ? prev : stripExtension(picked.name)));
    setError("");
  };

  // ── Drag & Drop handlers ──────────────────────────────────────────────────

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const dropped = e.dataTransfer.files?.[0];
    if (dropped) applyFile(dropped);
  };

  const handleFileChange = (e) => {
    const picked = e.target.files?.[0];
    if (picked) applyFile(picked);
    // Reset input value so the same file can be re-selected after clearing
    e.target.value = "";
  };

  const clearFile = (e) => {
    e.stopPropagation();
    setFile(null);
  };

  // ── Form submission — POST /api/v1/documents/upload ───────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Validation
    if (!file) {
      setError("Vui lòng chọn hoặc kéo thả file để tải lên.");
      return;
    }
    if (!title.trim()) {
      setError("Vui lòng nhập tiêu đề tài liệu.");
      return;
    }
    if (!subjectId) {
      setError("Vui lòng chọn môn học.");
      return;
    }

    const formData = new FormData();
    formData.append("File", file);
    formData.append("Title", title.trim());
    formData.append("SubjectId", subjectId);
    formData.append("IsPublic", isPublic);
    if (description.trim()) {
      formData.append("Description", description.trim());
    }

    setIsUploading(true);
    setUploadProgress(0);
    setUploadDone(false);

    try {
      await axiosClient.post("/documents/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
        // Track real upload progress via XMLHttpRequest event
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const pct = Math.round(
              (progressEvent.loaded / progressEvent.total) * 90
            ); // cap at 90% — remaining 10% = server-side processing
            setUploadProgress(pct);
          }
        },
      });

      // Simulate server-side processing phase (90 → 100%)
      setUploadProgress(95);
      await new Promise((resolve) => setTimeout(resolve, 400));
      setUploadProgress(100);
      setUploadDone(true);

      // Brief delay to let user see the 100% state, then close
      await new Promise((resolve) => setTimeout(resolve, 700));

      setIsUploading(false);
      onSuccess?.();
      onClose?.();
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.response?.data?.Message ||
        "Tải lên thất bại. Vui lòng thử lại.";
      setError(msg);
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  // ── Keyboard: close on Escape ─────────────────────────────────────────────
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e) => {
      if (e.key === "Escape" && !isUploading) onClose?.();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isOpen, isUploading, onClose]);

  if (!isOpen) return null;

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <>
      {/* ── Backdrop ──────────────────────────────────────────────────────── */}
      <div
        className={styles.backdrop}
        onClick={(e) => {
          if (e.target === e.currentTarget && !isUploading) onClose?.();
        }}
      >
        {/* ── Modal ───────────────────────────────────────────────────────── */}
        <div className={styles.modal} role="dialog" aria-modal="true">

          {/* Header */}
          <div className={styles.modalHeader}>
            <div className={styles.modalHeaderLeft}>
              <div className={styles.headerIconBox}>
                <Upload size={20} />
              </div>
              <div className={styles.modalHeaderText}>
                <h2>Tải Lên Tài Liệu</h2>
                <p>Thêm vào kho. Để AI lo phần còn lại.</p>
              </div>
            </div>
            <button
              type="button"
              className={styles.closeBtn}
              onClick={onClose}
              disabled={isUploading}
              aria-label="Đóng"
            >
              <X size={16} />
            </button>
          </div>

          {/* Body */}
          <form onSubmit={handleSubmit}>
            <div className={styles.modalBody}>

              {/* ── Drop Zone ───────────────────────────────────────────── */}
              <div
                className={`${styles.dropZone} ${isDragging ? styles.dropZoneActive : ""}`}
                onDragOver={handleDragOver}
                onDragEnter={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => !file && fileInputRef.current?.click()}
              >
                {/* Hidden native file input */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.doc,.docx,.pptx,.txt,.md,.png,.jpg,.jpeg"
                  onChange={handleFileChange}
                  style={{ display: "none" }}
                />

                {!file ? (
                  <>
                    <div className={styles.dropZoneIconBox}>
                      <Upload size={24} />
                    </div>
                    <p className={styles.dropZoneTitle}>
                      Kéo &amp; thả file vào đây (.pdf, .docx, .png, .jpg, .txt, .md)
                    </p>
                    <p className={styles.dropZoneSubtitle}>
                      hoặc chọn file — tối đa 25 MB mỗi file
                    </p>
                  </>
                ) : (
                  <div
                    className={styles.fileChosenCard}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className={styles.fileChosenIcon}>
                      <FileText size={18} />
                    </div>
                    <div className={styles.fileChosenInfo}>
                      <span className={styles.fileChosenName} title={file.name}>
                        {file.name}
                      </span>
                      <span className={styles.fileChosenSize}>
                        {formatFileSize(file.size)}
                      </span>
                    </div>
                    <button
                      type="button"
                      className={styles.fileClearBtn}
                      onClick={clearFile}
                      aria-label="Xóa file đã chọn"
                    >
                      <X size={13} />
                    </button>
                  </div>
                )}
              </div>

              {/* ── Title + Subject row ──────────────────────────────────── */}
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel} htmlFor="modal-title">
                    Tiêu đề *
                  </label>
                  <input
                    id="modal-title"
                    type="text"
                    className={styles.inputField}
                    placeholder="Nhập tiêu đề tài liệu..."
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                  />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel} htmlFor="modal-subject">
                    Chọn môn học *
                  </label>
                  <select
                    id="modal-subject"
                    className={styles.inputField}
                    value={subjectId}
                    onChange={(e) => setSubjectId(e.target.value)}
                    disabled={isLoadingSubjects}
                    required
                  >
                    <option value="">
                      {isLoadingSubjects ? "Đang tải..." : "-- Chọn môn học --"}
                    </option>
                    {subjects.map((s) => (
                      <option key={s.id || s.Id} value={s.id || s.Id}>
                        {s.Name || s.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* ── Description ─────────────────────────────────────────── */}
              <div className={styles.formGroup}>
                <label className={styles.formLabel} htmlFor="modal-description">
                  Mô tả (không bắt buộc)
                </label>
                <textarea
                  id="modal-description"
                  className={styles.inputField}
                  placeholder="Thêm mô tả ngắn về tài liệu..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                />
              </div>

              {/* ── AI hint banner ───────────────────────────────────────── */}
              <div className={styles.aiBanner}>
                <Sparkles size={16} className={styles.aiBannerIcon} />
                <span className={styles.aiBannerText}>
                  AI sẽ tự động tạo flashcards và bản tóm tắt.
                </span>
              </div>

              {/* ── Privacy note ─────────────────────────────────────────── */}
              <div className={styles.privacyNote}>
                <Lock size={13} />
                <span>Riêng tư &amp; bảo mật</span>
              </div>

              {/* ── Error message ────────────────────────────────────────── */}
              {error && (
                <div className={styles.errorMsg}>
                  <AlertCircle size={15} />
                  {error}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className={styles.modalFooter}>
              <button
                type="button"
                className={styles.cancelBtn}
                onClick={onClose}
                disabled={isUploading}
              >
                Hủy
              </button>
              <button
                type="submit"
                className={styles.submitBtn}
                disabled={isUploading}
              >
                {isUploading ? (
                  <>
                    <Loader2 size={14} className={styles.spinIcon} />
                    Đang xử lý...
                  </>
                ) : (
                  <>
                    <Upload size={14} />
                    Tải lên &amp; Xử lý
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* ── Toast Progress Notification ───────────────────────────────────── */}
      {isUploading && (
        <div className={styles.progressToast} role="status" aria-live="polite">
          <div className={styles.toastHeader}>
            {uploadDone ? (
              <CheckCircle2 size={28} style={{ color: "#22c55e", flexShrink: 0 }} />
            ) : (
              <div className={styles.toastSpinner} />
            )}
            <div className={styles.toastTextGroup}>
              <span className={styles.toastTitle}>
                {file?.name || "Tài liệu"}
              </span>
              <span className={styles.toastSubtitle}>
                {uploadDone
                  ? "Tải lên hoàn tất!"
                  : `Đang xử lý... Trích xuất dữ liệu AI (${uploadProgress}%)`}
              </span>
            </div>
            <span className={styles.toastPercent}>{uploadProgress}%</span>
          </div>

          {/* Progress bar — width driven by uploadProgress state */}
          <div className={styles.progressTrack}>
            <div
              className={styles.progressFill}
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
        </div>
      )}
    </>
  );
}
