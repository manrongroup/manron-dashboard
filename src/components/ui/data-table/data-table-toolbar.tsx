import { Table } from "@tanstack/react-table";
import { X, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CustomAction, FilterConfig } from "./index";

interface DataTableToolbarProps<TData> {
    table: Table<TData>;
    filterConfig?: FilterConfig;
    enableExport?: boolean;
    onExport?: (format: "csv" | "excel" | "pdf") => void;
    customActions?: CustomAction[];
}

export function DataTableToolbar<TData>({
    table,
    filterConfig,
    enableExport,
    onExport,
    customActions = [],
}: DataTableToolbarProps<TData>) {
    const isFiltered = table.getState().columnFilters.length > 0;

    return (
        <div className="flex items-center justify-between">
            <div className="flex flex-1 items-center space-x-2">
                {filterConfig?.enableGlobalFilter && filterConfig.searchKey && (
                    <Input
                        placeholder={filterConfig.searchPlaceholder || "Filter..."}
                        value={(table.getColumn(filterConfig.searchKey)?.getFilterValue() as string) ?? ""}
                        onChange={(event) =>
                            table.getColumn(filterConfig.searchKey!)?.setFilterValue(event.target.value)
                        }
                        className="h-8 w-[150px] lg:w-[250px]"
                    />
                )}
                {isFiltered && (
                    <Button
                        variant="ghost"
                        onClick={() => table.resetColumnFilters()}
                        className="h-8 px-2 lg:px-3"
                    >
                        Reset
                        <X className="ml-2 h-4 w-4" />
                    </Button>
                )}
            </div>
            <div className="flex items-center space-x-2">
                {customActions.map((action, index) => (
                    <Button
                        key={index}
                        variant={action.variant || "outline"}
                        onClick={action.onClick}
                        className="h-8"
                    >
                        {action.icon && <span className="mr-2">{action.icon}</span>}
                        {action.label}
                    </Button>
                ))}
                {enableExport && onExport && (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm" className="h-8">
                                <Download className="mr-2 h-4 w-4" />
                                Export
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => onExport("csv")}>
                                Export as CSV
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => onExport("excel")}>
                                Export as Excel
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => onExport("pdf")}>
                                Export as PDF
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                )}
                {/* <DataTableViewOptions table={table} /> */}
            </div>
        </div>
    );
}
