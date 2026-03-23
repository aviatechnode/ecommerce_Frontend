import { Navigate } from "react-router-dom";
import { useAuthStore } from "../store/AuthStore";
import type { JSX } from "react";

interface Props {
  children: JSX.Element;
  allowedRoles?: string[];
  requiredPermissions?: string[];
}

export default function RoleProtectedRoute({
  children,
  allowedRoles,
  requiredPermissions,
}: Props) {
  const { user, loading, hasPermission } = useAuthStore();

  if (loading) return null;

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  // 🔹 Role check
  if (
    allowedRoles &&
    !allowedRoles.includes(user.roleName)
  ) {
    return <Navigate to="/unauthorized" replace />;
  }

  // 🔹 Permission check
  if (
    requiredPermissions &&
    !requiredPermissions.every((p) =>
      hasPermission(p)
    )
  ) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
}