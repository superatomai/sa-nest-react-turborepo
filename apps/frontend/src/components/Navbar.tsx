// src/components/Navbar.tsx
import { SignedIn, SignedOut, UserButton, SignOutButton } from "@clerk/clerk-react";
import { Link } from "react-router-dom";

export function Navbar() {
  return (
    <SignedIn>
      <nav className="flex items-center gap-4 p-4">
        <Link to="/">Home</Link>
        <Link to="/editor">Editor</Link>

        <div className="ml-auto flex items-center gap-2">
          <UserButton />
          <SignOutButton redirectUrl="/login">
            <button>Sign out</button>
          </SignOutButton>
        </div>
      </nav>
    </SignedIn>
  );
}
