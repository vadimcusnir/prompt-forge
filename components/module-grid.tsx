"use client"

import { HomeInteractive } from "@/components/home-interactive";

import { useState, useMemo } from "react"
import { Input } from "@/components/ui/input"

import { Badge } from "@/components/ui/badge"
import { ModuleCard } from "./module-card"
import { MODULES, searchModules, getModulesByVector } from "@/lib/modules"
import { VECTORS } from "@/types/promptforge"
import { Search, Filter, Grid, List } from "lucide-react"

interface ModuleGridProps {
  selectedModule: number | null
  onSelectModule: (moduleId: number) => void
  vectorFilter: string
  onVectorFilterChange: (vector: string) => void
}

export function HomeInteractive() ({ selectedModule, onSelectModule, vectorFilter, onVectorFilterChange }: ModuleGridProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [showDetails, setShowDetails] = useState<number | null>(null)

  const filteredModules = useMemo(() => {
    let modules = Object.values(MODULES)

    // Apply vector filter
    if (vectorFilter !== "all") {
      modules = getModulesByVector(Number.parseInt(vectorFilter))
    }

    // Apply search filter
    if (searchQuery.trim()) {
      modules = searchModules(searchQuery).filter(
        (module) => vectorFilter === "all" || module.vectors.includes(Number.parseInt(vectorFilter)),
      )
    }

    return modules.sort((a, b) => a.id - b.id)
  }, [vectorFilter, searchQuery])

  const handleViewDetails = (moduleId: number) => {
    setShowDetails(showDetails === moduleId ? null : moduleId)
  }

  return (
    <div className="space-y-4">
      {/* Search and Controls */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#5a5a5a] w-4 h-4" />
          <Input
            placeholder="Search modules..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 glass-effect border-[#5a5a5a]/30 focus:border-[#d1a954] focus:ring-[#d1a954]/20"
          />
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="outline" className="glass-effect border-[#5a5a5a]/30 text-[#d1a954]">
            {filteredModules.length} modules
          </Badge>

          <div className="flex items-center gap-1">
            <button 
              onClick={() => setViewMode("grid")} 
              className={`inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 px-3 py-2 h-8 ${
                viewMode === "grid" 
                  ? "bg-[#d1a954] text-black shadow-[0_0_20px_rgba(209,169,84,0.3)] hover:shadow-[0_0_30px_rgba(209,169,84,0.5)]" 
                  : "glass-effect border-[#5a5a5a]/30 hover:border-[#d1a954] hover:text-[#d1a954]"
              }`}
            >
              <Grid className="w-4 h-4" />
            </button>
            <button 
              onClick={() => setViewMode("list")} 
              className={`inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 px-3 py-2 h-8 ${
                viewMode === "list" 
                  ? "bg-[#d1a954] text-black shadow-[0_0_20px_rgba(209,169,84,0.3)] hover:shadow-[0_0_30px_rgba(209,169,84,0.5)]" 
                  : "glass-effect border-[#5a5a5a]/30 hover:border-[#d1a954] hover:text-[#d1a954]"
              }`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Vector Filter Pills */}
      <div className="flex flex-wrap gap-2">
        <button 
          onClick={() => onVectorFilterChange("all")} 
          className={`inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 px-3 py-2 h-8 ${
            vectorFilter === "all" 
              ? "bg-[#d1a954] text-black shadow-[0_0_20px_rgba(209,169,84,0.3)] hover:shadow-[0_0_30px_rgba(209,169,84,0.5)]" 
              : "glass-effect border-[#5a5a5a]/30 hover:border-[#d1a954] hover:text-[#d1a954]"
          }`}
        >
          All ({Object.keys(MODULES).length})
        </button>
        {Object.entries(VECTORS).map(([key, vector]) => {
          const count = getModulesByVector(Number.parseInt(key)).length
          return (
            <button 
              onClick={() => onVectorFilterChange(key)} 
              className={`inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 px-3 py-2 h-8 ${
                vectorFilter === key 
                  ? "bg-[#d1a954] text-black shadow-[0_0_20px_rgba(209,169,84,0.3)] hover:shadow-[0_0_30px_rgba(209,169,84,0.5)]" 
                  : "glass-effect border-[#5a5a5a]/30 hover:border-[#d1a954] hover:text-[#d1a954]"
              }`} 
              key={key}
            >
              {vector.name} ({count})
            </button>
          )
        })}
      </div>

      {/* Module Grid/List */}
      <div className={viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" : "space-y-3"}>
        {filteredModules.map((module) => (
          <ModuleCard
            key={module.id}
            module={module}
            isSelected={selectedModule === module.id}
            onSelect={onSelectModule}
            onViewDetails={handleViewDetails}
          />
        ))}
      </div>

      {filteredModules.length === 0 && (
        <div className="text-center py-12 text-[#5a5a5a]">
          <Filter className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>No modules found for the selected criteria.</p>
          <button 
            onClick={() => {
              setSearchQuery("")
              onVectorFilterChange("all")
            }} 
            className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 px-4 py-2 glass-effect border-[#5a5a5a]/30 hover:border-[#d1a954] hover:text-[#d1a954]"
          >
            Reset filters
          </button>
        </div>
      )}
    </div>
  )
}
