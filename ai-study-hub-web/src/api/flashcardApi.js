import axiosClient from "./axiosClient";

/**
 * =========================================================================
 * FLASHCARD API SERVICE
 * Connects directly to PRN212.AIStudyHub Backend (FlashcardController & AIController).
 * Uses real Database records associated with the authenticated user.
 * =========================================================================
 */

// Clean up any stale mock keys in localStorage if previously stored
if (typeof window !== "undefined") {
  try {
    localStorage.removeItem("ai_study_hub_flashcard_sets");
    localStorage.removeItem("ai_study_hub_flashcard_items");
  } catch (e) {
    // ignore
  }
}

export const flashcardApi = {
  /**
   * 1. GET ALL FLASHCARD SETS OF CURRENT USER
   * GET /api/v1/flashcards/sets
   */
  async getMySets() {
    const res = await axiosClient.get("/flashcards/sets");
    const payload = res.data?.data ?? res.data?.Data ?? res.data;
    return Array.isArray(payload) ? payload : [];
  },

  /**
   * 2. GET SET DETAIL BY ID
   * GET /api/v1/flashcards/sets/{setId}
   */
  async getSetById(setId) {
    const res = await axiosClient.get(`/flashcards/sets/${setId}`);
    return res.data?.data ?? res.data?.Data ?? res.data;
  },

  /**
   * 3. CREATE FLASHCARD SET
   * POST /api/v1/flashcards/sets
   */
  async createSet({ title, description, documentId = null }) {
    const res = await axiosClient.post("/flashcards/sets", {
      title: title.trim(),
      description: description?.trim() || null,
      documentId: documentId || null,
    });
    return res.data?.data ?? res.data?.Data ?? res.data;
  },

  /**
   * 4. UPDATE FLASHCARD SET
   * PUT /api/v1/flashcards/sets/{setId}
   */
  async updateSet(setId, { title, description }) {
    const res = await axiosClient.put(`/flashcards/sets/${setId}`, {
      title: title.trim(),
      description: description?.trim() || null,
    });
    return res.data?.data ?? res.data?.Data ?? res.data;
  },

  /**
   * 5. DELETE FLASHCARD SET
   * DELETE /api/v1/flashcards/sets/{setId}
   */
  async deleteSet(setId) {
    const res = await axiosClient.delete(`/flashcards/sets/${setId}`);
    return res.data?.data ?? res.data?.Data ?? true;
  },

  /**
   * 6. GET FLASHCARD ITEMS IN SET
   * GET /api/v1/flashcards/sets/{setId}/items?isFinished=...
   */
  async getCards(setId, isFinished = null) {
    let url = `/flashcards/sets/${setId}/items`;
    if (typeof isFinished === "boolean") {
      url += `?isFinished=${isFinished}`;
    }
    const res = await axiosClient.get(url);
    const payload = res.data?.data ?? res.data?.Data ?? res.data;
    return Array.isArray(payload) ? payload : [];
  },

  /**
   * 7. GET PROGRESS OF SET
   * GET /api/v1/flashcards/sets/{setId}/progress
   */
  async getProgress(setId) {
    const res = await axiosClient.get(`/flashcards/sets/${setId}/progress`);
    return res.data?.data ?? res.data?.Data ?? res.data;
  },

  /**
   * 8. UPDATE FLASHCARD STATUS (Đúng = true / Sai = false)
   * PUT /api/v1/flashcards/items/{cardId}/status
   */
  async updateCardStatus(cardId, isFinished) {
    const res = await axiosClient.put(`/flashcards/items/${cardId}/status`, {
      isFinished: Boolean(isFinished),
    });
    return res.data?.data ?? res.data?.Data ?? res.data;
  },

  /**
   * 9. TOGGLE FLASHCARD STATUS (1-tap toggle)
   * PATCH /api/v1/flashcards/items/{cardId}/toggle
   */
  async toggleCardStatus(cardId) {
    const res = await axiosClient.patch(`/flashcards/items/${cardId}/toggle`);
    return res.data?.data ?? res.data?.Data ?? res.data;
  },

  /**
   * 10. RESET PROGRESS OF SET (set all isFinished = false)
   * POST /api/v1/flashcards/sets/{setId}/reset
   */
  async resetProgress(setId) {
    const res = await axiosClient.post(`/flashcards/sets/${setId}/reset`);
    return res.data?.data ?? res.data?.Data ?? true;
  },

  /**
   * 11. CREATE CARD MANUALLY
   * POST /api/v1/flashcards/sets/{setId}/items
   */
  async createCard(setId, { question, answer }) {
    const res = await axiosClient.post(`/flashcards/sets/${setId}/items`, {
      question: question.trim(),
      answer: answer.trim(),
    });
    return res.data?.data ?? res.data?.Data ?? res.data;
  },

  /**
   * 12. UPDATE CARD CONTENT
   * PUT /api/v1/flashcards/items/{cardId}
   */
  async updateCard(cardId, { question, answer }) {
    const res = await axiosClient.put(`/flashcards/items/${cardId}`, {
      question: question.trim(),
      answer: answer.trim(),
    });
    return res.data?.data ?? res.data?.Data ?? res.data;
  },

  /**
   * 13. DELETE CARD
   * DELETE /api/v1/flashcards/items/{cardId}
   */
  async deleteCard(cardId) {
    const res = await axiosClient.delete(`/flashcards/items/${cardId}`);
    return res.data?.data ?? res.data?.Data ?? true;
  },

  /**
   * 14. GENERATE FLASHCARDS VIA AI
   * POST /api/v1/ai/flashcards
   */
  async generateCardsWithAI(setId, documentContent = "") {
    const res = await axiosClient.post("/ai/flashcards", {
      flashcardSetId: setId,
      documentContent: (documentContent || "").trim(),
    });
    const payload = res.data?.data ?? res.data?.Data ?? res.data;
    return Array.isArray(payload) ? payload : [];
  },
};

export default flashcardApi;
