"use client";

import React, { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Edit, Trash2 } from "lucide-react";
import { DataTable } from "../ui/data-table";

interface Blog {
  _id: string;
  title: string;
  author: string;
  excerpt: string;
  content: string;
  image: string;
  images?: string[];
  category: string;
  tags: string[];
  publishDate: string;
  readTime: string;
  featured: boolean;
  createdAt: string;
  updatedAt: string;
}

interface BlogsTableProps {
  blogs: Blog[];
  onDelete: (id: string) => void;
  onEdit: (blog: Blog) => void;
  onCreate?: () => void;
  onView?: (blog: Blog) => void;
}

const BlogsTable: React.FC<BlogsTableProps> = ({ blogs, onDelete, onEdit, onCreate, onView }) => {
  const [selectedBlogs, setSelectedBlogs] = useState<Blog[]>([]);

  const handleRowClick = useCallback((row: any) => {
    if (onView) {
      const blog = row.original || row;
      onView(blog);
    }
  }, [onView]);

  const handleRowSelect = useCallback((rows: Blog[]) => {
    setSelectedBlogs(rows);
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
      accessorKey: "image",
      header: "Image",
      cell: ({ row }: any) => (
        <img
          src={row.getValue("image")}
          alt="Blog"
          className="w-20 h-14 object-cover rounded-md"
        />
      ),
    },
    {
      accessorKey: "title",
      header: "Title",
      cell: ({ row }: any) => (
        <div className="font-medium line-clamp-2">{row.getValue("title")}</div>
      ),
    },
    {
      accessorKey: "author",
      header: "Author",
      cell: ({ row }: any) => <div>{row.getValue("author")}</div>,
    },
    {
      accessorKey: "category",
      header: "Category",
      cell: ({ row }: any) => (
        <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
          {row.getValue("category")}
        </span>
      ),
    },
    {
      accessorKey: "tags",
      header: "Tags",
      cell: ({ row }: any) => {
        const tags = row.getValue("tags") as string[];
        return (
          <div className="flex flex-wrap gap-1">
            {tags?.map((tag, i) => (
              <span
                key={i}
                className="px-2 py-0.5 rounded-full text-xs bg-gray-100 text-gray-700"
              >
                {tag}
              </span>
            ))}
          </div>
        );
      },
    },
    {
      accessorKey: "publishDate",
      header: "Published",
      cell: ({ row }: any) => {
        const date = new Date(row.getValue("publishDate"));
        return date.toLocaleDateString();
      },
    },
    {
      accessorKey: "readTime",
      header: "Read Time",
      cell: ({ row }: any) => <div>{row.getValue("readTime")}</div>,
    },
    {
      accessorKey: "featured",
      header: "Featured",
      cell: ({ row }: any) =>
        row.getValue("featured") ? (
          <span className="text-green-600 font-medium">Yes</span>
        ) : (
          <span className="text-gray-500">No</span>
        ),
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }: any) => {
        const blog = row.original as Blog;
        return (
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="sm" onClick={() => onEdit(blog)}>
              <Edit className="h-4 w-4 mr-1" /> Edit
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-red-600 hover:text-red-700"
              onClick={() => onDelete(blog._id)}
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
    <div className="max-w-full h-full min-h-screen   2xl:max-w-full mx-auto p-4">
      <DataTable
        columns={columns}
        data={blogs}
        filterConfig={{
          enableGlobalFilter: true,
          searchKey: "title",
          searchPlaceholder: "Search blogs...",
        }}
        enableSorting
        enableRowSelection
        enableColumnVisibility
        enableExport
        exportOptions={{
          filename: "blogs_export",
          includeHeaders: true,
          selectedRowsOnly: false,
        }}
        paginationConfig={{
          enabled: true,
          pageSize: 5,
          pageSizeOptions: [5, 10, 20, 50],
        }}
        title="Blogs"
        description="Manage blog posts with filtering, sorting, and export options."
        onRowClick={handleRowClick}
        onRowSelect={handleRowSelect}
        className="w-full"
        customActions={onCreate ? [
          {
            label: "Create Blog",
            icon: <Plus className="h-4 w-4" />,
            onClick: onCreate,
            variant: "default" as const,
          }
        ] : []}
      />

      {selectedBlogs.length > 0 && (
        <div className="mt-6 p-4 sm:p-6 bg-blue-50 border border-blue-200 rounded-lg">
          <h3 className="text-base md:text-lg font-semibold mb-2 text-blue-800">
            Selected Blogs ({selectedBlogs.length}):
          </h3>
          <div className="space-y-1">
            {selectedBlogs.map((blog) => (
              <div key={blog._id} className="text-sm md:text-base text-blue-700">
                {blog.title} — {blog.author} ({blog.category})
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default BlogsTable;
