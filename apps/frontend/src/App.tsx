import { Routes, Route, useLocation, Navigate, useParams, useNavigate, matchPath, useMatch } from "react-router-dom";
import {
  OrganizationProfile,
  useAuth,
  SignedIn,
} from "@clerk/clerk-react";
import "./styles/design-system.css";
import Home from "./pages/Home";
import Editor from "./pages/Editor";
import Login from "./pages/Login";
import Projects from "./pages/Project/Projects";
// import { Navbar } from "./components/Navbar";
import  AppSidebar  from "./components/Sidebar";
import { SidebarProvider } from "./components/ui/sidebar";
import { ProtectedRoute } from "./ProtectedRoute";
import CreateOrganizationWrapper from "./components/CreateOrganization";
import { useEffect, useRef } from "react";
import { useOrganization } from "@clerk/clerk-react";
import orgStore from "./stores/mobx_org_store";
import { projectStore } from "./stores/mobx_project_store";
import { motion, AnimatePresence } from "framer-motion";
import SignUpPage from "./pages/SignUp";
import { Toaster } from "react-hot-toast";
import ProjApiKeys from "./pages/Project/ProjApiKeys";
import ProjDoc from "./pages/Project/ProjDoc";
import ProjDesignSys from "./pages/Project/ProjDesignSys";
import ProjLogsV2 from "./pages/Project/ProjLogsV2";

export function App() {
  const { organization, isLoaded: orgLoaded } = useOrganization();
  const { isSignedIn, isLoaded: authLoaded } = useAuth();
  const location = useLocation();
  const params = useParams();
  const navigate = useNavigate();
  const prevOrgIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (orgLoaded) {
      const currentOrgId = organization?.id || null;
      const previousOrgId = prevOrgIdRef.current;

      // Update the org store
      if (organization?.id) {
        orgStore.setOrgId(organization.id);
      } else if (!organization) {
        orgStore.setOrgId(null);
      }

      // If organization changed (not initial load) and user is signed in, reset project store and navigate to /projects
      if (previousOrgId !== null && previousOrgId !== currentOrgId && isSignedIn) {
        projectStore.resetPagination();
        navigate('/projects');
      }

      // Update the ref to track the current org ID
      prevOrgIdRef.current = currentOrgId;
    }
  }, [orgLoaded, organization?.id, navigate, isSignedIn]);

  const match = useMatch("/projects/:projectId/:maybeUiId");
  const hideSidebar =
    match &&
    !["api-keys", "documentation", "design-system", "project-logs"].includes(
      match.params.maybeUiId || ""
    );

  const isPublicRoute = [
    "/login",
    "/sign-up",
    "/login/sso-callback",
    "/sign-in/sso-callback",
    "/sign-up/sso-callback",
  ].some(path => location.pathname.startsWith(path));

  // Show loading state while Clerk is initializing
  if (!authLoaded || !orgLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  // Now we know for sure the auth state is loaded
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
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.15, ease: "easeOut" }}
        className="h-screen overflow-auto w-full flex-1"
      >
        <Routes>
          <Route path="/login" element={<Navigate to="/projects" replace />} />
          <Route path="/sign-up" element={<Navigate to="/projects" replace />} />
          <Route path = '/' element={<Navigate to="/projects" replace />}/>
          {/* <Route
            path="/"
            element={
              <ProtectedRoute>
                <Home />
              </ProtectedRoute>
            }
          /> */}

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
            path="projects/:projectId/api-keys" 
            element={
              <ProtectedRoute>
                <ProjApiKeys/>
              </ProtectedRoute>
          }/>

          <Route
            path="projects/:projectId/documentation"
            element={
              <ProtectedRoute>
                <ProjDoc/>
              </ProtectedRoute>
            }
          />

          <Route
            path="projects/:projectId/design-system"
            element={
              <ProtectedRoute>
                <ProjDesignSys/>
              </ProtectedRoute>
            }
          />

          {/* Project Logs with 24h Persistence */}
          <Route
            path="projects/:projectId/project-logs"
            element={
              <ProtectedRoute>
                <ProjLogsV2/>
              </ProtectedRoute>
            }
          />

          <Route
            path="/projects/:projectId/:uiId"
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
      </motion.div>
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
