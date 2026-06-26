import { useAuth } from "@/hooks/useAuth";
import { Navigate, useLocation } from "react-router-dom";
import { logAuthDebug } from "@/lib/authDebugLog";

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading, roleLoading, userRole } = useAuth();
  const location = useLocation();

  if (loading || (user && roleLoading)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    logAuthDebug("redirect", "ProtectedRoute → /login (no user)", { from: location.pathname });
    return <Navigate to="/login" state={{ from: location, bouncedFrom: location.pathname }} replace />;
  }

  // Only redirect to onboarding once role lookup has *completed* and confirmed no role exists
  if (!userRole && location.pathname !== "/onboarding") {
    logAuthDebug("redirect", "ProtectedRoute → /onboarding (no role)");
    return <Navigate to="/onboarding" replace />;
  }

  return <>{children}</>;
}
