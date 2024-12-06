import type { ColumnSchema } from '@/app/(default)/schema';

interface GetCVsResponse {
    items: ColumnSchema[];
    total: number;
    page: number;
    page_size: number;
}

export interface GetCVsParams {
    page?: number;
    page_size?: number;
    sort_by?: string;
    sort_desc?: boolean;
    tools?: string[];
    database?: string[];
    linguaggi_programmazione?: string[];
    anni_esperienza?: [number, number];
    stipendio_attuale?: [number, number];
    stipendio_desiderato?: [number, number];
    ultimo_contatto?: Date[];
    created_at?: Date[];
}

export async function getCVs(params: GetCVsParams) {
    const searchParams = new URLSearchParams();

    // Parametri base
    if (params.page) searchParams.set('page', params.page.toString());
    if (params.page_size) searchParams.set('page_size', params.page_size.toString());
    if (params.sort_by) searchParams.set('sort_by', params.sort_by);
    if (params.sort_desc !== undefined) searchParams.set('sort_desc', params.sort_desc.toString());

    // Array params
    if (params.tools?.length) searchParams.set('tools', params.tools.join(','));
    if (params.database?.length) searchParams.set('database', params.database.join(','));
    if (params.linguaggi_programmazione?.length) {
        searchParams.set('linguaggi_programmazione', params.linguaggi_programmazione.join(','));
    }

    // Range params
    if (params.anni_esperienza) {
        searchParams.set('anni_esperienza_min', params.anni_esperienza[0].toString());
        searchParams.set('anni_esperienza_max', params.anni_esperienza[1].toString());
    }

    // Aggiungiamo questo per le date
    if (params.ultimo_contatto?.length) {
        searchParams.set('data_dal', params.ultimo_contatto[0].toISOString());
        if (params.ultimo_contatto.length > 1) {
            searchParams.set('data_al', params.ultimo_contatto[1].toISOString());
        }
    }
    if (params.created_at?.length) {
        console.log('Frontend sending date:', params.created_at[0]);
        searchParams.set('created_at_dal', params.created_at[0].toISOString());
    }

    const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/cv?${searchParams.toString()}`
    );

    if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.message || 'Failed to fetch CVs');
    }

    return response.json() as Promise<GetCVsResponse>;
}

export async function getCV(id: string): Promise<ColumnSchema> {
    const url = `${process.env.NEXT_PUBLIC_API_URL}/cv/${id}`;
    console.log('Making API request to:', url);
    console.log('NEXT_PUBLIC_API_URL:', process.env.NEXT_PUBLIC_API_URL);

    try {
        const response = await fetch(url);
        console.log('Response status:', response.status);

        if (!response.ok) {
            const error = await response.json().catch(() => ({}));
            console.error('API Error:', error);
            throw new Error(error.message || `Failed to fetch CV (${response.status})`);
        }

        const data = await response.json();
        console.log('API Response:', data);
        return data;
    } catch (error) {
        console.error('Fetch error:', error);
        throw error;
    }
}

export async function updateCV(id: string, data: Partial<ColumnSchema>): Promise<ColumnSchema> {
    console.log('=== UPDATE CV START ===');
    console.log('ID:', id);
    console.log('Original data:', data);

    // Rimuovi created_at e gestisci le date
    const { created_at, ...restData } = data;
    const dataToSend = {
        ...restData,
        // Converti le date in formato YYYY-MM-DD
        scadenza_contratto: data.scadenza_contratto
            ? (data.scadenza_contratto instanceof Date
                ? data.scadenza_contratto.toISOString().split('T')[0]
                : String(data.scadenza_contratto).slice(0, 10))
            : null,
        data_nascita: data.data_nascita
            ? (data.data_nascita instanceof Date
                ? data.data_nascita.toISOString().split('T')[0]
                : String(data.data_nascita).slice(0, 10))
            : null,
        ultimo_contatto: data.ultimo_contatto
            ? (data.ultimo_contatto instanceof Date
                ? data.ultimo_contatto.toISOString().split('T')[0]
                : String(data.ultimo_contatto).slice(0, 10))
            : null,
    };

    console.log('Data to send:', JSON.stringify(dataToSend, null, 2));

    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/cv/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(dataToSend),
        });

        console.log('Response status:', response.status);
        const responseData = await response.json();
        console.log('Response data:', responseData);

        if (!response.ok) {
            console.error('Server error:', responseData);
            throw new Error(responseData.detail || `Failed to update CV (${response.status})`);
        }

        console.log('=== UPDATE CV END ===');
        return responseData;
    } catch (error) {
        console.error('Update failed:', error);
        throw error;
    }
}

export async function getToolsFilters(): Promise<string[]> {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/cv/filters/tools`);

    if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.message || 'Failed to fetch tools filters');
    }

    const data = await response.json();
    return data.tools;
}

export async function getDatabaseFilters(): Promise<string[]> {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/cv/filters/database`);

    if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.message || 'Failed to fetch database filters');
    }

    const data = await response.json();
    return data.database;
}

export async function getLinguaggiFilters(): Promise<string[]> {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/cv/filters/linguaggi`);

    if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.message || 'Failed to fetch linguaggi filters');
    }

    const data = await response.json();
    return data.linguaggi;
}

export async function getPiattaformeFilters(): Promise<string[]> {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/cv/filters/piattaforme`);

    if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.message || 'Failed to fetch piattaforme filters');
    }

    const data = await response.json();
    return data.piattaforme;
}

export async function getSistemiOperativiFilters(): Promise<string[]> {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/cv/filters/sistemi-operativi`);

    if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.message || 'Failed to fetch sistemi operativi filters');
    }

    const data = await response.json();
    return data.sistemi_operativi;
} 