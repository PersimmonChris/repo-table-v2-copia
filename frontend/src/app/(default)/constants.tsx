"use client";

import type { ColumnDef } from "@tanstack/react-table";
import type { DataTableFilterField } from "@/components/data-table/types";
import type { ColumnSchema } from "./schema";
import { subDays, subHours, format } from "date-fns";
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";

// Aggiorniamo i dati di esempio con i nuovi campi
export const data: ColumnSchema[] = [
  {
    id: "1",
    nome: "Mario",
    cognome: "Rossi",
    citta: "Milano",
    data_nascita: new Date("1990-01-01"),
    cellulare: "3331234567",
    anni_esperienza: 5,
    competenze: "Full Stack Developer",
    tools: ["VS Code", "Git", "Docker"],
    database: ["MySQL", "MongoDB"],
    piattaforme: ["AWS", "Azure"],
    sistemi_operativi: ["Linux", "Windows"],
    linguaggi_programmazione: ["JavaScript", "Python", "Java"],
    contratto_attuale: "Indeterminato",
    stipendio_attuale: 45000,
    scadenza_contratto: null,
    preavviso: "3 mesi",
    tipo_contratto_desiderato: "Indeterminato",
    stipendio_desiderato: 55000,
    note: "",
    created_at: subDays(new Date(), 1),
    email: "mario.rossi@example.com",
    ultimo_contatto: subDays(new Date(), 5),
  },
  {
    id: "2",
    nome: "Laura",
    cognome: "Bianchi",
    citta: "Roma",
    data_nascita: new Date("1988-05-15"),
    cellulare: "3339876543",
    anni_esperienza: 8,
    competenze: "Backend Developer",
    tools: ["IntelliJ", "Git", "Jenkins"],
    database: ["PostgreSQL", "Redis"],
    piattaforme: ["GCP", "Heroku"],
    sistemi_operativi: ["Linux", "macOS"],
    linguaggi_programmazione: ["Java", "Kotlin", "Go"],
    contratto_attuale: "Determinato",
    stipendio_attuale: 52000,
    scadenza_contratto: subDays(new Date(), 90),
    preavviso: "1 mese",
    tipo_contratto_desiderato: "Indeterminato",
    stipendio_desiderato: 65000,
    note: "",
    created_at: subHours(new Date(), 12),
    email: "laura.bianchi@example.com",
    ultimo_contatto: subDays(new Date(), 2),
  },
];

export const filterFields: DataTableFilterField<ColumnSchema>[] = [
  // Data ultimo contatto
  {
    label: "Ultimo Contatto",
    value: "ultimo_contatto",
    type: "timerange",
    defaultOpen: false,
  },
  // Data inserimento
  {
    label: "Data Inserimento",
    value: "created_at",
    type: "timerange",
    defaultOpen: false,
  },

  // Arrays con checkbox
  {
    label: "Tools",
    value: "tools",
    type: "checkbox",
    defaultOpen: false,
    enableSearch: true,
    options: [],
  },
  {
    label: "Database",
    value: "database",
    type: "checkbox",
    defaultOpen: false,
    enableSearch: true,
    options: [],
  },
  {
    label: "Linguaggi",
    value: "linguaggi_programmazione",
    type: "checkbox",
    defaultOpen: false,
    enableSearch: true,
    options: [],
  },
  {
    label: "Piattaforme",
    value: "piattaforme",
    type: "checkbox",
    defaultOpen: false,
    enableSearch: true,
    options: [],
  },
  {
    label: "Sistemi Operativi",
    value: "sistemi_operativi",
    type: "checkbox",
    defaultOpen: false,
    enableSearch: true,
    options: [],
  },

  // Range numerici
  {
    label: "Anni Esperienza",
    value: "anni_esperienza",
    type: "slider",
    min: 0,
    max: 40,
    defaultOpen: false,
    trailing: "anni",
  },
  {
    label: "RAL Attuale",
    value: "stipendio_attuale",
    type: "slider",
    min: 0,
    max: 100000,
    defaultOpen: false,
    trailing: "€",
  },
  {
    label: "RAL Desiderata",
    value: "stipendio_desiderato",
    type: "slider",
    min: 0,
    max: 100000,
    defaultOpen: false,
    trailing: "€",
  },
];

export const columns: ColumnDef<ColumnSchema>[] = [
  {
    accessorKey: "nome",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Nome" />,
    cell: ({ row }) => <div>{row.getValue("nome")}</div>,
    enableSorting: true,
    enableHiding: true,
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
      const date = row.getValue("ultimo_contatto") as Date | null;
      return date ? format(date, "dd/MM/yyyy") : "N/A";
    },
    enableSorting: true,
    enableHiding: true,
  },
];
