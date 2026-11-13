import { useState, useEffect, useRef, useCallback } from "react";
import {
  Upload,
  X,
  FileText,
  File,
  Sparkles,
  Lock,
  AlertCircle,
} from "lucide-react";
import axiosClient from "../../api/axiosClient";
import { useUpload } from "../../hooks/useUpload";
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
  const [error, setError] = useState("");

  const { uploadDocument } = useUpload();
  const fileInputRef = useRef(null);

  // ── Subjects state ─────────────────────────────────────────────────────────
  const [subjects, setSubjects] = useState([]);
  const [isLoadingSubjects, setIsLoadingSubjects] = useState(false);

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

  // ── Form submission — Asynchronous Background Upload ─────────────────────
  const handleSubmit = (e) => {
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

    const currentFile = file;
    const currentTitle = title.trim();
    const currentSubjectId = subjectId;
    const currentIsPublic = isPublic;
    const currentDescription = description.trim();

    // Close modal immediately so the user can continue working without waiting!
    onClose?.();

    // Trigger non-blocking background upload with floating toast widget
    uploadDocument({
      file: currentFile,
      title: currentTitle,
      subjectId: currentSubjectId,
      isPublic: currentIsPublic,
      description: currentDescription,
      onSuccess,
    });
  };

  // ── Keyboard: close on Escape ─────────────────────────────────────────────
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e) => {
      if (e.key === "Escape") onClose?.();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <>
      {/* ── Backdrop ──────────────────────────────────────────────────────── */}
      <div
        className={styles.backdrop}
        onClick={(e) => {
          if (e.target === e.currentTarget) onClose?.();
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
              >
                Hủy
              </button>
              <button
                type="submit"
                className={styles.submitBtn}
              >
                <Upload size={14} />
                Tải lên &amp; Xử lý
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
