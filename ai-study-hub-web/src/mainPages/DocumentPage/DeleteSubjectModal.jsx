import React, { useState, useEffect } from "react";
import { AlertTriangle, X, Trash2, AlertCircle, Loader2 } from "lucide-react";
import axiosClient from "../../api/axiosClient";
import styles from "./DeleteSubjectModal.module.css";

/**
 * DeleteSubjectModal Component
 *
 * Props:
 *  - isOpen      {boolean}   Controls modal visibility.
 *  - onClose     {function}  Called when modal is dismissed.
 *  - onSuccess   {function}  Called after subject is successfully deleted.
 *  - subject     {object}    Subject object to delete.
 */
export default function DeleteSubjectModal({ isOpen, onClose, onSuccess, subject }) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState("");

  const subjectId = subject?.id || subject?.Id;
  const subjectName = subject?.Name || subject?.name || "Môn học";

  useEffect(() => {
    if (isOpen) {
      setError("");
      setIsDeleting(false);
    }
  }, [isOpen]);

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && !isDeleting) onClose?.();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, isDeleting, onClose]);

  const handleDelete = async () => {
    if (!subjectId) return;
    setError("");
    setIsDeleting(true);

    try {
      await axiosClient.delete(`/subjects/${subjectId}`);
      onSuccess?.();
      onClose?.();
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.response?.data?.Message ||
        "Xóa môn học thất bại. Vui lòng thử lại sau.";
      setError(msg);
    } finally {
      setIsDeleting(false);
    }
  };

  if (!isOpen || !subject) return null;

  return (
    <div
      className={styles.backdrop}
      onClick={(e) => {
        if (e.target === e.currentTarget && !isDeleting) onClose?.();
      }}
    >
      <div className={styles.modal} role="dialog" aria-modal="true">
        {/* Header */}
        <div className={styles.modalHeader}>
          <div className={styles.modalHeaderLeft}>
            <div className={styles.warningIconBox}>
              <AlertTriangle size={20} />
            </div>
            <div className={styles.modalHeaderText}>
              <h2>Xác Nhận Xóa Môn Học</h2>
            </div>
          </div>
          <button
            type="button"
            className={styles.closeBtn}
            onClick={onClose}
            disabled={isDeleting}
            aria-label="Đóng"
          >
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className={styles.modalBody}>
          <p className={styles.warningMessage}>
            Bạn có chắc chắn muốn xóa môn học{" "}
            <span className={styles.subjectNameHighlight}>"{subjectName}"</span> không?
            Hành động này không thể hoàn tác.
          </p>

          <p className={styles.warningNote}>
            Lưu ý: Nếu môn học vẫn còn tài liệu bên trong, hệ thống sẽ ngăn việc xóa
            để đảm bảo không bị mất tài liệu của bạn.
          </p>

          {/* Error Message */}
          {error && (
            <div className={styles.errorMsg}>
              <AlertCircle size={16} style={{ flexShrink: 0 }} />
              <span>{error}</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className={styles.modalFooter}>
          <button
            type="button"
            className={styles.cancelBtn}
            onClick={onClose}
            disabled={isDeleting}
          >
            Hủy
          </button>
          <button
            type="button"
            className={styles.deleteBtn}
            onClick={handleDelete}
            disabled={isDeleting}
          >
            {isDeleting ? (
              <>
                <Loader2 size={14} className={styles.spinIcon} />
                Đang xóa...
              </>
            ) : (
              <>
                <Trash2 size={14} />
                Xác Nhận Xóa
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
