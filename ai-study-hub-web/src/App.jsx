import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Welcome from "./authenticationPages/Welcome";
import Login from "./authenticationPages/Login";
import Register from "./authenticationPages/Register";
import MainLayout from "./layouts/MainLayout";
import ProtectedRoute from "./components/ProtectedRoute";
import Dashboard from "./mainPages/Dashboard";
import SubjectsPage from "./mainPages/DocumentPage/SubjectsPage";
import SubjectDocumentsPage from "./mainPages/DocumentPage/SubjectDocumentsPage";
import ChatboxPage from "./mainPages/ChatboxPage/ChatboxPage";
import FlashcardsPage from "./mainPages/FlashcardPage/FlashcardsPage";

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Welcome />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected App Routes inside MainLayout */}
        <Route element={<ProtectedRoute />}>
          <Route element={<MainLayout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/subjects" element={<SubjectsPage />} />
            <Route path="/subjects/:subjectId/documents" element={<SubjectDocumentsPage />} />
            <Route path="/documents" element={<SubjectsPage />} />
            <Route path="/courses" element={<Navigate to="/subjects" replace />} />
            <Route path="/flashcards" element={<FlashcardsPage />} />
            <Route path="/flashcards/:setId" element={<FlashcardsPage />} />
            <Route path="/ai-assistant" element={<ChatboxPage />} />
            <Route path="/chat" element={<ChatboxPage />} />
            <Route path="/chat/:sessionId" element={<ChatboxPage />} />
            <Route path="/shared" element={<Dashboard />} />
            <Route path="/settings" element={<Dashboard />} />
            <Route path="/profile" element={<Dashboard />} />
          </Route>
        </Route>

        {/* Fallback route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
