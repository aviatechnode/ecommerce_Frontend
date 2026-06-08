import type { ReactNode } from "react";
import { useMeQuery } from "../services/authApi";

export default function PermissionGate({
  permission,
  children,
}: {
  permission: string;
  children: ReactNode;
}) {
  const { data, isLoading } = useMeQuery();

  if (isLoading) return null;

  const user = data?.user;

  // no user = no access
  if (!user) return null;

  // super admin override
  if (user.roleName === "SUPER_ADMIN") {
    return <>{children}</>;
  }

  // permission check from backend-provided array
  const hasPermission =
    user.permissions?.includes(permission);

  if (!hasPermission) return null;

  return <>{children}</>;
}