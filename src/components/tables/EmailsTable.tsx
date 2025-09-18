"use client";

import React, { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Eye, Trash2 } from "lucide-react";
import { DataTable } from "../ui/data-table";

interface SentEmail {
  _id: string;
  subject: string;
  message: string;
  recipients: string[];
  status: "sent" | "failed";
  category: string;
  sentBy: string;
  createdAt: string;
  updatedAt: string;
}

interface EmailTableProps {
  emails: SentEmail[];
  onDelete: (id: string) => void;
  onView: (email: SentEmail) => void;
}

const EmailTable: React.FC<EmailTableProps> = ({ emails, onDelete, onView }) => {
  const [selectedEmails, setSelectedEmails] = useState<SentEmail[]>([]);

  const handleRowClick = useCallback((row: SentEmail) => {
    console.log("Email clicked:", row);
  }, []);

  const handleRowSelect = useCallback((rows: SentEmail[]) => {
    setSelectedEmails(rows);
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
      accessorKey: "subject",
      header: "Subject",
      cell: ({ row }: any) => (
        <div className="font-medium">{row.getValue("subject") || "No Subject"}</div>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }: any) => {
        const status = row.getValue("status");
        return (
          <span
            className={`px-2 py-1 rounded-full text-xs font-medium ${status === "sent"
              ? "bg-green-100 text-green-800"
              : "bg-red-100 text-red-800"
              }`}
          >
            {status}
          </span>
        );
      },
    },
    {
      accessorKey: "category",
      header: "Category",
      cell: ({ row }: any) => (
        <span className="text-sm">{row.getValue("category")}</span>
      ),
    },
    {
      accessorKey: "sentBy",
      header: "Sent By",
      cell: ({ row }: any) => (
        <span className="text-sm text-gray-700">{row.getValue("sentBy")}</span>
      ),
    },
    {
      accessorKey: "recipients",
      header: "Recipients",
      cell: ({ row }: any) => {
        const recipients = row.getValue("recipients") as string[];
        return (
          <span className="text-sm text-gray-700">
            {recipients?.length} recipients
          </span>
        );
      },
    },
    {
      accessorKey: "createdAt",
      header: "Sent At",
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
        const email = row.original as SentEmail;
        return (
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="sm" onClick={() => onView(email)}>
              <Eye className="h-4 w-4 mr-1" /> View
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-red-600 hover:text-red-700"
              onClick={() => onDelete(email._id)}
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
    <div className="max-w-full md:max-w-[800px] lg:max-w-[1000px] xl:max-w-[1200px] 2xl:max-w-full mx-auto p-4">
      <DataTable
        columns={columns}
        data={emails}
        filterConfig={{
          enableGlobalFilter: true,
          searchKey: "subject",
          searchPlaceholder: "Search emails...",
        }}
        enableSorting
        enableRowSelection
        enableColumnVisibility
        enableExport
        exportOptions={{
          filename: "emails_export",
          includeHeaders: true,
          selectedRowsOnly: false,
        }}
        paginationConfig={{
          enabled: true,
          pageSize: 5,
          pageSizeOptions: [5, 10, 20, 50],
        }}
        title="Sent Emails"
        description="Manage sent emails with filtering, sorting, and export options."
        onRowClick={handleRowClick}
        onRowSelect={handleRowSelect}
        className="w-full"
      />

      {selectedEmails.length > 0 && (
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h3 className="text-base font-semibold mb-2 text-blue-800">
            Selected Emails ({selectedEmails.length}):
          </h3>
          <div className="space-y-1">
            {selectedEmails.map((email) => (
              <div key={email._id} className="text-sm text-blue-700">
                {email.subject || "No Subject"} — {email.status}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default EmailTable;
