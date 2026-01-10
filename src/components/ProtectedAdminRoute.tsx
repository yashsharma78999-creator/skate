import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

interface ProtectedAdminRouteProps {
  children: React.ReactNode;
}

/**
 * Protected route component for admin pages
 * Handles auth loading state and redirects unauthenticated users
 */
export default function ProtectedAdminRoute({
  children,
}: ProtectedAdminRouteProps) {
  const { user, isAdmin, isLoading } = useAuth();

  console.log("[ProtectedAdminRoute] Check - isLoading:", isLoading, "user:", user, "isAdmin:", isAdmin);

  // Show loading state while auth is being checked
  if (isLoading) {
    console.log("[ProtectedAdminRoute] Showing loading state...");
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="mb-4 h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600 mx-auto" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated or not admin
  if (!user || !isAdmin) {
    console.log("[ProtectedAdminRoute] Redirecting to login - user exists:", !!user, "isAdmin:", isAdmin);
    return <Navigate to="/admin/login" replace />;
  }

  console.log("[ProtectedAdminRoute] Access granted to admin user:", user.id);
  // Render protected content
  return <>{children}</>;
}
