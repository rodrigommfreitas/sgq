import React, {type Dispatch, type SetStateAction, useState} from 'react';
import {
    type ColumnDef,
    flexRender,
    getCoreRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    type SortingState,
    useReactTable,
    getFilteredRowModel,
    type ColumnFiltersState
} from '@tanstack/react-table';
import {type NCStatus, type NonConformity} from '@/types';

import {ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, MoreHorizontal, ArrowUpDown} from 'lucide-react';
import {Button} from "@/components/ui/button.tsx";
import {Badge} from "@/components/ui/badge.tsx";
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "@/components/ui/table.tsx";
import {Input} from "@/components/ui/input.tsx";

interface NonConformityTableProps {
    data: NonConformity[];
    onCreateNew: Dispatch<SetStateAction<boolean>>;
}

export const NonConformityTable: React.FC<NonConformityTableProps> = ({data, onCreateNew}) => {
    const [sorting, setSorting] = useState<SortingState>([]);
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

    const columns: ColumnDef<NonConformity>[] = [
        {
            accessorKey: 'name',
            header: ({column}) => {
                return (
                    <Button
                        variant="ghost"
                        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                        className="-ml-4 h-8"
                    >
                        Name
                        <ArrowUpDown className="ml-2 h-4 w-4"/>
                    </Button>
                )
            },
            cell: ({row}) => <div className="font-medium">{row.getValue('name')}</div>,
        },
        {accessorKey: "origin", header: "Origem"},
        {
            accessorKey: "status",
            header: "Estado",
            cell: ({row}) => {
                const status = row.getValue('status') as NCStatus;

                return <Badge
                    variant={status === "IN_PROGRESS" ? "default" : status === "RESOLVED" ? "secondary" : "outline"}>{status}</Badge>
            },
        },
        {accessorKey: "evaluation", header: "Avaliação"},
        {accessorKey: "actions", header: "Ações"},
        {accessorKey: "reportedDate", header: "Reportada Em"},
        {
            accessorKey: "comment",
            header: "Comentário",
            cell: ({row}) => (
                <span className="truncate max-w-[200px] block text-muted-foreground cursor-pointer">
          {row.getValue("comment")}
        </span>
            ),
        },
    ]

    const columnsss: ColumnDef<NonConformity>[] = [
        {
            accessorKey: 'createdAt',
            header: 'Reported Date',
            cell: ({row}) => {
                const date = row.getValue('createdAt') as Date;
                return <span className="text-muted-foreground">{date.toLocaleDateString()}</span>;
            },
        },
        {
            id: "actions",
            cell: ({row}) => {
                return (
                    <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-4 w-4"/>
                    </Button>
                )
            },
        },
    ];

    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        onSortingChange: setSorting,
        getSortedRowModel: getSortedRowModel(),
        onColumnFiltersChange: setColumnFilters,
        getFilteredRowModel: getFilteredRowModel(),
        state: {
            sorting,
            columnFilters,
        },
        initialState: {
            pagination: {
                pageSize: 10,
            }
        }
    });

    return (
        <div className="flex flex-col h-full gap-4">
            <div className="flex items-center justify-between gap-4">
                <Input
                    placeholder="Pesquisar..."
                    value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
                    onChange={(event) =>
                        table.getColumn("name")?.setFilterValue(event.target.value)
                    }
                    className="max-w-sm"
                />
                <Button onClick={() => onCreateNew(true)}>Registar Não Conformidade</Button>
            </div>

            {/* Table Container - flex-1 and min-h-0 are crucial for scrolling within flex layout */}
            <div className="flex-1 min-h-0 rounded-md border bg-white shadow-sm overflow-auto relative">
                <Table>
                    <TableHeader className="bg-muted/50 sticky top-0 z-10 shadow-sm">
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id} className="hover:bg-muted/50">
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
                                    )
                                })}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody>
                        {table.getRowModel().rows?.length ? (
                            table.getRowModel().rows.map((row, index) => (
                                <TableRow
                                    key={index}
                                    data-state={row.getIsSelected() && "selected"}
                                >
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell key={cell.id}>
                                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={columns.length} className="h-24 text-center">
                                    No results.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Pagination Controls */}
            <div className="flex items-center justify-between px-2">
                <div className="hidden flex-1 text-sm text-muted-foreground md:block">
                    {table.getFilteredRowModel().rows.length} row(s) total.
                </div>
                <div className="flex items-center space-x-6 lg:space-x-8">
                    <div className="flex items-center space-x-2">
                        <p className="text-sm font-medium">Rows per page</p>
                        <select
                            value={`${table.getState().pagination.pageSize}`}
                            onChange={(e) => {
                                table.setPageSize(Number(e.target.value))
                            }}
                            className="h-8 w-[70px]"
                        >
                            {[10, 20, 30, 40, 50].map((pageSize) => (
                                <option key={pageSize} value={`${pageSize}`}>
                                    {pageSize}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="flex w-[100px] items-center justify-center text-sm font-medium">
                        Page {table.getState().pagination.pageIndex + 1} of{" "}
                        {table.getPageCount()}
                    </div>
                    <div className="flex items-center space-x-2">
                        <Button
                            variant="outline"
                            className="hidden h-8 w-8 p-0 lg:flex"
                            onClick={() => table.setPageIndex(0)}
                            disabled={!table.getCanPreviousPage()}
                        >
                            <span className="sr-only">Go to first page</span>
                            <ChevronsLeft className="h-4 w-4"/>
                        </Button>
                        <Button
                            variant="outline"
                            className="h-8 w-8 p-0"
                            onClick={() => table.previousPage()}
                            disabled={!table.getCanPreviousPage()}
                        >
                            <span className="sr-only">Go to previous page</span>
                            <ChevronLeft className="h-4 w-4"/>
                        </Button>
                        <Button
                            variant="outline"
                            className="h-8 w-8 p-0"
                            onClick={() => table.nextPage()}
                            disabled={!table.getCanNextPage()}
                        >
                            <span className="sr-only">Go to next page</span>
                            <ChevronRight className="h-4 w-4"/>
                        </Button>
                        <Button
                            variant="outline"
                            className="hidden h-8 w-8 p-0 lg:flex"
                            onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                            disabled={!table.getCanNextPage()}
                        >
                            <span className="sr-only">Go to last page</span>
                            <ChevronsRight className="h-4 w-4"/>
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};