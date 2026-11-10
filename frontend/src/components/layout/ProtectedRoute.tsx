import { Navigate, Outlet, useLocation } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { Logo } from "../Logo";

export function ProtectedRoute() {
  const { status } = useAuth();
  const location = useLocation();

  if (status === "loading") {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center gap-5 bg-background px-6 text-center">
        <Logo />
        <span className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2
            className="h-4 w-4 animate-spin text-primary motion-reduce:animate-none"
            aria-hidden="true"
          />
          Restoring your session…
        </span>
      </div>
    );
  }

  if (status !== "authenticated") {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return <Outlet />;
}
