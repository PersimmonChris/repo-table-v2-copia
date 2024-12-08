"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getCV, updateCV } from "@/lib/api";
import { Skeleton } from "@/components/ui/skeleton";
import { useRouter } from "next/navigation";
import type { ColumnSchema } from "@/app/(default)/schema";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Pencil, Save, X } from "lucide-react";
import { format } from "date-fns";
import { useState } from "react";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
} from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useToast } from "@/hooks/use-toast"

export default function CVDetailPage({ params }: { params: { id: string } }) {
    const [isEditing, setIsEditing] = useState(false);
    const [editedData, setEditedData] = useState<Partial<ColumnSchema>>({});

    const router = useRouter();
    const queryClient = useQueryClient();
    const { toast } = useToast()

    const { data: cv, isLoading } = useQuery({
        queryKey: ['cv', params.id],
        queryFn: () => getCV(params.id),
    });

    const mutation = useMutation({
        mutationFn: (data: Partial<ColumnSchema>) => updateCV(params.id, data),
        onSuccess: (newCV) => {
            queryClient.setQueryData(['cv', params.id], newCV);
            queryClient.invalidateQueries({ queryKey: ['cvs'] });
            setIsEditing(false);
            setEditedData({});
        },
    });

    const handleEdit = () => {
        setEditedData(cv || {});
        setIsEditing(true);
    };

    const handleSave = async () => {
        // Validazione base
        if (!editedData.nome || !editedData.cognome || !editedData.citta) {
            toast({
                variant: "destructive",
                title: "Errore di validazione",
                description: "I campi Nome, Cognome e Città sono obbligatori"
            });
            return;
        }

        try {
            // Prepara i dati per l'invio
            const dataToSend: Partial<ColumnSchema> = {
                ...editedData,
                // Assicurati che gli array non siano undefined
                tools: editedData.tools || [],
                database: editedData.database || [],
                linguaggi_programmazione: editedData.linguaggi_programmazione || [],
                // Gestisci la data correttamente
                scadenza_contratto: editedData.scadenza_contratto
                    ? new Date(editedData.scadenza_contratto)
                    : null,
            };

            console.log('Saving data:', dataToSend);
            await mutation.mutateAsync(dataToSend);

            queryClient.invalidateQueries({ queryKey: ['filters'] });

            toast({
                title: "Salvato!",
                description: "Le modifiche sono state salvate con successo",
                variant: "success"
            });
        } catch (error) {
            console.error('Error saving:', error);
            toast({
                variant: "destructive",
                title: "Errore",
                description: error instanceof Error
                    ? error.message
                    : "Si è verificato un errore durante il salvataggio"
            });
        }
    };

    const handleCancel = () => {
        setEditedData({});
        setIsEditing(false);
    };

    const handleArrayItemAdd = (field: keyof ColumnSchema, value: string) => {
        const trimmedValue = value.trim().toUpperCase();
        if (!trimmedValue) return;

        // Check per spazi nel mezzo
        if (trimmedValue.includes(' ')) {
            toast({
                variant: "destructive",
                title: "Formato non valido",
                description: "Usa trattini (-) o underscore (_) invece degli spazi"
            });
            return;
        }

        // Validazione caratteri permessi
        if (!/^[a-zA-Z0-9-_]+$/.test(trimmedValue)) {
            toast({
                variant: "destructive",
                title: "Caratteri non validi",
                description: "Usa solo lettere, numeri, trattini (-) o underscore (_)"
            });
            return;
        }

        setEditedData(prev => {
            const currentArray = prev[field] as string[] || [];

            if (currentArray.includes(trimmedValue)) {
                toast({
                    variant: "destructive",
                    title: "Errore",
                    description: "Questo valore è già presente"
                });
                return prev;
            }

            return {
                ...prev,
                [field]: [...currentArray, trimmedValue],
            };
        });
    };

    const handleArrayItemRemove = (field: keyof ColumnSchema, value: string) => {
        if (!editedData[field]) return;
        const currentArray = editedData[field] as string[];
        setEditedData({
            ...editedData,
            [field]: currentArray.filter(item => item !== value),
        });
    };

    const handleRoleChange = (value: string) => {
        // Aggiorna il valore senza validazione immediata
        setEditedData({
            ...editedData,
            competenze: value
        });
    };

    const validateAndSave = async () => {
        // Validazioni esistenti
        const roleValue = editedData.competenze?.trim() || '';
        const contractValue = editedData.contratto_attuale?.trim() || '';
        const desiredContractValue = editedData.tipo_contratto_desiderato?.trim() || '';
        const cityValue = editedData.citta?.trim() || '';

        // Validazione città
        if (cityValue.includes(' ')) {
            toast({
                variant: "destructive",
                title: "Formato non valido",
                description: "Nella città, usa trattini (-) o underscore (_) invece degli spazi. Es: san_giovanni_rotondo"
            });
            return;
        }

        if (cityValue && !/^[a-zA-Z0-9-_]+$/.test(cityValue)) {
            toast({
                variant: "destructive",
                title: "Caratteri non validi nella città",
                description: "Usa solo lettere, numeri, trattini (-) o underscore (_)"
            });
            return;
        }

        // Validazione spazi e caratteri per ruolo
        if (roleValue.includes(' ')) {
            toast({
                variant: "destructive",
                title: "Formato non valido",
                description: "Nel ruolo, usa trattini (-) o underscore (_) invece degli spazi. Es: backend_engineer"
            });
            return;
        }

        // Validazione spazi e caratteri per contratto attuale
        if (contractValue.includes(' ')) {
            toast({
                variant: "destructive",
                title: "Formato non valido",
                description: "Nel contratto attuale, usa trattini (-) o underscore (_) invece degli spazi"
            });
            return;
        }

        // Validazione spazi e caratteri per contratto desiderato
        if (desiredContractValue.includes(' ')) {
            toast({
                variant: "destructive",
                title: "Formato non valido",
                description: "Nel contratto desiderato, usa trattini (-) o underscore (_) invece degli spazi"
            });
            return;
        }

        if (roleValue && !/^[a-zA-Z0-9-_]+$/.test(roleValue)) {
            toast({
                variant: "destructive",
                title: "Caratteri non validi nel ruolo",
                description: "Usa solo lettere, numeri, trattini (-) o underscore (_)"
            });
            return;
        }

        if (contractValue && !/^[a-zA-Z0-9-_]+$/.test(contractValue)) {
            toast({
                variant: "destructive",
                title: "Caratteri non validi nel contratto attuale",
                description: "Usa solo lettere, numeri, trattini (-) o underscore (_)"
            });
            return;
        }

        if (desiredContractValue && !/^[a-zA-Z0-9-_]+$/.test(desiredContractValue)) {
            toast({
                variant: "destructive",
                title: "Caratteri non validi nel contratto desiderato",
                description: "Usa solo lettere, numeri, trattini (-) o underscore (_)"
            });
            return;
        }

        try {
            await mutation.mutateAsync(editedData);
            queryClient.invalidateQueries({ queryKey: ['filters'] });

            toast({
                title: "Salvato!",
                description: "Le modifiche sono state salvate con successo",
                variant: "success"
            });

            setIsEditing(false);
            setEditedData({});
        } catch (error) {
            console.error('Error saving:', error);
            toast({
                variant: "destructive",
                title: "Errore",
                description: error instanceof Error
                    ? error.message
                    : "Si è verificato un errore durante il salvataggio"
            });
        }
    };

    if (isLoading) return <Skeleton />;
    if (!cv) return <div>CV non trovato</div>;

    return (
        <div className="container mx-auto pt-2 pb-4">
            {/* Header */}
            <div className="mb-4 flex items-start justify-between">
                <div>
                    <div className="flex items-center gap-4 mb-2">
                        <Button
                            variant="ghost"
                            onClick={() => router.back()}
                            className="flex items-center gap-2"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            Torna alla lista
                        </Button>
                    </div>
                    <h1 className="text-3xl font-bold">
                        {cv.nome} {cv.cognome}
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Inserito il {format(new Date(cv.created_at), "dd/MM/yyyy")}
                        {cv.ultimo_contatto && (
                            <>
                                {" "}• Ultimo contatto il{" "}
                                {format(new Date(cv.ultimo_contatto), "dd/MM/yyyy")}
                            </>
                        )}
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    {isEditing ? (
                        <>
                            <Button
                                variant="outline"
                                onClick={handleCancel}
                                className="flex items-center gap-2"
                            >
                                <X className="h-4 w-4" />
                                Annulla
                            </Button>
                            <Button
                                onClick={validateAndSave}
                                className="flex items-center gap-2"
                            >
                                <Save className="h-4 w-4" />
                                Salva
                            </Button>
                        </>
                    ) : (
                        <Button
                            onClick={handleEdit}
                            className="flex items-center gap-2"
                        >
                            <Pencil className="h-4 w-4" />
                            Modifica
                        </Button>
                    )}
                </div>
            </div>

            {/* Sezioni */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Dati Anagrafici e Posizione Contrattuale */}
                <Card className="p-4">
                    <Accordion type="single" collapsible defaultValue="dati-contrattuali">
                        <AccordionItem value="dati-contrattuali">
                            <AccordionTrigger className="py-2">Dati Anagrafici e Posizione Contrattuale</AccordionTrigger>
                            <AccordionContent className="space-y-2 pt-1">
                                <div className="grid gap-2">
                                    {/* Dati Anagrafici */}
                                    <div className="grid grid-cols-2 gap-6">
                                        <div className="space-y-2 px-1">
                                            <span className="font-medium block">Nome:</span>
                                            {isEditing ? (
                                                <div className="pt-1">
                                                    <Input
                                                        value={editedData.nome || ''}
                                                        onChange={(e) => setEditedData({
                                                            ...editedData,
                                                            nome: e.target.value
                                                        })}
                                                        placeholder="Nome"
                                                        className="w-full"
                                                    />
                                                </div>
                                            ) : (
                                                <span>{cv.nome}</span>
                                            )}
                                        </div>
                                        <div className="space-y-2 px-1">
                                            <span className="font-medium block">Cognome:</span>
                                            {isEditing ? (
                                                <div className="pt-1">
                                                    <Input
                                                        value={editedData.cognome || ''}
                                                        onChange={(e) => setEditedData({
                                                            ...editedData,
                                                            cognome: e.target.value
                                                        })}
                                                        placeholder="Cognome"
                                                        className="w-full"
                                                    />
                                                </div>
                                            ) : (
                                                <span>{cv.cognome}</span>
                                            )}
                                        </div>
                                        <div className="space-y-2 px-1">
                                            <span className="font-medium block">Cellulare:</span>
                                            {isEditing ? (
                                                <div className="pt-1">
                                                    <Input
                                                        value={editedData.cellulare || ''}
                                                        onChange={(e) => setEditedData({
                                                            ...editedData,
                                                            cellulare: e.target.value
                                                        })}
                                                        placeholder="Cellulare"
                                                        className="w-full"
                                                    />
                                                </div>
                                            ) : (
                                                <span>{cv.cellulare}</span>
                                            )}
                                        </div>
                                        <div className="space-y-2 px-1">
                                            <span className="font-medium block">Email:</span>
                                            {isEditing ? (
                                                <div className="pt-1">
                                                    <Input
                                                        type="email"
                                                        value={editedData.email || ''}
                                                        onChange={(e) => setEditedData({
                                                            ...editedData,
                                                            email: e.target.value
                                                        })}
                                                        placeholder="Email"
                                                        className="w-full"
                                                    />
                                                </div>
                                            ) : (
                                                <span>{cv.email}</span>
                                            )}
                                        </div>
                                        <div className="space-y-2 px-1">
                                            <span className="font-medium block">Data di Nascita:</span>
                                            {isEditing ? (
                                                <div className="pt-1">
                                                    <Input
                                                        type="date"
                                                        value={editedData.data_nascita ?
                                                            new Date(editedData.data_nascita).toISOString().split('T')[0] :
                                                            ''}
                                                        onChange={(e) => setEditedData({
                                                            ...editedData,
                                                            data_nascita: e.target.value ? new Date(e.target.value) : null
                                                        })}
                                                        className="w-full"
                                                    />
                                                </div>
                                            ) : (
                                                <span>
                                                    {cv.data_nascita
                                                        ? format(new Date(cv.data_nascita), "dd/MM/yyyy")
                                                        : "N/A"}
                                                </span>
                                            )}
                                        </div>
                                        <div className="space-y-2 px-1">
                                            <span className="font-medium block">Città:</span>
                                            {isEditing ? (
                                                <div className="pt-1">
                                                    <Input
                                                        value={editedData.citta || ''}
                                                        onChange={(e) => setEditedData({
                                                            ...editedData,
                                                            citta: e.target.value
                                                        })}
                                                        placeholder="Città"
                                                        className="w-full"
                                                    />
                                                </div>
                                            ) : (
                                                <span>{cv.citta}</span>
                                            )}
                                        </div>
                                        <div className="space-y-2 px-1">
                                            <span className="font-medium block">Anni Esperienza:</span>
                                            {isEditing ? (
                                                <div className="pt-1">
                                                    <Input
                                                        type="number"
                                                        value={editedData.anni_esperienza || ''}
                                                        onChange={(e) => setEditedData({
                                                            ...editedData,
                                                            anni_esperienza: parseInt(e.target.value) || 0
                                                        })}
                                                        placeholder="Anni esperienza"
                                                        className="w-full"
                                                    />
                                                </div>
                                            ) : (
                                                <span>{cv.anni_esperienza}</span>
                                            )}
                                        </div>
                                        <div className="space-y-2 px-1">
                                            <span className="font-medium block">Ultimo Contatto:</span>
                                            {isEditing ? (
                                                <div className="pt-1">
                                                    <Input
                                                        type="date"
                                                        value={editedData.ultimo_contatto ?
                                                            new Date(editedData.ultimo_contatto).toISOString().split('T')[0] :
                                                            ''}
                                                        onChange={(e) => setEditedData({
                                                            ...editedData,
                                                            ultimo_contatto: e.target.value ? new Date(e.target.value) : null
                                                        })}
                                                        className="w-full"
                                                    />
                                                </div>
                                            ) : (
                                                <span>
                                                    {cv.ultimo_contatto
                                                        ? format(new Date(cv.ultimo_contatto), "dd/MM/yyyy")
                                                        : "N/A"}
                                                </span>
                                            )}
                                        </div>
                                        <div className="space-y-2 px-1 col-span-2">
                                            <span className="font-medium block">Note:</span>
                                            {isEditing ? (
                                                <div className="pt-1">
                                                    <Textarea
                                                        value={editedData.note || ''}
                                                        onChange={(e) => setEditedData({
                                                            ...editedData,
                                                            note: e.target.value
                                                        })}
                                                        placeholder="Inserisci note..."
                                                        className="w-full resize-none h-20"
                                                    />
                                                </div>
                                            ) : (
                                                <p className="whitespace-pre-wrap">
                                                    {cv.note || "Nessuna nota"}
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    {/* Separatore */}
                                    <div className="border-t border-border" />

                                    {/* Posizione Contrattuale */}
                                    <div className="grid grid-cols-2 gap-6">
                                        <div className="space-y-2 px-1">
                                            <span className="font-medium block">Contratto Attuale:</span>
                                            {isEditing ? (
                                                <div className="pt-1">
                                                    <Input
                                                        value={editedData.contratto_attuale || ''}
                                                        onChange={(e) => setEditedData({
                                                            ...editedData,
                                                            contratto_attuale: e.target.value
                                                        })}
                                                        placeholder="Contratto attuale"
                                                        className="w-full"
                                                    />
                                                </div>
                                            ) : (
                                                <div>
                                                    <Badge
                                                        variant="outline"
                                                        className="bg-[#FAEBDD] text-[#D9730D] border-transparent hover:bg-[#D9730D] hover:text-white hover:border-transparent text-base"
                                                    >
                                                        {cv.contratto_attuale}
                                                    </Badge>
                                                </div>
                                            )}
                                        </div>
                                        <div className="space-y-2 px-1">
                                            <span className="font-medium block">Stipendio Attuale:</span>
                                            {isEditing ? (
                                                <div className="pt-1">
                                                    <Input
                                                        type="number"
                                                        value={editedData.stipendio_attuale || ''}
                                                        onChange={(e) => setEditedData({
                                                            ...editedData,
                                                            stipendio_attuale: parseInt(e.target.value) || 0
                                                        })}
                                                        placeholder="Stipendio attuale"
                                                        className="w-full"
                                                    />
                                                </div>
                                            ) : (
                                                <span>€ {cv.stipendio_attuale?.toLocaleString()}</span>
                                            )}
                                        </div>
                                        <div className="space-y-2 px-1">
                                            <span className="font-medium block">Scadenza Contratto:</span>
                                            {isEditing ? (
                                                <div className="pt-1">
                                                    <Input
                                                        type="date"
                                                        value={editedData.scadenza_contratto ?
                                                            new Date(editedData.scadenza_contratto).toISOString().split('T')[0] :
                                                            ''}
                                                        onChange={(e) => setEditedData({
                                                            ...editedData,
                                                            scadenza_contratto: e.target.value ? new Date(e.target.value) : null
                                                        })}
                                                    />
                                                </div>
                                            ) : (
                                                <span>
                                                    {cv.scadenza_contratto
                                                        ? format(new Date(cv.scadenza_contratto), "dd/MM/yyyy")
                                                        : "N/A"}
                                                </span>
                                            )}
                                        </div>
                                        <div className="space-y-2 px-1">
                                            <span className="font-medium block">Preavviso:</span>
                                            {isEditing ? (
                                                <div className="pt-1">
                                                    <Input
                                                        value={editedData.preavviso || ''}
                                                        onChange={(e) => setEditedData({
                                                            ...editedData,
                                                            preavviso: e.target.value
                                                        })}
                                                        placeholder="Preavviso"
                                                    />
                                                </div>
                                            ) : (
                                                <span>{cv.preavviso}</span>
                                            )}
                                        </div>
                                        <div className="space-y-2 px-1">
                                            <span className="font-medium block">Contratto Desiderato:</span>
                                            {isEditing ? (
                                                <div className="pt-1">
                                                    <Input
                                                        value={editedData.tipo_contratto_desiderato || ''}
                                                        onChange={(e) => setEditedData({
                                                            ...editedData,
                                                            tipo_contratto_desiderato: e.target.value
                                                        })}
                                                        placeholder="Contratto desiderato"
                                                    />
                                                </div>
                                            ) : (
                                                <div>
                                                    <Badge
                                                        variant="outline"
                                                        className="bg-[#FAEBDD] text-[#D9730D] border-transparent hover:bg-[#D9730D] hover:text-white hover:border-transparent text-base"
                                                    >
                                                        {cv.tipo_contratto_desiderato}
                                                    </Badge>
                                                </div>
                                            )}
                                        </div>
                                        <div className="space-y-2 px-1">
                                            <span className="font-medium block">Stipendio Desiderato:</span>
                                            {isEditing ? (
                                                <div className="pt-1">
                                                    <Input
                                                        type="number"
                                                        value={editedData.stipendio_desiderato || ''}
                                                        onChange={(e) => setEditedData({
                                                            ...editedData,
                                                            stipendio_desiderato: parseInt(e.target.value) || 0
                                                        })}
                                                        placeholder="Stipendio desiderato"
                                                    />
                                                </div>
                                            ) : (
                                                <span>€ {cv.stipendio_desiderato?.toLocaleString()}</span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </AccordionContent>
                        </AccordionItem>
                    </Accordion>
                </Card>

                {/* Competenze */}
                <Card className="p-4">
                    <Accordion type="single" collapsible defaultValue="competenze">
                        <AccordionItem value="competenze">
                            <AccordionTrigger className="py-2">Competenze</AccordionTrigger>
                            <AccordionContent className="pt-2">
                                <div className="grid gap-6">
                                    <div className="space-y-2 px-1">
                                        <span className="font-medium block">Ruolo:</span>
                                        {isEditing ? (
                                            <div className="pt-1">
                                                <Input
                                                    value={editedData.competenze || ''}
                                                    onChange={(e) => handleRoleChange(e.target.value)}
                                                    placeholder="es: backend_engineer"
                                                    className="w-full"
                                                />
                                            </div>
                                        ) : (
                                            <div>
                                                <Badge
                                                    variant="outline"
                                                    className="bg-[#ddf4ff] text-[#0969da] border-transparent hover:bg-[#0969da] hover:text-white hover:border-transparent text-base"
                                                >
                                                    {cv.competenze}
                                                </Badge>
                                            </div>
                                        )}
                                    </div>

                                    {/* Tools */}
                                    <div className="space-y-2 px-1">
                                        <span className="font-medium block">Tools:</span>
                                        {isEditing ? (
                                            <div className="space-y-2">
                                                <div className="flex flex-wrap gap-2">
                                                    {editedData.tools?.sort()?.map((tool) => (
                                                        <Badge key={tool} variant="secondary" className="gap-1">
                                                            {tool}
                                                            <button
                                                                onClick={() => handleArrayItemRemove('tools', tool)}
                                                                className="ml-1 rounded-full outline-none hover:bg-muted"
                                                            >
                                                                <X className="h-3 w-3" />
                                                            </button>
                                                        </Badge>
                                                    ))}
                                                </div>
                                                <div className="flex gap-2">
                                                    <Input
                                                        placeholder="Nuovo tool..."
                                                        onKeyDown={(e) => {
                                                            if (e.key === 'Enter' && e.currentTarget.value) {
                                                                e.preventDefault();
                                                                handleArrayItemAdd('tools', e.currentTarget.value.toUpperCase());
                                                                e.currentTarget.value = '';
                                                            }
                                                        }}
                                                        className="w-full"
                                                    />
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => {
                                                            const input = document.querySelector('input[placeholder="Nuovo tool..."]') as HTMLInputElement;
                                                            if (input.value) {
                                                                handleArrayItemAdd('tools', input.value.toUpperCase());
                                                                input.value = '';
                                                            }
                                                        }}
                                                    >
                                                        Aggiungi
                                                    </Button>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="flex flex-wrap gap-2">
                                                {cv.tools.sort().map((tool) => (
                                                    <Badge key={tool} variant="secondary">
                                                        {tool}
                                                    </Badge>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    {/* Database */}
                                    <div className="space-y-2 px-1">
                                        <span className="font-medium block">Database:</span>
                                        {isEditing ? (
                                            <div className="space-y-2">
                                                <div className="flex flex-wrap gap-2">
                                                    {editedData.database?.sort()?.map((db) => (
                                                        <Badge key={db} variant="secondary" className="gap-1">
                                                            {db}
                                                            <button
                                                                onClick={() => handleArrayItemRemove('database', db)}
                                                                className="ml-1 rounded-full outline-none hover:bg-muted"
                                                            >
                                                                <X className="h-3 w-3" />
                                                            </button>
                                                        </Badge>
                                                    ))}
                                                </div>
                                                <div className="flex gap-2">
                                                    <Input
                                                        placeholder="Nuovo database..."
                                                        onKeyDown={(e) => {
                                                            if (e.key === 'Enter' && e.currentTarget.value) {
                                                                e.preventDefault();
                                                                handleArrayItemAdd('database', e.currentTarget.value.toUpperCase());
                                                                e.currentTarget.value = '';
                                                            }
                                                        }}
                                                        className="w-full"
                                                    />
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => {
                                                            const input = document.querySelector('input[placeholder="Nuovo database..."]') as HTMLInputElement;
                                                            if (input.value) {
                                                                handleArrayItemAdd('database', input.value.toUpperCase());
                                                                input.value = '';
                                                            }
                                                        }}
                                                    >
                                                        Aggiungi
                                                    </Button>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="flex flex-wrap gap-2">
                                                {cv.database.sort().map((db) => (
                                                    <Badge key={db} variant="secondary">
                                                        {db}
                                                    </Badge>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    {/* Linguaggi di Programmazione */}
                                    <div className="space-y-2 px-1">
                                        <span className="font-medium block">Linguaggi di Programmazione:</span>
                                        {isEditing ? (
                                            <div className="space-y-2">
                                                <div className="flex flex-wrap gap-2">
                                                    {editedData.linguaggi_programmazione?.sort()?.map((lang) => (
                                                        <Badge key={lang} variant="secondary" className="gap-1">
                                                            {lang}
                                                            <button
                                                                onClick={() => handleArrayItemRemove('linguaggi_programmazione', lang)}
                                                                className="ml-1 rounded-full outline-none hover:bg-muted"
                                                            >
                                                                <X className="h-3 w-3" />
                                                            </button>
                                                        </Badge>
                                                    ))}
                                                </div>
                                                <div className="flex gap-2">
                                                    <Input
                                                        placeholder="Nuovo linguaggio..."
                                                        onKeyDown={(e) => {
                                                            if (e.key === 'Enter' && e.currentTarget.value) {
                                                                e.preventDefault();
                                                                handleArrayItemAdd('linguaggi_programmazione', e.currentTarget.value.toUpperCase());
                                                                e.currentTarget.value = '';
                                                            }
                                                        }}
                                                        className="w-full"
                                                    />
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => {
                                                            const input = document.querySelector('input[placeholder="Nuovo linguaggio..."]') as HTMLInputElement;
                                                            if (input.value) {
                                                                handleArrayItemAdd('linguaggi_programmazione', input.value.toUpperCase());
                                                                input.value = '';
                                                            }
                                                        }}
                                                    >
                                                        Aggiungi
                                                    </Button>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="flex flex-wrap gap-2">
                                                {cv.linguaggi_programmazione.sort().map((lang) => (
                                                    <Badge key={lang} variant="secondary">
                                                        {lang}
                                                    </Badge>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    {/* Piattaforme */}
                                    <div className="space-y-2 px-1">
                                        <span className="font-medium block">Piattaforme:</span>
                                        {isEditing ? (
                                            <div className="space-y-2">
                                                <div className="flex flex-wrap gap-2">
                                                    {editedData.piattaforme?.sort()?.map((platform) => (
                                                        <Badge key={platform} variant="secondary" className="gap-1">
                                                            {platform}
                                                            <button
                                                                onClick={() => handleArrayItemRemove('piattaforme', platform)}
                                                                className="ml-1 rounded-full outline-none hover:bg-muted"
                                                            >
                                                                <X className="h-3 w-3" />
                                                            </button>
                                                        </Badge>
                                                    ))}
                                                </div>
                                                <div className="flex gap-2">
                                                    <Input
                                                        placeholder="Nuova piattaforma..."
                                                        onKeyDown={(e) => {
                                                            if (e.key === 'Enter' && e.currentTarget.value) {
                                                                e.preventDefault();
                                                                handleArrayItemAdd('piattaforme', e.currentTarget.value.toUpperCase());
                                                                e.currentTarget.value = '';
                                                            }
                                                        }}
                                                        className="w-full"
                                                    />
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => {
                                                            const input = document.querySelector('input[placeholder="Nuova piattaforma..."]') as HTMLInputElement;
                                                            if (input.value) {
                                                                handleArrayItemAdd('piattaforme', input.value.toUpperCase());
                                                                input.value = '';
                                                            }
                                                        }}
                                                    >
                                                        Aggiungi
                                                    </Button>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="flex flex-wrap gap-2">
                                                {cv.piattaforme.sort().map((platform) => (
                                                    <Badge key={platform} variant="secondary">
                                                        {platform}
                                                    </Badge>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    {/* Sistemi Operativi */}
                                    <div className="space-y-2 px-1">
                                        <span className="font-medium block">Sistemi Operativi:</span>
                                        {isEditing ? (
                                            <div className="space-y-2">
                                                <div className="flex flex-wrap gap-2">
                                                    {editedData.sistemi_operativi?.sort()?.map((os) => (
                                                        <Badge key={os} variant="secondary" className="gap-1">
                                                            {os}
                                                            <button
                                                                onClick={() => handleArrayItemRemove('sistemi_operativi', os)}
                                                                className="ml-1 rounded-full outline-none hover:bg-muted"
                                                            >
                                                                <X className="h-3 w-3" />
                                                            </button>
                                                        </Badge>
                                                    ))}
                                                </div>
                                                <div className="flex gap-2">
                                                    <Input
                                                        placeholder="Nuovo sistema operativo..."
                                                        onKeyDown={(e) => {
                                                            if (e.key === 'Enter' && e.currentTarget.value) {
                                                                e.preventDefault();
                                                                handleArrayItemAdd('sistemi_operativi', e.currentTarget.value.toUpperCase());
                                                                e.currentTarget.value = '';
                                                            }
                                                        }}
                                                        className="w-full"
                                                    />
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => {
                                                            const input = document.querySelector('input[placeholder="Nuovo sistema operativo..."]') as HTMLInputElement;
                                                            if (input.value) {
                                                                handleArrayItemAdd('sistemi_operativi', input.value.toUpperCase());
                                                                input.value = '';
                                                            }
                                                        }}
                                                    >
                                                        Aggiungi
                                                    </Button>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="flex flex-wrap gap-2">
                                                {cv.sistemi_operativi.sort().map((os) => (
                                                    <Badge key={os} variant="secondary">
                                                        {os}
                                                    </Badge>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </AccordionContent>
                        </AccordionItem>
                    </Accordion>
                </Card>
            </div>
        </div>
    );
} 