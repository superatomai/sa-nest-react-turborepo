import { Routes, Route, useLocation } from "react-router-dom";
import { OrganizationProfile, SignIn, useAuth } from "@clerk/clerk-react";
import Home from "./pages/Home";
import Editor from "./pages/Editor";
import Login from "./pages/Login";
import Projects from "./pages/Projects";
import { Navbar } from "./components/Navbar";
import { AppSidebar } from "./components/Sidebar";
import { SidebarProvider } from "./components/ui/sidebar";
import { ProtectedRoute } from "./ProtectedRoute";
import CreateOrganizationWrapper from "./components/CreateOrganization";
import { useEffect } from "react";
import { useOrganization } from "@clerk/clerk-react";
import orgStore from "./stores/mobx_org_store";

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
  const isPublicRoute = ["/login", "/login/sso-callback", "/sign-in/sso-callback", "/sign-up/sso-callback"].includes(location.pathname);

  if (isPublicRoute || !isSignedIn) {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/login/sso-callback" element={<SignIn routing="path" path="/login" />} />
        <Route path="/sign-in/sso-callback" element={<SignIn routing="path" path="/login" />} />
        <Route path="/sign-up/sso-callback" element={<SignIn routing="path" path="/login" />} />
        <Route path="*" element={<Login />} />
      </Routes>
    );
  }

  return (
    <SidebarProvider className="overflow-hidden">
  
      <div className="">
        {
         !hideSidebar && <AppSidebar  />
        }
        </div>
          {/* {!hideNavbar && <Navbar />} */}
          <div className="h-screen overflow-auto w-full flex-1">
            <Routes >
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

              <Route
                path="/create-organization"
                element={
                  <ProtectedRoute>
                    <CreateOrganizationWrapper />
                  </ProtectedRoute>
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
            
          
    </SidebarProvider>
  );
}