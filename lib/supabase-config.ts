import { createClient } from "@supabase/supabase-js"
import type { Database } from "./database.types"

// Types for our database
export type Tables = Database["public"]["Tables"]
export type Enums = Database["public"]["Enums"]

// Client-side Supabase client
export const createClientComponentClient = () =>
  createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

// Server-side Supabase client (for Route Handlers, Server Actions)
// Ensure these are only used in server environments
export const createServerComponentClient = () => {
  // This is a placeholder. In a real Next.js app, you'd typically use
  // `cookies()` from `next/headers` to get the session cookie for server components.
  // For v0's Next.js environment, direct usage of env vars is common.
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!, // Use service role key for server-side operations
  )
}

// Create typed Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Missing Supabase URL or Anon Key environment variables.")
}

const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Helper functions for common operations
export const supabaseHelpers = {
  // Get all reports
  async getAllReports() {
    const { data, error } = await supabase.from("reports").select("*").order("created_at", { ascending: false })

    return { data, error }
  },

  // Get reports near a location
  async getReportsNearLocation(lat: number, lng: number, radiusMeters = 1000) {
    const { data, error } = await supabase.rpc("get_reports_near_location", {
      center_lat: lat,
      center_lng: lng,
      radius_meters: radiusMeters,
    })

    return { data, error }
  },

  // Create a new report
  async createReport(report: Tables["reports"]["Insert"]) {
    const { data, error } = await supabase.from("reports").insert([report]).select()

    return { data, error }
  },

  // Add vote to report (with duplicate prevention)
  async addVoteToReport(reportId: string, voterFingerprint?: string) {
    try {
      // First, check if this fingerprint has already voted for this report
      if (voterFingerprint) {
        const { data: existingVote, error: checkError } = await supabase
          .from("report_votes")
          .select("id")
          .eq("report_id", reportId)
          .eq("voter_fingerprint", voterFingerprint)
          .single()

        if (checkError && checkError.code !== "PGRST116") {
          // PGRST116 is "not found" which is what we want
          return { data: false, error: checkError }
        }

        if (existingVote) {
          // Vote already exists
          return { data: false, error: { message: "Ya has votado por este reporte" } }
        }
      }

      // Add the vote
      const { data: voteData, error: voteError } = await supabase
        .from("report_votes")
        .insert([
          {
            report_id: reportId,
            voter_fingerprint: voterFingerprint,
          },
        ])
        .select()

      if (voteError) {
        return { data: false, error: voteError }
      }

      // Update the vote count in the reports table
      const { data: updateData, error: updateError } = await supabase.rpc("increment_report_votes", {
        report_id: reportId,
      })

      if (updateError) {
        // If the RPC doesn't exist, fall back to manual update
        const { data: currentReport, error: fetchError } = await supabase
          .from("reports")
          .select("votes")
          .eq("id", reportId)
          .single()

        if (fetchError) {
          return { data: false, error: fetchError }
        }

        const { error: manualUpdateError } = await supabase
          .from("reports")
          .update({ votes: (currentReport.votes || 0) + 1 })
          .eq("id", reportId)

        if (manualUpdateError) {
          return { data: false, error: manualUpdateError }
        }
      }

      return { data: true, error: null }
    } catch (error) {
      return { data: false, error: { message: "Error interno al votar" } }
    }
  },

  // Upload image to storage
  async uploadImage(file: File, folder = "uploads") {
    const fileExt = file.name.split(".").pop()
    const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`

    const { data, error } = await supabase.storage.from("report-images").upload(fileName, file)

    if (error) return { data: null, error }

    const {
      data: { publicUrl },
    } = supabase.storage.from("report-images").getPublicUrl(fileName)

    return { data: { ...data, publicUrl }, error: null }
  },

  // Delete image from storage
  async deleteImage(path: string) {
    const { data, error } = await supabase.storage.from("report-images").remove([path])

    return { data, error }
  },

  // Subscribe to real-time changes
  subscribeToReports(callback: (payload: any) => void) {
    return supabase
      .channel("reports")
      .on("postgres_changes", { event: "*", schema: "public", table: "reports" }, callback)
      .subscribe()
  },

  // Add comment to report
  async addComment(reportId: string, comment: string, commenterName?: string) {
    const { data, error } = await supabase
      .from("report_comments")
      .insert([
        {
          report_id: reportId,
          comment,
          commenter_name: commenterName,
        },
      ])
      .select()

    return { data, error }
  },

  // Get comments for a report
  async getReportComments(reportId: string) {
    const { data, error } = await supabase
      .from("report_comments")
      .select("*")
      .eq("report_id", reportId)
      .order("created_at", { ascending: true })

    return { data, error }
  },

  // Auth helpers
  async signUpWithEmail(email: string, password: string, fullName?: string) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    })
    return { data, error }
  },

  async signInWithEmail(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    return { data, error }
  },

  async signOut() {
    const { error } = await supabase.auth.signOut()
    return { error }
  },

  async getCurrentUser() {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser()
    if (error) return { user: null, profile: null, error }

    if (user) {
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single()

      if (profileError && profileError.code !== "PGRST116") {
        // PGRST116 is "not found"
        console.error("Error fetching profile:", profileError)
        return { user, profile: null, error: profileError }
      }
      return { user, profile, error: null }
    }
    return { user: null, profile: null, error: null }
  },

  onAuthStateChange(callback: (event: string, session: any | null) => void) {
    return supabase.auth.onAuthStateChange(callback)
  },

  // Admin specific helpers
  async updateReportStatus(reportId: string, status: Tables["reports"]["Row"]["status"]) {
    const { data, error } = await supabase
      .from("reports")
      .update({ status, updated_at: new Date().toISOString() })
      .eq("id", reportId)
      .select()
    return { data, error }
  },

  async updateReportPriority(reportId: string, priority: number) {
    const { data, error } = await supabase
      .from("reports")
      .update({ priority, updated_at: new Date().toISOString() })
      .eq("id", reportId)
      .select()
    return { data, error }
  },

  async deleteReport(reportId: string) {
    const { error } = await supabase.from("reports").delete().eq("id", reportId)
    return { error }
  },
}
