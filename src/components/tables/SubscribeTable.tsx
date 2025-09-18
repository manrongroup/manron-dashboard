"use client";

import React, { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Edit, Trash2 } from "lucide-react";
import { DataTable } from "../ui/data-table";

interface Subscriber {
  _id: string;
  email: string;
  status: "active" | "inactive";
  createdAt: string;
  updatedAt?: string;
}

interface SubscribersTableProps {
  subscribers: Subscriber[];
  onDelete: (id: string) => void;
  onEdit: (subscriber: Subscriber) => void;
}

const SubscribersTable: React.FC<SubscribersTableProps> = ({
  subscribers,
  onDelete,
  onEdit,
}) => {
  const [selectedSubs, setSelectedSubs] = useState<Subscriber[]>([]);

  const handleRowClick = useCallback((row: Subscriber) => {
    console.log("Subscriber clicked:", row);
  }, []);

  const handleRowSelect = useCallback((rows: Subscriber[]) => {
    setSelectedSubs(rows);
  }, []);

  const columns = [
    {
      id: "select",
      header: ({ table }: any) => (
        <input
          type="checkbox"
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onChange={(e) => table.toggleAllPageRowsSelected(e.target.checked)}
          className="rounded"
        />
      ),
      cell: ({ row }: any) => (
        <input
          type="checkbox"
          checked={row.getIsSelected()}
          onChange={(e) => row.toggleSelected(e.target.checked)}
          className="rounded"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "email",
      header: "Email",
      cell: ({ row }: any) => (
        <div className="font-medium">{row.getValue("email")}</div>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }: any) => {
        const status = row.getValue("status");
        return (
          <span
            className={`px-2 py-1 rounded-full text-xs font-medium ${status === "active"
              ? "bg-green-100 text-green-800"
              : "bg-gray-100 text-gray-700"
              }`}
          >
            {status}
          </span>
        );
      },
    },
    {
      accessorKey: "createdAt",
      header: "Subscribed At",
      cell: ({ row }: any) => {
        const date = new Date(row.getValue("createdAt"));
        return date.toLocaleDateString() + " " + date.toLocaleTimeString();
      },
    },
    {
      accessorKey: "updatedAt",
      header: "Updated At",
      cell: ({ row }: any) => {
        const date = new Date(row.getValue("updatedAt"));
        return date.toLocaleDateString() + " " + date.toLocaleTimeString();
      },
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }: any) => {
        const sub = row.original as Subscriber;
        return (
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="sm" onClick={() => onEdit(sub)}>
              <Edit className="h-4 w-4 mr-1" /> Edit
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-red-600 hover:text-red-700"
              onClick={() => onDelete(sub._id)}
            >
              <Trash2 className="h-4 w-4 mr-1" /> Delete
            </Button>
          </div>
        );
      },
      enableSorting: false,
      enableHiding: false,
    },
  ];

  return (
    <div className='max-w-full   2xl:max-w-full mx-auto p-4'>
      <DataTable
        columns={columns}
        data={subscribers}
        filterConfig={{
          enableGlobalFilter: true,
          searchKey: "email",
          searchPlaceholder: "Search subscribers...",
        }}
        enableSorting
        enableRowSelection
        enableColumnVisibility
        enableExport
        exportOptions={{
          filename: "subscribers_export",
          includeHeaders: true,
          selectedRowsOnly: false,
        }}
        paginationConfig={{
          enabled: true,
          pageSize: 5,
          pageSizeOptions: [5, 10, 20, 50],
        }}
        title="Subscribers"
        description="Manage newsletter subscribers with filtering, sorting, and export options."
        onRowClick={handleRowClick}
        onRowSelect={handleRowSelect}
        className="w-full"
      />

      {selectedSubs.length > 0 && (
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h3 className="text-base font-semibold mb-2 text-blue-800">
            Selected Subscribers ({selectedSubs.length}):
          </h3>
          <div className="space-y-1">
            {selectedSubs.map((sub) => (
              <div key={sub._id} className="text-sm text-blue-700">
                {sub.email} — {sub.status}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SubscribersTable;
