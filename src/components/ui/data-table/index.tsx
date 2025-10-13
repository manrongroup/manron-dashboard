import React, { useState, useMemo, useCallback, useEffect } from 'react';
import {
    ColumnDef,
    ColumnFiltersState,
    SortingState,
    VisibilityState,
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    useReactTable,
    Row,
    Table as TanStackTable,
    Column,
} from "@tanstack/react-table";
import {
    Search,
    Filter,
    Download,
    RotateCcw,
    Eye,
    EyeOff,
    ChevronDown,
    ChevronUp,
    ArrowUpDown,
    MoreHorizontal,
    Settings,
    FileText,
    FileSpreadsheet,
    X,
    Plus,
    Trash2,
    Edit,
    ChevronLeft,
    ChevronRight,
    ChevronsLeft,
    ChevronsRight
} from "lucide-react";

// Type Definitions
export interface ExportOptions {
    filename?: string;
    includeHeaders?: boolean;
    selectedRowsOnly?: boolean;
}

export interface CustomAction {
    label: string;
    icon?: React.ReactNode;
    onClick: () => void;
    variant?: 'default' | 'outline' | 'ghost' | 'destructive' | 'secondary';
}

export interface FilterConfig {
    enableGlobalFilter?: boolean;
    enableColumnFilters?: boolean;
    searchKey?: string;
    searchPlaceholder?: string;
}

export interface PaginationConfig {
    enabled?: boolean;
    pageSize?: number;
    pageSizeOptions?: number[];
}

export interface DataTableProps<TData extends Record<string, any>, TValue = any> {
    columns: ColumnDef<TData, TValue>[];
    data: TData[];
    filterConfig?: FilterConfig;
    enableSorting?: boolean;
    enableRowSelection?: boolean;
    enableColumnVisibility?: boolean;
    paginationConfig?: PaginationConfig;
    enableExport?: boolean;
    exportOptions?: ExportOptions;
    title?: string;
    description?: string;
    className?: string;
    onRowClick?: (row: any) => void;
    onRowSelect?: (selectedRows: TData[]) => void;
    customActions?: CustomAction[];
}

// UI Components
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'default' | 'outline' | 'ghost' | 'secondary' | 'destructive';
    size?: 'default' | 'sm' | 'lg' | 'icon';
    asChild?: boolean;
}

const Button: React.FC<ButtonProps> = ({
    children,
    variant = "default",
    size = "default",
    className = "",
    disabled = false,
    ...props
}) => (
    <button
        className={`inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background
      ${variant === "outline" ? "border border-input bg-background hover:bg-accent hover:text-accent-foreground" :
                variant === "ghost" ? "hover:bg-accent hover:text-accent-foreground" :
                    variant === "secondary" ? "bg-secondary text-secondary-foreground hover:bg-secondary/80" :
                        variant === "destructive" ? "bg-red-600 text-white hover:bg-red-700" :
                            "bg-blue-600 text-white hover:bg-blue-700"}
      ${size === "sm" ? "h-9 px-3 rounded-md" :
                size === "lg" ? "h-11 px-8 rounded-md" :
                    size === "icon" ? "h-10 w-10" : "h-10 px-4 py-2"}
      ${className}`}
        disabled={disabled}
        {...props}
    >
        {children}
    </button>
);

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    className?: string;
}

