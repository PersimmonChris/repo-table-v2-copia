import { ColumnSchema } from '@/app/(default)/schema'

// User type
export interface User {
  id: string;
  email: string;
  // altri campi necessari
}

// API Response types
export interface ApiResponse<T> {
  data: T;
  error: string | null;
}

// Re-export dei tipi principali
export type { ColumnSchema } from '@/app/(default)/schema'
export type {
  SearchParams,
  DataTableFilterField,
  Option
} from '@/components/data-table/types'
