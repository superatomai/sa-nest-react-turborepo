<<<<<<< HEAD
import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Editor from "./pages/Editor";
import Login from "./pages/Login";
import { Navbar } from "./components/Navbar";
=======
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Editor from './pages/Editor';
import Projects from './pages/Projects';
>>>>>>> a61aae9d2b279ab535ba08138c8d24b3168b29a5

export function App() {
  return (
    <>
      <Routes>
        {/* Public login page */}
        <Route path="/login" element={<Login />} />

        {/* Home and Editor are protected */}
        <Route path="/" element={<Home />} />
        <Route path="/projects" element={<Projects />} />
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
