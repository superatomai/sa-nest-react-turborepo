// src/components/Navbar.tsx
import { 
  SignedIn, 
  UserButton, 
  SignOutButton, 
  OrganizationSwitcher
} from "@clerk/clerk-react";
import { Link } from "react-router-dom";


export function Navbar() {
  return (
    <SignedIn>
      <nav className="flex items-center gap-4 p-4">
        <Link to="/">Home</Link>
        <Link to="/editor">Editor</Link>
        <Link to="/projects">Projects</Link>
        
        <div className="ml-auto flex items-center gap-4">
          <OrganizationSwitcher />
          <UserButton />
          <SignOutButton redirectUrl="/login">
            <button className="px-4 py-2 bg-blue-500 text-white rounded cursor-pointer">
              Sign out
            </button>
          </SignOutButton>
        </div>
      </nav>
    </SignedIn>
  );
}