export const TableSkeleton = () => {
    return (
        <div className="space-y-4 animate-pulse">
            <div className="h-8 bg-muted rounded" />
            {[...Array(5)].map((_, i) => (
                <div key={i} className="h-16 bg-muted rounded" />
            ))}
        </div>
    )
}

export const UploadSkeleton = () => {
    return (
        <div className="border-2 border-dashed rounded-lg p-8 animate-pulse">
            <div className="h-24 bg-muted rounded" />
        </div>
    )
} 