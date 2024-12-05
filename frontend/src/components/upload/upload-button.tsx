"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Upload } from "lucide-react";
import { FileUpload } from "./file-upload";

export function UploadButton() {
    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button
                    variant="outline"
                    size="sm"
                    className="h-8 border-dashed"
                >
                    <Upload className="mr-2 h-4 w-4" />
                    Carica CV
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <FileUpload />
            </DialogContent>
        </Dialog>
    );
} 