import { useState, useEffect, useCallback, useMemo } from "react";
import {
  X,
  RotateCw,
  RotateCcw,
  Check,
  ChevronLeft,
  ChevronRight,
  Shuffle,
  Sparkles,
  Trophy,
  BookOpen,
  Award,
  Loader2,
  CheckCircle2,
  XCircle,
  HelpCircle,
  BrainCircuit,
} from "lucide-react";
import flashcardApi from "../../api/flashcardApi";
import styles from "./FlashcardStudyModal.module.css";

export default function FlashcardStudyModal({
  isOpen,
  onClose,
  flashcardSet,
  onProgressUpdated,
}) {
  const [cards, setCards] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [filterMode, setFilterMode] = useState("all"); // "all" | "unmastered" | "mastered"
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [isSessionComplete, setIsSessionComplete] = useState(false);

  // Session score tracker
  const [sessionResults, setSessionResults] = useState({
    correctCards: [],
    wrongCards: [],
  });

  // 1. Fetch cards for this set
  const loadCards = useCallback(async () => {
    if (!flashcardSet?.id) return;
    setIsLoading(true);
    try {
      const items = await flashcardApi.getCards(flashcardSet.id);
      setCards(items || []);
      setCurrentIndex(0);
      setIsFlipped(false);
      setIsSessionComplete(false);
      setSessionResults({ correctCards: [], wrongCards: [] });
    } catch (err) {
      console.error("Lỗi khi tải thẻ Flashcard:", err);
    } finally {
      setIsLoading(false);
    }
  }, [flashcardSet?.id]);

  useEffect(() => {
    if (isOpen) {
      loadCards();
    }
  }, [isOpen, loadCards]);

  // 2. Filter active cards according to filterMode
  const activeCards = useMemo(() => {
    if (filterMode === "unmastered") {
      return cards.filter((c) => !c.isFinished);
    }
    if (filterMode === "mastered") {
      return cards.filter((c) => c.isFinished);
    }
    return cards;
  }, [cards, filterMode]);

  const currentCard = activeCards[currentIndex] || null;
  const totalInDeck = activeCards.length;

  // 3. Shuffle Cards
  const handleShuffle = () => {
    const shuffled = [...cards].sort(() => Math.random() - 0.5);
    setCards(shuffled);
    setCurrentIndex(0);
    setIsFlipped(false);
  };

  // 4. Flip card
  const handleFlipCard = () => {
    setIsFlipped((prev) => !prev);
  };

  // 5. Navigation: Previous card
  const handlePrevCard = () => {
    if (currentIndex > 0) {
      setIsFlipped(false);
      setCurrentIndex((prev) => prev - 1);
    }
  };

  // 6. Navigation: Next card
  const handleNextCard = () => {
    if (currentIndex < totalInDeck - 1) {
      setIsFlipped(false);
      setCurrentIndex((prev) => prev + 1);
    } else {
      setIsSessionComplete(true);
    }
  };

  // 7. Answer: "Đúng" / Đã thuộc (isFinished = true)
  const handleMarkCorrect = async () => {
    if (!currentCard || isUpdatingStatus) return;
    setIsUpdatingStatus(true);
    try {
      await flashcardApi.updateCardStatus(currentCard.id, true);

      // Update in local cards state
      setCards((prev) =>
        prev.map((c) => (c.id === currentCard.id ? { ...c, isFinished: true } : c))
      );

      // Track session result
      setSessionResults((prev) => ({
        ...prev,
        correctCards: [...prev.correctCards, currentCard.id],
      }));

      if (onProgressUpdated) onProgressUpdated();

      // Advance to next card smoothly
      if (currentIndex < totalInDeck - 1) {
        setIsFlipped(false);
        setCurrentIndex((prev) => prev + 1);
      } else {
        setIsSessionComplete(true);
      }
    } catch (err) {
      console.error("Lỗi khi cập nhật trạng thái thẻ:", err);
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  // 8. Answer: "Sai" / Chưa thuộc (isFinished = false)
  const handleMarkWrong = async () => {
    if (!currentCard || isUpdatingStatus) return;
    setIsUpdatingStatus(true);
    try {
      await flashcardApi.updateCardStatus(currentCard.id, false);

      // Update in local cards state
      setCards((prev) =>
        prev.map((c) => (c.id === currentCard.id ? { ...c, isFinished: false } : c))
      );

      // Track session result
      setSessionResults((prev) => ({
        ...prev,
        wrongCards: [...prev.wrongCards, currentCard.id],
      }));

      if (onProgressUpdated) onProgressUpdated();

      // Advance to next card smoothly
      if (currentIndex < totalInDeck - 1) {
        setIsFlipped(false);
        setCurrentIndex((prev) => prev + 1);
      } else {
        setIsSessionComplete(true);
      }
    } catch (err) {
      console.error("Lỗi khi cập nhật trạng thái thẻ:", err);
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  // 9. Reset deck progress (isFinished = false on all)
  const handleResetProgress = async () => {
    if (!flashcardSet?.id) return;
    try {
      await flashcardApi.resetProgress(flashcardSet.id);
      await loadCards();
      if (onProgressUpdated) onProgressUpdated();
    } catch (err) {
      console.error("Lỗi khi đặt lại tiến độ:", err);
    }
  };

  // 10. Study only wrong cards from this session
  const handleReviewWrongCards = () => {
    setFilterMode("unmastered");
    setCurrentIndex(0);
    setIsFlipped(false);
    setIsSessionComplete(false);
    setSessionResults({ correctCards: [], wrongCards: [] });
  };

  // 11. Keyboard navigation (Space, ArrowLeft, ArrowRight, 1, 2)
  useEffect(() => {
    if (!isOpen || isSessionComplete) return;

    function handleKeyDown(e) {
      // Don't trigger if user is focusing an input or textarea
      if (["INPUT", "TEXTAREA"].includes(document.activeElement?.tagName)) return;

      if (e.code === "Space") {
        e.preventDefault();
        handleFlipCard();
      } else if (e.code === "ArrowLeft") {
        e.preventDefault();
        handlePrevCard();
      } else if (e.code === "ArrowRight") {
        e.preventDefault();
        handleNextCard();
      } else if (e.key === "1" || e.key === "s" || e.key === "S") {
        e.preventDefault();
        handleMarkWrong();
      } else if (e.key === "2" || e.key === "d" || e.key === "D") {
        e.preventDefault();
        handleMarkCorrect();
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, isSessionComplete, currentIndex, totalInDeck, currentCard]);

  if (!isOpen) return null;

  // Percentage progress in current review list
  const currentProgressPercent =
    totalInDeck === 0 ? 0 : Math.round(((currentIndex + 1) / totalInDeck) * 100);

  // Overall mastered percentage in whole deck
  const overallMastered = cards.filter((c) => c.isFinished).length;
  const overallPercent =
    cards.length === 0 ? 0 : Math.round((overallMastered / cards.length) * 100);

  return (
    <div className={styles.overlay} onClick={onClose} role="dialog" aria-modal="true">
      <div
        className={styles.studyModal}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className={styles.header}>
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <BookOpen className="w-5 h-5" />
            </div>
            <div className="overflow-hidden">
              <h2 className="text-base font-bold text-slate-900 truncate">
                {flashcardSet?.title || "Ôn tập Flashcard"}
              </h2>
              <p className="text-xs text-slate-500">
                {cards.length} thẻ • Độ thuộc lòng toàn bộ:{" "}
                <span className="font-semibold text-blue-600">{overallPercent}%</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Filter buttons */}
            <div className="hidden sm:flex items-center p-1 bg-slate-100 rounded-xl text-xs font-medium text-slate-600">
              <button
                type="button"
                onClick={() => {
                  setFilterMode("all");
                  setCurrentIndex(0);
                  setIsFlipped(false);
                }}
                className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                  filterMode === "all"
                    ? "bg-white text-blue-600 font-semibold shadow-xs"
                    : "hover:text-slate-900"
                }`}
              >
                Tất cả ({cards.length})
              </button>
              <button
                type="button"
                onClick={() => {
                  setFilterMode("unmastered");
                  setCurrentIndex(0);
                  setIsFlipped(false);
                }}
                className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                  filterMode === "unmastered"
                    ? "bg-white text-rose-600 font-semibold shadow-xs"
                    : "hover:text-slate-900"
                }`}
              >
                Chưa thuộc ({cards.filter((c) => !c.isFinished).length})
              </button>
              <button
                type="button"
                onClick={() => {
                  setFilterMode("mastered");
                  setCurrentIndex(0);
                  setIsFlipped(false);
                }}
                className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                  filterMode === "mastered"
                    ? "bg-white text-emerald-600 font-semibold shadow-xs"
                    : "hover:text-slate-900"
                }`}
              >
                Đã thuộc ({cards.filter((c) => c.isFinished).length})
              </button>
            </div>

            {/* Shuffle button */}
            <button
              type="button"
              onClick={handleShuffle}
              className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
              title="Xáo trộn thứ tự thẻ"
            >
              <Shuffle className="w-4 h-4" />
            </button>

            {/* Close button */}
            <button
              type="button"
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
              aria-label="Đóng"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Progress Bar Track */}
        <div className={styles.progressBarTrack}>
          <div
            className={styles.progressBarFill}
            style={{ width: `${currentProgressPercent}%` }}
          />
        </div>

        {/* Main Body Play Area */}
        <div className={styles.bodyArea}>
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3 text-slate-400">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
              <p className="text-sm font-medium">Đang chuẩn bị bộ thẻ Flashcard...</p>
            </div>
          ) : totalInDeck === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 px-4 text-center max-w-md">
              <div className="w-14 h-14 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mb-3">
                <BrainCircuit className="w-7 h-7" />
              </div>
              <h3 className="text-base font-bold text-slate-800">
                {filterMode === "unmastered"
                  ? "Tuyệt vời! Không còn thẻ nào chưa thuộc!"
                  : filterMode === "mastered"
                  ? "Chưa có thẻ nào được đánh dấu đã thuộc."
                  : "Bộ thẻ này hiện chưa có câu hỏi nào."}
              </h3>
              <p className="text-xs text-slate-500 mt-1 mb-4">
                {filterMode === "unmastered"
                  ? "Bạn đã thuộc lòng tất cả các thẻ trong bộ này. Hãy luyện tập lại để củng cố trí nhớ!"
                  : "Bạn có thể chuyển bộ lọc hoặc tạo thêm thẻ mới để bắt đầu học."}
              </p>
              <div className="flex gap-2">
                {filterMode !== "all" && (
                  <button
                    type="button"
                    onClick={() => setFilterMode("all")}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold transition-colors cursor-pointer"
                  >
                    Xem tất cả thẻ
                  </button>
                )}
                <button
                  type="button"
                  onClick={handleResetProgress}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
                >
                  Đặt lại tiến độ (Reset)
                </button>
              </div>
            </div>
          ) : isSessionComplete ? (
            /* ── SESSION COMPLETE CELEBRATION ── */
            <div className="flex flex-col items-center justify-center py-6 px-4 text-center max-w-lg w-full animate-in fade-in zoom-in-95 duration-200">
              <div className="w-16 h-16 rounded-3xl bg-amber-100 text-amber-600 flex items-center justify-center mb-4 shadow-sm shadow-amber-500/20">
                <Trophy className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-black text-slate-900 tracking-tight">
                Hoàn thành phiên luyện tập!
              </h3>
              <p className="text-xs text-slate-500 mt-1 mb-6">
                Bạn đã duyệt qua toàn bộ {totalInDeck} thẻ trong danh sách này.
              </p>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-3 w-full mb-6">
                <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4 flex flex-col items-center">
                  <div className="flex items-center gap-1.5 text-emerald-700 text-xs font-bold mb-1">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Thuộc lòng (Đúng)</span>
                  </div>
                  <span className="text-2xl font-black text-emerald-800">
                    {sessionResults.correctCards.length}
                  </span>
                </div>

                <div className="bg-rose-50 border border-rose-100 rounded-2xl p-4 flex flex-col items-center">
                  <div className="flex items-center gap-1.5 text-rose-700 text-xs font-bold mb-1">
                    <XCircle className="w-4 h-4" />
                    <span>Cần ôn lại (Sai)</span>
                  </div>
                  <span className="text-2xl font-black text-rose-800">
                    {sessionResults.wrongCards.length}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-wrap items-center justify-center gap-3 w-full">
                {sessionResults.wrongCards.length > 0 && (
                  <button
                    type="button"
                    onClick={handleReviewWrongCards}
                    className="flex-1 min-w-[160px] py-2.5 px-4 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center justify-center gap-2"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Ôn lại các thẻ Sai ({sessionResults.wrongCards.length})</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => {
                    setCurrentIndex(0);
                    setIsFlipped(false);
                    setIsSessionComplete(false);
                    setSessionResults({ correctCards: [], wrongCards: [] });
                  }}
                  className="flex-1 min-w-[140px] py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center justify-center gap-2"
                >
                  <RotateCw className="w-3.5 h-3.5" />
                  <span>Học lại toàn bộ</span>
                </button>

                <button
                  type="button"
                  onClick={onClose}
                  className="py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                >
                  Quay lại danh sách
                </button>
              </div>
            </div>
          ) : (
            /* ── INTERACTIVE 3D FLIP CARD ── */
            <>
              {/* Card Counter & Mastery Badge */}
              <div className="w-full max-w-[42rem] flex items-center justify-between mb-2 text-xs font-medium text-slate-500 px-1">
                <span className="font-semibold text-slate-700">
                  Thẻ {currentIndex + 1} / {totalInDeck}
                </span>

                <div className="flex items-center gap-2">
                  {currentCard.isFinished ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-semibold text-[11px] border border-emerald-200">
                      <Check className="w-3 h-3" /> Đã thuộc
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 font-semibold text-[11px] border border-amber-200">
                      Chưa thuộc
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={handleFlipCard}
                    className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-700 font-semibold transition-colors cursor-pointer ml-1"
                  >
                    <RotateCw className="w-3.5 h-3.5" />
                    <span>Lật thẻ</span>
                  </button>
                </div>
              </div>

              {/* 3D Flip Card Container */}
              <div
                className={styles.cardPerspectiveContainer}
                onClick={handleFlipCard}
                title="Nhấn vào thẻ để lật xem đáp án (hoặc nhấn phím Space)"
              >
                <div
                  className={`${styles.cardInner} ${
                    isFlipped ? styles.cardFlipped : ""
                  }`}
                >
                  {/* Front Side: Question (Câu hỏi) */}
                  <div className={`${styles.cardFace} ${styles.cardFront}`}>
                    <div className="flex items-center justify-between text-xs text-blue-600 font-bold uppercase tracking-wider">
                      <span className="flex items-center gap-1.5">
                        <HelpCircle className="w-4 h-4" /> Câu hỏi
                      </span>
                      <span className="text-slate-400 font-normal lowercase text-[11px]">
                        nhấn để lật ↻
                      </span>
                    </div>

                    <div className={styles.cardQuestionText}>
                      {currentCard.question}
                    </div>

                    <div className="text-center text-[11px] text-slate-400 flex items-center justify-center gap-1">
                      <span>💡 Nhấn vào thẻ để xem câu trả lời</span>
                    </div>
                  </div>

                  {/* Back Side: Answer (Đáp án) */}
                  <div className={`${styles.cardFace} ${styles.cardBack}`}>
                    <div className="flex items-center justify-between text-xs text-emerald-700 font-bold uppercase tracking-wider">
                      <span className="flex items-center gap-1.5">
                        <Sparkles className="w-4 h-4" /> Đáp án
                      </span>
                      <span className="text-slate-400 font-normal lowercase text-[11px]">
                        đã lật thẻ
                      </span>
                    </div>

                    <div className={styles.cardAnswerText}>
                      {currentCard.answer}
                    </div>

                    <div className="text-center text-[11px] text-emerald-600 font-semibold">
                      <span>Đánh giá mức độ nhớ của bạn ở 2 nút bên dưới 👇</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons: "ĐÚNG" & "SAI" */}
              <div className={styles.actionsContainer}>
                <div className={styles.masteryButtonsRow}>
                  {/* Option "Sai" / "Chưa thuộc" */}
                  <button
                    type="button"
                    onClick={handleMarkWrong}
                    disabled={isUpdatingStatus}
                    className={styles.btnWrong}
                    title="Đánh dấu thẻ này chưa thuộc (Phím tắt: 1 hoặc S)"
                  >
                    <XCircle className="w-5 h-5" />
                    <span>Sai / Chưa thuộc (1)</span>
                  </button>

                  {/* Option "Đúng" / "Đã thuộc" */}
                  <button
                    type="button"
                    onClick={handleMarkCorrect}
                    disabled={isUpdatingStatus}
                    className={styles.btnCorrect}
                    title="Đánh dấu thẻ này đã thuộc (Phím tắt: 2 hoặc D)"
                  >
                    <CheckCircle2 className="w-5 h-5" />
                    <span>Đúng / Đã nhớ (2)</span>
                  </button>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer Navigation & Shortcuts Info */}
        <div className={styles.footerNav}>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrevCard}
              disabled={currentIndex === 0 || isSessionComplete || totalInDeck === 0}
              className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
              title="Thẻ trước (←)"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={handleNextCard}
              disabled={isSessionComplete || totalInDeck === 0}
              className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
              title="Thẻ tiếp theo (→)"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="hidden sm:flex items-center gap-2 text-[11px] text-slate-400">
            <span>Phím tắt:</span>
            <span className={styles.shortcutPill}>Space : Lật thẻ</span>
            <span className={styles.shortcutPill}>1 : Sai</span>
            <span className={styles.shortcutPill}>2 : Đúng</span>
            <span className={styles.shortcutPill}>← / → : Chuyển thẻ</span>
          </div>

          <button
            type="button"
            onClick={handleResetProgress}
            className="text-xs text-slate-500 hover:text-slate-800 transition-colors font-medium cursor-pointer"
          >
            Đặt lại từ đầu
          </button>
        </div>
      </div>
    </div>
  );
}
