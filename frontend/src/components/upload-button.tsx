"use client";

import { Button } from "@/components/ui/button";
import { UploadIcon } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { useCallback } from "react";
import { useDropzone } from "react-dropzone";

export function UploadButton() {
    const onDrop = useCallback((acceptedFiles: File[]) => {
        // TODO: Implementare l'upload
        console.log('Files:', acceptedFiles);
    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'application/pdf': ['.pdf'],
            'application/msword': ['.doc'],
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx']
        },
        maxFiles: 10
    });

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button
                    variant="outline"
                    size="sm"
                    className="h-8 border-dashed"
                >
                    <UploadIcon className="mr-2 h-4 w-4" />
                    Carica CV
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Carica CV</DialogTitle>
                    <DialogDescription>
                        Trascina qui i file o clicca per selezionarli.
                        <br />
                        Formati supportati: PDF, DOC, DOCX
                    </DialogDescription>
                </DialogHeader>
                <div
                    {...getRootProps()}
                    className={`
            border-2 border-dashed rounded-lg p-8 text-center cursor-pointer
            ${isDragActive ? 'border-primary bg-primary/10' : 'border-border'}
          `}
                >
                    <input {...getInputProps()} />
                    {isDragActive ? (
                        <p>Rilascia i file qui...</p>
                    ) : (
                        <p>Trascina i file qui, o clicca per selezionarli</p>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
} 