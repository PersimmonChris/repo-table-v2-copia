import {
  ARRAY_DELIMITER,
  RANGE_DELIMITER,
  SLIDER_DELIMITER,
} from "@/lib/delimiters";
import { REGIONS } from "@/constants/region";
import { TAGS } from "@/constants/tag";
import { z } from "zod";
import { isArrayOfDates } from "@/lib/is-array";
import { isSameDay } from "date-fns";

// https://github.com/colinhacks/zod/issues/2985#issue-2008642190
const stringToBoolean = z
  .string()
  .toLowerCase()
  .transform((val) => {
    try {
      return JSON.parse(val);
    } catch (e) {
      console.log(e);
      return undefined;
    }
  })
  .pipe(z.boolean().optional());

export type ColumnSchema = {
  id: string;
  nome: string;
  cognome: string;
  citta: string;
  data_nascita: Date;
  cellulare: string | null;
  email: string | null;
  ultimo_contatto: Date | null;
  anni_esperienza: number | null;
  competenze: string;
  tools: string[];
  database: string[];
  piattaforme: string[];
  sistemi_operativi: string[];
  linguaggi_programmazione: string[];
  contratto_attuale: string;
  stipendio_attuale: number;
  scadenza_contratto: Date | null;
  preavviso: string;
  tipo_contratto_desiderato: string;
  stipendio_desiderato: number;
  note: string;
  created_at: Date;
};

export const columnFilterSchema = z.object({
  // Arrays con checkbox
  tools: z
    .string()
    .transform((val) => val.split(ARRAY_DELIMITER))
    .pipe(z.string().array())
    .optional(),
  database: z
    .string()
    .transform((val) => val.split(ARRAY_DELIMITER))
    .pipe(z.string().array())
    .optional(),
  linguaggi_programmazione: z
    .string()
    .transform((val) => val.split(ARRAY_DELIMITER))
    .pipe(z.string().array())
    .optional(),
  piattaforme: z
    .string()
    .transform((val) => val.split(ARRAY_DELIMITER))
    .pipe(z.string().array())
    .optional(),
  sistemi_operativi: z
    .string()
    .transform((val) => val.split(ARRAY_DELIMITER))
    .pipe(z.string().array())
    .optional(),

  // Range numerici
  anni_esperienza: z
    .string()
    .transform((val) => val.split(SLIDER_DELIMITER))
    .pipe(z.coerce.number().array().max(2))
    .optional(),
  stipendio_attuale: z
    .string()
    .transform((val) => val.split(SLIDER_DELIMITER))
    .pipe(z.coerce.number().array().max(2))
    .optional(),
  stipendio_desiderato: z
    .string()
    .transform((val) => val.split(SLIDER_DELIMITER))
    .pipe(z.coerce.number().array().max(2))
    .optional(),

  // Data - cambiato da created_at a ultimo_contatto
  ultimo_contatto: z
    .string()
    .transform((val) => val.split(RANGE_DELIMITER).map(Number))
    .pipe(z.coerce.date().array())
    .optional(),
  created_at: z
    .string()
    .transform((val) => val.split(RANGE_DELIMITER).map(Number))
    .pipe(z.coerce.date().array())
    .refine((dates) => {
      if (dates.length === 1) return true;
      if (dates.length === 2) {
        return dates[0].getTime() <= dates[1].getTime();
      }
      return false;
    }, "Invalid date range")
    .optional(),
});

export type ColumnFilterSchema = z.infer<typeof columnFilterSchema>;
