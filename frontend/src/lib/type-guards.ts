import { ColumnSchema } from '@/types'

export function isColumnSchema(obj: any): obj is ColumnSchema {
    return (
        typeof obj === 'object' &&
        obj !== null &&
        'id' in obj &&
        'nome' in obj &&
        'cognome' in obj
    )
}

export function isDateString(value: any): boolean {
    if (typeof value !== 'string') return false
    const date = new Date(value)
    return date instanceof Date && !isNaN(date.getTime())
} 