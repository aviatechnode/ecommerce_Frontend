import { createApi } from "@reduxjs/toolkit/query/react";
import { axiosBaseQuery } from "../api/axiosBaseQuery";

export interface AuditLog {
  id: string;
  userId: string;
  action: string;
  entity: string;

  entityId?: string | null;
  ipAddress?: string | null;
  userAgent?: string | null;

  metadata?: unknown;

  createdAt: string;
  updatedAt: string;

  user?: {
    id: string;
    name: string;
    email: string;
  };
}

export interface CreateAuditLogPayload {
  userId: string;
  action: string;
  entity: string;

  entityId?: string;
  ipAddress?: string;
  userAgent?: string;

  metadata?: unknown;
}

export interface GetAuditLogsQuery {
  page?: number;
  limit?: number;

  userId?: string;
  entity?: string;
  entityId?: string;
}

export interface AuditLogsResponse {
  success: boolean;

  data: AuditLog[];

  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface CreateAuditLogResponse {
  success: boolean;
  message: string;
  data: AuditLog;
}

export const auditLogApi = createApi({
  reducerPath: "auditLogApi",

  baseQuery: axiosBaseQuery(),

  tagTypes: ["AuditLogs"],

  endpoints: (builder) => ({
    /* =========================================================
       CREATE AUDIT LOG
    ========================================================= */
    createAuditLog: builder.mutation<
      CreateAuditLogResponse,
      CreateAuditLogPayload
    >({
      query: (body) => ({
        url: "/api/audit-logs",
        method: "POST",
        data: body,
      }),

      invalidatesTags: ["AuditLogs"],
    }),

    /* =========================================================
       GET AUDIT LOGS
    ========================================================= */
    getAuditLogs: builder.query<
      AuditLogsResponse,
      GetAuditLogsQuery
    >({
      query: (params) => ({
        url: "/api/audit-logs",
        method: "GET",
        params,
      }),

      providesTags: ["AuditLogs"],
    }),
  }),
});

export const {
  useCreateAuditLogMutation,
  useGetAuditLogsQuery,
} = auditLogApi;