const Input: React.FC<InputProps> = ({ className = "", ...props }) => (
    <input
        className={`flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
        {...props}
    />
);

interface SelectProps {
    children: React.ReactNode;
    onValueChange: (value: string) => void;
    value?: string | number;
    defaultValue?: string | number;
    className?: string;
    placeholder?: string;
}

const Select: React.FC<SelectProps> = ({
    children,
    onValueChange,
    value,
    defaultValue,
    className = "",
    placeholder = "Select..."
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [internalValue, setInternalValue] = useState(String(value || defaultValue || ""));

    useEffect(() => {
        if (value !== undefined) {
            setInternalValue(String(value));
        }
    }, [value]);

    const handleValueChange = (newValue: string) => {
        setInternalValue(newValue);
        onValueChange(newValue);
        setIsOpen(false);
    };

    return (
        <div className={`relative ${className}`}>
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
                <span>{internalValue || placeholder}</span>
                <ChevronDown className="h-4 w-4 opacity-50" />
            </button>
            {isOpen && (
                <>
                    <div
                        className="fixed inset-0 z-40"
                        onClick={() => setIsOpen(false)}
                    />
                    <div className="absolute top-full left-0 z-50 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto">
                        {React.Children.map(children, (child) =>
                            React.isValidElement(child)
                                ? React.cloneElement(child as React.ReactElement<any>, { onSelect: handleValueChange })
                                : child
                        )}
                    </div>
                </>
            )}
        </div>
    );
};

interface SelectItemProps {
    value: string | number;
    children: React.ReactNode;
    onSelect?: (value: string | number) => void;
}

const SelectItem: React.FC<SelectItemProps> = ({ value, children, onSelect }) => (
    <div
        onClick={() => onSelect?.(value)}
        className="cursor-pointer px-3 py-2 text-sm hover:bg-gray-100 transition-colors"
    >
        {children}
    </div>
);

// Dropdown Menu Components
interface DropdownMenuProps {
    children: React.ReactNode;
}

const DropdownMenu: React.FC<DropdownMenuProps> = ({ children }) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="relative inline-block text-left">
            {React.Children.map(children, child =>
                React.isValidElement(child)
                    ? React.cloneElement(child as React.ReactElement<any>, { isOpen, setIsOpen })
                    : child
            )}
        </div>
    );
};

interface DropdownMenuTriggerProps {
    children: React.ReactNode;
    asChild?: boolean;
    isOpen?: boolean;
    setIsOpen?: (open: boolean) => void;
}

const DropdownMenuTrigger: React.FC<DropdownMenuTriggerProps> = ({
    children,
    asChild = false,
    isOpen,
    setIsOpen
}) => {
    const handleClick = () => {
        setIsOpen?.(!isOpen);
    };

    if (asChild && React.isValidElement(children)) {
        return React.cloneElement(children as React.ReactElement<any>, { onClick: handleClick });
    }

    return <div onClick={handleClick}>{children}</div>;
};

interface DropdownMenuContentProps {
    children: React.ReactNode;
    align?: 'start' | 'end' | 'center';
    isOpen?: boolean;
    setIsOpen?: (open: boolean) => void;
}

const DropdownMenuContent: React.FC<DropdownMenuContentProps> = ({
    children,
    align = 'start',
    isOpen,
    setIsOpen
}) => {
    if (!isOpen) return null;

    return (
        <>
            <div
                className="fixed inset-0 z-40"
                onClick={() => setIsOpen?.(false)}
            />
            <div className={`absolute top-full mt-1 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-50 ${align === 'end' ? 'right-0' : align === 'center' ? 'left-1/2 -translate-x-1/2' : 'left-0'
                }`}>
                <div className="py-1">
                    {React.Children.map(children, child =>
                        React.isValidElement(child)
                            ? React.cloneElement(child as React.ReactElement<any>, { setIsOpen })
                            : child
                    )}
                </div>
            </div>
        </>
    );
};

interface DropdownMenuItemProps {
    children: React.ReactNode;
    onClick?: () => void;
    setIsOpen?: (open: boolean) => void;
}

const DropdownMenuItem: React.FC<DropdownMenuItemProps> = ({
    children,
    onClick,
    setIsOpen
}) => {
    const handleClick = () => {
        onClick?.();
        setIsOpen?.(false);
    };

    return (
        <button
            onClick={handleClick}
            className="flex items-center w-full px-3 py-2 text-sm text-left hover:bg-gray-100 transition-colors"
        >
            {children}
        </button>
    );
};

// Table Components
const Table: React.FC<{ children: React.ReactNode; className?: string }> = ({
    children,
    className = ""
}) => (
    <div className={`w-full overflow-auto ${className}`}>
        <table className="w-full caption-bottom text-sm">
            {children}
        </table>
    </div>
);

const TableHeader: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <thead className="[&_tr]:border-b">{children}</thead>
);

const TableBody: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <tbody className="[&_tr:last-child]:border-0">{children}</tbody>
);

interface TableRowProps extends React.HTMLAttributes<HTMLTableRowElement> {
    children: React.ReactNode;
}

const TableRow: React.FC<TableRowProps> = ({ children, className = "", ...props }) => (
    <tr
        className={`border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted ${className}`}
        {...props}
    >
        {children}
    </tr>
);

const TableHead: React.FC<{ children: React.ReactNode; className?: string }> = ({
    children,
    className = ""
}) => (
    <th className={`h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0 ${className}`}>
        {children}
    </th>
);

const TableCell: React.FC<{ children: React.ReactNode; className?: string }> = ({
    children,
    className = ""
}) => (
    <td className={`p-4 align-middle [&:has([role=checkbox])]:pr-0 ${className}`}>
        {children}
    </td>
);

// Export Service
export class ExportService {
    static exportToCSV<T extends Record<string, any>>(
        data: T[],
        columns: ColumnDef<T, any>[],
        options: ExportOptions = {}
    ): void {
        const { filename = 'export.csv', includeHeaders = true } = options;

        const headers = columns
            .filter(col => col.accessorKey)
            .map(col => {
                if (typeof col.header === 'string') return col.header;
                return String(col.accessorKey);
            });

        const accessors = columns
            .filter(col => col.accessorKey)
            .map(col => col.accessorKey as keyof T);

        let csvContent = '';

        if (includeHeaders) {
            csvContent += headers.join(',') + '\n';
        }

        data.forEach(row => {
            const values = accessors.map(accessor => {
                const value = row[accessor];
                if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
                    return `"${value.replace(/"/g, '""')}"`;
                }
                return value ?? '';
            });
            csvContent += values.join(',') + '\n';
        });

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    static exportToExcel<T extends Record<string, any>>(
        data: T[],
        columns: ColumnDef<T, any>[],
        options: ExportOptions = {}
    ): void {
        const { filename = 'export.xlsx' } = options;
        console.log('Excel export would require SheetJS library');
        this.exportToCSV(data, columns, { ...options, filename: filename.replace('.xlsx', '.csv') });
    }

    static exportToPDF<T extends Record<string, any>>(
        data: T[],
        columns: ColumnDef<T, any>[],
        options: ExportOptions = {}
    ): void {
        const { filename = 'export.pdf' } = options;
        console.log('PDF export would require jsPDF library');

        const headers = columns
            .filter(col => col.accessorKey)
            .map(col => typeof col.header === 'string' ? col.header : String(col.accessorKey));

        const accessors = columns
            .filter(col => col.accessorKey)
            .map(col => col.accessorKey as keyof T);

        let htmlContent = `
      <html>
        <head>
          <title>${filename}</title>
          <style>
            table { width: 100%; border-collapse: collapse; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f2f2f2; font-weight: bold; }
          </style>
        </head>
        <body>
          <table>
            <thead>
              <tr>${headers.map(h => `<th>${h}</th>`).join('')}</tr>
            </thead>
            <tbody>
    `;

        data.forEach(row => {
            const cells = accessors.map(accessor => `<td>${row[accessor] ?? ''}</td>`).join('');
            htmlContent += `<tr>${cells}</tr>`;
        });

        htmlContent += `
            </tbody>
          </table>
        </body>
      </html>
    `;

        const printWindow = window.open('', '_blank');
        if (printWindow) {
            printWindow.document.write(htmlContent);
            printWindow.document.close();
            printWindow.print();
        }
    }
}

