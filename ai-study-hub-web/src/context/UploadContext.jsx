import React, { createContext, useContext, useState, useCallback } from "react";
import { CheckCircle2, AlertCircle, X } from "lucide-react";
import axiosClient from "../api/axiosClient";
import styles from "../mainPages/DocumentPage/UploadDocumentModal.module.css";

export const UploadContext = createContext(null);

export function UploadProvider({ children }) {
  const [activeUploads, setActiveUploads] = useState([]);

  const removeUpload = useCallback((id) => {
    setActiveUploads((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const uploadDocument = useCallback(
    async ({ file, title, subjectId, isPublic = false, description = "", onSuccess }) => {
      const uploadId = `upload-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
      const fileName = file?.name || title || "Tài liệu";

      const newUpload = {
        id: uploadId,
        fileName,
        title,
        progress: 0,
        status: "uploading", // "uploading" | "processing" | "done" | "error"
        errorMessage: "",
      };

      setActiveUploads((prev) => [...prev, newUpload]);

      const formData = new FormData();
      formData.append("File", file);
      formData.append("Title", title.trim());
      formData.append("SubjectId", subjectId);
      formData.append("IsPublic", isPublic);
      if (description?.trim()) {
        formData.append("Description", description.trim());
      }

      try {
        await axiosClient.post("/documents/upload", formData, {
          headers: { "Content-Type": "multipart/form-data" },
          onUploadProgress: (progressEvent) => {
            if (progressEvent.total) {
              const pct = Math.round((progressEvent.loaded / progressEvent.total) * 90);
              setActiveUploads((prev) =>
                prev.map((item) =>
                  item.id === uploadId
                    ? {
                        ...item,
                        progress: Math.min(pct, 90),
                        status: pct >= 90 ? "processing" : "uploading",
                      }
                    : item
                )
              );
            }
          },
        });

        // Backend upload finished, now background AI processing / finalize
        setActiveUploads((prev) =>
          prev.map((item) =>
            item.id === uploadId
              ? { ...item, progress: 95, status: "processing" }
              : item
          )
        );

        await new Promise((resolve) => setTimeout(resolve, 500));

        setActiveUploads((prev) =>
          prev.map((item) =>
            item.id === uploadId
              ? { ...item, progress: 100, status: "done" }
              : item
          )
        );

        // Notify caller and broadcast global event
        onSuccess?.();
        if (typeof window !== "undefined") {
          window.dispatchEvent(
            new CustomEvent("document-uploaded", { detail: { title, subjectId } })
          );
        }

        // Auto dismiss toast after 4 seconds
        setTimeout(() => {
          removeUpload(uploadId);
        }, 4000);
      } catch (err) {
        console.error("Lỗi khi tải lên tài liệu:", err);
        const msg =
          err.response?.data?.message ||
          err.response?.data?.Message ||
          "Tải lên thất bại. Vui lòng thử lại.";

        setActiveUploads((prev) =>
          prev.map((item) =>
            item.id === uploadId
              ? { ...item, status: "error", errorMessage: msg }
              : item
          )
        );
      }
    },
    [removeUpload]
  );

  return (
    <UploadContext.Provider value={{ uploadDocument, activeUploads }}>
      {children}

      {/* Floating Upload Progress Toast Widget (Bottom Right) */}
      {activeUploads.length > 0 && (
        <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-3 pointer-events-auto">
          {activeUploads.map((item) => {
            const isDone = item.status === "done";
            const isError = item.status === "error";
            const isProcessing = item.status === "processing";

            return (
              <div
                key={item.id}
                className={styles.progressToast}
                style={{
                  position: "relative",
                  bottom: "auto",
                  right: "auto",
                  margin: 0,
                  width: 340,
                  maxWidth: "calc(100vw - 32px)",
                }}
                role="status"
                aria-live="polite"
              >
                <div className={styles.toastHeader}>
                  {isDone ? (
                    <CheckCircle2 size={26} style={{ color: "#22c55e", flexShrink: 0 }} />
                  ) : isError ? (
                    <AlertCircle size={26} style={{ color: "#ef4444", flexShrink: 0 }} />
                  ) : (
                    <div className={styles.toastSpinner} />
                  )}

                  <div className={styles.toastTextGroup}>
                    <span className={styles.toastTitle} title={item.fileName}>
                      {item.fileName}
                    </span>
                    <span className={styles.toastSubtitle}>
                      {isDone
                        ? "Tải lên & xử lý AI hoàn tất!"
                        : isError
                        ? item.errorMessage || "Tải lên thất bại"
                        : isProcessing
                        ? `Đang duyệt Cloudinary & trích xuất AI (${item.progress}%)`
                        : `Đang tải lên dữ liệu (${item.progress}%)`}
                    </span>
                  </div>

                  {!isDone && !isError && (
                    <span className={styles.toastPercent}>{item.progress}%</span>
                  )}

                  {(isDone || isError) && (
                    <button
                      type="button"
                      onClick={() => removeUpload(item.id)}
                      className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                      title="Đóng thông báo"
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>

                {/* Progress bar */}
                <div className={styles.progressTrack}>
                  <div
                    className={styles.progressFill}
                    style={{
                      width: `${isError ? 100 : item.progress}%`,
                      background: isDone
                        ? "#22c55e"
                        : isError
                        ? "#ef4444"
                        : "linear-gradient(90deg, #60a5fa, #2563eb)",
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </UploadContext.Provider>
  );
}

export function useUpload() {
  const context = useContext(UploadContext);
  if (!context) {
    throw new Error("useUpload must be used within an UploadProvider");
  }
  return context;
}
