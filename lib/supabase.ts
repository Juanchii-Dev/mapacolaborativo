"use client"

import { createClient } from "@supabase/supabase-js"
import type { Report } from "@/app/page"
import { useToast } from "@/hooks/use-toast" // Import useToast

// Initialize Supabase client
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!, // Use service role key for server-side operations if needed, or anon key for client
)

// Helper functions for Supabase interactions
export const supabaseHelpers = {
  async getAllReports(): Promise<{ data: Report[] | null; error: Error | null }> {
    const { data, error } = await supabase
      .from("reports")
      .select(`
        id,
        type,
        address,
        description,
        image_url,
        latitude,
        longitude,
        created_at,
        status,
        reporter_name,
        user_id,
        votes(id)
      `)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching reports:", error)
      return { data: null, error: new Error(error.message) }
    }

    const reportsWithVoteCount: Report[] = data.map((report: any) => ({
      ...report,
      votes: report.votes ? report.votes.length : 0,
    }))

    return { data: reportsWithVoteCount, error: null }
  },

  async createReport(
    reportData: Omit<Report, "id" | "votes" | "status" | "created_at"> & { imageFile?: File | null },
  ): Promise<{ data: Report | null; error: Error | null }> {
    const { toast } = useToast() // Get toast function here

    let imageUrl: string | null = null
    let userId: string | null = null
    let reporterName: string | null = null

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()
    if (userError) {
      console.error("Error getting user for report creation:", userError)
      // Continue as anonymous if user cannot be fetched
    } else {
      userId = user?.id || null
      reporterName = user?.user_metadata?.full_name || user?.email || "Anónimo"
    }

    if (reportData.imageFile) {
      const file = reportData.imageFile
      const filePath = `${userId || "anonymous"}/${Date.now()}-${file.name}`
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("report_images")
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: false,
        })

      if (uploadError) {
        console.error("Error uploading image:", uploadError)
        toast({
          title: "Error al subir imagen",
          description: "No se pudo subir la imagen del reporte.",
          variant: "destructive",
        })
        return { data: null, error: new Error("Failed to upload image") }
      }
      imageUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/report_images/${uploadData.path}`
    }

    const newReport = {
      type: reportData.type,
      address: reportData.address,
      description: reportData.description,
      image_url: imageUrl,
      latitude: reportData.latitude,
      longitude: reportData.longitude,
      votes: 0, // Initial votes
      status: "pending", // Initial status
      reporter_name: reporterName,
      user_id: userId,
    }

    const { data, error } = await supabase.from("reports").insert(newReport).select().single()

    if (error) {
      console.error("Error inserting report:", error)
      return { data: null, error: new Error(error.message) }
    }

    return { data: data as Report, error: null }
  },

  async hasUserVoted(userId: string, reportId: string): Promise<boolean> {
    const { data, error } = await supabase
      .from("report_votes")
      .select("id")
      .eq("user_id", userId)
      .eq("report_id", reportId)
      .single()

    if (error && error.code !== "PGRST116") {
      // PGRST116 means "no rows found"
      console.error("Error checking user vote:", error)
      throw new Error(error.message)
    }
    return !!data
  },

  async addVoteToReport(reportId: string, userId: string): Promise<{ data: any | null; error: Error | null }> {
    const { error: insertError } = await supabase.from("report_votes").insert({ report_id: reportId, user_id: userId })

    if (insertError) {
      console.error("Error inserting vote record:", insertError)
      return { data: null, error: new Error(insertError.message) }
    }

    // Call the RPC function to increment the vote count in the reports table
    const { data, error: rpcError } = await supabase.rpc("increment_report_votes", { report_id: reportId })

    if (rpcError) {
      console.error("Error calling increment_report_votes RPC:", rpcError)
      // If RPC fails, try to delete the inserted vote record to maintain consistency
      await supabase.from("report_votes").delete().eq("report_id", reportId).eq("user_id", userId)
      return { data: null, error: new Error(rpcError.message) }
    }

    return { data: data, error: null }
  },

  async updateReportStatus(reportId: string, status: string): Promise<{ data: Report | null; error: Error | null }> {
    const { data, error } = await supabase
      .from("reports")
      .update({ status: status })
      .eq("id", reportId)
      .select()
      .single()

    if (error) {
      console.error("Error updating report status:", error)
      return { data: null, error: new Error(error.message) }
    }
    return { data: data as Report, error: null }
  },
}
