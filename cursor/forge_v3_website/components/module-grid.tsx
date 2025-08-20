"use client"

import { useState, useMemo } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
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

export function ModuleGrid({ selectedModule, onSelectModule, vectorFilter, onVectorFilterChange }: ModuleGridProps) {
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
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Search modules..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-black/50 border border-lead-gray/30 backdrop-blur-sm"
          />
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="skre-outline" className="bg-black/50 border border-lead-gray/30 backdrop-blur-sm">
            {filteredModules.length} modules
          </Badge>

          <div className="flex items-center gap-1">
            <Button size="sm" variant={viewMode === "grid" ? "default" : "outline"} onClick={() => setViewMode("grid")}>
              <Grid className="w-4 h-4" />
            </Button>
            <Button size="sm" variant={viewMode === "list" ? "default" : "outline"} onClick={() => setViewMode("list")}>
              <List className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Vector Filter Pills */}
      <div className="flex flex-wrap gap-2">
        <Button
          size="sm"
          variant={vectorFilter === "all" ? "default" : "outline"}
          onClick={() => onVectorFilterChange("all")}
          className="bg-black/50 border border-lead-gray/30 backdrop-blur-sm"
        >
          All ({Object.keys(MODULES).length})
        </Button>
        {Object.entries(VECTORS).map(([key, vector]) => {
          const count = getModulesByVector(Number.parseInt(key)).length
          return (
            <Button
              key={key}
              size="sm"
              variant={vectorFilter === key ? "default" : "outline"}
              onClick={() => onVectorFilterChange(key)}
              className="bg-black/50 border border-lead-gray/30 backdrop-blur-sm"
            >
              {vector.name} ({count})
            </Button>
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
        <div className="text-center py-12 text-muted-foreground">
          <Filter className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>No modules found for the selected criteria.</p>
          <Button
            variant="skre-outline"
            onClick={() => {
              setSearchQuery("")
              onVectorFilterChange("all")
            }}
            className="mt-4"
          >
            Reset filters
          </Button>
        </div>
      )}
    </div>
  )
}
