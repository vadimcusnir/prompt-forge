'use client';

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

import { VECTORS, type PromptModule } from "@/types/promptforge"
import { useState } from "react"

interface ModuleCardProps {
  module: PromptModule
  isSelected: boolean
  onSelect: (moduleId: number) => void
  onViewDetails: (moduleId: number) => void
}

export function ModuleCard({ module, isSelected, onSelect, onViewDetails }: ModuleCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  const primaryVector = module.vectors[0]
  const vectorColor = VECTORS[primaryVector as keyof typeof VECTORS]?.color || "text-gray-400"

  return (
    <Card
      className={`glass-effect p-4 cursor-pointer transition-all duration-300 hover:glow-primary border-l-4 ${
        isSelected ? "ring-2 ring-primary glow-primary border-l-primary" : `border-l-${vectorColor.split("-")[1]}-500`
      }`}
      onClick={() => onSelect(module.id)}
    >
      <div className="flex justify-between items-start mb-2">
        <h3 className="font-semibold text-sm text-primary">M{module.id.toString().padStart(2, "0")}</h3>
        <div className="flex gap-1">
          {module.vectors.map((v) => (
            <Badge
              key={v}
              variant="secondary"
              className={`text-xs ${VECTORS[v as keyof typeof VECTORS]?.color || "text-gray-400"}`}
            >
              V{v}
            </Badge>
          ))}
        </div>
      </div>

      <h4 className="font-bold text-foreground mb-2 text-sm leading-tight break-words line-clamp-2">{module.name}</h4>

      <p className="text-muted-foreground text-xs mb-3 line-clamp-2 break-words">{module.description}</p>

      {isExpanded && (
        <div className="text-xs text-muted-foreground space-y-2 mb-3">
          <div className="break-words">
            <strong>Spec:</strong> <span className="line-clamp-3">{module.spec}</span>
          </div>
          <div className="break-words">
            <strong>Output:</strong> <span className="line-clamp-2">{module.output}</span>
          </div>
          <div className="break-words">
            <strong>Guardrails:</strong> <span className="line-clamp-2">{module.guardrails}</span>
          </div>
        </div>
      )}

      <div className="text-xs text-muted-foreground mb-3">
        <div className="break-words">
          <strong>KPI:</strong> <span className="line-clamp-1">{module.kpi}</span>
        </div>
      </div>

      <div className="flex gap-2">
        <button onClick={(e) => {
            e.stopPropagation()
            setIsExpanded(!isExpanded)
          } className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 px-4 py-2 border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground h-8 rounded-md gap-1.5 px-3 text-xs bg-transparent">
          {isExpanded ? "Minimize" : "Details"}
        </button>
        <button onClick={(e) => {
            e.stopPropagation()
            onViewDetails(module.id)
          } className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 px-4 py-2 border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground h-8 rounded-md gap-1.5 px-3 text-xs bg-transparent">
          Specifications
        </button>
      </div>
    </Card>
  )
}
