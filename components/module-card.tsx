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
        isSelected 
          ? "ring-2 ring-[#d1a954] glow-primary border-l-[#d1a954]" 
          : `border-l-${vectorColor.split("-")[1]}-500`
      }`}
      onClick={() => onSelect(module.id)}
    >
      <div className="flex justify-between items-start mb-2">
        <h3 className="font-semibold text-sm text-[#d1a954]">M{module.id.toString().padStart(2, "0")}</h3>
        <div className="flex gap-1">
          {module.vectors.map((v) => (
            <Badge
              key={v}
              variant="secondary"
              className={`text-xs glass-effect border-[#5a5a5a]/30 ${VECTORS[v as keyof typeof VECTORS]?.color || "text-gray-400"}`}
            >
              V{v}
            </Badge>
          ))}
        </div>
      </div>

      <h4 className="font-bold text-white mb-2 text-sm leading-tight break-words line-clamp-2">{module.name}</h4>

      <p className="text-[#5a5a5a] text-xs mb-3 line-clamp-2 break-words">{module.description}</p>

      {isExpanded && (
        <div className="text-xs text-[#5a5a5a] space-y-2 mb-3">
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

      <div className="text-xs text-[#5a5a5a] mb-3">
        <div className="break-words">
          <strong>KPI:</strong> <span className="line-clamp-1">{module.kpi}</span>
        </div>
      </div>

      <div className="flex gap-2">
        <button 
          onClick={(e) => {
            e.stopPropagation()
            setIsExpanded(!isExpanded)
          }} 
          className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 px-3 py-2 h-8 text-xs glass-effect border-[#5a5a5a]/30 hover:border-[#d1a954] hover:text-[#d1a954]"
        >
          {isExpanded ? "Minimize" : "Details"}
        </button>
        <button 
          onClick={(e) => {
            e.stopPropagation()
            onViewDetails(module.id)
          }} 
          className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 px-3 py-2 h-8 text-xs glass-effect border-[#5a5a5a]/30 hover:border-[#d1a954] hover:text-[#d1a954]"
        >
          Specifications
        </button>
      </div>
    </Card>
  )
}