// Column Filter Component
interface ColumnFilterProps<T> {
    column: Column<T, unknown>;
    title: string;
}

const ColumnFilter = <T,>({ column, title }: ColumnFilterProps<T>) => {
    const columnFilterValue = column.getFilterValue();
    const uniqueValues = Array.from(column.getFacetedUniqueValues().keys()).slice(0, 100);
    const headerText =
        typeof column.columnDef.header === "string"
            ? column.columnDef.header
            : column.id;

    return (
        <div className="px-3 py-2">
            <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">{title}</span>
                {columnFilterValue && (
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => column.setFilterValue("")}
                    >
                        <RotateCcw className="h-3 w-3" />
                    </Button>
                )}
            </div>
            <Input
                placeholder={`Filter ${headerText} ...`}
                value={(columnFilterValue as string) ?? ""}
                onChange={(e) => column.setFilterValue(e.target.value)}
                className="mb-2"
            />

            {uniqueValues.length > 0 && (
                <div className="max-h-32 overflow-auto">
                    <div className="text-xs text-muted-foreground mb-1">Quick filters:</div>
                    {uniqueValues.slice(0, 5).map((value) => (
                        <button
                            key={String(value)}
                            onClick={() => column.setFilterValue(value)}
                            className="block w-full text-left px-2 py-1 text-xs rounded hover:bg-gray-100 transition-colors"
                        >
                            {String(value)} ({column.getFacetedUniqueValues().get(value)})
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

// Export Dropdown Component
interface ExportDropdownProps<T extends Record<string, any>> {
    table: TanStackTable<T>;
    columns: ColumnDef<T, any>[];
    exportOptions?: ExportOptions;
}

const ExportDropdown = <T extends Record<string, any>>({
    table,
    columns,
    exportOptions = {}
}: ExportDropdownProps<T>) => {
    const handleExport = useCallback((format: 'csv' | 'excel' | 'pdf') => {
        const selectedRows = table.getSelectedRowModel().rows;
        const dataToExport = exportOptions.selectedRowsOnly && selectedRows.length > 0
            ? selectedRows.map(row => row.original)
            : table.getFilteredRowModel().rows.map(row => row.original);

        const filename = exportOptions.filename || `export_${new Date().toISOString().split('T')[0]}`;

        switch (format) {
            case 'csv':
                ExportService.exportToCSV(dataToExport, columns, {
                    ...exportOptions,
                    filename: `${filename}.csv`
                });
                break;
            case 'excel':
                ExportService.exportToExcel(dataToExport, columns, {
                    ...exportOptions,
                    filename: `${filename}.xlsx`
                });
                break;
            case 'pdf':
                ExportService.exportToPDF(dataToExport, columns, {
                    ...exportOptions,
                    filename: `${filename}.pdf`
                });
                break;
        }
    }, [table, columns, exportOptions]);

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                    <Download className="mr-2 h-4 w-4" />
                    Export
                    <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => handleExport('csv')}>
                    <FileText className="mr-2 h-4 w-4" />
                    Export as CSV
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleExport('excel')}>
                    <FileSpreadsheet className="mr-2 h-4 w-4" />
                    Export as Excel
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleExport('pdf')}>
                    <FileText className="mr-2 h-4 w-4" />
                    Export as PDF
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
};

// Table Toolbar Component
interface DataTableToolbarProps<T extends Record<string, any>> {
    table: TanStackTable<T>;
    columns: ColumnDef<T, any>[];
    filterConfig?: FilterConfig;
    enableExport?: boolean;
    exportOptions?: ExportOptions;
    customActions?: CustomAction[];
    title?: string;
    description?: string;
}

const DataTableToolbar = <T extends Record<string, any>>({
    table,
    columns,
    filterConfig = {},
    enableExport = false,
    exportOptions,
    customActions = [],
    title,
    description,
}: DataTableToolbarProps<T>) => {
    const [showFilters, setShowFilters] = useState(false);
    const [globalFilter, setGlobalFilter] = useState("");

    const {
        enableGlobalFilter = false,
        searchKey,
        searchPlaceholder = "Search..."
    } = filterConfig;

    const isFiltered = table.getState().columnFilters.length > 0;

    return (
        <div className="space-y-4">
            {(title || description) && (
                <div>
                    {title && <h2 className="text-2xl font-bold tracking-tight">{title}</h2>}
                    {description && <p className="text-muted-foreground">{description}</p>}
                </div>
            )}

            <div className="flex items-center justify-between">
                <div className="flex flex-1 items-center space-x-2">
                    {enableGlobalFilter && (
                        <div className="relative">
                            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search all columns..."
                                value={globalFilter}
                                onChange={(e) => {
                                    setGlobalFilter(e.target.value);
                                    table.setGlobalFilter(e.target.value);
                                }}
                                className="pl-8 max-w-sm"
                            />
                        </div>
                    )}

                    {searchKey && !enableGlobalFilter && (
                        <div className="relative">
                            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder={searchPlaceholder}
                                value={(table.getColumn(searchKey)?.getFilterValue() as string) ?? ""}
                                onChange={(event) =>
                                    table.getColumn(searchKey)?.setFilterValue(event.target.value)
                                }
                                className="pl-8 max-w-sm"
                            />
                        </div>
                    )}

                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowFilters(!showFilters)}
                    >
                        <Filter className="mr-2 h-4 w-4" />
                        Filters
                        {table.getState().columnFilters.length > 0 && (
                            <span className="ml-1 bg-blue-600 text-white rounded-full px-1.5 py-0.5 text-xs">
                                {table.getState().columnFilters.length}
                            </span>
                        )}
                    </Button>

                    {isFiltered && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => table.resetColumnFilters()}
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
                            variant={action.variant || 'default'}
                            size="sm"
                            onClick={action.onClick}
                        >
                            {action.icon && <span className="mr-2">{action.icon}</span>}
                            {action.label}
                        </Button>
                    ))}

                    {enableExport && (
                        <ExportDropdown
                            table={table}
                            columns={columns}
                            exportOptions={exportOptions}
                        />
                    )}

                    <ColumnVisibilityDropdown table={table} />
                </div>
            </div>

            {showFilters && (
                <div className="border rounded-lg p-4 bg-muted/10">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {table.getAllColumns()
                            .filter(column => column.getCanFilter())
                            .map(column => (
                                <div key={column.id} className="border rounded bg-background">
                                    <ColumnFilter
                                        column={column}
                                        title={
                                            typeof column.columnDef.header === "function"
                                                ? column.columnDef.header({ column })
                                                : (column.columnDef.header as string) || column.id
                                        }
                                    />
                                </div>
                            ))}
                    </div>
                </div>
            )}
        </div>
    );
};

