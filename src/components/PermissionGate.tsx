import { useAuthStore } from "../store/AuthStore";

export default function PermissionGate({
  permission,
  children,
}: {
  permission: string;
  children: React.ReactNode;
}) {
  const { hasPermission } = useAuthStore();

  if (!hasPermission(permission)) return null;

  return <>{children}</>;
}