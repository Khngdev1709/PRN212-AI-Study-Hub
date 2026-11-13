import { useState, useEffect, useCallback } from "react";
import {
  X,
  Plus,
  Pencil,
  Trash2,
  Check,
  RotateCcw,
  Sparkles,
  Loader2,
  FileText,
  AlertCircle,
  HelpCircle,
} from "lucide-react";
import flashcardApi from "../../api/flashcardApi";

export default function ManageCardsModal({
  isOpen,
  onClose,
  flashcardSet,
  onCardsUpdated,
}) {
  const [cards, setCards] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("list"); // "list" | "add_manual" | "ai_generate"

  // Form states for manual add/edit
  const [editingCardId, setEditingCardId] = useState(null);
  const [questionInput, setQuestionInput] = useState("");
  const [answerInput, setAnswerInput] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // AI Generation states
  const [aiDocContent, setAiDocContent] = useState("");
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [aiSuccessMsg, setAiSuccessMsg] = useState("");

  const loadCards = useCallback(async () => {
    if (!flashcardSet?.id) return;
    setIsLoading(true);
    try {
      const items = await flashcardApi.getCards(flashcardSet.id);
      setCards(items || []);
    } catch (err) {
      console.error("Lỗi khi tải thẻ:", err);
    } finally {
      setIsLoading(false);
    }
  }, [flashcardSet?.id]);

  useEffect(() => {
    if (isOpen) {
      loadCards();
      setActiveTab("list");
      setEditingCardId(null);
      setQuestionInput("");
      setAnswerInput("");
      setErrorMsg("");
      setAiDocContent("");
      setAiSuccessMsg("");
    }
  }, [isOpen, loadCards]);

  // Handle Save Manual Card (Add or Edit)
  const handleSaveCard = async (e) => {
    e.preventDefault();
    if (!questionInput.trim() || !answerInput.trim()) {
      setErrorMsg("Vui lòng nhập đầy đủ câu hỏi và câu trả lời.");
      return;
    }

    setIsSubmitting(true);
    setErrorMsg("");
    try {
      if (editingCardId) {
        // Edit existing card
        await flashcardApi.updateCard(editingCardId, {
          question: questionInput,
          answer: answerInput,
        });
      } else {
        // Create new card
        await flashcardApi.createCard(flashcardSet.id, {
          question: questionInput,
          answer: answerInput,
        });
      }

      setQuestionInput("");
      setAnswerInput("");
      setEditingCardId(null);
      setActiveTab("list");
      await loadCards();
      if (onCardsUpdated) onCardsUpdated();
    } catch (err) {
      console.error("Lỗi khi lưu thẻ:", err);
      setErrorMsg(err.response?.data?.message || err.message || "Không thể lưu thẻ.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Toggle Card Mastered Status
  const handleToggleStatus = async (cardId) => {
    try {
      await flashcardApi.toggleCardStatus(cardId);
      setCards((prev) =>
        prev.map((c) => (c.id === cardId ? { ...c, isFinished: !c.isFinished } : c))
      );
      if (onCardsUpdated) onCardsUpdated();
    } catch (err) {
      console.error("Lỗi khi toggle thẻ:", err);
    }
  };

  // Delete Card
  const handleDeleteCard = async (cardId) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa thẻ này?")) return;
    try {
      await flashcardApi.deleteCard(cardId);
      setCards((prev) => prev.filter((c) => c.id !== cardId));
      if (onCardsUpdated) onCardsUpdated();
    } catch (err) {
      console.error("Lỗi khi xóa thẻ:", err);
    }
  };

  // Trigger edit mode for a card
  const handleStartEdit = (card) => {
    setEditingCardId(card.id);
    setQuestionInput(card.question || "");
    setAnswerInput(card.answer || "");
    setActiveTab("add_manual");
  };

  // Handle AI Generate Cards
  const handleGenerateAI = async (e) => {
    e.preventDefault();
    if (!aiDocContent.trim()) {
      setErrorMsg("Vui lòng dán nội dung bài học hoặc tài liệu để AI phân tích.");
      return;
    }

    setIsGeneratingAI(true);
    setErrorMsg("");
    setAiSuccessMsg("");
    try {
      const generated = await flashcardApi.generateCardsWithAI(flashcardSet.id, aiDocContent);
      setAiSuccessMsg(`Đã tạo thành công ${generated.length || 3} thẻ Flashcard tự động từ nội dung!`);
      setAiDocContent("");
      await loadCards();
      if (onCardsUpdated) onCardsUpdated();
      setTimeout(() => {
        setActiveTab("list");
      }, 1500);
    } catch (err) {
      console.error("Lỗi khi tạo thẻ AI:", err);
      setErrorMsg(err.response?.data?.message || err.message || "Không thể tạo thẻ bằng AI. Vui lòng thử lại!");
    } finally {
      setIsGeneratingAI(false);
    }
  };

  if (!isOpen || !flashcardSet) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className="relative w-full max-w-2xl max-h-[90vh] bg-white rounded-2xl shadow-2xl border border-slate-100 flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-white">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Quản lý danh sách thẻ • {flashcardSet.title}
            </h3>
            <p className="text-xs text-slate-500">
              Tổng cộng {cards.length} thẻ ({cards.filter((c) => c.isFinished).length} đã thuộc)
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-2 px-6 pt-3 pb-2 border-b border-slate-100 bg-slate-50 text-xs font-semibold">
          <button
            type="button"
            onClick={() => {
              setActiveTab("list");
              setEditingCardId(null);
            }}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              activeTab === "list"
                ? "bg-white text-blue-600 shadow-xs border border-slate-200"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Danh sách câu hỏi ({cards.length})
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab("add_manual");
              setEditingCardId(null);
              setQuestionInput("");
              setAnswerInput("");
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              activeTab === "add_manual"
                ? "bg-white text-blue-600 shadow-xs border border-slate-200"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Thêm thẻ thủ công</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("ai_generate")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              activeTab === "ai_generate"
                ? "bg-white text-indigo-600 shadow-xs border border-slate-200"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
            <span>Tạo nhanh bằng AI</span>
          </button>
        </div>

        {/* Tab Content Area */}
        <div className="flex-1 overflow-y-auto p-6">
          {errorMsg && (
            <div className="mb-4 p-3 text-xs text-red-700 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* TAB 1: LIST OF CARDS */}
          {activeTab === "list" && (
            <div>
              {isLoading ? (
                <div className="flex flex-col items-center justify-center py-12 gap-2 text-slate-400">
                  <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
                  <span className="text-xs">Đang tải danh sách thẻ...</span>
                </div>
              ) : cards.length === 0 ? (
                <div className="text-center py-12 px-4 text-slate-400">
                  <FileText className="w-10 h-10 mx-auto mb-2 text-slate-300 stroke-[1.5]" />
                  <p className="text-sm font-semibold text-slate-700">Chưa có câu hỏi nào trong bộ này</p>
                  <p className="text-xs text-slate-400 mt-1 mb-4">
                    Thêm thẻ thủ công hoặc dùng Trợ lý AI để tự động tạo câu hỏi trắc nghiệm/dò bài!
                  </p>
                  <button
                    type="button"
                    onClick={() => setActiveTab("add_manual")}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-all cursor-pointer"
                  >
                    + Thêm thẻ đầu tiên
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {cards.map((card, idx) => (
                    <div
                      key={card.id}
                      className="p-3.5 rounded-xl border border-slate-200 bg-white hover:border-slate-300 transition-all shadow-2xs flex items-start justify-between gap-3"
                    >
                      <div className="flex items-start gap-2.5 overflow-hidden">
                        <span className="w-6 h-6 rounded-lg bg-slate-100 text-slate-500 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                          {idx + 1}
                        </span>
                        <div className="overflow-hidden space-y-1">
                          <p className="text-xs font-bold text-slate-900 break-words">
                            Q: {card.question}
                          </p>
                          <p className="text-xs text-slate-600 break-words whitespace-pre-line bg-slate-50 p-2 rounded-lg border border-slate-100">
                            A: {card.answer}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0 ml-2">
                        {/* Status Toggle Button */}
                        <button
                          type="button"
                          onClick={() => handleToggleStatus(card.id)}
                          className={`p-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1 ${
                            card.isFinished
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              : "bg-amber-50 text-amber-700 border border-amber-200"
                          }`}
                          title="Bấm để đảo trạng thái thuộc lòng"
                        >
                          {card.isFinished ? (
                            <>
                              <Check className="w-3.5 h-3.5" />
                              <span className="hidden sm:inline">Đã thuộc</span>
                            </>
                          ) : (
                            <span className="hidden sm:inline">Chưa thuộc</span>
                          )}
                        </button>

                        {/* Edit Button */}
                        <button
                          type="button"
                          onClick={() => handleStartEdit(card)}
                          className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                          title="Chỉnh sửa câu hỏi & câu trả lời"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>

                        {/* Delete Button */}
                        <button
                          type="button"
                          onClick={() => handleDeleteCard(card.id)}
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                          title="Xóa thẻ"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: ADD OR EDIT CARD MANUALLY */}
          {activeTab === "add_manual" && (
            <form onSubmit={handleSaveCard} className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <span className="text-xs font-bold text-slate-800">
                  {editingCardId ? "Chỉnh sửa nội dung thẻ" : "Thêm thẻ câu hỏi mới"}
                </span>
                {editingCardId && (
                  <button
                    type="button"
                    onClick={() => {
                      setEditingCardId(null);
                      setQuestionInput("");
                      setAnswerInput("");
                      setActiveTab("list");
                    }}
                    className="text-xs text-slate-500 hover:text-slate-800 cursor-pointer"
                  >
                    Hủy sửa
                  </button>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Mặt trước: Câu hỏi / Khái niệm cần dò bài <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={3}
                  required
                  value={questionInput}
                  onChange={(e) => setQuestionInput(e.target.value)}
                  placeholder="VD: Thuật toán QuickSort có độ phức tạp thời gian trung bình là bao nhiêu?"
                  className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-800 resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Mặt sau: Đáp án / Lời giải chi tiết <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={4}
                  required
                  value={answerInput}
                  onChange={(e) => setAnswerInput(e.target.value)}
                  placeholder="VD: O(n log n). Trường hợp xấu nhất là O(n²) khi phân đoạn không đều..."
                  className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-800 resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab("list");
                    setEditingCardId(null);
                  }}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
                >
                  Quay lại danh sách
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !questionInput.trim() || !answerInput.trim()}
                  className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-xl shadow-xs transition-all cursor-pointer flex items-center gap-1.5"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Đang lưu...</span>
                    </>
                  ) : (
                    <span>{editingCardId ? "Cập nhật thẻ" : "Thêm thẻ vào bộ"}</span>
                  )}
                </button>
              </div>
            </form>
          )}

          {/* TAB 3: AI GENERATE CARDS */}
          {activeTab === "ai_generate" && (
            <form onSubmit={handleGenerateAI} className="space-y-4">
              <div className="p-3 bg-indigo-50/70 border border-indigo-100 rounded-xl text-xs text-indigo-900 leading-relaxed">
                <p className="font-bold flex items-center gap-1.5 text-indigo-800 mb-1">
                  <Sparkles className="w-4 h-4 text-indigo-600" />
                  <span>Trí tuệ nhân tạo (AI RAG Flashcard Generator)</span>
                </p>
                Dán văn bản giáo trình, bài giảng hoặc ghi chú của bạn vào ô bên dưới. AI sẽ tự động phân tích và trích xuất các câu hỏi kèm đáp án chuẩn xác nhất!
              </div>

              {aiSuccessMsg && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-semibold text-emerald-800 flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span>{aiSuccessMsg}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Nội dung tài liệu học tập <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={6}
                  required
                  value={aiDocContent}
                  onChange={(e) => setAiDocContent(e.target.value)}
                  placeholder="Dán đoạn văn bản, tóm tắt chương sách hoặc nội dung slide bài giảng vào đây..."
                  className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-slate-800 resize-none font-sans"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setActiveTab("list")}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
                >
                  Quay lại danh sách
                </button>
                <button
                  type="submit"
                  disabled={isGeneratingAI || !aiDocContent.trim()}
                  className="px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 rounded-xl shadow-xs transition-all cursor-pointer flex items-center gap-1.5"
                >
                  {isGeneratingAI ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>AI đang phân tích và tạo thẻ...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Bắt đầu tạo thẻ bằng AI</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
