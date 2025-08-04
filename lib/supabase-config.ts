import { createClient } from "@supabase/supabase-js"

// Types for our database
export interface Database {
  public: {
    Tables: {
      reports: {
        Row: {
          id: string
          type: "bache" | "luz" | "basura" | "inseguridad" | "otro"
          address: string
          description: string
          image_url: string | null
          reporter_name: string | null
          latitude: number
          longitude: number
          votes: number
          status: "pending" | "in_progress" | "resolved" | "rejected"
          priority: number
          created_at: string
          updated_at: string
          resolved_at: string | null
        }
        Insert: {
          id?: string
          type: "bache" | "luz" | "basura" | "inseguridad" | "otro"
          address: string
          description: string
          image_url?: string | null
          reporter_name?: string | null
          latitude: number
          longitude: number
          votes?: number
          status?: "pending" | "in_progress" | "resolved" | "rejected"
          priority?: number
          created_at?: string
          updated_at?: string
          resolved_at?: string | null
        }
        Update: {
          id?: string
          type?: "bache" | "luz" | "basura" | "inseguridad" | "otro"
          address?: string
          description?: string
          image_url?: string | null
          reporter_name?: string | null
          latitude?: number
          longitude?: number
          votes?: number
          status?: "pending" | "in_progress" | "resolved" | "rejected"
          priority?: number
          created_at?: string
          updated_at?: string
          resolved_at?: string | null
        }
      }
      report_votes: {
        Row: {
          id: string
          report_id: string
          voter_ip: string | null
          voter_fingerprint: string | null
          created_at: string
        }
        Insert: {
          id?: string
          report_id: string
          voter_ip?: string | null
          voter_fingerprint?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          report_id?: string
          voter_ip?: string | null
          voter_fingerprint?: string | null
          created_at?: string
        }
      }
      report_comments: {
        Row: {
          id: string
          report_id: string
          comment: string
          commenter_name: string | null
          commenter_ip: string | null
          created_at: string
        }
        Insert: {
          id?: string
          report_id: string
          comment: string
          commenter_name?: string | null
          commenter_ip?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          report_id?: string
          comment?: string
          commenter_name?: string | null
          commenter_ip?: string | null
          created_at?: string
        }
      }
    }
  }
}

// Create typed Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)

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
  async createReport(report: Database["public"]["Tables"]["reports"]["Insert"]) {
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
}
