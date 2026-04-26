import { useAuthStore } from "../store/AuthStore";

export default function PermissionGate({
  permission,
  children,
}: {
  permission: string;
  children: React.ReactNode;
}) {
  const { hasPermission } = useAuthStore();

  // 🔹 SUPER_ADMIN shortcut
  if (hasPermission("*")) return <>{children}</>;

  if (!hasPermission(permission)) return null;

  return <>{children}</>;
}