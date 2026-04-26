"use client"

import { useState, useEffect, useMemo, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Search, Filter, ChevronUp, ChevronDown, ChevronLeft, ChevronRight,
  Upload, FolderOpen, ArrowUpDown, AlertCircle, RefreshCw,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { StatusBadge } from "@/components/dashboard/StatusBadge"
import { CaseDrawer } from "@/components/dashboard/CaseDrawer"
import { SkeletonRow } from "@/components/dashboard/SkeletonCard"
import { useDebounce } from "@/hooks/useDebounce"
import { cn } from "@/lib/utils"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"

const PAGE_SIZE = 10

// Database types matching Hackathon Schema
interface DatabaseCase {
  id: string
  case_number: string | null
  title: string | null
  court: string | null
  judgment_date: string | null
  pdf_filename: string
  pdf_url: string
  status: 'pending' | 'processing' | 'verified' | 'archived'
  created_at: string
  updated_at: string
  created_by: string | null
  department: string | null
  priority: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW'
  summary: string | null
}

type SortField = "case_number" | "judgment_date" | "priority" | "status" | "created_at"
type SortDir = "asc" | "desc"

const PRIORITY_ORDER: Record<string, number> = { CRITICAL: 0, HIGH: 1, MEDIUM: 2, LOW: 3 }
const STATUS_ORDER: Record<string, number> = {
  processing: 0,
  pending: 1,
  verified: 2,
  archived: 3
}

/* ─── Filter Select ─── */
function FilterSelect({ label, value, onChange, options }: {
  label: string; value: string; onChange: (v: string) => void; options: { value: string; label: string }[]
}) {
  return (
    <select
      value={value}
      onChange={e => onChange(e.target.value)}
      className="h-9 rounded-xl border border-border bg-secondary/50 px-3 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary min-w-[130px]"
    >
      <option value="">{label}</option>
      {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  )
}

/* ─── Sortable TH ─── */
function SortTh({ label, field, sortField, sortDir, onSort }: {
  label: string; field: SortField; sortField: SortField; sortDir: SortDir; onSort: (f: SortField) => void
}) {
  const active = sortField === field
  return (
    <th
      className="px-6 py-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider cursor-pointer select-none hover:text-foreground transition-colors"
      onClick={() => onSort(field)}
    >
      <div className="flex items-center gap-1.5">
        {label}
        {active
          ? sortDir === "asc"
            ? <ChevronUp className="h-3.5 w-3.5 text-primary" />
            : <ChevronDown className="h-3.5 w-3.5 text-primary" />
          : <ArrowUpDown className="h-3 w-3 opacity-40" />}
      </div>
    </th>
  )
}

/* ─── Empty State ─── */
function EmptyState({ hasFilter, error }: { hasFilter: boolean; error?: string | null }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-24 text-center"
    >
      <div className="h-20 w-20 rounded-3xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mb-6">
        {error ? (
          <AlertCircle className="h-10 w-10 text-red-400" />
        ) : (
          <FolderOpen className="h-10 w-10 text-blue-400" />
        )}
      </div>
      <h3 className="text-lg font-semibold mb-2">
        {error ? "Failed to load cases" : hasFilter ? "No matching cases" : "No cases yet"}
      </h3>
      <p className="text-sm text-muted-foreground max-w-xs mb-6">
        {error
          ? error
          : hasFilter
            ? "Try adjusting your filters or search term."
            : "Upload your first judgment to get started. AI will automatically extract compliance actions."}
      </p>
      {error ? (
        <Button variant="outline" onClick={() => window.location.reload()}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Retry
        </Button>
      ) : !hasFilter && (
        <Link href="/upload">
          <Button className="gap-2 shadow-lg shadow-blue-500/20">
            <Upload className="h-4 w-4" />
            Upload your first judgment
          </Button>
        </Link>
      )}
    </motion.div>
  )
}

/* ─── Page ─── */
export default function CasesPage() {
  const [search, setSearch] = useState("")
  const [statusF, setStatusF] = useState("")
  const [priorityF, setPriorityF] = useState("")
  const [deptF, setDeptF] = useState("")
  const [sortField, setSortField] = useState<SortField>("created_at")
  const [sortDir, setSortDir] = useState<SortDir>("desc")
  const [page, setPage] = useState(1)
  const [selected, setSelected] = useState<DatabaseCase | null>(null)
  const [cases, setCases] = useState<DatabaseCase[]>([])
  const [departments, setDepartments] = useState<{ id: string; name: string }[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const supabase = createClient()
  const debouncedSearch = useDebounce(search, 400)

  // Fetch unique departments
  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const { data, error } = await supabase.from('cases').select('department').not('department', 'is', null)
        if (error) throw error
        // Unique departments
        const depts = Array.from(new Set(data.map(d => d.department))).filter(Boolean)
        setDepartments(depts.map((d: any) => ({ id: d, name: d })))
      } catch (err: any) {
        console.error('Error fetching departments:', err)
      }
    }
    fetchDepartments()
  }, [])

  const loadCases = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const { data, error } = await supabase
        .from('cases')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCases(data ?? []);
    } catch (err: any) {
      console.error('fetchCases error:', err);
      setError(err.message ?? 'Failed to load cases');
      toast.error('Failed to load cases')
    } finally {
      setLoading(false)
    }
  }, [supabase])

  useEffect(() => {
    loadCases()
  }, [loadCases])

  const totalPages = Math.max(1, Math.ceil(cases.length / PAGE_SIZE))
  const pageRows   = cases.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)
  const hasFilter  = !!(debouncedSearch || statusF || priorityF || deptF)

  const handleSort = (field: SortField) => {
    if (sortField === field) setSortDir(d => d === "asc" ? "desc" : "asc")
    else { setSortField(field); setSortDir("asc") }
    setPage(1)
  }

  const clearFilters = () => {
    setSearch(""); setStatusF(""); setPriorityF(""); setDeptF(""); setPage(1)
  }

  const statusOptions = [
    { value: "processing", label: "Processing" },
    { value: "pending", label: "Pending" },
    { value: "verified", label: "Verified" },
    { value: "archived", label: "Archived" },
  ]

  const priorityOptions = [
    { value: "CRITICAL", label: "Critical" },
    { value: "HIGH", label: "High" },
    { value: "MEDIUM", label: "Medium" },
    { value: "LOW", label: "Low" },
  ]

  const departmentOptions = departments.map(dept => ({
    value: dept.name,
    label: dept.name
  }))

  return (
    <div className="space-y-6 pb-10">
      {/* Header */}
      <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
        <h1 className="text-3xl font-extrabold tracking-tight">Cases Directory</h1>
        <p className="text-muted-foreground mt-1">Search, filter, and manage all processed judgments.</p>
      </motion.div>

      {/* Summary chips */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex flex-wrap gap-2"
      >
        {[
          { label: "Total", value: cases.length, color: "bg-blue-500/15 text-blue-400" },
          { label: "Pending", value: cases.filter(c => c.status === "pending").length, color: "bg-amber-500/15 text-amber-400" },
          { label: "Verified", value: cases.filter(c => c.status === "verified").length, color: "bg-emerald-500/15 text-emerald-400" },
          { label: "Processing", value: cases.filter(c => c.status === "processing").length, color: "bg-orange-500/15 text-orange-400" },
        ].map(chip => (
          <div key={chip.label} className={cn("flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border border-transparent", chip.color)}>
            <span className="font-bold">{chip.value}</span> {chip.label}
          </div>
        ))}
      </motion.div>

      {/* Table card */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="rounded-2xl border border-border bg-card overflow-hidden"
      >
        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-3 p-5 border-b border-border">
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Full-text search (case, title...)"
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1) }}
              className="pl-9 rounded-xl bg-secondary/50 border-border h-9"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground shrink-0" />
            <FilterSelect label="All Status" value={statusF} onChange={v => { setStatusF(v); setPage(1) }} options={statusOptions} />
            <FilterSelect label="All Priority" value={priorityF} onChange={v => { setPriorityF(v); setPage(1) }} options={priorityOptions} />
            <FilterSelect label="All Depts" value={deptF} onChange={v => { setDeptF(v); setPage(1) }} options={departmentOptions} />
            {hasFilter && (
              <Button variant="ghost" size="sm" onClick={clearFilters} className="text-xs text-muted-foreground h-9 px-3 rounded-xl">
                Clear filters
              </Button>
            )}
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-secondary/40 border-b border-border">
              <tr>
                <SortTh label="Case Number" field="case_number" sortField={sortField} sortDir={sortDir} onSort={handleSort} />
                <th className="px-6 py-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Title</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Court</th>
                <SortTh label="Filed" field="judgment_date" sortField={sortField} sortDir={sortDir} onSort={handleSort} />
                <SortTh label="Priority" field="priority"   sortField={sortField} sortDir={sortDir} onSort={handleSort} />
                <SortTh label="Status"   field="status"     sortField={sortField} sortDir={sortDir} onSort={handleSort} />
                <th className="px-6 py-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} cols={7} />)
              ) : pageRows.length === 0 ? (
                <tr>
                  <td colSpan={7}>
                    <EmptyState hasFilter={hasFilter} error={error} />
                  </td>
                </tr>
              ) : (
                <AnimatePresence>
                  {pageRows.map((c, i) => (
                    <motion.tr
                      key={c.id}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      transition={{ delay: i * 0.04 }}
                      onClick={() => setSelected(c)}
                      className="border-b border-border/50 hover:bg-secondary/30 cursor-pointer transition-colors group"
                    >
                      <td className="px-6 py-4">
                        <span className="font-mono text-xs font-semibold text-blue-400 group-hover:text-blue-300 transition-colors">
                          {c.case_number || "Pending"}
                        </span>
                      </td>
                      <td className="px-6 py-4 max-w-[180px]">
                        <span className="line-clamp-2 text-xs">{c.title || "Untitled"}</span>
                      </td>
                      <td className="px-6 py-4 text-xs text-muted-foreground max-w-[150px]">
                        <span className="line-clamp-1">{c.court || "Unknown"}</span>
                      </td>
                      <td className="px-6 py-4 text-xs text-muted-foreground whitespace-nowrap">
                        {c.judgment_date
                          ? new Date(c.judgment_date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })
                          : "N/A"
                        }
                      </td>
                      <td className="px-6 py-4">
                        <StatusBadge status={c.priority?.toLowerCase()} size="sm" />
                      </td>
                      <td className="px-6 py-4">
                        <StatusBadge status={c.status?.toLowerCase()} size="sm" />
                      </td>
                      <td className="px-6 py-4">
                        <Link href={`/cases/${c.id}`} onClick={e => e.stopPropagation()}>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-xs h-7 px-3 rounded-lg text-primary hover:bg-primary/10"
                          >
                            View Details →
                          </Button>
                        </Link>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {cases.length > 0 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-border">
            <span className="text-xs text-muted-foreground">
              Showing {Math.min((page - 1) * PAGE_SIZE + 1, cases.length)}–{Math.min(page * PAGE_SIZE, cases.length)} of {cases.length} cases
            </span>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="h-8 w-8 p-0 rounded-lg"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                <Button
                  key={p}
                  variant={p === page ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setPage(p)}
                  className={cn("h-8 w-8 p-0 rounded-lg text-xs", p === page && "shadow-lg shadow-blue-500/20")}
                >
                  {p}
                </Button>
              ))}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="h-8 w-8 p-0 rounded-lg"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  )
}
