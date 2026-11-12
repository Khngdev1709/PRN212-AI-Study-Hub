import React, { useState, useEffect } from "react";
import { Pencil, X, Check, AlertCircle, Loader2 } from "lucide-react";
import axiosClient from "../../api/axiosClient";
import styles from "./EditSubjectModal.module.css";

/**
 * EditSubjectModal Component
 *
 * Props:
 *  - isOpen      {boolean}   Controls modal visibility.
 *  - onClose     {function}  Called when modal is dismissed.
 *  - onSuccess   {function}  Called after subject is successfully updated.
 *  - subject     {object}    Current subject object to edit.
 */
export default function EditSubjectModal({ isOpen, onClose, onSuccess, subject }) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const subjectId = subject?.id || subject?.Id;

  // Pre-fill form when modal opens with subject data
  useEffect(() => {
    if (isOpen && subject) {
      setName(subject.Name || subject.name || "");
      setDescription(subject.Description || subject.description || "");
      setError("");
      setIsSubmitting(false);
    }
  }, [isOpen, subject]);

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

    if (!subjectId) {
      setError("Không tìm thấy mã môn học cần chỉnh sửa.");
      return;
    }

    setIsSubmitting(true);
    try {
      await axiosClient.put(`/subjects/${subjectId}`, {
        name: trimmedName,
        description: description.trim() || null,
      });

      onSuccess?.();
      onClose?.();
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.response?.data?.Message ||
        "Cập nhật môn học thất bại. Vui lòng thử lại.";
      setError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen || !subject) return null;

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
              <Pencil size={20} />
            </div>
            <div className={styles.modalHeaderText}>
              <h2>Chỉnh Sửa Môn Học</h2>
              <p>Cập nhật tên và mô tả môn học trong hệ thống học tập.</p>
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
              <label className={styles.formLabel} htmlFor="edit-subject-name">
                Tên môn học *
              </label>
              <input
                id="edit-subject-name"
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
              <label className={styles.formLabel} htmlFor="edit-subject-desc">
                Mô tả (không bắt buộc)
              </label>
              <textarea
                id="edit-subject-desc"
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
                  Đang lưu...
                </>
              ) : (
                <>
                  <Check size={14} />
                  Lưu Thay Đổi
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
