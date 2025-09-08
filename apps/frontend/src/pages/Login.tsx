import React from "react";
import { SignIn } from "@clerk/clerk-react";

const Login = () => {
  return (
    <div className="flex items-center justify-center min-h-screen">
      {/* Clerk's SignIn component */}
      <SignIn routing="path" path="/login" />
    </div>
  );
};

export default Login;
