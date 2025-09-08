// src/pages/LoginFlow.tsx
import { useUser, useOrganizations, SignedIn, SignedOut } from "@clerk/clerk-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const LoginFlow = () => {
  const { isSignedIn, user } = useUser();
  const { organizations, isLoaded } = useOrganizations(); // <-- correct hook
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isSignedIn || !user) return;
    if (!isLoaded) return; // wait until organizations are loaded

    if (organizations.length > 0) {
      // Navigate to first organization dashboard
      navigate(`/org/${organizations[0].id}/dashboard`);
    } else {
      // No organization exists → go to create org page
      navigate("/create-organization");
    }

    setLoading(false);
  }, [isSignedIn, user, isLoaded, organizations]);

  if (!isSignedIn || loading) return <div>Loading...</div>;

  return null; // only handles redirection
};

export default LoginFlow;
