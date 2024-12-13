"use client";

import type {
  ColumnDef,
  ColumnFiltersState,
  PaginationState,
  SortingState,
  Table as TTable,
  VisibilityState,
  FilterFn,
} from "@tanstack/react-table";
import {
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import * as React from "react";
import { useEffect } from "react";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/custom/table";
import { DataTableFilterControls } from "@/components/data-table/data-table-filter-controls";
import { DataTablePagination } from "@/components/data-table/data-table-pagination";
import { DataTableFilterCommand } from "@/components/data-table/data-table-filter-command";
import { columnFilterSchema } from "./schema";
import type { DataTableFilterField } from "@/components/data-table/types";
import { DataTableToolbar } from "@/components/data-table/data-table-toolbar";
import { cn } from "@/lib/utils";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { useQueryStates } from "nuqs";
import { searchParamsParser } from "./search-params";
import { inDateRange } from "@/lib/table/filterfns";

export interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  total?: number;
  defaultColumnFilters?: ColumnFiltersState;
  filterFields?: DataTableFilterField<TData>[];
  pagination?: {
    pageIndex: number;
    pageSize: number;
    pageCount: number;
    onPageChange: (page: number) => void;
    onPageSizeChange: (pageSize: number) => void;
  };
}

export function DataTable<TData, TValue>({
  columns,
  data,
  total,
  defaultColumnFilters = [],
  filterFields = [],
  pagination,
}: DataTableProps<TData, TValue>) {
  const [columnFilters, setColumnFilters] = useLocalStorage<ColumnFiltersState>(
    "tableFilters",
    defaultColumnFilters
  );
  const [sorting, setSorting] = useLocalStorage<SortingState>(
    "tableSorting",
    []
  );
  const [columnVisibility, setColumnVisibility] =
    useLocalStorage<VisibilityState>("data-table-visibility", {});
  const [controlsOpen, setControlsOpen] = useLocalStorage(
    "data-table-controls",
    true
  );
  const [_, setSearch] = useQueryStates(searchParamsParser);
  const [columnOrder, setColumnOrder] = useLocalStorage<string[]>(
    "tableColumnOrder",
    []
  );
  const [pageIndex, setPageIndex] = useLocalStorage<number>("tablePage", 0);
  const [pageSize, setPageSize] = useLocalStorage<number>("tablePageSize", 100);

  const table = useReactTable({
    data,
    columns,
    state: {
      columnFilters,
      sorting,
      columnVisibility,
      pagination: pagination
        ? {
          pageIndex: pagination.pageIndex,
          pageSize: pagination.pageSize,
        }
        : { pageIndex: 0, pageSize: 10 },
      columnOrder
    },
    manualPagination: true,
    pageCount: pagination?.pageCount ?? -1,
    filterFns: {
      inDateRange,
    },
    onColumnVisibilityChange: setColumnVisibility,
    onColumnFiltersChange: setColumnFilters,
    onSortingChange: setSorting,
    onPaginationChange: (updater) => {
      if (pagination) {
        const newState =
          typeof updater === 'function'
            ? updater({ pageIndex: pagination.pageIndex, pageSize: pagination.pageSize })
            : updater;

        pagination.onPageChange(newState.pageIndex);
        if (newState.pageSize !== pagination.pageSize) {
          pagination.onPageSizeChange(newState.pageSize);
        }
      }
    },
    onColumnOrderChange: setColumnOrder,
    getSortedRowModel: getSortedRowModel(),
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    meta: {
      total: total
    },
  });

  React.useEffect(() => {
    const columnFiltersWithNullable = filterFields.map((field) => {
      const filterValue = columnFilters.find(
        (filter) => filter.id === field.value
      );
      if (!filterValue) return { id: field.value, value: null };
      return { id: field.value, value: filterValue.value };
    });

    const search = columnFiltersWithNullable.reduce((prev, curr) => {
      prev[curr.id as string] = curr.value;
      return prev;
    }, {} as Record<string, unknown>);

    console.log({ search });

    setSearch(search);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [columnFilters]);

  return (
    <div className="flex w-full h-full flex-col gap-3 sm:flex-row">
      <div
        className={cn(
          "w-full p-1 sm:min-w-52 sm:max-w-52 sm:self-start md:min-w-64 md:max-w-64",
          !controlsOpen && "hidden"
        )}
      >
        <div className="-m-1 h-full p-1">
          <DataTableFilterControls
            table={table}
            columns={columns}
            filterFields={filterFields}
          />
        </div>
      </div>
      <div className="flex max-w-full flex-1 flex-col gap-4 overflow-hidden p-1">
        <DataTableFilterCommand
          table={table}
          schema={columnFilterSchema}
          filterFields={filterFields}
        />
        <DataTableToolbar
          table={table}
          controlsOpen={controlsOpen}
          setControlsOpen={setControlsOpen}
        />
        <div className="rounded-md border">
          <Table>
            <TableHeader className="bg-muted/50">
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id} className="hover:bg-transparent">
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
              {table.getRowModel().rows && table.getRowModel().rows.length > 0 ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
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
                    colSpan={columns.length}
                    className="h-24 text-center"
                  >
                    Nessun risultato.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}

