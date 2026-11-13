import { useState, useEffect } from "react";
import { X, Layers, FileText, Loader2, Plus } from "lucide-react";
import axiosClient from "../../api/axiosClient";
import flashcardApi from "../../api/flashcardApi";

export default function CreateSetModal({ isOpen, onClose, onSuccess }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [documentId, setDocumentId] = useState("");
  const [userDocs, setUserDocs] = useState([]);
  const [isLoadingDocs, setIsLoadingDocs] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (isOpen) {
      setTitle("");
      setDescription("");
      setDocumentId("");
      setErrorMsg("");

      // Fetch user documents for optional attachment
      const fetchDocs = async () => {
        setIsLoadingDocs(true);
        try {
          const res = await axiosClient.get("/documents/me");
          const docs = res.data?.data || res.data || [];
          setUserDocs(Array.isArray(docs) ? docs : []);
        } catch (err) {
          console.warn("Could not load user documents:", err);
        } finally {
          setIsLoadingDocs(false);
        }
      };
      fetchDocs();
    }
  }, [isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      setErrorMsg("Vui lòng nhập tiêu đề cho bộ Flashcard.");
      return;
    }

    setIsSubmitting(true);
    setErrorMsg("");
    try {
      const created = await flashcardApi.createSet({
        title: title.trim(),
        description: description.trim() || null,
        documentId: documentId || null,
      });

      if (onSuccess) onSuccess(created);
      onClose();
    } catch (err) {
      console.error("Lỗi khi tạo bộ Flashcard:", err);
      setErrorMsg(err.response?.data?.message || err.message || "Không thể tạo bộ thẻ. Vui lòng thử lại!");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className="relative w-full max-w-lg bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Tạo bộ Flashcard mới</h3>
              <p className="text-xs text-slate-500">Tạo bộ câu hỏi để ôn tập và ghi nhớ kiến thức</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {errorMsg && (
            <div className="p-3 text-xs text-red-700 bg-red-50 border border-red-200 rounded-xl">
              {errorMsg}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Tiêu đề bộ thẻ <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="VD: Cấu trúc dữ liệu & Giải thuật, Từ vựng TOEIC..."
              className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-800 placeholder:text-slate-400"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Mô tả chi tiết (Tùy chọn)
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Ghi chú mục tiêu học tập hoặc các nội dung cốt lõi..."
              className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-800 placeholder:text-slate-400 resize-none"
            />
          </div>

          {/* Optional Document linkage */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Liên kết với tài liệu tham chiếu (Tùy chọn)
            </label>
            <div className="relative">
              <select
                value={documentId}
                onChange={(e) => setDocumentId(e.target.value)}
                disabled={isLoadingDocs}
                className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-800 cursor-pointer"
              >
                <option value="">-- Không liên kết tài liệu --</option>
                {userDocs.map((doc) => (
                  <option key={doc.id || doc.Id} value={doc.id || doc.Id}>
                    {doc.title || doc.Title || doc.fileName || "Tài liệu học tập"}
                  </option>
                ))}
              </select>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Liên kết tài liệu giúp Trợ lý AI có thể tự động tạo câu hỏi Flashcard từ bài giảng.
            </p>
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !title.trim()}
              className="flex items-center gap-1.5 px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-xl shadow-xs hover:shadow transition-all cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Đang tạo...</span>
                </>
              ) : (
                <>
                  <Plus className="w-3.5 h-3.5" />
                  <span>Tạo bộ thẻ</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
