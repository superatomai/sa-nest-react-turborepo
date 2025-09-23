import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { ClerkProvider } from "@clerk/clerk-react";
import { App } from "./App";
import { trpc, trpcClient } from "./utils/trpc";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import "./index.css";

interface SAEditorType{
  text: string,
  className: string,
  nodeId?: string,
  hasText?: boolean
}

declare global {
  interface Window {
    SAEDITOR: SAEditorType
  }
}

window.SAEDITOR = {
  text: "",
  className: "",
  nodeId: undefined,
  hasText: false
}

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;
if (!PUBLISHABLE_KEY) {
  throw new Error("Missing Clerk Publishable Key in .env");
}

const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ClerkProvider 
      publishableKey={PUBLISHABLE_KEY}
      signInFallbackRedirectUrl="/projects"
      signUpFallbackRedirectUrl="/projects"
      afterSignOutUrl="/login"
      signInUrl="/login"
      signUpUrl="/sign-up" 
    >
      <QueryClientProvider client={queryClient}>
        <trpc.Provider client={trpcClient} queryClient={queryClient}>
          <BrowserRouter>
            <App />
          </BrowserRouter>
        </trpc.Provider>
      </QueryClientProvider>
    </ClerkProvider>
  </React.StrictMode>
);