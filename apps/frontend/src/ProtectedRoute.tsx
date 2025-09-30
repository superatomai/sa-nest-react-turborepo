import { SignedIn, SignedOut } from "@clerk/clerk-react";
import { JSX } from "react";
import { Navigate } from "react-router-dom";

type ProtectedRouteProps = {
	children: JSX.Element;
};

export function ProtectedRoute({ children }: ProtectedRouteProps) {
	return (
		<>
			<SignedIn>{children}</SignedIn>
			<SignedOut>
				<Navigate to="/login" replace />
			</SignedOut>
		</>
	);
}
