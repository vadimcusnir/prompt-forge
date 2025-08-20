"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Settings, Eye, EyeOff } from "lucide-react"

export function AdminToggle() {
  // Temporarily disable all functionality to avoid build issues
  const status = { enabled: false, message: "Coming Soon", updated_at: new Date().toISOString() }
  const isToggling = false

  return (
    <Card className="bg-[#1a1a1a] border-[#5a5a5a]/30">
      <CardHeader>
        <div className="flex items-center gap-3">
          <Settings className="w-5 h-5 text-[#d1a954]" />
          <CardTitle className="text-white">Coming Soon Control</CardTitle>
        </div>
        <CardDescription className="text-[#5a5a5a]">
          Toggle the coming soon page on/off
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {status?.enabled ? (
              <EyeOff className="w-5 h-5 text-[#d1a954]" />
            ) : (
              <Eye className="w-5 h-5 text-[#d1a954]" />
            )}
            <span className="text-white">
              {status?.enabled ? 'Coming Soon Active' : 'Site Live'}
            </span>
          </div>
          <div className="w-8 h-4 bg-[#5a5a5a] rounded-full flex items-center">
            <div className={`w-4 h-4 rounded-full transition-all ${status?.enabled ? 'bg-[#d1a954] translate-x-4' : 'bg-[#5a5a5a] translate-x-0'}`} />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Badge 
            variant={status?.enabled ? "default" : "secondary"}
            className={status?.enabled 
              ? "bg-[#d1a954]/10 text-[#d1a954] border-[#d1a954]/20" 
              : "bg-[#5a5a5a]/20 text-[#5a5a5a] border-[#5a5a5a]/30"
            }
          >
            {status?.enabled ? 'ENABLED' : 'DISABLED'}
          </Badge>
          <span className="text-sm text-[#5a5a5a]">
            {status?.message}
          </span>
        </div>

        {status?.updated_at && (
          <div className="text-xs text-[#5a5a5a]">
            Last updated: {new Date(status.updated_at).toLocaleString()}
          </div>
        )}

        <div className="pt-4 border-t border-[#5a5a5a]/20">
          <button className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 px-4 py-2 bg-primary text-primary-foreground shadow-xs hover:bg-primary/90">
            {isToggling ? "Processing..." : `Turn ${status?.enabled ? 'Off' : 'On'}`}
          </button>
        </div>
      </CardContent>
    </Card>
  )
}
