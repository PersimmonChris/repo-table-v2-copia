"use client";

import { Badge } from "@/components/ui/badge";
import type { ColumnDef } from "@tanstack/react-table";
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import { format } from "date-fns";
import type { ColumnSchema } from "./schema";
import React from "react";
import Link from "next/link";

export const columns: ColumnDef<ColumnSchema>[] = [
  {
    accessorKey: "nome",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Nome" />
    ),
    enableHiding: false,
    cell: ({ row }) => {
      const value = row.getValue("nome");
      if (typeof value !== "string") return null;
      return (
        <Link
          href={`/cv/${row.original.id}`}
          className="text-blue-600 hover:text-blue-800 hover:underline"
        >
          {value}
        </Link>
      );
    },
  },
  {
    accessorKey: "cognome",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Cognome" />
    ),
    enableHiding: false,
    cell: ({ row }) => {
      const value = row.getValue("cognome");
      if (typeof value !== "string") return null;
      return <div>{value}</div>;
    },
  },
  {
    accessorKey: "citta",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Città" />
    ),
    cell: ({ row }) => {
      const value = row.getValue("citta");
      if (typeof value !== "string") return null;
      return <div>{value}</div>;
    },
  },
  {
    accessorKey: "data_nascita",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Data di Nascita" />
    ),
    cell: ({ row }) => {
      const value = row.getValue("data_nascita");
      if (!value || !(typeof value === 'string' || value instanceof Date)) {
        return null;
      }
      return (
        <div className="text-xs text-muted-foreground" suppressHydrationWarning>
          {format(typeof value === 'string' ? new Date(value) : value, "dd/MM/yyyy")}
        </div>
      );
    },
  },
  {
    accessorKey: "anni_esperienza",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Anni Esp." />
    ),
    cell: ({ row }) => {
      const value = row.getValue("anni_esperienza");
      if (typeof value !== "number") return null;
      return <div className="font-mono">{value}</div>;
    },
  },
  {
    accessorKey: "tools",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Tools" />
    ),
    cell: ({ row }) => {
      const value = row.getValue("tools");
      if (!value || !Array.isArray(value)) return null;
      return (
        <div className="flex flex-wrap gap-1">
          {value.map((tool) => (
            <Badge key={tool} variant="outline">
              {tool}
            </Badge>
          ))}
        </div>
      );
    },
    filterFn: (row, id, value) => {
      const array = row.getValue(id);
      if (!array || !Array.isArray(array)) return false;
      if (typeof value === "string") return array.includes(value);
      if (Array.isArray(value)) return value.some((i) => array.includes(i));
      return false;
    },
  },
  {
    accessorKey: "linguaggi_programmazione",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Linguaggi" />
    ),
    meta: {
      label: "Linguaggi"
    },
    cell: ({ row }) => {
      const value = row.getValue("linguaggi_programmazione");
      if (!value || !Array.isArray(value)) return null;
      return (
        <div className="flex flex-wrap gap-1">
          {value.map((lang) => (
            <Badge key={lang} variant="outline">
              {lang}
            </Badge>
          ))}
        </div>
      );
    },
    filterFn: (row, id, value) => {
      const array = row.getValue(id);
      if (!array || !Array.isArray(array)) return false;
      if (typeof value === "string") return array.includes(value);
      if (Array.isArray(value)) return value.some((i) => array.includes(i));
      return false;
    },
  },
  {
    accessorKey: "stipendio_attuale",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="RAL Attuale" />
    ),
    cell: ({ row }) => {
      const value = row.getValue("stipendio_attuale");
      if (typeof value !== "number") return null;
      return <div className="font-mono">€ {value.toLocaleString()}</div>;
    },
    filterFn: "inNumberRange",
  },
  {
    accessorKey: "created_at",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Data Inserimento" />
    ),
    cell: ({ row }) => {
      const value = row.getValue("created_at");
      if (!value || (typeof value !== 'string' && !(value instanceof Date))) return null;
      const date = typeof value === 'string' ? new Date(value) : value;
      return (
        <div className="font-mono whitespace-nowrap">
          {format(date, "dd/MM/yyyy HH:mm:ss")}
        </div>
      );
    },
    filterFn: "inDateRange",
    enableSorting: true,
    enableHiding: true,
  },
  {
    accessorKey: "database",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Database" />
    ),
    cell: ({ row }) => {
      const value = row.getValue("database");
      if (!value || !Array.isArray(value)) return null;
      return (
        <div className="flex flex-wrap gap-1">
          {value.map((db) => (
            <Badge key={db} variant="outline">
              {db}
            </Badge>
          ))}
        </div>
      );
    },
    filterFn: (row, id, value) => {
      const array = row.getValue(id);
      if (!array || !Array.isArray(array)) return false;
      if (typeof value === "string") return array.includes(value);
      if (Array.isArray(value)) return value.some((i) => array.includes(i));
      return false;
    },
  },
  {
    accessorKey: "piattaforme",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Piattaforme" />
    ),
    cell: ({ row }) => {
      const value = row.getValue("piattaforme");
      if (!value || !Array.isArray(value)) return null;
      return (
        <div className="flex flex-wrap gap-1">
          {value.map((platform) => (
            <Badge key={platform} variant="outline">
              {platform}
            </Badge>
          ))}
        </div>
      );
    },
    filterFn: (row, id, value) => {
      const array = row.getValue(id);
      if (!array || !Array.isArray(array)) return false;
      if (typeof value === "string") return array.includes(value);
      if (Array.isArray(value)) return value.some((i) => array.includes(i));
      return false;
    },
  },
  {
    accessorKey: "sistemi_operativi",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Sistemi Operativi" />
    ),
    cell: ({ row }) => {
      const value = row.getValue("sistemi_operativi");
      if (!value || !Array.isArray(value)) return null;
      return (
        <div className="flex flex-wrap gap-1">
          {value.map((os) => (
            <Badge key={os} variant="outline">
              {os}
            </Badge>
          ))}
        </div>
      );
    },
    filterFn: (row, id, value) => {
      const array = row.getValue(id);
      if (!array || !Array.isArray(array)) return false;
      if (typeof value === "string") return array.includes(value);
      if (Array.isArray(value)) return value.some((i) => array.includes(i));
      return false;
    },
  },
  {
    accessorKey: "contratto_attuale",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Contratto" />
    ),
    cell: ({ row }) => {
      const value = row.getValue("contratto_attuale");
      if (typeof value !== "string") return null;
      return (
        <Badge
          variant="outline"
          className="bg-[#FAEBDD] text-[#D9730D] border-transparent"
        >
          {value}
        </Badge>
      );
    },
  },
  {
    accessorKey: "scadenza_contratto",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Scadenza" />
    ),
    cell: ({ row }) => {
      const value = row.getValue("scadenza_contratto");
      if (!value || !(typeof value === 'string' || value instanceof Date)) {
        return null;
      }
      return (
        <div className="text-xs text-muted-foreground" suppressHydrationWarning>
          {format(typeof value === 'string' ? new Date(value) : value, "dd/MM/yyyy")}
        </div>
      );
    },
  },
  {
    accessorKey: "preavviso",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Preavviso" />
    ),
    cell: ({ row }) => {
      const value = row.getValue("preavviso");
      if (typeof value !== "string") return null;
      return <div>{value}</div>;
    },
  },
  {
    accessorKey: "stipendio_desiderato",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="RAL Desiderata" />
    ),
    cell: ({ row }) => {
      const value = row.getValue("stipendio_desiderato");
      if (typeof value !== "number") return null;
      return <div className="font-mono">€ {value.toLocaleString()}</div>;
    },
    filterFn: "inNumberRange",
  },
  {
    accessorKey: "competenze",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Ruolo" />
    ),
    cell: ({ row }) => {
      const value = row.getValue("competenze");
      if (typeof value !== "string") return null;
      return (
        <Badge
          variant="outline"
          className="bg-[#ddf4ff] text-[#0969da] border-transparent "
        >
          {value}
        </Badge>
      );
    },
  },
  {
    accessorKey: "email",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Email" />
    ),
    cell: ({ row }) => <div>{row.getValue("email")}</div>,
    enableSorting: true,
    enableHiding: true,
  },
  {
    accessorKey: "ultimo_contatto",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Ultimo Contatto" />
    ),
    cell: ({ row }) => {
      const value = row.getValue("ultimo_contatto");
      if (!value || (typeof value !== 'string' && !(value instanceof Date))) return "N/A";
      const date = typeof value === 'string' ? new Date(value) : value;
      return format(date, "dd/MM/yyyy");
    },
    filterFn: "inDateRange",
    enableSorting: true,
    enableHiding: true,
  },
  {
    accessorKey: "tipo_contratto_desiderato",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Contratto Desiderato" />
    ),
    cell: ({ row }) => {
      const value = row.getValue("tipo_contratto_desiderato");
      if (typeof value !== "string") return null;
      return (
        <Badge
          variant="outline"
          className="bg-[#FAEBDD] text-[#D9730D] border-transparent"
        >
          {value}
        </Badge>
      );
    },
  },
];
