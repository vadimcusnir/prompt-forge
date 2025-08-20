"use client"

import { HomeInteractive } from "@/components/home-interactive";

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

import { Keyboard, X } from "lucide-react"

interface KeyboardShortcutsProps {
  onGeneratePrompt?: () => void
  onOpenHistory?: () => void
  onExport?: () => void
  onClearAll?: () => void
}

export function HomeInteractive() ({ onGeneratePrompt, onOpenHistory, onExport, onClearAll }: KeyboardShortcutsProps) {
  const [showShortcuts, setShowShortcuts] = useState(false)

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger shortcuts when typing in inputs
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        e.target instanceof HTMLSelectElement
      ) {
        return
      }

      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case "g":
            e.preventDefault()
            onGeneratePrompt?.()
            break
          case "h":
            e.preventDefault()
            onOpenHistory?.()
            break
          case "e":
            e.preventDefault()
            onExport?.()
            break
          case "k":
            e.preventDefault()
            setShowShortcuts(true)
            break
        }
      }

      if (e.key === "Escape") {
        setShowShortcuts(false)
      }

      if (e.ctrlKey && e.shiftKey && e.key === "Delete") {
        e.preventDefault()
        onClearAll?.()
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [onGeneratePrompt, onOpenHistory, onExport, onClearAll])

  const shortcuts = [
    { keys: ["Ctrl", "G"], description: "Generate new prompt" },
    { keys: ["Ctrl", "H"], description: "Open history" },
    { keys: ["Ctrl", "E"], description: "Quick export" },
    { keys: ["Ctrl", "K"], description: "Show shortcuts" },
    { keys: ["Ctrl", "Shift", "Del"], description: "Clear all data" },
    { keys: ["Esc"], description: "Close panels" },
  ]

  if (!showShortcuts) {
    return (
      <button onClick={() => setShowShortcuts(true)} className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 px-4 py-2 hover:bg-accent hover:text-accent-foreground h-8 rounded-md gap-1.5 px-3">
        <Keyboard className="w-4 h-4" />
      </button>
    )
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="glass-strong p-6 max-w-md w-full animate-slide-up">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold font-[var(--font-heading)] text-foreground">Keyboard Shortcuts</h3>
          <button onClick={() => setShowShortcuts(false)} className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 px-4 py-2 hover:bg-accent hover:text-accent-foreground h-8 rounded-md gap-1.5 px-3">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-3">
          {shortcuts.map((shortcut, index) => (
            <div key={index} className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">{shortcut.description}</span>
              <div className="flex gap-1">
                {shortcut.keys.map((key, keyIndex) => (
                  <Badge key={keyIndex} variant="outline" className="text-xs font-mono">
                    {key}
                  </Badge>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 pt-4 border-t border-border">
          <p className="text-xs text-muted-foreground text-center">
            Press{" "}
            <Badge variant="outline" className="text-xs font-mono mx-1">
              Esc
            </Badge>{" "}
            to close
          </p>
        </div>
      </Card>
    </div>
  )
}
