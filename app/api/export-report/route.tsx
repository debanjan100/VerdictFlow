export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { Document, Page, Text, View, StyleSheet, renderToStream } from "@react-pdf/renderer"

const styles = StyleSheet.create({
  page: { padding: 40, fontFamily: "Helvetica" },
  header: { fontSize: 24, marginBottom: 20, textAlign: "center", fontWeight: "bold", color: "#1e3a8a" },
  subHeader: { fontSize: 14, marginBottom: 10, color: "#475569" },
  table: { display: "flex", width: "auto", borderStyle: "solid", borderWidth: 1, borderRightWidth: 0, borderBottomWidth: 0, marginTop: 20 },
  tableRow: { margin: "auto", flexDirection: "row" },
  tableColHeader: { width: "25%", borderStyle: "solid", borderWidth: 1, borderLeftWidth: 0, borderTopWidth: 0, backgroundColor: "#f1f5f9", padding: 5 },
  tableCol: { width: "25%", borderStyle: "solid", borderWidth: 1, borderLeftWidth: 0, borderTopWidth: 0, padding: 5 },
  tableCellHeader: { margin: 5, fontSize: 10, fontWeight: "bold" },
  tableCell: { margin: 5, fontSize: 10 },
  section: { marginBottom: 20 },
  footer: { position: "absolute", bottom: 30, left: 40, right: 40, textAlign: "center", color: "#94a3b8", fontSize: 10 }
})

const ReportPDF = ({ data, department }: { data: any[], department: string }) => {
  const pending = data.filter(d => d.status === 'pending').length
  const done = data.filter(d => d.status === 'done').length
  const overdue = data.filter(d => d.status === 'overdue').length
  const inProgress = data.filter(d => d.status === 'in_progress').length

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.header}>Compliance Report: {department || "All Departments"}</Text>
        <Text style={styles.subHeader}>Generated on: {new Date().toLocaleDateString()}</Text>
        
        <View style={styles.section}>
          <Text style={{ fontSize: 12, marginBottom: 5 }}>Summary Statistics:</Text>
          <Text style={{ fontSize: 10 }}>Total Actions: {data.length}</Text>
          <Text style={{ fontSize: 10 }}>Completed: {done}</Text>
          <Text style={{ fontSize: 10 }}>Pending: {pending}</Text>
          <Text style={{ fontSize: 10 }}>In Progress: {inProgress}</Text>
          <Text style={{ fontSize: 10, color: "red" }}>Overdue: {overdue}</Text>
        </View>

        <View style={styles.table}>
          <View style={styles.tableRow}>
            <View style={styles.tableColHeader}><Text style={styles.tableCellHeader}>Case Number</Text></View>
            <View style={{...styles.tableColHeader, width: "35%"}}><Text style={styles.tableCellHeader}>Action</Text></View>
            <View style={{...styles.tableColHeader, width: "20%"}}><Text style={styles.tableCellHeader}>Deadline</Text></View>
            <View style={{...styles.tableColHeader, width: "20%"}}><Text style={styles.tableCellHeader}>Status</Text></View>
          </View>
          {data.map((item, i) => (
            <View style={styles.tableRow} key={i}>
              <View style={styles.tableCol}><Text style={styles.tableCell}>{item.cases?.case_number || "N/A"}</Text></View>
              <View style={{...styles.tableCol, width: "35%"}}><Text style={styles.tableCell}>{item.action}</Text></View>
              <View style={{...styles.tableCol, width: "20%"}}>
                <Text style={styles.tableCell}>{item.deadline ? new Date(item.deadline).toLocaleDateString() : "No Deadline"}</Text>
              </View>
              <View style={{...styles.tableCol, width: "20%"}}><Text style={styles.tableCell}>{item.status.toUpperCase()}</Text></View>
            </View>
          ))}
        </View>

        <Text style={styles.footer}>VerdictFlow AI Platform • Official Government Report</Text>
      </Page>
    </Document>
  )
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const department = searchParams.get("department") || ""
    
    const supabase = createClient()
    
    let query = supabase.from('compliance_actions').select('*, cases(case_number)')
    if (department) {
      query = query.eq('responsible_department', department)
    }

    const { data, error } = await query
    
    if (error) throw error

    const stream = await renderToStream(<ReportPDF data={data || []} department={department} />)
    
    return new NextResponse(stream as unknown as ReadableStream, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="compliance_report_${department || 'all'}.pdf"`,
      }
    })
  } catch (error: any) {
    console.error("Export error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
