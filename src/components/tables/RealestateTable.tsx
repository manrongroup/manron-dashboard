import React, { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Edit, Trash2 } from "lucide-react";
import { DataTable } from "../ui/data-table";
import { Property } from "@/types/realEstate";
import { RealEstate } from "@/types";


interface RealEstateTableProps {
    properties: Property[];
    onDelete: (id: string) => void;
    onEdit: (property: Property) => void;
    onCreate?: () => void;
}

const RealEstateTable: React.FC<RealEstateTableProps> = ({
    properties,
    onDelete,
    onEdit,
    onCreate,
}) => {
    const [selectedProperties, setSelectedProperties] = useState<Property[]>([]);

    const handleRowClick = useCallback((row: Property) => {
        console.log("Row clicked:", row);
    }, []);

    const handleRowSelect = useCallback((rows: Property[]) => {
        setSelectedProperties(rows);
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
            accessorKey: "images",
            header: "Image",
            cell: ({ row }: any) => {
                const images = row.getValue("images") as { url: string; isMain: boolean }[];
                const mainImage = images.find(img => img.isMain) || images[0];
                return (
                    <img
                        src={mainImage?.url}
                        alt="Property"
                        className="w-20 h-14 object-cover rounded-md"
                    />
                );
            },
        },
        {
            accessorKey: "title",
            header: "Title",
            cell: ({ row }: any) => <div className="font-medium">{row.getValue("title")}</div>,
        },
        {
            accessorKey: "location",
            header: "Location",
            cell: ({ row }: any) => <div>{row.getValue("location")}</div>,
        },
        {
            accessorKey: "price",
            header: "Price",
            cell: ({ row }: any) =>
                <div>{row.getValue("currency")} {row.getValue("price").toLocaleString()}</div>,
        },
        {
            accessorKey: "type",
            header: "Type",
            cell: ({ row }: any) => (
                <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {row.getValue("type")}
                </span>
            ),
        },
        {
            accessorKey: "status",
            header: "Status",
            cell: ({ row }: any) => {
                const status = row.getValue("status");
                const bgColor =
                    status.toLowerCase() === "available"
                        ? "bg-green-100 text-green-800"
                        : status.toLowerCase() === "rented"
                            ? "bg-yellow-100 text-yellow-800"
                            : status.toLowerCase() === "sold"
                                ? "bg-red-100 text-red-800"
                                : "bg-gray-100 text-gray-800";
                return <span className={`px-2 py-1 rounded-full text-xs font-medium ${bgColor}`}>{status}</span>;
            },
        },
        {
            accessorKey: "bedrooms",
            header: "Bedrooms",
            cell: ({ row }: any) => <div>{row.getValue("bedrooms")}</div>,
        },
        {
            accessorKey: "bathrooms",
            header: "Bathrooms",
            cell: ({ row }: any) => <div>{row.getValue("bathrooms")}</div>,
        },
        {
            accessorKey: "carSpaces",
            header: "Car Spaces",
            cell: ({ row }: any) => <div>{row.getValue("carSpaces")}</div>,
        },
        {
            accessorKey: "landSize",
            header: "Land Size (m²)",
            cell: ({ row }: any) => <div>{row.getValue("landSize")}</div>,
        },
        {
            accessorKey: "propertySize",
            header: "Property Size (m²)",
            cell: ({ row }: any) => <div>{row.getValue("propertySize")}</div>,
        },
        {
            accessorKey: "yearBuilt",
            header: "Year Built",
            cell: ({ row }: any) => <div>{row.getValue("yearBuilt")}</div>,
        },
        {
            accessorKey: "furnished",
            header: "Furnished",
            cell: ({ row }: any) => <div>{row.getValue("furnished") ? "Yes" : "No"}</div>,
        },
        {
            accessorKey: "likes",
            header: "Likes",
            cell: ({ row }: any) => <div>{row.getValue("likes")}</div>,
        },
        {
            accessorKey: "isDeal",
            header: "Deal Type",
            cell: ({ row }: any) => <div>{row.getValue("isDeal") ? "Deal" : "No Deal"}</div>,
        },
        {
            accessorKey: "agent",
            header: "Agent",
            cell: ({ row }: any) => {
                const agent = row.getValue("agent");
                return (
                    <div className="flex flex-col text-sm">
                        <span className="font-medium">{agent.name}</span>
                        <span className="text-gray-500">{agent.email}</span>
                        <span className="text-gray-500">{agent.phone}</span>
                    </div>
                );
            },
        },
        {
            id: "actions",
            header: "Actions",
            cell: ({ row }: any) => {
                const property = row.original as RealEstate;
                return (
                    <div className="flex items-center space-x-2">
                        <Button variant="ghost" size="sm" onClick={() => onEdit(property as any)}>
                            <Edit className="h-4 w-4 mr-1" /> Edit
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-600 hover:text-red-700"
                            onClick={() => onDelete(property._id)}
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
        <div className='max-w-full  2xl:max-w-full mx-auto p-4'>
            <DataTable
                columns={columns}
                data={properties}
                filterConfig={{
                    enableGlobalFilter: true,
                    searchKey: "title",
                    searchPlaceholder: "Search properties...",
                }}
                enableSorting
                enableRowSelection
                enableColumnVisibility
                enableExport
                exportOptions={{
                    filename: "real_estate_export",
                    includeHeaders: true,
                    selectedRowsOnly: false,
                }}
                paginationConfig={{
                    enabled: true,
                    pageSize: 5,
                    pageSizeOptions: [5, 10, 20, 50],
                }}
                title="Real Estate Properties"
                description="Manage properties with filtering, sorting, and export options."
                onRowClick={handleRowClick}
                onRowSelect={handleRowSelect}
                className="w-full"
                customActions={onCreate ? [
                    {
                        label: "Add Property",
                        icon: <Plus className="h-4 w-4" />,
                        onClick: onCreate,
                        variant: "default" as const,
                    }
                ] : []}
            />

            {selectedProperties.length > 0 && (
                <div className="mt-6 p-4 sm:p-6 bg-blue-50 border border-blue-200 rounded-lg">
                    <h3 className="text-base md:text-lg font-semibold mb-2 text-blue-800">
                        Selected Properties ({selectedProperties.length}):
                    </h3>
                    <div className="space-y-1">
                        {selectedProperties.map((property) => (
                            <div key={property._id} className="text-sm md:text-base text-blue-700">
                                {property.title} - {property.location} - {property.currency} {property.price.toLocaleString()} - {property.bedrooms}BR/{property.bathrooms}BA
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default RealEstateTable;
