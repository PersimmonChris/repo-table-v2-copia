import { toast } from '@/components/ui/use-toast'

interface ApiError {
    message: string;
    status?: number;
}

export async function apiHandler<T>(
    promise: Promise<T>,
    errorMessage = 'Si è verificato un errore'
): Promise<T | null> {
    try {
        const data = await promise
        return data
    } catch (error) {
        const apiError = error as ApiError
        toast({
            variant: "destructive",
            title: "Errore",
            description: apiError.message || errorMessage
        })
        console.error('API Error:', error)
        return null
    }
} 