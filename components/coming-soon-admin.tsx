"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { useComingSoon } from "@/hooks/use-coming-soon"
import { Settings, AlertTriangle, CheckCircle, Clock } from "lucide-react"

export function ComingSoonAdmin() {
  const { enabled, loading, error, toggleComingSoon } = useComingSoon()
  const [isToggling, setIsToggling] = useState(false)

  const handleToggle = async () => {
    try {
      setIsToggling(true)
      await toggleComingSoon(!enabled)
    } catch (error) {
      console.error('Eroare la toggle:', error)
    } finally {
      setIsToggling(false)
    }
  }

  if (loading) {
    return (
      <Card className="glass-effect p-6">
        <div className="flex items-center space-x-3">
          <Clock className="w-5 h-5 text-muted-foreground animate-spin" />
          <span className="text-muted-foreground">Se verifică statusul...</span>
        </div>
      </Card>
    )
  }

  return (
    <Card className="glass-effect p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <Settings className="w-5 h-5 text-foreground" />
          <h3 className="text-lg font-semibold text-foreground">
            Admin Coming Soon
          </h3>
        </div>
        
        <Badge 
          variant={enabled ? "destructive" : "secondary"}
          className={enabled ? "text-red-400" : "text-green-400"}
        >
          {enabled ? "ACTIVAT" : "DEZACTIVAT"}
        </Badge>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="w-4 h-4 text-red-400" />
            <span className="text-red-400 text-sm">{error}</span>
          </div>
        </div>
      )}

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <Label htmlFor="coming-soon-toggle" className="text-foreground">
              Coming Soon Mode
            </Label>
            <p className="text-sm text-muted-foreground">
              {enabled 
                ? "Toate rutele sunt redirecționate către pagina coming soon"
                : "Aplicația funcționează normal"
              }
            </p>
          </div>
          
          <Switch
            id="coming-soon-toggle"
            checked={enabled}
            onCheckedChange={handleToggle}
            disabled={isToggling}
          />
        </div>

        <div className="flex items-center justify-between">
          <div>
            <Label className="text-foreground">Status Actual</Label>
            <p className="text-sm text-muted-foreground">
              {enabled ? "Coming soon activ" : "Aplicația completă"}
            </p>
          </div>
          
          <div className="flex items-center space-x-2">
            {enabled ? (
              <CheckCircle className="w-5 h-5 text-red-400" />
            ) : (
              <CheckCircle className="w-5 h-5 text-green-400" />
            )}
          </div>
        </div>

        <div className="pt-4 border-t border-border/50">
          <Button
            onClick={handleToggle}
            disabled={isToggling}
            variant={enabled ? "outline" : "default"}
            className="w-full"
          >
            {isToggling ? (
              "Se procesează..."
            ) : enabled ? (
              "Dezactivează Coming Soon"
            ) : (
              "Activează Coming Soon"
            )}
          </Button>
        </div>

        <div className="text-xs text-muted-foreground text-center">
          <p>
            <strong>Notă:</strong> Modificările se aplică imediat și afectează 
            toți utilizatorii aplicației.
          </p>
        </div>
      </div>
    </Card>
  )
}
