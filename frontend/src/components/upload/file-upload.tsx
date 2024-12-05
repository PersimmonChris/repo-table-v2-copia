"use client";

import * as React from "react";
import { useDropzone } from "react-dropzone";

export function FileUpload() {
    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        accept: {
            'application/pdf': ['.pdf'],
            'application/msword': ['.doc'],
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx']
        },
        onDrop: () => { }
    });

    return (
        <div
            {...getRootProps()}
            className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-gray-400 transition-colors"
        >
            <input {...getInputProps()} />
            {isDragActive ? (
                <p>Drop the files here...</p>
            ) : (
                <div className="space-y-2">
                    <p>Drag & drop PDF or Word files here</p>
                    <p className="text-sm text-muted-foreground">
                        or click to select files
                    </p>
                </div>
            )}
        </div>
    );
} 