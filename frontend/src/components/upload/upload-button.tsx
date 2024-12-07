"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Upload, X } from "lucide-react";
import { FileUpload } from "./file-upload";

export function UploadButton() {
    const [open, setOpen] = React.useState(false);

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <Button
                variant="outline"
                size="sm"
                className="h-8 border-dashed"
                onClick={() => setOpen(true)}
            >
                <Upload className="mr-2 h-4 w-4" />
                Carica CV
            </Button>
            <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                    <DialogTitle>Carica CV</DialogTitle>
                </DialogHeader>
                <FileUpload />
            </DialogContent>
        </Dialog>
    );
} 