"use client"
import React, { useEffect, useState } from 'react'
import { useProtectedRoute } from '@/_hooks/useProtectedRoute'
import api from '@/_services/api'
import useAuthStore from '@/_store/auth'
import { SubmissionsTable } from '@/_components/profile/SubmissionTable'
import { Button } from '@/_components/ui/button'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import AuthLoader from '@/_components/AuthLoader'

interface Submission {
  id: string
  problemTitle: string
  problemId: string
  language: string
  verdict:
    | "ACCEPTED"
    | "WRONG_ANSWER"
    | "TIME_LIMIT_EXCEEDED"
    | "MEMORY_LIMIT_EXCEEDED"
    | "RUNTIME_ERROR"
    | "COMPILATION_ERROR"
  createdAt: string
  runtime: number
  memory: number
}

function SubmissionPage() {
  const { isAllowed, isLoading: authLoading } = useProtectedRoute()
  const accessToken = useAuthStore((state) => state.accessToken)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const limit = 17 // Number of submissions per page

  // Show loading while authentication is being verified
  if (authLoading || !isAllowed) {
    return <AuthLoader />;
  }

  useEffect(() => {
    // Only fetch data if user is authenticated and allowed to access this route
    if (!isAllowed) {
      return;
    }

    const fetchTotalPages = async () => {
      try {
        const response = await api.get('/submissions', {
          headers: { Authorization: `Bearer ${accessToken}` },
        })
        setTotalPages(Math.ceil(response.data.data.length / limit))
      } catch (error) {
        console.error('Failed to fetch total pages:', error)
      }
    }
    fetchTotalPages()
  }, [accessToken])

  useEffect(() => {
    const fetchSubmissions = async (page = 1) => {
      setIsLoading(true)
      try {
        const response = await api.get('/submissions', {
          headers: { Authorization: `Bearer ${accessToken}` },
          params: {
            limit: limit,
            offset: (page - 1) * limit,
          },
        })
        setSubmissions(response.data.data)
      } catch (error) {
        console.error('Failed to fetch submissions:', error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchSubmissions(currentPage)
  }, [accessToken, currentPage, isAllowed])

  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) return
    setCurrentPage(page)
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-4 p-2 text-center">My Submissions</h1>
      <div className="mx-auto px-4 pb-2 rounded-lg shadow-md">
      {submissions.length > 0 && (
        <SubmissionsTable submissions={submissions} isLoading={isLoading} />
      )}
      </div>

      {submissions.length === 0 && !isLoading && (
        <div className="text-center text-gray-500">No submissions found.</div>
      )}

      {/* Pagination */}
      {!isLoading && submissions.length > 0 && (
        <div className="flex justify-center items-center gap-2 m-4">
          <Button
            variant="outline"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="flex items-center gap-2"
          >
            <ChevronLeft className="h-4 w-4" />
            Previous
          </Button>

          {Array.from({ length: totalPages }, (_, i) => i + 1)
            .filter(
              (page) =>
                page === 1 ||
                page === totalPages ||
                (page >= currentPage - 2 && page <= currentPage + 2)
            )
            .map((page, idx, arr) => {
              const prevPage = arr[idx - 1]
              const showEllipsis = prevPage && page - prevPage > 1

              return (
                <React.Fragment key={page}>
                  {showEllipsis && <span className="px-2 text-muted-foreground">...</span>}
                  <Button
                    variant={page === currentPage ? "default" : "outline"}
                    onClick={() => handlePageChange(page)}
                    className="w-10"
                  >
                    {page}
                  </Button>
                </React.Fragment>
              )
            })}

          <Button
            variant="outline"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="flex items-center gap-2"
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

      )}
    </div>
  )
}

export default SubmissionPage
