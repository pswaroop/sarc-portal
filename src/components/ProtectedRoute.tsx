import { Navigate, useLocation } from "react-router-dom";
import { useAuth, canAccess } from "@/contexts/AuthContext";
import type { Role } from "@/types";
import { ReactNode } from "react";

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles?: Role[];
}

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && !canAccess(user.role, allowedRoles)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}
