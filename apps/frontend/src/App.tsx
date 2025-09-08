import { Routes, Route } from "react-router-dom";
import { OrganizationProfile, SignIn } from "@clerk/clerk-react";
import Home from "./pages/Home";
import Editor from "./pages/Editor";
import Login from "./pages/Login";
import Projects from "./pages/Projects";
import { Navbar } from "./components/Navbar";
import { ProtectedRoute } from "./ProtectedRoute";
import CreateOrganizationWrapper from "./components/CreateOrganization";
import { useEffect } from "react";
import { useOrganization } from "@clerk/clerk-react";
import orgStore from "./stores/mobx_org_store";

export function App() {
  const { organization, isLoaded } = useOrganization();

  useEffect(() => {
    if (isLoaded) {
      orgStore.setOrgId(organization?.id ?? null);
    }
  }, [isLoaded, organization]);

  const hideNavbar = location.pathname.startsWith("/editor");

  return (
    <>
      {!hideNavbar &&  <Navbar />}
      <Routes>
        {/* Public login page */}
        <Route path="/login" element={<Login />} />

        {/* Clerk SSO callback routes - these handle OAuth redirects */}
        <Route
          path="/login/sso-callback"
          element={<SignIn routing="path" path="/login" />}
        />
        <Route
          path="/sign-in/sso-callback"
          element={<SignIn routing="path" path="/login" />}
        />
        <Route
          path="/sign-up/sso-callback"
          element={<SignIn routing="path" path="/login" />}
        />

        {/* Protected routes */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          }
        />

        <Route
          path="/editor"
          element={
            <ProtectedRoute>
              <Editor />
            </ProtectedRoute>
          }
        />

        <Route
          path="/projects"
          element={
            <ProtectedRoute>
              <Projects />
            </ProtectedRoute>
          }
        />

        <Route
          path="/editor/:uiId"
          element={
            <ProtectedRoute>
              <Editor />
            </ProtectedRoute>
          }
        />

        {/* Optional: Keep this if you want a manual org creation route */}
        <Route
          path="/create-organization"
          element={
            <ProtectedRoute>
              <CreateOrganizationWrapper />
            </ProtectedRoute>
          }
        />

        {/* REMOVE THIS ROUTE - Let Clerk handle it internally */}

        {/* <Route
          path="/login/tasks/choose-organization"
          element={
            <ProtectedRoute>
              <CreateOrganization/>
            </ProtectedRoute>
          }
        /> */}

        <Route
          path="/organization-profile"
          element={
            <ProtectedRoute>
              <div className="flex items-center justify-center min-h-screen">
                <OrganizationProfile />
              </div>
            </ProtectedRoute>
          }
        />
      </Routes>
    </>
  );
}
