"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { historyManager, type HistoryEntry, type HistoryStats } from "@/lib/history-manager"
import { Clock, Search, Download, Trash2, Filter, TrendingUp, Activity } from "lucide-react"

interface HistoryPanelProps {
  onRestoreEntry?: (entry: HistoryEntry) => void
}

export function HistoryPanel({ onRestoreEntry }: HistoryPanelProps) {
  const [history, setHistory] = useState<HistoryEntry[]>([])
  const [stats, setStats] = useState<HistoryStats | null>(null)
  const [filters, setFilters] = useState({
    type: "all" as "all" | "prompt" | "edit" | "test",
    vector: "all",
    searchTerm: "",
  })

  useEffect(() => {
    refreshHistory()
  }, [filters])

  const refreshHistory = () => {
    const filterObj = {
      ...(filters.type !== "all" && { type: filters.type }),
      ...(filters.vector !== "all" && { vector: filters.vector }),
      ...(filters.searchTerm && { searchTerm: filters.searchTerm }),
    }

    const filteredHistory = historyManager.getHistory(filterObj)
    const currentStats = historyManager.getStats()

    setHistory(filteredHistory)
    setStats(currentStats)
  }

  const handleExport = () => {
    const exportData = historyManager.exportHistory()
    const blob = new Blob([exportData], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `promptforge-history-${new Date().toISOString().split("T")[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const handleClearHistory = () => {
    if (confirm("Are you sure you want to delete the entire history? This action cannot be undone.")) {
      historyManager.clearHistory()
      refreshHistory()
    }
  }

  const handleDeleteEntry = (id: string) => {
    historyManager.deleteEntry(id)
    refreshHistory()
  }

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("ro-RO", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date)
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case "prompt":
        return "bg-blue-500/20 text-blue-400 border-blue-500/30"
      case "edit":
        return "bg-purple-500/20 text-purple-400 border-purple-500/30"
      case "test":
        return "bg-green-500/20 text-green-400 border-green-500/30"
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-500/30"
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 8) return "text-green-400"
    if (score >= 6) return "text-yellow-400"
    return "text-red-400"
  }

  return (
    <div className="space-y-6">
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="bg-black/50 border border-lead-gray/30 backdrop-blur-sm p-4">
            <div className="flex items-center gap-2 mb-2">
              <Activity className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-muted-foreground">Total Entries</span>
            </div>
            <div className="text-2xl font-bold text-foreground">{stats.totalEntries}</div>
          </Card>

          <Card className="bg-black/50 border border-lead-gray/30 backdrop-blur-sm p-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4 text-blue-400" />
              <span className="text-sm font-medium text-muted-foreground">Average Score</span>
            </div>
            <div className={`text-2xl font-bold ${getScoreColor(stats.averageScore)}`}>
              {stats.averageScore.toFixed(1)}
            </div>
          </Card>

          <Card className="bg-black/50 border border-lead-gray/30 backdrop-blur-sm p-4">
            <div className="flex items-center gap-2 mb-2">
              <Filter className="w-4 h-4 text-purple-400" />
              <span className="text-sm font-medium text-muted-foreground">Popular Module</span>
            </div>
            <div className="text-sm font-bold text-foreground break-words line-clamp-1">{stats.mostUsedModule}</div>
          </Card>

          <Card className="bg-black/50 border border-lead-gray/30 backdrop-blur-sm p-4">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-4 h-4 text-green-400" />
              <span className="text-sm font-medium text-muted-foreground">Popular Vector</span>
            </div>
            <div className="text-sm font-bold text-foreground">V{stats.mostUsedVector}</div>
          </Card>
        </div>
      )}

      <Card className="bg-black/50 border border-lead-gray/30 backdrop-blur-sm p-4">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <Search className="w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search in history..."
              value={filters.searchTerm}
              onChange={(e) => setFilters({ ...filters, searchTerm: e.target.value })}
              className="w-64"
            />
          </div>

          <select
            value={filters.type}
            onChange={(e) => setFilters({ ...filters, type: e.target.value as any })}
            className="bg-input border border-border rounded-lg px-3 py-2 text-sm text-foreground"
          >
            <option value="all">All Types</option>
            <option value="prompt">Prompts</option>
            <option value="edit">Edits</option>
            <option value="test">Tests</option>
          </select>

          <select
            value={filters.vector}
            onChange={(e) => setFilters({ ...filters, vector: e.target.value })}
            className="bg-input border border-border rounded-lg px-3 py-2 text-sm text-foreground"
          >
            <option value="all">All Vectors</option>
            <option value="1">V1 - Marketing</option>
            <option value="2">V2 - Content</option>
            <option value="3">V3 - PR</option>
            <option value="4">V4 - Branding</option>
            <option value="5">V5 - Sales</option>
            <option value="6">V6 - Operations</option>
            <option value="7">V7 - Crisis</option>
          </select>

          <div className="flex gap-2 ml-auto">
            <Button variant="skre-outline" size="sm" onClick={handleExport}>
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
            <Button variant="skre-outline" size="sm" onClick={handleClearHistory}>
              <Trash2 className="w-4 h-4 mr-2" />
              Delete All
            </Button>
          </div>
        </div>
      </Card>

      <div className="space-y-4">
        {history.length === 0 ? (
          <Card className="bg-black/50 border border-lead-gray/30 backdrop-blur-sm p-8 text-center">
            <div className="text-muted-foreground">
              <Clock className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No history entries match the current filters.</p>
            </div>
          </Card>
        ) : (
          history.map((entry) => (
            <Card key={entry.id} className="bg-black/50 border border-lead-gray/30 backdrop-blur-sm p-4 hover:shadow-gold hover:shadow-gold-hover transition-all duration-300">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <Badge className={getTypeColor(entry.type)}>{entry.type.toUpperCase()}</Badge>
                  <Badge variant="skre-outline">V{entry.vector}</Badge>
                  <span className="text-sm font-medium text-foreground break-words line-clamp-1">
                    {entry.moduleName}
                  </span>
                  {entry.metadata.validationScore && (
                    <Badge className={`${getScoreColor(entry.metadata.validationScore)} bg-transparent border-current`}>
                      Score: {entry.metadata.validationScore.toFixed(1)}
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">{formatDate(entry.timestamp)}</span>
                  <Button variant="ghost" size="sm" onClick={() => onRestoreEntry?.(entry)} className="text-xs">
                    Restore
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteEntry(entry.id)}
                    className="text-xs text-red-400 hover:text-red-300"
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </div>

              <div className="text-sm text-muted-foreground mb-3">
                <div className="line-clamp-3 break-words">{entry.content.substring(0, 200)}...</div>
              </div>

              {entry.tags.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {entry.tags.map((tag, index) => (
                    <Badge key={index} variant="skre" className="text-xs break-words">
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}

              {entry.metadata.improvements && entry.metadata.improvements.length > 0 && (
                <div className="mt-2 text-xs text-green-400 break-words line-clamp-2">
                  Improvements: {entry.metadata.improvements.join(", ")}
                </div>
              )}
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
