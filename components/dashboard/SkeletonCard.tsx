"use client"

import { cn } from "@/lib/utils"

interface SkeletonCardProps {
  className?: string
  lines?: number
  showHeader?: boolean
}

export function SkeletonCard({ className, lines = 3, showHeader = true }: SkeletonCardProps) {
  return (
    <div className={cn(
      "rounded-xl border border-border bg-card p-6 space-y-4",
      className
    )}>
      {showHeader && (
        <div className="flex items-center justify-between">
          <div className="skeleton-shimmer h-4 w-32 rounded" />
          <div className="skeleton-shimmer h-8 w-8 rounded-full" />
        </div>
      )}
      <div className="space-y-2">
        {Array.from({ length: lines }).map((_, i) => (
          <div
            key={i}
            className="skeleton-shimmer h-3 rounded"
            style={{ width: `${85 - i * 12}%` }}
          />
        ))}
      </div>
    </div>
  )
}

export function SkeletonRow({ cols = 5 }: { cols?: number }) {
  const widths = [75, 55, 80, 60, 70, 65, 50, 85]
  return (
    <tr className="border-b border-border">
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i} className="px-6 py-4">
          <div className="skeleton-shimmer h-4 rounded" style={{ width: `${widths[i % widths.length]}%` }} />
        </td>
      ))}
    </tr>
  )
}

export function SkeletonText({ className, width = "100%" }: { className?: string; width?: string }) {
  return <div className={cn("skeleton-shimmer h-4 rounded", className)} style={{ width }} />
}

export function SkeletonStatCard() {
  return (
    <div className="rounded-xl border border-border bg-card p-6 space-y-3">
      <div className="flex items-center justify-between">
        <div className="skeleton-shimmer h-3 w-28 rounded" />
        <div className="skeleton-shimmer h-9 w-9 rounded-lg" />
      </div>
      <div className="skeleton-shimmer h-8 w-16 rounded" />
      <div className="skeleton-shimmer h-3 w-24 rounded" />
    </div>
  )
}
