import React, { useState, useEffect, useCallback } from "react";
import {
  Book,
  X,
  Plus,
  Loader2,
  FolderOpen,
  AlertCircle,
  CheckCircle2,
  Calendar,
} from "lucide-react";
import axiosClient from "../../api/axiosClient";
import styles from "./ManageSubjectsModal.module.css";

/**
 * Format ISO date string -> Vietnamese short date
 */
function formatDate(isoString) {
  if (!isoString) return "";
  const d = new Date(isoString);
  return d.toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

/**
 * ManageSubjectsModal component
 * Provides full subject management: view subjects and create new subjects
 */
export default function ManageSubjectsModal({
  isOpen,
  onClose,
  onSubjectsUpdated,
}) {
  const [subjects, setSubjects] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Form fields
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Alerts
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Search in subjects list
  const [searchFilter, setSearchFilter] = useState("");

  // ── Fetch all subjects (GET /api/v1/subjects) ───────────────────────────
  const fetchSubjects = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await axiosClient.get("/subjects");
      const raw =
        res.data?.data ||
        res.data?.Data ||
        (Array.isArray(res.data) ? res.data : []);
      const list = Array.isArray(raw) ? raw : [];
      setSubjects(list);
    } catch (err) {
      console.error("Lỗi khi tải danh sách môn học:", err);
      setError("Không thể tải danh sách môn học. Vui lòng thử lại.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      setName("");
      setDescription("");
      setError("");
      setSuccessMsg("");
      setSearchFilter("");
      fetchSubjects();
    }
  }, [isOpen, fetchSubjects]);

  // ── Keyboard: close on Escape ─────────────────────────────────────────────
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e) => {
      if (e.key === "Escape" && !isSubmitting) onClose?.();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isOpen, isSubmitting, onClose]);

  // ── Create Subject (POST /api/v1/subjects) ─────────────────────────────────
  const handleCreate = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");

    const trimmedName = name.trim();
    if (!trimmedName) {
      setError("Tên môn học không được để trống.");
      return;
    }

    setIsSubmitting(true);
    try {
      await axiosClient.post("/subjects", {
        name: trimmedName,
        description: description.trim() || null,
      });

      setSuccessMsg(`Đã tạo môn học "${trimmedName}" thành công.`);
      setName("");
      setDescription("");

      // Refresh list & notify parent component
      await fetchSubjects();
      onSubjectsUpdated?.();
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.response?.data?.Message ||
        "Tạo môn học thất bại. Vui lòng thử lại.";
      setError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const filteredSubjects = subjects.filter((s) => {
    const sName = (s.Name || s.name || "").toLowerCase();
    const sDesc = (s.Description || s.description || "").toLowerCase();
    const q = searchFilter.toLowerCase();
    return sName.includes(q) || sDesc.includes(q);
  });

  return (
    <div
      className={styles.backdrop}
      onClick={(e) => {
        if (e.target === e.currentTarget && !isSubmitting) onClose?.();
      }}
    >
      <div className={styles.modal} role="dialog" aria-modal="true">
        {/* ── Modal Header ──────────────────────────────────────── */}
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <div className={styles.headerIconBox}>
              <Book size={20} />
            </div>
            <div className={styles.headerText}>
              <h2>Quản Lý Môn Học</h2>
              <p>Thêm mới và xem danh mục môn học trong hệ thống học tập.</p>
            </div>
          </div>
          <button
            type="button"
            className={styles.closeBtn}
            onClick={onClose}
            disabled={isSubmitting}
            aria-label="Đóng"
          >
            <X size={16} />
          </button>
        </div>

        {/* ── Create Subject Form ───────────────────────────────── */}
        <form onSubmit={handleCreate} className={styles.createSection}>
          <p className={styles.createTitle}>
            <Plus size={15} />
            Tạo môn học mới
          </p>

          <div className={styles.createRow}>
            <div className={styles.createFields}>
              <input
                type="text"
                className={styles.inputField}
                placeholder="Nhập tên môn học (ví dụ: Giải tích 1, Lập trình C#)... *"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                disabled={isSubmitting}
              />
              <textarea
                className={styles.inputField}
                placeholder="Mô tả môn học (tùy chọn)..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
                disabled={isSubmitting}
              />
            </div>

            <button
              type="submit"
              className={styles.createBtn}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={14} className={styles.spinIcon} />
                  Đang tạo...
                </>
              ) : (
                <>
                  <Plus size={14} />
                  Thêm môn
                </>
              )}
            </button>
          </div>

          {/* Feedback messages */}
          {error && (
            <div className={styles.errorBanner} style={{ marginTop: 10 }}>
              <AlertCircle size={14} />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className={styles.successBanner} style={{ marginTop: 10 }}>
              <CheckCircle2 size={14} />
              <span>{successMsg}</span>
            </div>
          )}
        </form>

        {/* ── Subject List Section ──────────────────────────────── */}
        <div className={styles.listSection}>
          <div className={styles.listHeader}>
            <div className={styles.listTitle}>
              <span>Danh sách môn học</span>
              <span className={styles.countBadge}>
                {subjects.length} môn
              </span>
            </div>

            {subjects.length > 5 && (
              <input
                type="text"
                className={styles.inputField}
                style={{ maxWidth: 200, padding: "5px 10px", fontSize: "0.75rem" }}
                placeholder="Lọc môn học..."
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
              />
            )}
          </div>

          {isLoading ? (
            <div className={styles.loadingRow}>
              <div className={styles.spinner} />
              <span>Đang tải danh sách môn học...</span>
            </div>
          ) : filteredSubjects.length === 0 ? (
            <div className={styles.emptyState}>
              <div className={styles.emptyIcon}>
                <FolderOpen size={22} />
              </div>
              <p>
                {searchFilter
                  ? "Không tìm thấy môn học khớp với bộ lọc."
                  : "Chưa có môn học nào. Hãy thêm môn học đầu tiên ở trên!"}
              </p>
            </div>
          ) : (
            filteredSubjects.map((subject) => {
              const sId = subject.id || subject.Id;
              const sName = subject.Name || subject.name;
              const sDesc = subject.Description || subject.description;
              const sDate = subject.CreatedAt || subject.createdAt;

              return (
                <div key={sId} className={styles.subjectRow}>
                  <div className={styles.subjectIconBox}>
                    <Book size={18} />
                  </div>

                  <div className={styles.subjectInfo}>
                    <div className={styles.subjectName} title={sName}>
                      {sName}
                    </div>
                    {sDesc && (
                      <div className={styles.subjectDesc} title={sDesc}>
                        {sDesc}
                      </div>
                    )}
                  </div>

                  {sDate && (
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 4,
                        fontSize: "0.6875rem",
                        color: "#94a3b8",
                        flexShrink: 0,
                      }}
                      title="Ngày tạo"
                    >
                      <Calendar size={11} />
                      {formatDate(sDate)}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* ── Footer ───────────────────────────────────────────── */}
        <div className={styles.footer}>
          <button
            type="button"
            className={styles.doneBtn}
            onClick={onClose}
          >
            Hoàn tất
          </button>
        </div>
      </div>
    </div>
  );
}
