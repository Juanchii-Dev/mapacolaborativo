"use client"

import { useState } from "react"
import { supabaseHelpers } from "@/lib/supabase"
import { useAuth } from "@/components/supabase-auth-provider"
import { useToast } from "@/components/ui/use-toast" // Corrected import path for useToast

interface Report {
  id: string
  type: string
  address: string
  description: string | null
  image_url: string | null
  latitude: number
  longitude: number
  created_at: string
  status: "pending" | "in_progress" | "resolved"
  votes: number
  reporter_name: string | null
  user_id: string | null
}

interface ReportsListProps {
  reports: Report[]
  isLoading: boolean
  onReportUpdated: () => void
}

export function ReportsList({ reports, isLoading, onReportUpdated }: ReportsListProps) {
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [votingStates, setVotingStates] = useState<{ [key: string]: boolean }>({}) // To track individual vote loading
  const { user, isLoading: authLoading } = useAuth()
  const { toast } = useToast()

  const handleViewReport = (reportId: string) => {
    setSelectedReportId(reportId)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setSelectedReportId(null)
    onReportUpdated() // Refresh reports after modal closes (in case of changes like comments/votes)
  }

  const handleVote = async (reportId: string) => {
    if (!user || authLoading) {
      toast({
        title: "Inicia sesión para votar",
        description: "Necesitas iniciar sesión para poder votar por un reporte.",
        variant: "warning",
      })
      return
    }

    if (votingStates[reportId]) return // Prevent double click

    setVotingStates((prev) => ({ ...prev, [reportId]: true }))
    try {
      const hasVoted = await supabaseHelpers.hasUserVoted(user.id, reportId)
      if (hasVoted) {
        toast({
          title: "Ya votaste",
          description: "Ya has votado por este reporte.",
          variant
