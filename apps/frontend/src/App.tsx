import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Editor from "./pages/Editor";
import Login from "./pages/Login";
import { Navbar } from "./components/Navbar";

export function App() {
  return (
    <>
      <Routes>
        {/* Public login page */}
        <Route path="/login" element={<Login />} />

        {/* Home and Editor are protected */}
        <Route path="/" element={<Home />} />
        <Route path="/editor" element={<Editor />} />

        {/* Organization pages */}
        <Route path="/create-organization" element={<div>Create Organization Page</div>} />
        <Route path="/org/:orgId/dashboard" element={<div>Organization Dashboard</div>} />
      </Routes>

      {/* Show Navbar only if signed in */}
      <Navbar />
    </>
  );
}
