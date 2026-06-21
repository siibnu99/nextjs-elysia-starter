import { Button } from "@/components/ui/button"

interface TablePaginationProps {
  page: number
  totalPages: number
  onPageChange: (page: number) => void
}

export function TablePagination({ page, totalPages, onPageChange }: TablePaginationProps) {
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1)
  const maxVisible = 5
  const start = Math.max(0, Math.min(page - Math.floor(maxVisible / 2), totalPages - maxVisible))
  const visiblePages = pages.slice(start, start + maxVisible)

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        size="sm"
        disabled={page <= 1}
        onClick={() => onPageChange(page - 1)}
      >
        Previous
      </Button>
      {visiblePages.map((pageNum) => (
        <Button
          key={pageNum}
          variant={pageNum === page ? "default" : "outline"}
          size="sm"
          onClick={() => onPageChange(pageNum)}
        >
          {pageNum}
        </Button>
      ))}
      <Button
        variant="outline"
        size="sm"
        disabled={page >= totalPages}
        onClick={() => onPageChange(page + 1)}
      >
        Next
      </Button>
    </div>
  )
}
