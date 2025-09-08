// src/pages/Login.tsx
import { SignIn } from "@clerk/clerk-react";
import { LoginFlow } from "../components/LoginFlow";

const Login = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-4">
      <SignIn routing="path" path="/login" />
      <LoginFlow />
    </div>
  );
};

export default Login;
