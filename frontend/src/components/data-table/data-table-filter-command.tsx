"use client";

import type { Table } from "@tanstack/react-table";
import type { DataTableFilterField } from "./types";

interface DataTableFilterCommandProps<TData> {
    table: Table<TData>;
    options: { label: string; value: string }[];
}

export function DataTableFilterCommand<TData>({
    table,
    options,
}: DataTableFilterCommandProps<TData>) {
    return (
        <div>
            {/* ... resto del componente ... */}
            <button
                onClick={(optionValue: string) => {
                    // ... logica del click ...
                }}
            >
                {/* ... contenuto del bottone ... */}
            </button>
        </div>
    );
}