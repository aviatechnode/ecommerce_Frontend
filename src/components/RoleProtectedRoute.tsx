import { Navigate } from "react-router-dom";
import { useMeQuery } from "../services/authApi";
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
  const { data, isLoading } = useMeQuery();

  const user = data?.user;

  // 🔥 wait until auth state is resolved from server
  if (isLoading) return null;

  // 🔥 not authenticated → redirect
  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  // 🔥 SUPER ADMIN OVERRIDE (always allowed)
  const isSuperAdmin = user.roleName === "SUPER_ADMIN";

  if (isSuperAdmin) {
    return children;
  }

  // 🔥 ROLE CHECK
  if (
    allowedRoles &&
    allowedRoles.length > 0 &&
    !allowedRoles.includes(user.roleName)
  ) {
    return <Navigate to="/unauthorized" replace />;
  }

  // 🔥 PERMISSION CHECK
  if (
    requiredPermissions &&
    requiredPermissions.length > 0 &&
    !requiredPermissions.every((p) =>
      user.permissions.includes(p)
    )
  ) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
}