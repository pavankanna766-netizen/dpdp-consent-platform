"use client";

import { useState } from "react";
import Link from "next/link";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { RequestStatusBadge } from "./request-status-badge";
import { DataTable } from "@/components/table";

interface RequestItem {
  id: string;
  subject_identifier: string;
  request_type: string;
  status: string;
  created_at: string;
}

export function RequestsTable({ requests }: { requests: RequestItem[] }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const filtered = requests.filter((req) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      !q ||
      req.subject_identifier.toLowerCase().includes(q) ||
      req.request_type.toLowerCase().includes(q);

    const matchesStatus =
      statusFilter === "all" || req.status.toLowerCase() === statusFilter.toLowerCase();

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-4">
      {/* Search & Filter Toolbar */}
      <div className="flex flex-col gap-4 rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
          <Input
            type="text"
            placeholder="Search subject email / identifier..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 text-xs"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-md border border-gray-300 bg-white px-3 py-2 text-xs text-gray-700 shadow-sm focus:outline-none focus:ring-1 focus:ring-black"
        >
          <option value="all">All Request Statuses</option>
          <option value="pending">Pending</option>
          <option value="in_progress">In Progress</option>
          <option value="completed">Completed</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-xl border border-gray-200 bg-white p-12 text-center text-sm text-gray-500 shadow-sm">
          {requests.length === 0 ? "No requests yet." : "No DSAR requests match your search filters."}
        </div>
      ) : (
        <DataTable headers={["Subject", "Type", "Status", "Created", "Action"]}>
          {filtered.map((request) => (
            <tr key={request.id} className="border-b hover:bg-slate-50/50 transition-colors">
              <td className="px-6 py-4 font-medium text-gray-900 select-all">{request.subject_identifier}</td>
              <td className="px-6 py-4 capitalize text-gray-700">{request.request_type}</td>
              <td className="px-6 py-4">
                <RequestStatusBadge status={request.status} />
              </td>
              <td className="px-6 py-4 text-gray-500">{new Date(request.created_at).toLocaleString()}</td>
              <td className="px-6 py-4">
                <Link
                  href={`/requests/${request.id}`}
                  className="rounded bg-slate-100 px-3 py-1 text-xs font-semibold text-gray-800 hover:bg-slate-200"
                >
                  View Details
                </Link>
              </td>
            </tr>
          ))}
        </DataTable>
      )}
    </div>
  );
}
