"use client"

import { useState, useEffect, useMemo } from "react"
import { createClient } from "@/lib/supabase/client"
import { 
  DndContext, closestCorners, KeyboardSensor, PointerSensor, 
  useSensor, useSensors, DragEndEvent, DragOverlay, DragStartEvent 
} from '@dnd-kit/core'
import { 
  SortableContext, arrayMove, sortableKeyboardCoordinates, verticalListSortingStrategy 
} from '@dnd-kit/sortable'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { motion } from "framer-motion"
import { Clock, Building2, AlertTriangle, FileText, Filter, Download } from "lucide-react"
import { StatusBadge } from "@/components/dashboard/StatusBadge"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import Link from "next/link"

const COLUMNS = [
  { id: 'pending', title: 'Pending' },
  { id: 'in_progress', title: 'In Progress' },
  { id: 'done', title: 'Completed' },
  { id: 'overdue', title: 'Overdue' }
]

// Sortable Action Card Component
function ActionCard({ action, isOverlay }: { action: any, isOverlay?: boolean }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: action.id, data: { ...action } })
  
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  }

  return (
    <div 
      ref={setNodeRef} 
      style={style} 
      {...attributes} 
      {...listeners}
      className={cn(
        "p-4 rounded-xl border bg-card shadow-sm cursor-grab active:cursor-grabbing mb-3",
        isOverlay ? "rotate-2 scale-105 shadow-xl border-primary" : "border-border hover:border-blue-500/50"
      )}
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <StatusBadge status={action.priority} size="sm" />
        {action.cases && (
          <Link href={`/cases/${action.case_id}`} onClick={e => e.stopPropagation()} className="text-[10px] font-mono font-semibold text-blue-400 hover:underline">
            {action.cases.case_number || 'View Case'}
          </Link>
        )}
      </div>
      <p className="text-sm font-medium mb-3 line-clamp-3">{action.action}</p>
      <div className="flex items-center justify-between text-xs text-muted-foreground mt-auto">
        <div className="flex items-center gap-1.5 bg-secondary/50 px-2 py-1 rounded">
          <Building2 className="h-3 w-3"/>
          <span className="truncate max-w-[80px]">{action.responsible_department || 'Unassigned'}</span>
        </div>
        {action.deadline && (
          <div className={cn("flex items-center gap-1 px-2 py-1 rounded", new Date(action.deadline) < new Date() && action.status !== 'done' ? "text-red-400 bg-red-400/10" : "")}>
            <Clock className="h-3 w-3"/>
            {new Date(action.deadline).toLocaleDateString()}
          </div>
        )}
      </div>
    </div>
  )
}

function Column({ col, actions }: { col: { id: string, title: string }, actions: any[] }) {
  const { setNodeRef } = useSortable({ id: col.id, data: { type: 'Column' } })
  
  return (
    <div className="flex flex-col bg-secondary/20 rounded-2xl border border-border overflow-hidden h-[calc(100vh-220px)] min-h-[500px]">
      <div className="p-4 border-b border-border bg-secondary/30 flex items-center justify-between sticky top-0 z-10">
        <h3 className="font-semibold">{col.title}</h3>
        <span className="bg-secondary text-foreground text-xs font-bold px-2 py-1 rounded-full">{actions.length}</span>
      </div>
      <div ref={setNodeRef} className="p-3 flex-1 overflow-y-auto">
        <SortableContext items={actions.map(a => a.id)} strategy={verticalListSortingStrategy}>
          {actions.map(action => (
            <ActionCard key={action.id} action={action} />
          ))}
        </SortableContext>
      </div>
    </div>
  )
}

export default function CompliancePage() {
  const [actions, setActions] = useState<any[]>([])
  const [departments, setDepartments] = useState<string[]>([])
  const [deptFilter, setDeptFilter] = useState("")
  const [activeId, setActiveId] = useState<string | null>(null)
  const supabase = createClient()

  useEffect(() => {
    const fetchActions = async () => {
      const { data, error } = await supabase
        .from('compliance_actions')
        .select('*, cases(case_number, title)')
        .order('created_at', { ascending: false })
      
      if (!error && data) {
        setActions(data)
        const depts = Array.from(new Set(data.map(a => a.responsible_department).filter(Boolean))) as string[]
        setDepartments(depts)
      }
    }
    fetchActions()
  }, [])

  const filteredActions = useMemo(() => {
    if (!deptFilter) return actions
    return actions.filter(a => a.responsible_department === deptFilter)
  }, [actions, deptFilter])

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string)
  }

  const handleDragOver = (event: any) => {
    const { active, over } = event
    if (!over) return

    const activeId = active.id
    const overId = over.id

    if (activeId === overId) return

    const isActiveTask = active.data.current?.action !== undefined
    const isOverTask = over.data.current?.action !== undefined
    const isOverColumn = over.data.current?.type === 'Column'

    if (!isActiveTask) return

    // Dropping a Task over another Task
    if (isActiveTask && isOverTask) {
      setActions((items) => {
        const activeIndex = items.findIndex(t => t.id === activeId)
        const overIndex = items.findIndex(t => t.id === overId)

        if (items[activeIndex].status !== items[overIndex].status) {
          items[activeIndex].status = items[overIndex].status
          return arrayMove(items, activeIndex, overIndex - 1)
        }
        return arrayMove(items, activeIndex, overIndex)
      })
    }

    // Dropping a Task over a Column
    if (isActiveTask && isOverColumn) {
      setActions((items) => {
        const activeIndex = items.findIndex(t => t.id === activeId)
        items[activeIndex].status = overId
        return arrayMove(items, activeIndex, activeIndex)
      })
    }
  }

  const handleDragEnd = async (event: DragEndEvent) => {
    setActiveId(null)
    const { active, over } = event
    if (!over) return

    const activeId = active.id
    const activeItem = actions.find(a => a.id === activeId)
    
    if (activeItem) {
      // Update DB
      await supabase
        .from('compliance_actions')
        .update({ status: activeItem.status })
        .eq('id', activeId)
    }
  }

  const activeItem = useMemo(() => actions.find(a => a.id === activeId), [activeId, actions])

  return (
    <div className="space-y-6 pb-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <h1 className="text-3xl font-extrabold tracking-tight">Compliance Tracker</h1>
          <p className="text-muted-foreground mt-1">Kanban board for tracking action items and deadlines.</p>
        </motion.div>
        
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground hidden sm:block" />
          <select 
            value={deptFilter} 
            onChange={e => setDeptFilter(e.target.value)}
            className="h-10 rounded-xl border border-border bg-card px-3 text-sm focus:ring-2 focus:ring-primary/50"
          >
            <option value="">All Departments</option>
            {departments.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
          <Button onClick={() => window.open(`/api/export-report?department=${deptFilter}`, '_blank')} variant="outline" className="h-10 rounded-xl gap-2">
            <Download className="h-4 w-4" /> Export PDF
          </Button>
        </div>
      </div>

      <DndContext sensors={sensors} collisionDetection={closestCorners} onDragStart={handleDragStart} onDragOver={handleDragOver} onDragEnd={handleDragEnd}>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          {COLUMNS.map(col => (
            <Column key={col.id} col={col} actions={filteredActions.filter(a => a.status === col.id)} />
          ))}
        </div>
        <DragOverlay>
          {activeItem ? <ActionCard action={activeItem} isOverlay /> : null}
        </DragOverlay>
      </DndContext>
    </div>
  )
}
