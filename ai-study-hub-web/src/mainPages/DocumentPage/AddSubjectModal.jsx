import React, { useState, useEffect } from "react";
import { Book, X, Plus, AlertCircle, Loader2 } from "lucide-react";
import axiosClient from "../../api/axiosClient";
import styles from "./AddSubjectModal.module.css";

/**
 * AddSubjectModal Component
 *
 * Props:
 *  - isOpen      {boolean}   Controls modal visibility.
 *  - onClose     {function}  Called when modal is dismissed.
 *  - onSuccess   {function}  Called after subject is successfully created.
 */
export default function AddSubjectModal({ isOpen, onClose, onSuccess }) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Reset form when opened
  useEffect(() => {
    if (isOpen) {
      setName("");
      setDescription("");
      setError("");
      setIsSubmitting(false);
    }
  }, [isOpen]);

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && !isSubmitting) onClose?.();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, isSubmitting, onClose]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const trimmedName = name.trim();
    if (!trimmedName) {
      setError("Vui lòng nhập tên môn học.");
      return;
    }

    setIsSubmitting(true);
    try {
      await axiosClient.post("/subjects", {
        name: trimmedName,
        description: description.trim() || null,
      });

      onSuccess?.();
      onClose?.();
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.response?.data?.Message ||
        "Thêm môn học thất bại. Vui lòng thử lại.";
      setError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className={styles.backdrop}
      onClick={(e) => {
        if (e.target === e.currentTarget && !isSubmitting) onClose?.();
      }}
    >
      <div className={styles.modal} role="dialog" aria-modal="true">
        {/* Header */}
        <div className={styles.modalHeader}>
          <div className={styles.modalHeaderLeft}>
            <div className={styles.headerIconBox}>
              <Book size={20} />
            </div>
            <div className={styles.modalHeaderText}>
              <h2>Thêm Môn Học Mới</h2>
              <p>Tạo môn học để quản lý và phân loại tài liệu học tập của bạn.</p>
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

        {/* Body */}
        <form onSubmit={handleSubmit}>
          <div className={styles.modalBody}>
            {/* Input 1: Tên môn học */}
            <div className={styles.formGroup}>
              <label className={styles.formLabel} htmlFor="subject-name">
                Tên môn học *
              </label>
              <input
                id="subject-name"
                type="text"
                className={styles.inputField}
                placeholder="Nhập tên môn học..."
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                disabled={isSubmitting}
                autoFocus
              />
            </div>

            {/* Input 2: Mô tả */}
            <div className={styles.formGroup}>
              <label className={styles.formLabel} htmlFor="subject-desc">
                Mô tả (không bắt buộc)
              </label>
              <textarea
                id="subject-desc"
                className={styles.inputField}
                placeholder="Thêm mô tả về môn học này..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                disabled={isSubmitting}
              />
            </div>

            {/* Error Message */}
            {error && (
              <div className={styles.errorMsg}>
                <AlertCircle size={15} />
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
              disabled={isSubmitting}
            >
              Hủy
            </button>
            <button
              type="submit"
              className={styles.submitBtn}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={14} className={styles.spinIcon} />
                  Đang thêm...
                </>
              ) : (
                <>
                  <Plus size={14} />
                  Thêm Môn Học
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
