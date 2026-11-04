import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  Book,
  Plus,
  Search,
  X,
  Calendar,
  Pencil,
  Trash2,
  FolderOpen,
  ArrowRight,
  Cloud,
} from "lucide-react";
import axiosClient from "../../api/axiosClient";
import styles from "./SubjectsPage.module.css";
import AddSubjectModal from "./AddSubjectModal";

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

export default function SubjectsPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [subjects, setSubjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOrder, setSortOrder] = useState("newest"); // "newest" | "oldest"

  // Modal
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Auto-open Add Subject modal if ?addSubject=1 or ?manageSubjects=1
  useEffect(() => {
    if (
      searchParams.get("addSubject") === "1" ||
      searchParams.get("manageSubjects") === "1"
    ) {
      setIsAddModalOpen(true);
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          next.delete("addSubject");
          next.delete("manageSubjects");
          return next;
        },
        { replace: true }
      );
    }
  }, [searchParams, setSearchParams]);

  // ── Fetch subjects (GET /api/v1/subjects) ──────────────────────────────
  const fetchSubjects = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await axiosClient.get("/subjects");
      const raw =
        res.data?.data ||
        res.data?.Data ||
        (Array.isArray(res.data) ? res.data : []);
      setSubjects(Array.isArray(raw) ? raw : []);
    } catch (err) {
      console.error("Lỗi khi tải danh sách môn học:", err);
      setSubjects([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSubjects();
  }, [fetchSubjects]);

  // ── Filter & Sort ───────────────────────────────────────────────────────
  const filteredAndSortedSubjects = subjects
    .filter((subject) => {
      const name = (subject.Name || subject.name || "").toLowerCase();
      const desc = (subject.Description || subject.description || "").toLowerCase();
      const q = searchQuery.toLowerCase().trim();
      return !q || name.includes(q) || desc.includes(q);
    })
    .sort((a, b) => {
      const dateA = new Date(a.CreatedAt || a.createdAt || 0).getTime();
      const dateB = new Date(b.CreatedAt || b.createdAt || 0).getTime();
      return sortOrder === "newest" ? dateB - dateA : dateA - dateB;
    });

  // ── Card navigation ─────────────────────────────────────────────────────
  const handleCardClick = (subjectId) => {
    navigate(`/subjects/${subjectId}/documents`);
  };

  // ── Edit & Delete action placeholders (stopping propagation) ───────────
  const handleEdit = (subject, e) => {
    e.stopPropagation();
    alert(`Chức năng chỉnh sửa môn học "${subject.Name || subject.name}" đang được cập nhật.`);
  };

  const handleDelete = (subject, e) => {
    e.stopPropagation();
    alert(`Chức năng xóa môn học "${subject.Name || subject.name}" đang được cập nhật.`);
  };

  return (
    <div className={styles.pageContainer}>
      {/* ── 1. Page Header ───────────────────────────────────────── */}
      <div className={styles.pageHeader}>
        <div className={styles.pageHeaderLeft}>
          <h1>Kho Môn Học</h1>
          <p>Quản lý các môn học của bạn. Bấm vào một môn học để xem tài liệu bên trong.</p>
        </div>
        <button
          type="button"
          onClick={() => setIsAddModalOpen(true)}
          className={styles.addSubjectBtn}
        >
          <Plus size={16} />
          Thêm môn học
        </button>
      </div>

      {/* ── 2. Toolbar & Filters ─────────────────────────────────── */}
      <div className={styles.toolbar}>
        {/* Search Input */}
        <div className={styles.searchWrapper}>
          <Search size={15} />
          <input
            type="text"
            className={styles.searchInput}
            placeholder="Tìm kiếm môn học..."
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

        {/* Filter Dropdown: Sort by created date */}
        <select
          className={styles.toolbarSelect}
          value={sortOrder}
          onChange={(e) => setSortOrder(e.target.value)}
        >
          <option value="newest">Lọc theo ngày đăng: Mới nhất</option>
          <option value="oldest">Lọc theo ngày đăng: Cũ nhất</option>
        </select>
      </div>

      {/* ── Stats Bar ────────────────────────────────────────────── */}
      <div className={styles.statsBar}>
        <div className={styles.statsLeft}>
          <span className={styles.statsBadge}>
            Tổng số: <strong>{subjects.length}</strong> môn học
          </span>
          <div className={styles.statsDivider} />
          <span className={styles.savedStatus}>
            <Cloud size={13} />
            Mọi thay đổi đã được lưu vào đám mây
          </span>
        </div>
      </div>

      {/* ── 3. Subject Grid ──────────────────────────────────────── */}
      {isLoading ? (
        <div className={styles.loadingState}>
          <div className={styles.spinner} />
          <p>Đang tải danh sách môn học...</p>
        </div>
      ) : filteredAndSortedSubjects.length === 0 ? (
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>
            <FolderOpen size={24} />
          </div>
          <h3>
            {searchQuery
              ? "Không tìm thấy môn học phù hợp"
              : "Chưa có môn học nào"}
          </h3>
          <p>
            {searchQuery
              ? "Thử thay đổi từ khóa tìm kiếm."
              : 'Nhấn "Thêm môn học" để tạo môn học đầu tiên của bạn.'}
          </p>
        </div>
      ) : (
        <div className={styles.subjectGrid}>
          {filteredAndSortedSubjects.map((subject) => {
            const id = subject.id || subject.Id;
            const name = subject.Name || subject.name || "Môn học";
            const desc = subject.Description || subject.description || "";
            const createdAt = subject.CreatedAt || subject.createdAt;

            return (
              <div
                key={id}
                className={styles.subjectCard}
                onClick={() => handleCardClick(id)}
              >
                {/* Card Header */}
                <div className={styles.cardHeader}>
                  <div className={styles.iconBox}>
                    <Book size={22} />
                  </div>
                  <span className={styles.cardBadge}>Môn học</span>
                </div>

                {/* Card Body */}
                <div className={styles.cardBody}>
                  <h3 className={styles.subjectTitle} title={name}>
                    {name}
                  </h3>
                  {desc ? (
                    <p className={styles.subjectDesc} title={desc}>
                      {desc}
                    </p>
                  ) : (
                    <p
                      className={styles.subjectDesc}
                      style={{ fontStyle: "italic", opacity: 0.7 }}
                    >
                      Chưa có mô tả
                    </p>
                  )}

                  <div className={styles.cardMeta}>
                    <Calendar size={12} />
                    <span>Tạo ngày: {formatDate(createdAt)}</span>
                  </div>
                </div>

                {/* Card Footer */}
                <div className={styles.cardFooter}>
                  <div className={styles.cardFooterLeft}>
                    <span>Xem tài liệu</span>
                    <ArrowRight size={13} />
                  </div>

                  {/* ONLY Two small icons on right: Edit & Delete */}
                  <div className={styles.cardActions}>
                    <button
                      type="button"
                      className={styles.actionBtn}
                      onClick={(e) => handleEdit(subject, e)}
                      title="Chỉnh sửa môn học"
                    >
                      <Pencil size={14} />
                    </button>
                    <button
                      type="button"
                      className={`${styles.actionBtn} ${styles.deleteBtn}`}
                      onClick={(e) => handleDelete(subject, e)}
                      title="Xóa môn học"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Add Subject Modal ─────────────────────────────────────── */}
      <AddSubjectModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={fetchSubjects}
      />
    </div>
  );
}
