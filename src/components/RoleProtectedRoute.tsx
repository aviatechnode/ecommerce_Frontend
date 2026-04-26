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
  const { user, hydrated, hasPermission } = useAuthStore();

  // 🔥 wait until auth state is fully resolved
  if (!hydrated) return null;

  // 🔥 only redirect AFTER hydration completes
  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  // 🔥 super admin override (clean + reliable)
  if (user.isSuperAdmin) {
    return children;
  }

  // 🔥 role check
  if (allowedRoles && !allowedRoles.includes(user.roleName)) {
    return <Navigate to="/unauthorized" replace />;
  }

  // 🔥 permission check
  if (
    requiredPermissions &&
    !requiredPermissions.every((p) => hasPermission(p))
  ) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
}