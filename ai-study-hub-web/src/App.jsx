import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Welcome from "./authenticationPages/Welcome";
import Login from "./authenticationPages/Login";
import Register from "./authenticationPages/Register";
import MainLayout from "./layouts/MainLayout";
import ProtectedRoute from "./components/ProtectedRoute";
import Dashboard from "./mainPages/Dashboard";

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
            {/* Placeholder routes matching sidebar navigation */}
            <Route path="/documents" element={<Dashboard />} />
            <Route path="/courses" element={<Dashboard />} />
            <Route path="/ai-assistant" element={<Dashboard />} />
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
