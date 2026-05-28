import { useMemo, useState } from "react";
import { useGetAuditLogsQuery } from "../../services/auditLogApi";

/* =========================================================
   COMPONENT
========================================================= */
const AdminAuditLogs = () => {
  const [page, setPage] = useState(1);
  const [viewMode, setViewMode] = useState<"table" | "list">("table");

  const [filters, setFilters] = useState({
    userId: "",
    entity: "",
    entityId: "",
  });

  const queryParams = useMemo(
    () => ({
      page,
      limit: 20,
      userId: filters.userId || undefined,
      entity: filters.entity || undefined,
      entityId: filters.entityId || undefined,
    }),
    [page, filters]
  );

  const { data, isLoading, isFetching, refetch } = useGetAuditLogsQuery(queryParams);

  /* =========================================================
     HELPERS
  ========================================================= */
  const getActionBadgeColor = (action: string) => {
    if (action.includes("CREATE")) return "bg-green-100 text-green-800";
    if (action.includes("UPDATE")) return "bg-blue-100 text-blue-800";
    if (action.includes("DELETE")) return "bg-red-100 text-red-800";
    if (action.includes("LOGIN")) return "bg-purple-100 text-purple-800";
    return "bg-gray-100 text-gray-800";
  };

  /* =========================================================
     RENDER
  ========================================================= */
  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 to-gray-100 p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* =====================================================
            HEADER
        ===================================================== */}
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-white p-6 shadow-sm">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">
              📜 Audit Logs
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Monitor system activities, user actions, and security events across the platform.
            </p>
          </div>

          <div className="flex gap-3">
            {/* View toggle */}
            <div className="flex rounded-xl border border-gray-200 bg-gray-50 p-1">
              <button
                onClick={() => setViewMode("table")}
                className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
                  viewMode === "table"
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                📋 Table
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
                  viewMode === "list"
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                📄 List
              </button>
            </div>

            <button
              type="button"
              onClick={() => refetch()}
              className="inline-flex items-center gap-2 rounded-xl bg-linear-to-r from-green-600 to-green-700 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:scale-105 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
            >
              🔄 Refresh Logs
            </button>
          </div>
        </div>

        {/* =====================================================
            FILTERS
        ===================================================== */}
        <div className="rounded-2xl bg-white p-6 shadow-sm">
          <div className="mb-5">
            <h2 className="text-lg font-semibold text-gray-800">🔍 Filters</h2>
            <p className="text-sm text-gray-500">Narrow down logs by user, entity, or resource ID.</p>
          </div>

          <div className="grid gap-5 md:grid-cols-3">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">User ID</label>
              <input
                type="text"
                value={filters.userId}
                onChange={(e) => setFilters((prev) => ({ ...prev, userId: e.target.value }))}
                placeholder="Filter by user ID"
                className="block w-full rounded-lg border border-gray-300 px-4 py-2.5 shadow-sm transition focus:border-green-500 focus:ring focus:ring-green-200"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Entity</label>
              <input
                type="text"
                value={filters.entity}
                onChange={(e) => setFilters((prev) => ({ ...prev, entity: e.target.value }))}
                placeholder="e.g. PRODUCT"
                className="block w-full rounded-lg border border-gray-300 px-4 py-2.5 shadow-sm transition focus:border-green-500 focus:ring focus:ring-green-200"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Entity ID</label>
              <input
                type="text"
                value={filters.entityId}
                onChange={(e) => setFilters((prev) => ({ ...prev, entityId: e.target.value }))}
                placeholder="Filter by entity ID"
                className="block w-full rounded-lg border border-gray-300 px-4 py-2.5 shadow-sm transition focus:border-indigo-500 focus:ring focus:ring-indigo-200"
              />
            </div>
          </div>

          <div className="mt-5 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => {
                setPage(1);
                refetch();
              }}
              className="rounded-xl bg-green-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-green-700"
            >
              Apply Filters
            </button>
            <button
              type="button"
              onClick={() => {
                setFilters({ userId: "", entity: "", entityId: "" });
                setPage(1);
              }}
              className="rounded-xl border border-gray-300 bg-white px-5 py-2.5 text-sm font-medium text-gray-700 shadow-sm transition hover:bg-gray-50"
            >
              Reset
            </button>
          </div>
        </div>

        {/* =====================================================
            STATUS BAR
        ===================================================== */}
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-white p-4 shadow-sm">
          <div className="text-sm text-gray-500">{data?.pagination?.total ?? 0} total audit log(s)</div>
          <div className="text-sm text-gray-500">{isFetching && "🔄 Updating logs..."}</div>
        </div>

        {/* =====================================================
            TABLE VIEW
        ===================================================== */}
        {viewMode === "table" && (
          <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      Action
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      Entity
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      IP Address
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      Metadata
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 bg-white">
                  {isLoading && (
                    <tr>
                      <td colSpan={6} className="px-6 py-10 text-center text-gray-500">
                        <div className="flex justify-center">
                          <div className="h-6 w-6 animate-spin rounded-full border-2 border-gray-300 border-t-indigo-600"></div>
                          <span className="ml-2">Loading audit logs...</span>
                        </div>
                      </td>
                    </tr>
                  )}
                  {!isLoading && data?.data.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-6 py-10 text-center text-gray-500">
                        📭 No audit logs found.
                      </td>
                    </tr>
                  )}
                  {!isLoading &&
                    data?.data.map((log) => (
                      <tr key={log.id} className="transition hover:bg-gray-50">
                        <td className="whitespace-nowrap px-6 py-4">
                          <span
                            className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${getActionBadgeColor(
                              log.action
                            )}`}
                          >
                            {log.action}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm font-medium text-gray-900">{log.entity}</div>
                          <div className="text-xs text-gray-500">{log.entityId || "—"}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm font-medium text-gray-900">{log.user?.name || "Unknown"}</div>
                          <div className="text-xs text-gray-500">{log.user?.email || log.userId}</div>
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600">
                          {log.ipAddress || "—"}
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600">
                          {new Date(log.createdAt).toLocaleString()}
                        </td>
                        <td className="max-w-xs px-6 py-4">
                          <pre className="overflow-auto rounded-lg bg-gray-100 p-3 text-xs text-gray-700">
                            {log.metadata ? JSON.stringify(log.metadata, null, 2) : "—"}
                          </pre>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* =====================================================
            LIST VIEW
        ===================================================== */}
        {viewMode === "list" && (
          <div className="space-y-4">
            {isLoading && (
              <div className="rounded-2xl bg-white p-10 text-center text-gray-500">
                <div className="flex justify-center">
                  <div className="h-6 w-6 animate-spin rounded-full border-2 border-gray-300 border-t-indigo-600"></div>
                  <span className="ml-2">Loading audit logs...</span>
                </div>
              </div>
            )}
            {!isLoading && data?.data.length === 0 && (
              <div className="rounded-2xl bg-white p-10 text-center text-gray-500">📭 No audit logs found.</div>
            )}
            {!isLoading &&
              data?.data.map((log) => (
                <div key={log.id} className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition hover:shadow-md">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${getActionBadgeColor(
                        log.action
                      )}`}
                    >
                      {log.action}
                    </span>
                    <span className="text-xs text-gray-400">{new Date(log.createdAt).toLocaleString()}</span>
                  </div>

                  <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div>
                      <p className="text-xs font-medium text-gray-500">Entity</p>
                      <p className="text-sm text-gray-900">{log.entity}</p>
                      {log.entityId && <p className="text-xs text-gray-500">ID: {log.entityId}</p>}
                    </div>
                    <div>
                      <p className="text-xs font-medium text-gray-500">User</p>
                      <p className="text-sm text-gray-900">{log.user?.name || "Unknown"}</p>
                      <p className="text-xs text-gray-500">{log.user?.email || log.userId}</p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-gray-500">IP Address</p>
                      <p className="text-sm text-gray-600">{log.ipAddress || "—"}</p>
                    </div>
                    <div className="col-span-full">
                      <p className="text-xs font-medium text-gray-500">Metadata</p>
                      <pre className="mt-1 max-h-40 overflow-auto rounded-lg bg-gray-100 p-3 text-xs text-gray-700">
                        {log.metadata ? JSON.stringify(log.metadata, null, 2) : "—"}
                      </pre>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        )}

        {/* =====================================================
            PAGINATION
        ===================================================== */}
        <div className="flex items-center justify-between rounded-2xl bg-white px-4 py-3 shadow-sm">
          <div>
            <p className="text-sm text-gray-700">
              Showing page <span className="font-medium">{data?.pagination?.page ?? page}</span> of{" "}
              <span className="font-medium">{data?.pagination?.totalPages ?? 1}</span>
            </p>
          </div>
          <div>
            <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="relative inline-flex items-center rounded-l-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              >
                Previous
              </button>
              <button
                onClick={() => setPage((p) => p + 1)}
                disabled={page >= (data?.pagination?.totalPages ?? 1)}
                className="relative inline-flex items-center rounded-r-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              >
                Next
              </button>
            </nav>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminAuditLogs;