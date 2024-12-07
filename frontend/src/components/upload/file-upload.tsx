"use client";

import * as React from "react";
import { useDropzone } from "react-dropzone";
import { useToast } from "@/hooks/use-toast";
import { LoaderCircle, Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { uploadCVs } from "@/lib/api";
import { useQueryClient } from "@tanstack/react-query";

export function FileUpload() {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [isUploading, setIsUploading] = React.useState(false);
    const [selectedFiles, setSelectedFiles] = React.useState<File[]>([]);

    const onDrop = React.useCallback((acceptedFiles: File[]) => {
        setSelectedFiles(prev => {
            const newFiles = [...prev, ...acceptedFiles];
            if (newFiles.length > 10) {
                toast({
                    title: "Errore",
                    description: "Puoi caricare massimo 10 file alla volta",
                    variant: "destructive",
                });
                return prev;
            }
            return newFiles;
        });
    }, [toast]);

    const removeFile = (fileToRemove: File) => {
        setSelectedFiles(prev => prev.filter(file => file !== fileToRemove));
    };

    const handleUpload = async () => {
        if (selectedFiles.length === 0) {
            toast({
                title: "Errore",
                description: "Seleziona almeno un file da caricare",
                variant: "destructive",
            });
            return;
        }

        setIsUploading(true);

        try {
            const result = await uploadCVs(selectedFiles);

            // Mostra risultati per ogni file
            result.results.forEach((fileResult) => {
                toast({
                    title: fileResult.status === 'success' ? 'Upload completato' : 'Errore',
                    description: fileResult.message,
                    variant: fileResult.status === 'success' ? 'success' : 'destructive',
                });
            });

            // Se tutto ok, pulisci la lista dei file
            if (result.results.every((r) => r.status === 'success')) {
                setSelectedFiles([]);

                // Aspetta 10 secondi prima di refreshare i dati
                setTimeout(() => {
                    // Invalida la query dei CV per forzare un refresh
                    queryClient.invalidateQueries({ queryKey: ['cvs'] });

                    toast({
                        title: "Dati aggiornati",
                        description: "La tabella è stata aggiornata con i nuovi CV",
                        variant: "success"
                    });
                }, 10000); // 10 secondi
            }

        } catch (error) {
            toast({
                title: "Errore",
                description: error instanceof Error ? error.message : "Errore durante l'upload",
                variant: "destructive",
            });
        } finally {
            setIsUploading(false);
        }
    };

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        accept: {
            'application/pdf': ['.pdf'],
            'application/msword': ['.doc'],
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx']
        },
        onDrop,
        disabled: isUploading
    });

    return (
        <div className="space-y-4">
            <div
                {...getRootProps()}
                className={`
                    border-2 border-dashed rounded-lg p-8 text-center transition-colors
                    ${isDragActive ? 'border-primary bg-primary/5' : 'border-primary/20 hover:border-primary/50'}
                    ${isUploading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                `}
            >
                <input {...getInputProps()} />
                {isUploading ? (
                    <div className="flex flex-col items-center gap-2">
                        <LoaderCircle className="h-6 w-6 animate-spin" />
                        <p>Caricamento in corso...</p>
                    </div>
                ) : (
                    <div className="flex flex-col items-center gap-2">
                        <Upload className="h-8 w-8 text-primary/50" />
                        <div className="space-y-2">
                            <p>Trascina qui i file PDF o Word</p>
                            <p className="text-sm text-muted-foreground">
                                oppure clicca per selezionarli
                            </p>
                            <p className="text-xs text-muted-foreground">
                                (Massimo 10 file alla volta)
                            </p>
                        </div>
                    </div>
                )}
            </div>

            {selectedFiles.length > 0 && (
                <div className="space-y-4">
                    <ScrollArea className="h-[200px] w-full rounded-md border p-4">
                        <div className="space-y-2">
                            {selectedFiles.map((file, idx) => (
                                <div
                                    key={idx}
                                    className="flex items-center justify-between rounded-lg border p-2"
                                >
                                    <span className="text-sm truncate max-w-[80%]">
                                        {file.name}
                                    </span>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => removeFile(file)}
                                    >
                                        <X className="h-4 w-4" />
                                    </Button>
                                </div>
                            ))}
                        </div>
                    </ScrollArea>

                    <div className="flex justify-end gap-2">
                        <Button
                            variant="outline"
                            onClick={() => setSelectedFiles([])}
                            disabled={isUploading}
                        >
                            Annulla
                        </Button>
                        <Button
                            onClick={handleUpload}
                            disabled={isUploading}
                        >
                            {isUploading ? (
                                <>
                                    <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                                    Caricamento...
                                </>
                            ) : (
                                <>
                                    <Upload className="mr-2 h-4 w-4" />
                                    Carica {selectedFiles.length} file
                                </>
                            )}
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
} 