import { Routes, Route, useLocation, Navigate, useParams } from "react-router-dom";
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
import { useEffect } from "react";
import { useOrganization } from "@clerk/clerk-react";
import orgStore from "./stores/mobx_org_store";
import SignUpPage from "./pages/SignUp";
import { Toaster } from "react-hot-toast";
import ProjApiKeys from "./pages/Project/ProjApiKeys";
import ProjDoc from "./pages/Project/ProjDoc";
import ProjDesignSys from "./pages/Project/ProjDesignSys";
import ProjLogs from "./pages/Project/ProjLogs";

export function App() {
  const { organization, isLoaded: orgLoaded } = useOrganization();
  const { isSignedIn, isLoaded: authLoaded } = useAuth();
  const location = useLocation();
  const params = useParams();

  useEffect(() => {
  if (orgLoaded) {
    if (organization?.id) {
      orgStore.setOrgId(organization.id);
    }
    else if (!organization) {
      orgStore.setOrgId(null);
    }
  }
}, [orgLoaded, organization?.id, params]);

  const hideSidebar = location.pathname.startsWith("/editor");
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
      <div className="h-screen overflow-auto w-full flex-1">
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

          <Route
            path="projects/:projectId/project-logs"
            element={
              <ProtectedRoute>
                <ProjLogs/>
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
