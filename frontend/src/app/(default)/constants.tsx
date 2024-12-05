"use client";

import type { DataTableFilterField } from "@/components/data-table/types";
import type { ColumnSchema } from "./schema";
import { subDays, subHours } from "date-fns";

// Dati di esempio che corrispondono al nostro schema
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
  },
];

export const filterFields: DataTableFilterField<ColumnSchema>[] = [
  // Arrays con checkbox
  {
    label: "Tools",
    value: "tools",
    type: "checkbox",
    defaultOpen: true,
    enableSearch: true,
    options: Array.from(
      new Set(data.flatMap((item) => item.tools))
    ).map((tool) => ({
      label: tool,
      value: tool,
    })),
  },
  {
    label: "Database",
    value: "database",
    type: "checkbox",
    defaultOpen: true,
    enableSearch: true,
    options: Array.from(
      new Set(data.flatMap((item) => item.database))
    ).map((db) => ({
      label: db,
      value: db,
    })),
  },
  {
    label: "Linguaggi",
    value: "linguaggi_programmazione",
    type: "checkbox",
    defaultOpen: true,
    enableSearch: true,
    options: Array.from(
      new Set(data.flatMap((item) => item.linguaggi_programmazione))
    ).map((lang) => ({
      label: lang,
      value: lang,
    })),
  },
  {
    label: "Piattaforme",
    value: "piattaforme",
    type: "checkbox",
    defaultOpen: true,
    enableSearch: true,
    options: Array.from(
      new Set(data.flatMap((item) => item.piattaforme))
    ).map((platform) => ({
      label: platform,
      value: platform,
    })),
  },
  {
    label: "Sistemi Operativi",
    value: "sistemi_operativi",
    type: "checkbox",
    defaultOpen: true,
    enableSearch: true,
    options: Array.from(
      new Set(data.flatMap((item) => item.sistemi_operativi))
    ).map((os) => ({
      label: os,
      value: os,
    })),
  },

  // Range numerici
  {
    label: "Anni Esperienza",
    value: "anni_esperienza",
    type: "slider",
    min: 0,
    max: 40,
    defaultOpen: true,
    trailing: "anni",
  },
  {
    label: "RAL Attuale",
    value: "stipendio_attuale",
    type: "slider",
    min: 0,
    max: 200000,
    defaultOpen: true,
    trailing: "€",
  },
  {
    label: "RAL Desiderata",
    value: "stipendio_desiderato",
    type: "slider",
    min: 0,
    max: 200000,
    defaultOpen: true,
    trailing: "€",
  },

  // Data
  {
    label: "Data Inserimento",
    value: "created_at",
    type: "timerange",
    defaultOpen: true,
  },
];
