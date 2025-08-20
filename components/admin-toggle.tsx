"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useComingSoon } from "@/hooks/use-coming-soon"
import { useToast } from "@/hooks/use-toast"
import { Settings, Eye, EyeOff } from "lucide-react"

export function AdminToggle() {
  const { status, loading, error, toggleStatus } = useComingSoon()
  const [isToggling, setIsToggling] = useState(false)
  const { toast } = useToast()

  const handleToggle = async (enabled: boolean) => {
    setIsToggling(true)
    
    try {
      const success = await toggleStatus(enabled)
      
      if (success) {
        toast({
          title: "Success",
          description: `Coming soon ${enabled ? 'enabled' : 'disabled'} successfully`,
        })
      } else {
        toast({
          title: "Error",
          description: "Failed to toggle coming soon status",
          variant: "destructive"
        })
      }
    } catch (err) {
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive"
      })
    } finally {
      setIsToggling(false)
    }
  }

  if (loading) {
    return (
      <Card className="bg-[#1a1a1a] border-[#5a5a5a]/30">
        <CardContent className="p-6">
          <div className="text-center text-[#5a5a5a]">Loading...</div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="bg-[#1a1a1a] border-red-500/30">
        <CardContent className="p-6">
          <div className="text-center text-red-400">Error: {error}</div>
        </CardContent>
      </Card>
    )
  }

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
          <Switch
            checked={status?.enabled || false}
            disabled={isToggling}
            className="data-[state=checked]:bg-[#d1a954]"
          />
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
          <button onClick={() => handleToggle(!status?.enabled)} className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 px-4 py-2 bg-primary text-primary-foreground shadow-xs hover:bg-primary/90">
            {isToggling ? "Processing..." : `Turn ${status?.enabled ? 'Off' : 'On'}`}
          </button>
        </div>
      </CardContent>
    </Card>
  )
}
