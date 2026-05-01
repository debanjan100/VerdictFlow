"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { toast } from "sonner"
import { 
  Loader2, Save, User, Building, Mail, Shield, 
  ExternalLink, BookOpen, Scale, Gavel, FileText,
  ShieldCheck, Lock, Bell, Moon, Sun, Laptop, Globe,
  FileBadge, Info, MessageSquareCode
} from "lucide-react"
import { cn } from "@/lib/utils"

export default function SettingsPage() {
  const [isSaving, setIsSaving] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [settingsFormData, setSettingsFormData] = useState({
    full_name: "",
    department: "",
    role: "",
  })

  const supabase = createClient()

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single()

        if (data) {
          setSettingsFormData({
            full_name: data.full_name || "",
            department: data.department || "",
            role: data.role || "",
          })
        }
      } catch (err) {
        console.error('Error fetching profile:', err)
      } finally {
        setIsLoading(false)
      }
    }
    fetchProfile()
  }, [supabase])

  const handleSaveSettings = async () => {
    setIsSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          ...settingsFormData,
          updated_at: new Date().toISOString(),
        });

      if (error) throw error;
      toast.success('Settings saved successfully!');
    } catch (err: any) {
      toast.error(err.message ?? 'Failed to save settings');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-blue-500" />
        <p className="text-sm font-bold uppercase tracking-widest text-muted-foreground animate-pulse">Synchronizing Profiles...</p>
      </div>
    )
  }

  return (
    <div className="space-y-10 max-w-5xl mx-auto pb-20">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-foreground">Global <span className="text-blue-500">Settings</span></h1>
          <p className="text-muted-foreground mt-2 font-medium">Configure your command center preferences and legal references.</p>
        </div>
        <Button 
          onClick={handleSaveSettings} 
          disabled={isSaving}
          className="rounded-2xl h-12 px-8 bg-blue-600 hover:bg-blue-500 text-white font-bold shadow-xl shadow-blue-500/20 gap-2"
        >
          {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          Commit Changes
        </Button>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Core Settings */}
        <div className="lg:col-span-2 space-y-8">
          <Card className="rounded-[2rem] border-border bg-card shadow-sm overflow-hidden transition-all hover:shadow-lg">
            <CardHeader className="bg-secondary/20 border-b border-border p-8">
              <CardTitle className="text-2xl font-black flex items-center gap-3">
                <User className="h-6 w-6 text-blue-500" /> Account Profile
              </CardTitle>
              <CardDescription className="font-medium">Update your identification data for the judicial network.</CardDescription>
            </CardHeader>
            <CardContent className="p-8 space-y-6">
              <div className="space-y-2">
                <Label htmlFor="full_name" className="text-xs font-black uppercase tracking-widest text-muted-foreground">Officer Full Name</Label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="full_name"
                    value={settingsFormData.full_name}
                    onChange={e => setSettingsFormData({ ...settingsFormData, full_name: e.target.value })}
                    className="pl-11 h-12 rounded-xl bg-secondary/30 border-border focus:ring-blue-500/20 font-semibold"
                    placeholder="Enter full legal name"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="department" className="text-xs font-black uppercase tracking-widest text-muted-foreground">Department Unit</Label>
                  <div className="relative">
                    <Building className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="department"
                      value={settingsFormData.department}
                      onChange={e => setSettingsFormData({ ...settingsFormData, department: e.target.value })}
                      className="pl-11 h-12 rounded-xl bg-secondary/30 border-border focus:ring-blue-500/20 font-semibold"
                      placeholder="e.g. Revenue, PWD"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="role" className="text-xs font-black uppercase tracking-widest text-muted-foreground">Jurisdiction Role</Label>
                  <div className="relative">
                    <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="role"
                      value={settingsFormData.role}
                      onChange={e => setSettingsFormData({ ...settingsFormData, role: e.target.value })}
                      className="pl-11 h-12 rounded-xl bg-secondary/30 border-border focus:ring-blue-500/20 font-semibold"
                      placeholder="e.g. Senior Reviewer"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card className="rounded-[2rem] border-border bg-card shadow-sm hover:shadow-md transition-all">
              <CardContent className="p-8 flex items-center gap-6">
                <div className="h-14 w-14 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-500 border border-amber-500/20 shrink-0">
                  <Bell className="h-7 w-7" />
                </div>
                <div>
                  <h4 className="font-black text-lg">Alert System</h4>
                  <p className="text-xs text-muted-foreground font-semibold">Manage critical compliance notification triggers.</p>
                </div>
              </CardContent>
            </Card>
            <Card className="rounded-[2rem] border-border bg-card shadow-sm hover:shadow-md transition-all">
              <CardContent className="p-8 flex items-center gap-6">
                <div className="h-14 w-14 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 border border-emerald-500/20 shrink-0">
                  <Lock className="h-7 w-7" />
                </div>
                <div>
                  <h4 className="font-black text-lg">Encrypted Keys</h4>
                  <p className="text-xs text-muted-foreground font-semibold">Rotate API credentials and security tokens.</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Right Column: References & Intelligence */}
        <div className="space-y-8">
          <Card className="rounded-[2rem] border-border bg-card overflow-hidden shadow-sm">
            <div className="p-8 bg-blue-600 text-white">
              <h3 className="text-xl font-black flex items-center gap-3">
                <BookOpen className="h-6 w-6" /> Legal Archive
              </h3>
              <p className="text-blue-100 text-xs font-bold mt-1 uppercase tracking-widest">Digital Reference Library</p>
            </div>
            <CardContent className="p-6 space-y-4">
              {[
                { title: "Constitution of India", code: "Article 226/32", icon: Scale },
                { title: "Supreme Court Guidelines", code: "Manual v2.4", icon: Gavel },
                { title: "Departmental SOPs", code: "Internal Doc", icon: FileBadge },
              ].map((ref, i) => (
                <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-secondary/50 border border-border group hover:bg-secondary transition-all cursor-pointer">
                  <div className="flex items-center gap-3">
                    <ref.icon className="h-5 w-5 text-blue-500" />
                    <div>
                      <p className="text-sm font-black tracking-tight">{ref.title}</p>
                      <p className="text-[10px] font-bold text-muted-foreground uppercase">{ref.code}</p>
                    </div>
                  </div>
                  <ExternalLink className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              ))}
              <Button variant="ghost" className="w-full rounded-xl text-blue-500 font-bold hover:bg-blue-500/5 text-xs">
                Explore Full Library
              </Button>
            </CardContent>
          </Card>

          <Card className="rounded-[2rem] border-border bg-card shadow-sm">
            <CardHeader className="p-8 pb-4">
              <CardTitle className="text-lg font-black flex items-center gap-2">
                <Info className="h-5 w-5 text-indigo-500" /> Node Status
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8 pt-0 space-y-6">
              <div className="flex items-center justify-between py-2 border-b border-border">
                <span className="text-xs font-bold text-muted-foreground">Version</span>
                <span className="text-xs font-black">v1.2.4-stable</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-border">
                <span className="text-xs font-bold text-muted-foreground">AI Engine</span>
                <span className="text-xs font-black flex items-center gap-1.5">
                  <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Grok 4 (Reasoning)
                </span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-xs font-bold text-muted-foreground">Region</span>
                <span className="text-xs font-black flex items-center gap-1.5">
                  <Globe className="h-3 w-3 text-blue-500" />
                  India Central
                </span>
              </div>
              
              <div className="pt-4 p-5 rounded-2xl bg-indigo-500/5 border border-indigo-500/10">
                <div className="flex items-center gap-2 mb-2 text-indigo-500">
                  <MessageSquareCode className="h-4 w-4" />
                  <span className="text-[10px] font-black uppercase tracking-widest">Developer Console</span>
                </div>
                <p className="text-[11px] font-medium leading-relaxed text-muted-foreground">
                  The extraction node is currently performing with 98.4% accuracy across high-court judgments.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
