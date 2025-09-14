"use client";

import React, { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Edit, Trash2 } from "lucide-react";
import { DataTable } from "../ui/data-table";

interface Contact {
  _id: string;
  name: string;
  email: string;
  telephone: string;
  service: string;
  description: string;
  website?: string; // ✅ added website
  createdAt: string;
  updatedAt: string;
}

interface ContactsTableProps {
  contacts: Contact[];
  onDelete: (id: string) => void;
  onEdit: (contact: Contact) => void;
}

const ContactsTable: React.FC<ContactsTableProps> = ({
  contacts,
  onDelete,
  onEdit,
}) => {
  const [selectedContacts, setSelectedContacts] = useState<Contact[]>([]);

  const handleRowClick = useCallback((row: Contact) => {
    console.log("Contact clicked:", row);
  }, []);

  const handleRowSelect = useCallback((rows: Contact[]) => {
    setSelectedContacts(rows);
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
      accessorKey: "name",
      header: "Name",
      cell: ({ row }: any) => (
        <div className="font-medium">{row.getValue("name")}</div>
      ),
    },
    {
      accessorKey: "email",
      header: "Email",
      cell: ({ row }: any) => <div>{row.getValue("email")}</div>,
    },
    {
      accessorKey: "telephone",
      header: "Phone",
      cell: ({ row }: any) => <div>{row.getValue("telephone")}</div>,
    },
    {
      accessorKey: "website",
      header: "Website",
      cell: ({ row }: any) => {
        const website = row.getValue("website");
        return website ? (
          <a
            href={website}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline"
          >
            {website}
          </a>
        ) : (
          <span className="text-gray-400 italic">—</span>
        );
      },
    },
    {
      accessorKey: "service",
      header: "Service",
      cell: ({ row }: any) => (
        <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
          {row.getValue("service")}
        </span>
      ),
    },
    {
      accessorKey: "description",
      header: "Message",
      cell: ({ row }: any) => (
        <div className="line-clamp-2">{row.getValue("description")}</div>
      ),
    },
    {
      accessorKey: "createdAt",
      header: "Created",
      cell: ({ row }: any) => {
        const date = new Date(row.getValue("createdAt"));
        return date.toLocaleString();
      },
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }: any) => {
        const contact = row.original as Contact;
        return (
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="sm" onClick={() => onEdit(contact)}>
              <Edit className="h-4 w-4 mr-1" /> Edit
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-red-600 hover:text-red-700"
              onClick={() => onDelete(contact._id)}
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
    <div className="max-w-full  2xl:max-w-full mx-auto p-4">
      <DataTable
        columns={columns}
        data={contacts}
        filterConfig={{
          enableGlobalFilter: true,
          searchKey: "name",
          searchPlaceholder: "Search contacts...",
        }}
        enableSorting
        enableRowSelection
        enableColumnVisibility
        enableExport
        exportOptions={{
          filename: "contacts_export",
          includeHeaders: true,
          selectedRowsOnly: false,
        }}
        paginationConfig={{
          enabled: true,
          pageSize: 5,
          pageSizeOptions: [5, 10, 20, 50],
        }}
        title="Contacts"
        description="Manage contact messages with filtering, sorting, and export options."
        onRowClick={handleRowClick}
        onRowSelect={handleRowSelect}
        className="w-full"
      />

      {selectedContacts.length > 0 && (
        <div className="mt-6 p-4 sm:p-6 bg-blue-50 border border-blue-200 rounded-lg">
          <h3 className="text-base md:text-lg font-semibold mb-2 text-blue-800">
            Selected Contacts ({selectedContacts.length}):
          </h3>
          <div className="space-y-1">
            {selectedContacts.map((contact) => (
              <div
                key={contact._id}
                className="text-sm md:text-base text-blue-700"
              >
                {contact.name} — {contact.email} ({contact.service})
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ContactsTable;
