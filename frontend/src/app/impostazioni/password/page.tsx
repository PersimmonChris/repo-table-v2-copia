'use client'

import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Loader2 } from "lucide-react"

// Funzione di validazione password
function validatePassword(password: string): { isValid: boolean; message: string } {
    if (password.length < 8) {
        return {
            isValid: false,
            message: "La password deve contenere almeno 8 caratteri"
        }
    }

    if (!/[A-Z]/.test(password)) {
        return {
            isValid: false,
            message: "La password deve contenere almeno una lettera maiuscola"
        }
    }

    if (!/[a-z]/.test(password)) {
        return {
            isValid: false,
            message: "La password deve contenere almeno una lettera minuscola"
        }
    }

    if (!/[0-9]/.test(password)) {
        return {
            isValid: false,
            message: "La password deve contenere almeno un numero"
        }
    }

    if (!/[!@#$%^&*]/.test(password)) {
        return {
            isValid: false,
            message: "La password deve contenere almeno un carattere speciale (!@#$%^&*)"
        }
    }

    return { isValid: true, message: "" }
}

export default function ChangePasswordPage() {
    const [loading, setLoading] = useState(false)
    const [currentPassword, setCurrentPassword] = useState('')
    const [newPassword, setNewPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const router = useRouter()
    const { toast } = useToast()
    const supabase = createClient()

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setLoading(true)

        try {
            // Verifichiamo che l'utente sia autenticato
            const { data: { user } } = await supabase.auth.getUser()
            if (!user?.email) {
                throw new Error('Utente non autenticato')
            }

            // Validazione della nuova password
            const validation = validatePassword(newPassword)
            if (!validation.isValid) {
                toast({
                    variant: "destructive",
                    title: "Password non valida",
                    description: validation.message
                })
                setLoading(false)
                return
            }

            // Verifichiamo che le nuove password coincidano
            if (newPassword !== confirmPassword) {
                toast({
                    variant: "destructive",
                    title: "Le password non coincidono",
                    description: "La nuova password e la conferma devono essere uguali"
                })
                setLoading(false)
                return
            }

            // Prima verifichiamo la password corrente
            const { error: signInError } = await supabase.auth.signInWithPassword({
                email: user.email,
                password: currentPassword,
            })

            if (signInError) {
                toast({
                    variant: "destructive",
                    title: "Password attuale non corretta",
                    description: "Verifica la password inserita e riprova"
                })
                setLoading(false)
                return
            }

            // Cambiamo la password
            const { error: updateError } = await supabase.auth.updateUser({
                password: newPassword
            })

            if (updateError) {
                console.error('Update error:', updateError)
                throw updateError
            }

            toast({
                title: "Password aggiornata",
                description: "La password è stata modificata con successo",
                variant: "success"
            })

            // Modifichiamo il redirect alla home
            setTimeout(() => {
                router.push('/')
            }, 1500)

        } catch (error) {
            console.error('Error:', error)
            toast({
                variant: "destructive",
                title: "Errore",
                description: "Impossibile aggiornare la password. Riprova più tardi."
            })
        } finally {
            setLoading(false)
        }
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
                    <CardTitle>Cambia Password</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="currentPassword">Password attuale</Label>
                            <Input
                                id="currentPassword"
                                type="password"
                                value={currentPassword}
                                onChange={(e) => setCurrentPassword(e.target.value)}
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="newPassword">Nuova password</Label>
                            <Input
                                id="newPassword"
                                type="password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                required
                            />
                            <p className="text-xs text-muted-foreground">
                                La password deve contenere almeno 8 caratteri, una lettera maiuscola,
                                una minuscola, un numero e un carattere speciale (!@#$%^&*)
                            </p>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="confirmPassword">Conferma password</Label>
                            <Input
                                id="confirmPassword"
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
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
                                    Aggiornamento...
                                </div>
                            ) : (
                                'Cambia password'
                            )}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
} 