import {
  createParser,
  createSearchParamsCache,
  parseAsArrayOf,
  parseAsInteger,
  parseAsString,
  parseAsTimestamp,
} from "nuqs/server";
import {
  ARRAY_DELIMITER,
  RANGE_DELIMITER,
  SLIDER_DELIMITER,
} from "@/lib/delimiters";

export interface ParsedSearchParams {
  tools?: string[];
  database?: string[];
  linguaggi_programmazione?: string[];
  anni_esperienza?: number[];
  stipendio_attuale?: number[];
  stipendio_desiderato?: number[];
  ultimo_contatto?: Date[];
}

export const searchParamsParser = {
  // Arrays con checkbox
  tools: parseAsArrayOf(parseAsString, ARRAY_DELIMITER),
  database: parseAsArrayOf(parseAsString, ARRAY_DELIMITER),
  linguaggi_programmazione: parseAsArrayOf(parseAsString, ARRAY_DELIMITER),

  // Range numerici
  anni_esperienza: parseAsArrayOf(parseAsInteger, SLIDER_DELIMITER),
  stipendio_attuale: parseAsArrayOf(parseAsInteger, SLIDER_DELIMITER),
  stipendio_desiderato: parseAsArrayOf(parseAsInteger, SLIDER_DELIMITER),

  // Data
  ultimo_contatto: parseAsArrayOf(parseAsTimestamp, RANGE_DELIMITER),
};

export const searchParamsCache = createSearchParamsCache(searchParamsParser);