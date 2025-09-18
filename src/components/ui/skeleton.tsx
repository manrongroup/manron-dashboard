import { cn } from "@/lib/utils"

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-muted", className)}
      {...props}
    />
  )
}

// Enhanced skeleton components for different use cases
export const SkeletonCard = ({ className }: { className?: string }) => (
  <div className={cn("rounded-lg border p-6 space-y-4", className)}>
    <div className="flex items-center space-x-4">
      <Skeleton className="h-12 w-12 rounded-full" />
      <div className="space-y-2">
        <Skeleton className="h-4 w-[200px]" />
        <Skeleton className="h-4 w-[160px]" />
      </div>
    </div>
    <div className="space-y-2">
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-[80%]" />
    </div>
  </div>
)

export const SkeletonTable = ({ rows = 5, columns = 4 }: { rows?: number; columns?: number }) => (
  <div className="space-y-4">
    {/* Header */}
    <div className="flex space-x-4">
      {Array.from({ length: columns }).map((_, i) => (
        <Skeleton key={i} className="h-4 w-[100px]" />
      ))}
    </div>
    {/* Rows */}
    {Array.from({ length: rows }).map((_, rowIndex) => (
      <div key={rowIndex} className="flex space-x-4">
        {Array.from({ length: columns }).map((_, colIndex) => (
          <Skeleton key={colIndex} className="h-4 w-[100px]" />
        ))}
      </div>
    ))}
  </div>
)

export const SkeletonChart = ({ className }: { className?: string }) => (
  <div className={cn("space-y-4", className)}>
    <div className="flex items-center justify-between">
      <Skeleton className="h-6 w-[200px]" />
      <Skeleton className="h-4 w-[100px]" />
    </div>
    <div className="h-[300px] w-full space-y-2">
      {Array.from({ length: 8 }).map((_, i) => (
        <Skeleton key={i} className="h-8 w-full" style={{ width: `${Math.random() * 40 + 20}%` }} />
      ))}
    </div>
  </div>
)

export const SkeletonStatCard = ({ className }: { className?: string }) => (
  <div className={cn("rounded-lg border p-6 space-y-4", className)}>
    <div className="flex items-center justify-between">
      <Skeleton className="h-4 w-[120px]" />
      <Skeleton className="h-5 w-5 rounded" />
    </div>
    <div className="space-y-2">
      <Skeleton className="h-8 w-[80px]" />
      <Skeleton className="h-4 w-[100px]" />
    </div>
    <div className="flex items-center justify-between">
      <Skeleton className="h-3 w-[60px]" />
      <Skeleton className="h-3 w-[40px]" />
    </div>
  </div>
)

export const SkeletonList = ({ items = 5 }: { items?: number }) => (
  <div className="space-y-3">
    {Array.from({ length: items }).map((_, i) => (
      <div key={i} className="flex items-center space-x-4">
        <Skeleton className="h-10 w-10 rounded-full" />
        <div className="space-y-2 flex-1">
          <Skeleton className="h-4 w-[200px]" />
          <Skeleton className="h-3 w-[150px]" />
        </div>
        <Skeleton className="h-6 w-[60px] rounded-full" />
      </div>
    ))}
  </div>
)

export const SkeletonForm = () => (
  <div className="space-y-6">
    <div className="space-y-2">
      <Skeleton className="h-4 w-[100px]" />
      <Skeleton className="h-10 w-full" />
    </div>
    <div className="space-y-2">
      <Skeleton className="h-4 w-[120px]" />
      <Skeleton className="h-10 w-full" />
    </div>
    <div className="space-y-2">
      <Skeleton className="h-4 w-[80px]" />
      <Skeleton className="h-20 w-full" />
    </div>
    <div className="flex space-x-4">
      <Skeleton className="h-10 w-[100px]" />
      <Skeleton className="h-10 w-[100px]" />
    </div>
  </div>
)

export const SkeletonDashboard = () => (
  <div className="space-y-6">
    {/* Header */}
    <div className="flex items-center justify-between">
      <div className="space-y-2">
        <Skeleton className="h-8 w-[300px]" />
        <Skeleton className="h-4 w-[200px]" />
      </div>
      <div className="flex space-x-2">
        <Skeleton className="h-10 w-[100px]" />
        <Skeleton className="h-10 w-[120px]" />
      </div>
    </div>

    {/* Stats Cards */}
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6">
      {Array.from({ length: 6 }).map((_, i) => (
        <SkeletonStatCard key={i} />
      ))}
    </div>

    {/* Charts */}
    <div className="grid gap-6 md:grid-cols-2">
      <SkeletonChart />
      <SkeletonChart />
    </div>

    {/* Content Grid */}
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      <SkeletonCard />
      <SkeletonCard />
      <SkeletonCard />
    </div>
  </div>
)

export { Skeleton }