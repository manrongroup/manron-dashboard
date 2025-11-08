// UsersTable.tsx
'use client';
import React, { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Edit, Trash2, Shield, Mail, Plus } from 'lucide-react';
import { DataTable } from '../ui/data-table';
import { User as UserType, Agent } from '@/types';

interface UsersTableProps {
  users: (UserType | Agent)[];
  onEdit: (user: UserType | Agent) => void;
  onDelete: (user: UserType | Agent) => void;
  onEmail?: (user: UserType | Agent) => void;
  onCreate?: () => void;
  onView?: (user: UserType | Agent) => void;
}

const UsersTable: React.FC<UsersTableProps> = ({ users, onEdit, onDelete, onEmail, onCreate, onView }) => {
  const [selectedUsers, setSelectedUsers] = useState<(UserType | Agent)[]>([]);

  const handleRowClick = useCallback((row: any) => {
    if (onView) {
      const user = row.original || row;
      onView(user);
    }
  }, [onView]);

  const handleRowSelect = useCallback((rows: (UserType | Agent)[]) => {
    setSelectedUsers(rows);
  }, []);

  const columns = [
    {
      id: 'select',
      header: ({ table }: any) => (
        <input
          type="checkbox"
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && 'indeterminate')
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
      accessorKey: 'fullname',
      header: 'Full Name',
      cell: ({ row }: any) => <div>{row.getValue('fullname') || "Agent"}</div>,
    },
    {
      accessorKey: 'email',
      header: 'Email',
      cell: ({ row }: any) => <div>{row.getValue('email')}</div>,
    },
    {
      accessorKey: 'telephone',
      header: 'Telephone',
      cell: ({ row }: any) => <div>{row.getValue('telephone')}</div>,
    },
    {
      accessorKey: 'role',
      header: 'Role',
      cell: ({ row }: any) => {
        const role = row.getValue('role') || '';
        const roleColors: Record<string, string> = {
          superAdmin: 'bg-purple-100 text-purple-800',
          admin: 'bg-blue-100 text-blue-800',
          client: 'bg-green-100 text-green-800',
          agent: 'bg-orange-100 text-orange-800'
        };
        return (
          <div className="flex items-center gap-1">
            {role === 'superAdmin' && <Shield className="h-4 w-4 text-purple-600" />}
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${roleColors[role] || 'bg-gray-100 text-gray-800'}`}>
              {role || 'N/A'}
            </span>
          </div>
        );
      },
    },
    {
      accessorKey: 'createdAt',
      header: 'Created At',
      cell: ({ row }: any) => new Date(row.getValue('createdAt')).toLocaleString(),
    },
    {
      accessorKey: 'updatedAt',
      header: 'Updated At',
      cell: ({ row }: any) => new Date(row.getValue('updatedAt')).toLocaleString(),
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }: any) => {
        const user = row.original as UserType | Agent;
        return (
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => onEdit(user)}>
              <Edit className="h-4 w-4 mr-1" /> Edit
            </Button>
            {onEmail && (
              <Button variant="ghost" size="sm" onClick={() => onEmail(user)}>
                <Mail className="h-4 w-4 mr-1" /> Email
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              className="text-red-600 hover:text-red-700"
              onClick={() => onDelete(user)}
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
        data={users}
        enableSorting
        enableRowSelection
        enableColumnVisibility
        filterConfig={{
          enableGlobalFilter: true,
          searchKey: 'fullname',
          searchPlaceholder: 'Search users...',
        }}
        enableExport
        exportOptions={{
          filename: "user_data_export",
          includeHeaders: true,
          selectedRowsOnly: false,
        }}
        paginationConfig={{
          enabled: true,
          pageSize: 5,
          pageSizeOptions: [5, 10, 20],
        }}
        onRowSelect={handleRowSelect}
        onRowClick={handleRowClick}
        customActions={onCreate ? [
          {
            label: "Add User",
            icon: <Plus className="h-4 w-4" />,
            onClick: onCreate,
            variant: "default" as const,
          }
        ] : []}
      />
    </div>

  );
};

export default UsersTable;
