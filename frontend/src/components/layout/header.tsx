"use client";

export function Header() {
    return (
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container flex h-14 items-center">
                <div className="flex items-center gap-2">
                    <h1 className="font-semibold">CV Manager</h1>
                </div>
            </div>
        </header>
    );
} 