// Column Visibility Dropdown
interface ColumnVisibilityDropdownProps<T> {
    table: TanStackTable<T>;
}

const ColumnVisibilityDropdown = <T,>({ table }: ColumnVisibilityDropdownProps<T>) => {
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                    <Settings className="mr-2 h-4 w-4" />
                    View
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <div className="p-2">
                    <div className="text-sm font-medium mb-2">Toggle columns</div>
                    {table
                        .getAllLeafColumns() // only leaf (actual) columns
                        .filter((column) => column.getCanHide()) // only those that can hide
                        .map((column) => (
                            <label key={column.id} className="flex items-center space-x-2 py-1">
                                <input
                                    type="checkbox"
                                    checked={column.getIsVisible()}
                                    onChange={(e) => column.toggleVisibility(e.target.checked)}
                                    className="rounded"
                                />
                                <span className="text-sm">
                                    {flexRender(
                                        column.columnDef.header,
                                        // create a fake context so flexRender works for header
                                        { table, header: { id: column.id, column, getContext: () => ({ table, column, header: null as any }) } }
                                    ) || column.id}
                                </span>
                            </label>
                        ))}
                </div>

            </DropdownMenuContent>
        </DropdownMenu>
    );
};

// Pagination Component
interface DataTablePaginationProps<T> {
    table: TanStackTable<T>;
}

