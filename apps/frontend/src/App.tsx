import { Routes, Route, useLocation, Navigate } from "react-router-dom";
import {
  OrganizationProfile,
  SignIn,
  SignUp,
  useAuth,
  SignedIn,
} from "@clerk/clerk-react";
import Home from "./pages/Home";
import Editor from "./pages/Editor";
import Login from "./pages/Login";
import Projects from "./pages/Projects";
// import { Navbar } from "./components/Navbar";
import { AppSidebar } from "./components/Sidebar";
import { SidebarProvider } from "./components/ui/sidebar";
import { ProtectedRoute } from "./ProtectedRoute";
import CreateOrganizationWrapper from "./components/CreateOrganization";
import { useEffect } from "react";
import { useOrganization } from "@clerk/clerk-react";
import orgStore from "./stores/mobx_org_store";
import SignUpPage from "./pages/SignUp";
import { Toaster } from "react-hot-toast";

export function App() {
  const { organization, isLoaded } = useOrganization();
  const { isSignedIn } = useAuth();
  const location = useLocation();

  useEffect(() => {
    if (isLoaded) {
      orgStore.setOrgId(organization?.id ?? null);
    }
  }, [isLoaded, organization]);

  const hideSidebar = location.pathname.startsWith("/editor");
  const isPublicRoute = [
    "/login",
    "/sign-up",
    "/login/sso-callback",
    "/sign-in/sso-callback",
    "/sign-up/sso-callback",
  ].some(path => location.pathname.startsWith(path));

  if (!isSignedIn) {
    if (isPublicRoute) {
      return (
        <Routes>
          <Route path="/login/*" element={<Login />} />
          <Route path="/sign-up/*" element={<SignUpPage />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      );
    }
    return <Navigate to="/login" replace />;
  }

  return (
    <SidebarProvider className="overflow-hidden">
      <div className="">{!hideSidebar && <AppSidebar />}</div>
      {/* {!hideNavbar && <Navbar />} */}
      <div className="h-screen overflow-auto w-full flex-1">
        <Routes>
          <Route path="/login" element={<Navigate to="/" replace />} />
          <Route path="/sign-up" element={<Navigate to="/" replace />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Home />
              </ProtectedRoute>
            }
          />

          {/* <Route path="/Schema" element={<Schema />} /> */}

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

          <Route
            path="/create-organization"
            element={
              <SignedIn>
                <CreateOrganizationWrapper />
              </SignedIn>
            }
          />

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
      </div>
      <Toaster
        position="top-center"
        reverseOrder={false}
        toastOptions={{
          duration: 3000, // default duration 3s
          style: {
            fontSize: "14px",
          },
        }}
      />
    </SidebarProvider>
  );
}
