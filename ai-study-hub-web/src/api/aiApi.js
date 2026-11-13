import axiosClient from "./axiosClient";

/**
 * =========================================================================
 * AI API SERVICE
 * Connects directly to PRN212.AIStudyHub AIController (/api/v1/ai/...)
 * =========================================================================
 */
export const aiApi = {
  /**
   * 1. TẠO FLASHCARDS TỰ ĐỘNG BẰNG AI
   * POST /api/v1/ai/flashcards
   */
  async generateFlashcards(flashcardSetId, documentContent = "") {
    const res = await axiosClient.post("/ai/flashcards", {
      flashcardSetId,
      documentContent: documentContent || "",
    });
    return res.data?.data ?? res.data?.Data ?? res.data;
  },

  /**
   * 2. TẠO TÓM TẮT TÀI LIỆU BẰNG AI
   * POST /api/v1/ai/summarize
   */
  async summarizeDocument(documentId, documentContent = "") {
    const res = await axiosClient.post("/ai/summarize", {
      documentId,
      documentContent: documentContent || "",
    });
    return res.data?.data ?? res.data?.Data ?? res.data;
  },

  /**
   * 3. LẤY BẢN TÓM TẮT CỦA TÀI LIỆU
   * GET /api/v1/ai/summary/{documentId}
   */
  async getDocumentSummary(documentId) {
    const res = await axiosClient.get(`/ai/summary/${documentId}`);
    return res.data?.data ?? res.data?.Data ?? res.data;
  },
};

export default aiApi;
