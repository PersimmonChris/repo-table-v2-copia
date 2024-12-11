"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { createClient } from "@/utils/supabase/client"
import { useRouter } from "next/navigation"
import { useState, useEffect } from 'react'
import { HeaderProps } from '@/types/supabase'
import { User } from '@supabase/supabase-js'

export function Header({ user: initialUser }: HeaderProps) {
    const router = useRouter()
    const supabase = createClient()
    const [displayName, setDisplayName] = useState<string>('')
    const [user, setUser] = useState<User | null>(initialUser || null)
    const [loading, setLoading] = useState(!initialUser)

    useEffect(() => {
        async function loadUserData() {
            try {
                const { data: { user: userData } } = await supabase.auth.getUser()
                if (!userData) {
                    setLoading(false)
                    return
                }

                setUser(userData)

                const { data: profile } = await supabase
                    .from('profiles')
                    .select('display_name')
                    .eq('id', userData.id)
                    .single()

                if (profile?.display_name) {
                    setDisplayName(profile.display_name)
                }
            } catch (error) {
                console.error('Error loading user data:', error)
            } finally {
                setLoading(false)
            }
        }

        loadUserData()

        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            if (event === 'SIGNED_IN') {
                loadUserData()
            } else if (event === 'SIGNED_OUT') {
                setUser(null)
                setDisplayName('')
            }
        })

        return () => {
            subscription.unsubscribe()
        }
    }, [])

    const handleSignOut = async () => {
        await supabase.auth.signOut()
        router.refresh()
        router.push('/login')
    }

    if (loading || !user) {
        return null
    }

    return (
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container flex h-14 items-center justify-between">
                <div className="flex items-center gap-2">
                    <h1 className="font-semibold">CV Manager</h1>
                </div>

                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                            <Avatar className="h-8 w-8">
                                <AvatarFallback>
                                    {displayName
                                        ? displayName.charAt(0).toUpperCase()
                                        : user.email?.charAt(0).toUpperCase()}
                                </AvatarFallback>
                            </Avatar>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56" align="end" forceMount>
                        <DropdownMenuLabel className="font-normal">
                            <div className="flex flex-col space-y-1">
                                <p className="text-sm font-medium leading-none">
                                    {displayName || user.email}
                                </p>
                                {displayName && (
                                    <p className="text-xs leading-none text-muted-foreground">
                                        {user.email}
                                    </p>
                                )}
                            </div>
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuGroup>
                            <DropdownMenuItem onClick={() => router.push('/impostazioni/profilo')}>
                                Profilo
                            </DropdownMenuItem>
                        </DropdownMenuGroup>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={handleSignOut}>
                            Log out
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </header>
    )
} 