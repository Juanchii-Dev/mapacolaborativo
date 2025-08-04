"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"
import { supabaseHelpers } from "@/lib/supabase"
import type { Database } from "@/lib/supabase"

type Report = Database["public"]["Tables"]["reports"]["Row"]
type ReportInsert = Database["public"]["Tables"]["reports"]["Insert"]

interface SupabaseContextType {
  reports: Report[]
  loading: boolean
  error: string | null
  createReport: (report: ReportInsert) => Promise<{ success: boolean; data?: Report; error?: string }>
  voteForReport: (reportId: string) => Promise<{ success: boolean; error?: string }>
  refreshReports: () => Promise<void>
  uploadImage: (file: File) => Promise<{ success: boolean; url?: string; error?: string }>
}

const SupabaseContext = createContext<SupabaseContextType | undefined>(undefined)

export function SupabaseProvider({ children }: { children: React.ReactNode }) {
  const [reports, setReports] = useState<Report[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refreshReports = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabaseHelpers.getAllReports()

      if (error) {
        setError(error.message)
        return
      }

      setReports(data || [])
      setError(null)
    } catch (err) {
      setError("Error loading reports")
      console.error("Error loading reports:", err)
    } finally {
      setLoading(false)
    }
  }

  const createReport = async (report: ReportInsert) => {
    try {
      const { data, error } = await supabaseHelpers.createReport(report)

      if (error) {
        return { success: false, error: error.message }
      }

      if (data && data[0]) {
        setReports((prev) => [data[0], ...prev])
        return { success: true, data: data[0] }
      }

      return { success: false, error: "No data returned" }
    } catch (err) {
      return { success: false, error: "Error creating report" }
    }
  }

  const voteForReport = async (reportId: string) => {
    try {
      // Generate a simple fingerprint based on browser characteristics
      const fingerprint = btoa(
        `${navigator.userAgent}-${screen.width}x${screen.height}-${navigator.language}`,
      ).substring(0, 32)

      const { data, error } = await supabaseHelpers.addVoteToReport(reportId, undefined, fingerprint)

      if (error) {
        return { success: false, error: error.message }
      }

      if (data) {
        // Refresh reports to get updated vote count
        await refreshReports()
        return { success: true }
      }

      return { success: false, error: "Vote already exists" }
    } catch (err) {
      return { success: false, error: "Error voting for report" }
    }
  }

  const uploadImage = async (file: File) => {
    try {
      const { data, error } = await supabaseHelpers.uploadImage(file)

      if (error) {
        return { success: false, error: error.message }
      }

      return { success: true, url: data?.publicUrl }
    } catch (err) {
      return { success: false, error: "Error uploading image" }
    }
  }

  useEffect(() => {
    refreshReports()

    // Subscribe to real-time changes
    const subscription = supabaseHelpers.subscribeToReports((payload) => {
      console.log("Real-time update:", payload)
      refreshReports()
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const value = {
    reports,
    loading,
    error,
    createReport,
    voteForReport,
    refreshReports,
    uploadImage,
  }

  return <SupabaseContext.Provider value={value}>{children}</SupabaseContext.Provider>
}

export function useSupabase() {
  const context = useContext(SupabaseContext)
  if (context === undefined) {
    throw new Error("useSupabase must be used within a SupabaseProvider")
  }
  return context
}
