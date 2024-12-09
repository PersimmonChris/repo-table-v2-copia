'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Loader2 } from "lucide-react"

export default function ProfilePage() {
    const [loading, setLoading] = useState(true)
    const [displayName, setDisplayName] = useState('')
    const [email, setEmail] = useState('')
    const router = useRouter()
    const { toast } = useToast()
    const supabase = createClient()

    useEffect(() => {
        async function loadProfile() {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) {
                router.push('/login')
                return
            }

            setEmail(user.email || '')

            const { data: profile } = await supabase
                .from('profiles')
                .select('display_name')
                .eq('id', user.id)
                .single()

            if (profile?.display_name) {
                setDisplayName(profile.display_name)
            }

            setLoading(false)
        }

        loadProfile()
    }, [])

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setLoading(true)

        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) throw new Error('No user')

            const { error } = await supabase
                .from('profiles')
                .upsert({
                    id: user.id,
                    display_name: displayName,
                    updated_at: new Date().toISOString(),
                })

            if (error) throw error

            toast({
                title: "Profilo aggiornato",
                description: "Le modifiche sono state salvate con successo",
                variant: "success"
            })

        } catch (error) {
            toast({
                variant: "destructive",
                title: "Errore",
                description: "Impossibile aggiornare il profilo"
            })
        } finally {
            setLoading(false)
        }
    }

    if (loading) {
        return (
            <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
                <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="text-sm text-muted-foreground">
                        Caricamento...
                    </span>
                </div>
            </div>
        )
    }

    return (
        <div className="container py-8">
            <div className="mb-6">
                <Button
                    variant="ghost"
                    onClick={() => router.back()}
                    className="flex items-center gap-2"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Torna indietro
                </Button>
            </div>

            <Card className="mx-auto max-w-md">
                <CardHeader>
                    <CardTitle>Il tuo profilo</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                value={email}
                                disabled
                                className="bg-muted"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="displayName">Nome visualizzato</Label>
                            <Input
                                id="displayName"
                                value={displayName}
                                onChange={(e) => setDisplayName(e.target.value)}
                                placeholder="Inserisci il tuo nome"
                            />
                        </div>

                        <Button
                            type="submit"
                            disabled={loading}
                            className="w-full"
                        >
                            {loading ? (
                                <div className="flex items-center gap-2">
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    Salvataggio...
                                </div>
                            ) : (
                                'Salva modifiche'
                            )}
                        </Button>
                    </form>

                    <div className="mt-6 flex justify-center">
                        <Button
                            variant="link"
                            onClick={() => router.push('/impostazioni/password')}
                        >
                            Cambia password
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
} 