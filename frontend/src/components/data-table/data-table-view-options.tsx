"use client";

import { Check, GripVertical, Settings2 } from "lucide-react";
import type { Table } from "@tanstack/react-table";

import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import {
  Sortable,
  SortableDragHandle,
  SortableItem,
} from "@/components/custom/sortable";

interface DataTableViewOptionsProps<TData> {
  table: Table<TData>;
  enableOrdering?: boolean;
}

export function DataTableViewOptions<TData>({
  table,
  enableOrdering = true,
}: DataTableViewOptionsProps<TData>) {
  const [open, setOpen] = useState(false);
  const [drag, setDrag] = useState(false);

  const columnOrder = table.getState().columnOrder;

  const columns = useMemo(
    () =>
      table
        .getAllColumns()
        .filter(
          (column) => typeof column.accessorFn !== "undefined"
        )
        .sort((a, b) => {
          return columnOrder.indexOf(a.id) - columnOrder.indexOf(b.id);
        }),
    [table, columnOrder]
  );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          role="combobox"
          aria-expanded={open}
          className="h-9 w-9"
        >
          <Settings2 className="h-4 w-4" />
          <span className="sr-only">Visualizza colonne</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent side="bottom" align="end" className="w-[200px] p-0">
        <Command>
          <CommandList>
            <CommandEmpty>Nessuna colonna trovata.</CommandEmpty>
            <CommandGroup>
              <Sortable
                value={columns.map((c) => ({ id: c.id }))}
                onValueChange={(items) =>
                  table.setColumnOrder(items.map((c) => c.id))
                }
                overlay={<div className="w-full h-8 rounded-md bg-muted/60" />}
                onDragStart={() => setDrag(true)}
                onDragEnd={() => setDrag(false)}
                onDragCancel={() => setDrag(false)}
              >
                {columns.map((column) => (
                  <SortableItem key={column.id} value={column.id} asChild>
                    <CommandItem
                      value={column.id}
                      onSelect={() => {
                        if (column.getCanHide()) {
                          column.toggleVisibility(!column.getIsVisible());
                        }
                      }}
                      className={"capitalize"}
                      disabled={drag || !column.getCanHide()}
                    >
                      <div
                        className={cn(
                          "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary",
                          column.getIsVisible()
                            ? "bg-primary text-primary-foreground"
                            : "opacity-50 [&_svg]:invisible"
                        )}
                      >
                        <Check className={cn("h-4 w-4")} />
                      </div>
                      <span>{column.columnDef.meta?.label || column.id}</span>
                      {enableOrdering ? (
                        <SortableDragHandle
                          variant="ghost"
                          size="icon"
                          className="size-5 ml-auto text-muted-foreground hover:text-foreground focus:bg-muted focus:text-foreground"
                        >
                          <GripVertical className="size-4" aria-hidden="true" />
                        </SortableDragHandle>
                      ) : null}
                    </CommandItem>
                  </SortableItem>
                ))}
              </Sortable>
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
