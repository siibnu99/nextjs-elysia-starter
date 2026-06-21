interface ExportColumn {
  key: string
  header: string
}

interface ExportOptions<T> {
  data: T[]
  columns: ExportColumn[]
  filename: string
  format: "csv" | "json"
}

export async function exportData<T>({ data, columns, filename, format }: ExportOptions<T>) {
  let content: string
  let mimeType: string
  let extension: string

  if (format === "csv") {
    const headers = columns.map((c) => c.header).join(",")
    const rows = data.map((row) =>
      columns.map((c) => `"${row[c.key as keyof T] ?? ""}"`).join(",")
    )
    content = [headers, ...rows].join("\n")
    mimeType = "text/csv"
    extension = "csv"
  } else {
    const exportData = data.map((row) => {
      const obj: Record<string, unknown> = {}
      columns.forEach((c) => {
        obj[c.key] = row[c.key as keyof T]
      })
      return obj
    })
    content = JSON.stringify(exportData, null, 2)
    mimeType = "application/json"
    extension = "json"
  }

  const blob = new Blob([content], { type: mimeType })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = `${filename}_${new Date().toISOString().split("T")[0]}.${extension}`
  a.click()
  URL.revokeObjectURL(url)
}
