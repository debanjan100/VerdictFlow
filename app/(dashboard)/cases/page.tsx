"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { createBrowserClient } from "@supabase/ssr"
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  getPaginationRowModel,
  ColumnDef
} from "@tanstack/react-table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Search, Filter, Loader2, ArrowRight } from "lucide-react"

export default function CasesPage() {
  const router = useRouter()
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [globalFilter, setGlobalFilter] = useState("")

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  useEffect(() => {
    const fetchCases = async () => {
      setLoading(true)
      const { data: casesData } = await supabase
        .from('cases')
        .select('*')
        .order('created_at', { ascending: false })
        
      if (casesData) setData(casesData)
      setLoading(false)
    }
    fetchCases()
  }, [supabase])

  const columns: ColumnDef<any>[] = [
    {
      accessorKey: "case_number",
      header: "Case Number",
      cell: ({ row }) => <span className="font-medium">{row.getValue("case_number") || "Pending AI"}</span>,
    },
    {
      accessorKey: "case_title",
      header: "Title",
      cell: ({ row }) => <div className="truncate max-w-[200px]">{row.getValue("case_title") || "Extracting..."}</div>,
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.getValue("status") as string
        const colorMap: Record<string, string> = {
          'processing': 'bg-muted text-muted-foreground',
          'extracted': 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
          'pending_review': 'bg-warning/20 text-warning-foreground border border-warning/30',
          'verified': 'bg-success/20 text-success-foreground border border-success/30',
          'rejected': 'bg-destructive/20 text-destructive border border-destructive/30'
        }
        
        return (
          <Badge variant="outline" className={colorMap[status] || ""}>
            {status.replace('_', ' ').toUpperCase()}
          </Badge>
        )
      },
    },
    {
      accessorKey: "created_at",
      header: "Uploaded",
      cell: ({ row }) => new Date(row.getValue("created_at")).toLocaleDateString(),
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const caseRecord = row.original
        const isPending = caseRecord.status === 'pending_review' || caseRecord.status === 'extracted'
        
        return (
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => router.push(\`/cases/\${caseRecord.id}/verify\`)}
            className={isPending ? "text-primary font-medium" : "text-muted-foreground"}
          >
            {isPending ? "Review" : "View"} <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        )
      },
    },
  ]

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    state: {
      globalFilter,
    },
    onGlobalFilterChange: setGlobalFilter,
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-primary">Cases Directory</h1>
        <p className="text-muted-foreground mt-1">Search, filter, and manage all processed judgments.</p>
      </div>

      <Card className="shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between pb-4 border-b">
          <div className="flex items-center space-x-2">
            <div className="relative w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search cases..."
                value={globalFilter}
                onChange={(e) => setGlobalFilter(e.target.value)}
                className="pl-9"
              />
            </div>
            <Button variant="outline" size="icon"><Filter className="h-4 w-4" /></Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-muted/50 border-b">
                  {table.getHeaderGroups().map((headerGroup) => (
                    <tr key={headerGroup.id}>
                      {headerGroup.headers.map((header) => (
                        <th key={header.id} className="px-6 py-4 font-medium text-muted-foreground">
                          {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                        </th>
                      ))}
                    </tr>
                  ))}
                </thead>
                <tbody>
                  {table.getRowModel().rows.length > 0 ? (
                    table.getRowModel().rows.map((row) => (
                      <tr key={row.id} className="border-b hover:bg-muted/20 transition-colors">
                        {row.getVisibleCells().map((cell) => (
                          <td key={cell.id} className="px-6 py-4">
                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                          </td>
                        ))}
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={columns.length} className="px-6 py-8 text-center text-muted-foreground">
                        No cases found matching your search.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
              <div className="flex items-center justify-end space-x-2 py-4 px-6 border-t">
                <Button variant="outline" size="sm" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>
                  Previous
                </Button>
                <Button variant="outline" size="sm" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
