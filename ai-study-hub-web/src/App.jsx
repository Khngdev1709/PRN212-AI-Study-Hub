import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Welcome from "./authenticationPages/Welcome";
import Login from "./authenticationPages/Login";
import Register from "./authenticationPages/Register";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Welcome />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Routes>
    </Router>
  );
}

export default App;
