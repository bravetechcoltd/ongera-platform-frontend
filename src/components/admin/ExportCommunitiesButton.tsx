
// @ts-nocheck
"use client"

import { Download, Loader2 } from "lucide-react"
import { useState } from "react"
import { Community } from "@/lib/features/auth/communitiesSlice"

interface ExportCommunitiesButtonProps {
  communities: Community[]
  filename?: string
}

export default function ExportCommunitiesButton({ 
  communities, 
  filename = "communities-export" 
}: ExportCommunitiesButtonProps) {
  const [isExporting, setIsExporting] = useState(false)

  const exportToCSV = () => {
    setIsExporting(true)
    
    try {
      // Prepare CSV headers
      const headers = [
        "ID",
        "Name",
        "Category",
        "Type",
        "Status",
        "Members",
        "Posts",
        "Creator Name",
        "Creator Email",
        "Created Date",
        "Join Approval Required"
      ]

      // Prepare CSV rows
      const rows = communities.map(community => [
        community.id,
        `"${community.name}"`,
        community.category,
        community.community_type,
        community.is_active ? "Approved" : "Pending",
        community.member_count,
        community.post_count,
        `"${community.creator.first_name} ${community.creator.last_name}"`,
        community.creator.email || "",
        new Date(community.created_at).toLocaleDateString(),
        community.join_approval_required ? "Yes" : "No"
      ])

      // Combine headers and rows
      const csvContent = [
        headers.join(","),
        ...rows.map(row => row.join(","))
      ].join("\n")

      // Create blob and download
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
      const link = document.createElement("a")
      const url = URL.createObjectURL(blob)
      
      link.setAttribute("href", url)
      link.setAttribute("download", `${filename}-${new Date().toISOString().split('T')[0]}.csv`)
      link.style.visibility = "hidden"
      
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      console.log("✅ CSV exported successfully")
    } catch (error) {
      console.error("❌ Export failed:", error)
    } finally {
      setIsExporting(false)
    }
  }

  const exportToJSON = () => {
    setIsExporting(true)
    
    try {
      const exportData = communities.map(community => ({
        id: community.id,
        name: community.name,
        slug: community.slug,
        category: community.category,
        type: community.community_type,
        status: community.is_active ? "Approved" : "Pending",
        description: community.description,
        members: community.member_count,
        posts: community.post_count,
        creator: {
          name: `${community.creator.first_name} ${community.creator.last_name}`,
          accountType: community.creator.account_type
        },
        joinApprovalRequired: community.join_approval_required,
        createdAt: community.created_at
      }))

      const jsonContent = JSON.stringify(exportData, null, 2)
      const blob = new Blob([jsonContent], { type: "application/json" })
      const link = document.createElement("a")
      const url = URL.createObjectURL(blob)
      
      link.setAttribute("href", url)
      link.setAttribute("download", `${filename}-${new Date().toISOString().split('T')[0]}.json`)
      link.style.visibility = "hidden"
      
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      console.log("✅ JSON exported successfully")
    } catch (error) {
      console.error("❌ Export failed:", error)
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <div className="relative group">
      <button
        disabled={isExporting || communities.length === 0}
        className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isExporting ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>Exporting...</span>
          </>
        ) : (
          <>
            <Download className="w-5 h-5" />
            <span>Export</span>
          </>
        )}
      </button>

      {/* Export options dropdown */}
      {!isExporting && communities.length > 0 && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
          <button
            onClick={exportToCSV}
            className="w-full px-4 py-3 text-left text-sm text-gray-700 hover:bg-gray-50 rounded-t-xl transition-colors"
          >
            Export as CSV
          </button>
          <button
            onClick={exportToJSON}
            className="w-full px-4 py-3 text-left text-sm text-gray-700 hover:bg-gray-50 rounded-b-xl transition-colors"
          >
            Export as JSON
          </button>
        </div>
      )}
    </div>
  )
}