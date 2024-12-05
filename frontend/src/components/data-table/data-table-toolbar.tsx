"use client";

import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { Table } from "@tanstack/react-table";
import { LoaderCircle, PanelLeftClose, PanelLeftOpen, X } from "lucide-react";
import { DataTableViewOptions } from "./data-table-view-options";
import { useEffect } from "react";
import { Kbd } from "@/components/custom/kbd";
import { UploadButton } from "@/components/upload/upload-button";

interface DataTableToolbarProps<TData> {
  table: Table<TData>;
  controlsOpen: boolean;
  setControlsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  isLoading?: boolean;
  enableColumnOrdering?: boolean;
}

export function DataTableToolbar<TData>({
  table,
  controlsOpen,
  setControlsOpen,
  isLoading,
  enableColumnOrdering,
}: DataTableToolbarProps<TData>) {
  const filters = table.getState().columnFilters;

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "b" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setControlsOpen((prev) => !prev);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, [setControlsOpen]);

  return (
    <div className="flex flex-wrap items-center justify-between gap-4">
      <div className="flex flex-wrap items-center gap-2">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setControlsOpen((prev) => !prev)}
                className="flex gap-2"
              >
                {controlsOpen ? (
                  <>
                    <PanelLeftClose className="h-4 w-4" />
                    <span className="hidden sm:block">Nascondi filtri</span>
                  </>
                ) : (
                  <>
                    <PanelLeftOpen className="h-4 w-4" />
                    <span className="hidden sm:block">Mostra filtri</span>
                  </>
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">
              <p>
                Mostra/nascondi filtri con{" "}
                <Kbd className="ml-1 text-muted-foreground group-hover:text-accent-foreground">
                  <span className="mr-0.5">⌘</span>
                  <span>B</span>
                </Kbd>
              </p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        <p className="text-sm text-muted-foreground">
          {table.getFilteredRowModel().rows.length} di{" "}
          {table.getCoreRowModel().rows.length} righe filtrate
        </p>
        {isLoading ? (
          <LoaderCircle className="ml-2 h-4 w-4 animate-spin text-muted-foreground" />
        ) : null}
      </div>
      <div className="flex items-center gap-2">
        {filters.length ? (
          <Button
            size="sm"
            variant="ghost"
            onClick={() => table.resetColumnFilters()}
          >
            <X className="mr-2 h-4 w-4" />
            Reset
          </Button>
        ) : null}
        <UploadButton />
        <DataTableViewOptions
          table={table}
          enableOrdering={enableColumnOrdering}
        />
      </div>
    </div>
  );
}
