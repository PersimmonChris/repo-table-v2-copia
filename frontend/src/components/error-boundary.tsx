"use client"

import { Component, ReactNode } from 'react'
import { Button } from '@/components/ui/button'

interface Props {
    children: ReactNode
    fallback?: ReactNode
}

interface State {
    hasError: boolean
    error?: Error
}

export class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false
    }

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error }
    }

    public reset = () => {
        this.setState({ hasError: false, error: undefined })
    }

    public render() {
        if (this.state.hasError) {
            return this.props.fallback || (
                <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
                    <h2 className="text-xl font-semibold">Qualcosa è andato storto</h2>
                    <p className="text-sm text-muted-foreground">
                        {this.state.error?.message || 'Si è verificato un errore imprevisto'}
                    </p>
                    <Button onClick={this.reset}>Riprova</Button>
                </div>
            )
        }

        return this.props.children
    }
} 