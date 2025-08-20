export interface HistoryEntry {
  id: string
  timestamp: Date
  type: "prompt" | "edit" | "test"
  moduleId: number
  moduleName: string
  vector: string
  config: any
  content: string
  metadata: {
    sessionHash?: string
    validationScore?: number
    kpiCompliance?: number
    structureScore?: number
    clarityScore?: number
    editType?: string
    testMode?: string
    improvements?: string[]
  }
  tags: string[]
}

export interface HistoryStats {
  totalEntries: number
  promptsGenerated: number
  editsPerformed: number
  testsExecuted: number
  averageScore: number
  mostUsedModule: string
  mostUsedVector: string
  recentActivity: HistoryEntry[]
}

export class HistoryManager {
  private static instance: HistoryManager
  private history: HistoryEntry[] = []
  private maxEntries = 1000

  static getInstance(): HistoryManager {
    if (!HistoryManager.instance) {
      HistoryManager.instance = new HistoryManager()
    }
    return HistoryManager.instance
  }

  addEntry(entry: Omit<HistoryEntry, "id" | "timestamp">): HistoryEntry {
    const newEntry: HistoryEntry = {
      ...entry,
      id: this.generateId(),
      timestamp: new Date(),
    }

    this.history.unshift(newEntry)

    // Keep only the most recent entries
    if (this.history.length > this.maxEntries) {
      this.history = this.history.slice(0, this.maxEntries)
    }

    this.saveToStorage()
    return newEntry
  }

  getHistory(filters?: {
    type?: "prompt" | "edit" | "test"
    vector?: string
    moduleId?: number
    dateRange?: { start: Date; end: Date }
    searchTerm?: string
  }): HistoryEntry[] {
    let filtered = [...this.history]

    if (filters) {
      if (filters.type) {
        filtered = filtered.filter((entry) => entry.type === filters.type)
      }
      if (filters.vector && filters.vector !== "all") {
        filtered = filtered.filter((entry) => entry.vector === filters.vector)
      }
      if (filters.moduleId) {
        filtered = filtered.filter((entry) => entry.moduleId === filters.moduleId)
      }
      if (filters.dateRange) {
        filtered = filtered.filter(
          (entry) => entry.timestamp >= filters.dateRange!.start && entry.timestamp <= filters.dateRange!.end,
        )
      }
      if (filters.searchTerm) {
        const term = filters.searchTerm.toLowerCase()
        filtered = filtered.filter(
          (entry) =>
            entry.content.toLowerCase().includes(term) ||
            entry.moduleName.toLowerCase().includes(term) ||
            entry.tags.some((tag) => tag.toLowerCase().includes(term)),
        )
      }
    }

    return filtered
  }

  getStats(): HistoryStats {
    const promptEntries = this.history.filter((e) => e.type === "prompt")
    const editEntries = this.history.filter((e) => e.type === "edit")
    const testEntries = this.history.filter((e) => e.type === "test")

    // Calculate average score
    const scoredEntries = this.history.filter((e) => e.metadata.validationScore)
    const averageScore =
      scoredEntries.length > 0
        ? scoredEntries.reduce((sum, e) => sum + (e.metadata.validationScore || 0), 0) / scoredEntries.length
        : 0

    // Find most used module and vector
    const moduleCount = this.history.reduce(
      (acc, entry) => {
        acc[entry.moduleName] = (acc[entry.moduleName] || 0) + 1
        return acc
      },
      {} as Record<string, number>,
    )

    const vectorCount = this.history.reduce(
      (acc, entry) => {
        acc[entry.vector] = (acc[entry.vector] || 0) + 1
        return acc
      },
      {} as Record<string, number>,
    )

    const mostUsedModule = Object.entries(moduleCount).sort(([, a], [, b]) => b - a)[0]?.[0] || "N/A"
    const mostUsedVector = Object.entries(vectorCount).sort(([, a], [, b]) => b - a)[0]?.[0] || "N/A"

    return {
      totalEntries: this.history.length,
      promptsGenerated: promptEntries.length,
      editsPerformed: editEntries.length,
      testsExecuted: testEntries.length,
      averageScore: Math.round(averageScore * 100) / 100,
      mostUsedModule,
      mostUsedVector,
      recentActivity: this.history.slice(0, 10),
    }
  }

  deleteEntry(id: string): boolean {
    const index = this.history.findIndex((entry) => entry.id === id)
    if (index !== -1) {
      this.history.splice(index, 1)
      this.saveToStorage()
      return true
    }
    return false
  }

  clearHistory(): void {
    this.history = []
    this.saveToStorage()
  }

  exportHistory(): string {
    return JSON.stringify(
      {
        exportDate: new Date().toISOString(),
        version: "3.0",
        entries: this.history,
      },
      null,
      2,
    )
  }

  importHistory(data: string): boolean {
    try {
      const parsed = JSON.parse(data)
      if (parsed.entries && Array.isArray(parsed.entries)) {
        this.history = parsed.entries.map((entry: any) => ({
          ...entry,
          timestamp: new Date(entry.timestamp),
        }))
        this.saveToStorage()
        return true
      }
    } catch (error) {
      console.error("Failed to import history:", error)
    }
    return false
  }

  private generateId(): string {
    return `hist_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`
  }

  private saveToStorage(): void {
    try {
      localStorage.setItem("promptforge_history", JSON.stringify(this.history))
    } catch (error) {
      console.error("Failed to save history to storage:", error)
    }
  }

  private loadFromStorage(): void {
    try {
      const stored = localStorage.getItem("promptforge_history")
      if (stored) {
        const parsed = JSON.parse(stored)
        this.history = parsed.map((entry: any) => ({
          ...entry,
          timestamp: new Date(entry.timestamp),
        }))
      }
    } catch (error) {
      console.error("Failed to load history from storage:", error)
    }
  }

  constructor() {
    if (typeof window !== "undefined") {
      this.loadFromStorage()
    }
  }
}

export const historyManager = HistoryManager.getInstance()
