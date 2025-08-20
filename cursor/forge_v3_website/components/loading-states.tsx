"use client"

import { Card } from "@/components/ui/card"

export function ModuleCardSkeleton() {
  return (
    <Card className="bg-black/50 border border-lead-gray/30 backdrop-blur-sm p-4 loading-shimmer">
      <div className="flex items-start justify-between mb-3">
        <div className="h-4 bg-muted/30 rounded w-24"></div>
        <div className="h-5 bg-muted/30 rounded w-8"></div>
      </div>
      <div className="h-3 bg-muted/30 rounded w-full mb-2"></div>
      <div className="h-3 bg-muted/30 rounded w-3/4 mb-3"></div>
      <div className="flex gap-2">
        <div className="h-5 bg-muted/30 rounded w-16"></div>
        <div className="h-5 bg-muted/30 rounded w-20"></div>
      </div>
    </Card>
  )
}

export function PromptGeneratorSkeleton() {
  return (
    <Card className="bg-black/50 border border-lead-gray/30 backdrop-blur-sm p-6 loading-shimmer">
      <div className="h-6 bg-muted/30 rounded w-48 mb-4"></div>
      <div className="space-y-3 mb-6">
        <div className="h-4 bg-muted/30 rounded w-full"></div>
        <div className="h-4 bg-muted/30 rounded w-5/6"></div>
        <div className="h-4 bg-muted/30 rounded w-4/5"></div>
      </div>
      <div className="h-10 bg-muted/30 rounded w-32"></div>
    </Card>
  )
}

export function LoadingSpinner({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-6 h-6",
    lg: "w-8 h-8",
  }

  return <div className={`${sizeClasses[size]} animate-spin rounded-full border-2 border-muted border-t-primary`} />
}

export function ProcessingIndicator({ message = "Processing..." }: { message?: string }) {
  return (
    <div className="flex items-center gap-3 p-4 bg-black/50 border border-lead-gray/30 backdrop-blur-sm rounded-lg animate-pulse-glow">
      <LoadingSpinner />
      <span className="text-sm text-muted-foreground">{message}</span>
    </div>
  )
}