const DataTablePagination = <T,>({ table }: DataTablePaginationProps<T>) => {
    return (
        <div className="flex items-center justify-between px-2">
            <div className="flex-1 text-sm text-muted-foreground">
                {table.getFilteredSelectedRowModel().rows.length} of{" "}
                {table.getFilteredRowModel().rows.length} row(s) selected.
            </div>
            <div className="flex items-center space-x-6 lg:space-x-8">
                <div className="flex items-center space-x-2">
                    <p className="text-sm font-medium">Rows per page</p>
                    <Select
                        value={String(table.getState().pagination.pageSize)}
                        onValueChange={(value) => table.setPageSize(Number(value))}
                    >
                        {[10, 20, 30, 40, 50].map(pageSize => (
                            <SelectItem key={pageSize} value={String(pageSize)}>
                                {pageSize}
                            </SelectItem>
                        ))}
                    </Select>
                </div>
                <div className="flex w-100 items-center justify-center text-sm font-medium">
                    Page {table.getState().pagination.pageIndex + 1} of{" "}
                    {table.getPageCount()}
                </div>
                <div className="flex items-center space-x-2">
                    <Button
                        variant="outline"
                        className="h-8 w-8 p-0"
                        onClick={() => table.setPageIndex(0)}
                        disabled={!table.getCanPreviousPage()}
                    >
                        <ChevronsLeft className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="outline"
                        className="h-8 w-8 p-0"
                        onClick={() => table.previousPage()}
                        disabled={!table.getCanPreviousPage()}
                    >
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="outline"
                        className="h-8 w-8 p-0"
                        onClick={() => table.nextPage()}
                        disabled={!table.getCanNextPage()}
                    >
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="outline"
                        className="h-8 w-8 p-0"
                        onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                        disabled={!table.getCanNextPage()}
                    >
                        <ChevronsRight className="h-4 w-4" />
                    </Button>
                </div>
            </div>
        </div>
    );
};

// Main Data Table Component
export function DataTable<TData extends Record<string, any>, TValue = any>({
    columns,
    data,
    filterConfig = {},
    enableSorting = true,
    enableRowSelection = false,
    enableColumnVisibility = true,
    paginationConfig = { enabled: true, pageSize: 10 },
    enableExport = false,
    exportOptions = {},
    title,
    description,
    onRowClick,
    onRowSelect,
    customActions = [],
    className = "",
}: DataTableProps<TData, TValue>) {
    const [sorting, setSorting] = useState<SortingState>([]);
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
    const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
    const [rowSelection, setRowSelection] = useState({});
    const [globalFilter, setGlobalFilter] = useState("");

    // Enhanced columns with sorting
    const enhancedColumns = useMemo(() => {
        return columns.map(column => ({
            ...column,
            header: (context: any) => {
                const col = context?.column;
                if (!enableSorting || !col?.getCanSort()) {
                    return typeof column.header === 'string' ? column.header :
                        typeof column.header === 'function' ? column.header(context) :
                            column.header;
                }

                return (
                    <Button
                        variant="ghost"
                        onClick={() => col.toggleSorting(col.getIsSorted() === "asc")}
                        className="h-auto p-0 font-medium justify-start"
                    >
                        {typeof column.header === 'string' ? column.header :
                            typeof column.header === 'function' ? column.header(context) :
                                column.header}
                        {col.getIsSorted() === "asc" && <ChevronUp className="ml-2 h-4 w-4" />}
                        {col.getIsSorted() === "desc" && <ChevronDown className="ml-2 h-4 w-4" />}
                        {!col.getIsSorted() && <ArrowUpDown className="ml-2 h-4 w-4 opacity-50" />}
                    </Button>
                );
            }
        }));
    }, [columns, enableSorting]);

    const table = useReactTable({
        data,
        columns: enhancedColumns,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: paginationConfig.enabled ? getPaginationRowModel() : undefined,
        getSortedRowModel: enableSorting ? getSortedRowModel() : undefined,
        getFilteredRowModel: getFilteredRowModel(),
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
        onColumnVisibilityChange: setColumnVisibility,
        onRowSelectionChange: setRowSelection,
        onGlobalFilterChange: setGlobalFilter,
        globalFilterFn: "includesString",
        state: {
            sorting,
            columnFilters,
            columnVisibility,
            rowSelection,
            globalFilter,
        },
        initialState: {
            pagination: {
                pageSize: paginationConfig.pageSize || 10,
            },
        },
        enableRowSelection,
        enableGlobalFilter: filterConfig.enableGlobalFilter,
    });

    // Handle row selection callback
    useEffect(() => {
        if (onRowSelect && enableRowSelection) {
            const selectedRows = table.getSelectedRowModel().rows.map(row => row.original);
            onRowSelect(selectedRows);
        }
    }, [rowSelection, onRowSelect, enableRowSelection, table]);

    return (
        <div className={`space-y-4 ${className}`}>
            <DataTableToolbar
                table={table}
                columns={columns}
                filterConfig={filterConfig}
                enableExport={enableExport}
                exportOptions={exportOptions}
                customActions={customActions}
                title={title}
                description={description}
            />

            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id}>
                                {headerGroup.headers.map((header) => {
                                    return (
                                        <TableHead key={header.id}>
                                            {header.isPlaceholder
                                                ? null
                                                : flexRender(
                                                    header.column.columnDef.header,
                                                    header.getContext()
                                                )}
                                        </TableHead>
                                    );
                                })}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody>
                        {table.getRowModel().rows?.length ? (
                            table.getRowModel().rows.map((row) => (
                                <TableRow
                                    key={row.id}
                                    data-state={row.getIsSelected() && "selected"}
                                    className={onRowClick ? "cursor-pointer" : ""}
                                    onClick={() => onRowClick?.(row)}
                                >
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell key={cell.id}>
                                            {flexRender(
                                                cell.column.columnDef.cell,
                                                cell.getContext()
                                            )}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell
                                    colSpan={enhancedColumns.length}
                                    className="h-24 text-center"
                                >
                                    No results found.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            {paginationConfig.enabled && <DataTablePagination table={table} />}
        </div>
    );
}

// Demo Types
interface User {
    id: number;
    name: string;
    email: string;
    role: 'Admin' | 'User' | 'Editor';
    status: 'Active' | 'Inactive';
    joinDate: string;
    lastLogin: string;
}

// Demo component showing usage examples
// const DataTableDemo: React.FC = () => {
//     const [selectedUsers, setSelectedUsers] = useState<User[]>([]);

//     // Sample data with proper typing
//     const data: User[] = [
//         {
//             id: 1,
//             name: "John Doe",
//             email: "john@example.com",
//             role: "Admin",
//             status: "Active",
//             joinDate: "2023-01-15",
//             lastLogin: "2024-12-01"
//         },
//         {
//             id: 2,
//             name: "Jane Smith",
//             email: "jane@example.com",
//             role: "User",
//             status: "Inactive",
//             joinDate: "2023-03-22",
//             lastLogin: "2024-11-28"
//         },
//         {
//             id: 3,
//             name: "Bob Johnson",
//             email: "bob@example.com",
//             role: "Editor",
//             status: "Active",
//             joinDate: "2023-06-10",
//             lastLogin: "2024-12-02"
//         },
//         {
//             id: 4,
//             name: "Alice Brown",
//             email: "alice@example.com",
//             role: "User",
//             status: "Active",
//             joinDate: "2023-08-05",
//             lastLogin: "2024-11-30"
//         },
//         {
//             id: 5,
//             name: "Charlie Wilson",
//             email: "charlie@example.com",
//             role: "Admin",
//             status: "Inactive",
//             joinDate: "2023-02-18",
//             lastLogin: "2024-11-25"
//         },
//         {
//             id: 6,
//             name: "Diana Prince",
//             email: "diana@example.com",
//             role: "Editor",
//             status: "Active",
//             joinDate: "2023-07-12",
//             lastLogin: "2024-12-01"
//         },
//         {
//             id: 7,
//             name: "Eva Martinez",
//             email: "eva@example.com",
//             role: "User",
//             status: "Active",
//             joinDate: "2023-09-30",
//             lastLogin: "2024-11-29"
//         },
//         {
//             id: 8,
//             name: "Frank Wilson",
//             email: "frank@example.com",
//             role: "Editor",
//             status: "Active",
//             joinDate: "2023-04-20",
//             lastLogin: "2024-11-27"
//         },
//         {
//             id: 9,
//             name: "Grace Lee",
//             email: "grace@example.com",
//             role: "User",
//             status: "Inactive",
//             joinDate: "2023-08-15",
//             lastLogin: "2024-10-15"
//         },
//         {
//             id: 10,
//             name: "Henry Davis",
//             email: "henry@example.com",
//             role: "Admin",
//             status: "Active",
//             joinDate: "2023-01-30",
//             lastLogin: "2024-12-02"
//         },
//     ];

//     // Column definitions with proper typing
//     const columns: ColumnDef<User>[] = [
//         {
//             id: "select",
//             header: ({ table }) => (
//                 <input
//                     type="checkbox"
//                     checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && "indeterminate")}
//                     onChange={(e) => table.toggleAllPageRowsSelected(e.target.checked)}
//                     className="rounded"
//                 />
//             ),
//             cell: ({ row }) => (
//                 <input
//                     type="checkbox"
//                     checked={row.getIsSelected()}
//                     onChange={(e) => row.toggleSelected(e.target.checked)}
//                     className="rounded"
//                 />
//             ),
//             enableSorting: false,
//             enableHiding: false,
//         },
//         {
//             accessorKey: "name",
//             header: "Name",
//             cell: ({ row }) => (
//                 <div className="font-medium">{row.getValue("name")}</div>
//             ),
//         },
//         {
//             accessorKey: "email",
//             header: "Email",
//             cell: ({ row }) => (
//                 <div className="text-gray-600">{row.getValue("email")}</div>
//             ),
//         },
//         {
//             accessorKey: "role",
//             header: "Role",
//             cell: ({ row }) => {
//                 const role = row.getValue("role") as string;
//                 return (
//                     <span className={`px-2 py-1 rounded-full text-xs font-medium ${role === "Admin" ? "bg-purple-100 text-purple-800" :
//                         role === "Editor" ? "bg-blue-100 text-blue-800" :
//                             "bg-gray-100 text-gray-800"
//                         }`}>
//                         {role}
//                     </span>
//                 );
//             },
//         },
//         {
//             accessorKey: "status",
//             header: "Status",
//             cell: ({ row }) => {
//                 const status = row.getValue("status") as string;
//                 return (
//                     <span className={`px-2 py-1 rounded-full text-xs font-medium ${status === "Active" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
//                         }`}>
//                         {status}
//                     </span>
//                 );
//             },
//         },
//         {
//             accessorKey: "joinDate",
//             header: "Join Date",
//             cell: ({ row }) => {
//                 const date = new Date(row.getValue("joinDate"));
//                 return <div>{date.toLocaleDateString()}</div>;
//             },
//         },
//         {
//             accessorKey: "lastLogin",
//             header: "Last Login",
//             cell: ({ row }) => {
//                 const date = new Date(row.getValue("lastLogin"));
//                 return <div className="text-sm text-gray-600">{date.toLocaleDateString()}</div>;
//             },
//         },
//         {
//             id: "actions",
//             header: "Actions",
//             cell: ({ row }) => {
//                 return (
//                     <div className="flex items-center space-x-2">
//                         <Button variant="ghost" size="sm">
//                             <Edit className="h-4 w-4 mr-1" />
//                             Edit
//                         </Button>
//                         <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700">
//                             <Trash2 className="h-4 w-4 mr-1" />
//                             Delete
//                         </Button>
//                     </div>
//                 );
//             },
//             enableSorting: false,
//             enableHiding: false,
//         },
//     ];

//     const handleRowClick = useCallback((row: Row<User>) => {
//         console.log("Row clicked:", row.original);
//     }, []);

//     const handleRowSelect = useCallback((selectedRows: User[]) => {
//         setSelectedUsers(selectedRows);
//         console.log("Selected rows:", selectedRows);
//     }, []);

//     const customActions: CustomAction[] = [
//         {
//             label: "Add User",
//             icon: <Plus className="h-4 w-4" />,
//             onClick: () => console.log("Add user clicked"),
//             variant: "default"
//         },
//         {
//             label: "Bulk Actions",
//             onClick: () => console.log("Bulk actions clicked"),
//             variant: "outline"
//         }
//     ];

//     return (
//         <div className="max-w-full overflow-auto md:max-w-[600px] lg:max-w-[700px] xl:max-w-[1000px] 2xl:max-w-full mx-auto py-6 px-4 ">
//   <DataTable
//     columns={columns}
//     data={data}
//     filterConfig={{
//       enableGlobalFilter: true,
//       searchKey: "name",
//       searchPlaceholder: "Search users...",
//     }}
//     enableSorting={true}
//     enableRowSelection={true}
//     enableColumnVisibility={true}
//     enableExport={true}
//     exportOptions={{
//       filename: "users_export",
//       includeHeaders: true,
//       selectedRowsOnly: false,
//     }}
//     paginationConfig={{
//       enabled: true,
//       pageSize: 5,
//       pageSizeOptions: [5, 10, 20, 50],
//     }}
//     title="User Management Dashboard"
//     description="Manage your team members, roles, and permissions with advanced filtering and export capabilities."
//     onRowClick={handleRowClick}
//     onRowSelect={handleRowSelect}
//     customActions={customActions}
//     className="w-full"
//   />

//   {selectedUsers.length > 0 && (
//     <div className="mt-6 p-4 sm:p-6 bg-blue-50 border border-blue-200 rounded-lg">
//       <h3 className="text-base md:text-lg font-semibold mb-2 text-blue-800">
//         Selected Users ({selectedUsers.length}):
//       </h3>
//       <div className="space-y-1">
//         {selectedUsers.map((user) => (
//           <div key={user.id} className="text-sm md:text-base text-blue-700">
//             {user.name} - {user.email}
//           </div>
//         ))}
//       </div>
//     </div>
//   )}

//   <div className="mt-8 p-4 sm:p-6 bg-gray-50 rounded-lg">
//     <h3 className="text-base md:text-lg font-semibold mb-4">Features Demonstrated:</h3>
//     <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
//       <ul className="text-sm md:text-base space-y-1 text-gray-700">
//         <li>✅ Advanced TypeScript support with proper generics</li>
//         <li>✅ Global search and column-specific filtering</li>
//         <li>✅ Row selection with callbacks</li>
//         <li>✅ Sortable columns with indicators</li>
//         <li>✅ Export to CSV, Excel, and PDF formats</li>
//       </ul>
//       <ul className="text-sm md:text-base space-y-1 text-gray-700">
//         <li>✅ Column visibility controls</li>
//         <li>✅ Pagination with configurable page sizes</li>
//         <li>✅ Custom actions and row click handlers</li>
//         <li>✅ Responsive design with modern UI</li>
//         <li>✅ Advanced filtering with faceted values</li>
//       </ul>
//     </div>
//   </div>
// </div>

//     );
// };

// export default DataTableDemo;