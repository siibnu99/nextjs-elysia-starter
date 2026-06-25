"use client";

import { useEffect, useState } from "react";
import { AutoCard } from "@/components/auto-card";
import { type Column, DataTable } from "@/components/data-table";
import { ColumnWithActions } from "@/components/data-table/molecules/column-with-actions";
import { useDataTable } from "@/hooks/use-data-table";
import { fetchPosts } from "../_server";
import { type Post, postsQueryKey } from "../_server/type";

const columns: Column<Post>[] = [
  {
    key: "name",
    header: "Title",
    sortable: true,
    render: (post) => <span className="font-medium">{post.name}</span>,
  },
  {
    key: "content",
    header: "Content",
    render: (post) => (
      <span className="text-muted-foreground line-clamp-1">{post.content}</span>
    ),
  },
  {
    key: "createdAt",
    header: "Created",
    sortable: true,
    render: (post) => (
      <span className="text-muted-foreground text-sm">
        {new Date(post.createdAt).toLocaleDateString()}
      </span>
    ),
  },
  {
    key: "actions",
    header: "Actions",
    className: "w-[100px]",
    render: () => null,
  },
];

interface PostsDataTableProps {
  onEdit: (post: Post) => void;
  onDelete: (post: Post) => void;
  onBulkDelete: (posts: Post[]) => void;
  onCreate: () => void;
  onSelectionChange?: (posts: Post[]) => void;
}

export function PostsDataTable({
  onEdit,
  onDelete,
  onBulkDelete,
  onCreate,
  onSelectionChange,
}: PostsDataTableProps) {
  const [layout, setLayout] = useState<"table" | "grid">("table");

  useEffect(() => {
    if (typeof document === "undefined") return;
    const match = document.cookie.match(/posts_layout=([^;]+)/);
    if (match && ["table", "grid"].includes(match[1])) {
      setLayout(match[1] as "table" | "grid");
    }
  }, []);

  function handleLayoutChange(newLayout: "table" | "grid") {
    setLayout(newLayout);
    document.cookie = `posts_layout=${newLayout}; path=/; max-age=${60 * 60 * 24 * 365}`;
  }

  const {
    page,
    setPage,
    search,
    setSearch,
    sortBy,
    sortOrder,
    selectedRows,
    setSelectedRows,
    density,
    handleDensityChange,
    responseTime,
    lastLoadTime,
    isRefreshing,
    data: posts,
    pagination,
    isLoading,
    isError,
    error,
    handleSort,
    handleExport,
    handleRefresh,
    refetch,
  } = useDataTable({
    queryKey: postsQueryKey,
    fetchFn: fetchPosts,
    exportFilename: "posts",
    exportColumns: [
      { key: "name", header: "Title" },
      { key: "content", header: "Content" },
      { key: "createdAt", header: "Created At" },
    ],
  });

  useEffect(() => {
    onSelectionChange?.(selectedRows);
  }, [selectedRows, onSelectionChange]);

  const columnsWithActions = ColumnWithActions({
    columns,
    actions: [
      { label: "Edit", onClick: onEdit },
      { label: "Delete", variant: "destructive", onClick: onDelete },
    ],
  });

  return (
    <DataTable
      data={posts}
      columns={columnsWithActions}
      totalItems={pagination?.total ?? 0}
      page={page}
      limit={10}
      onPageChange={setPage}
      searchPlaceholder="Search posts by title or content..."
      searchValue={search}
      onSearchChange={setSearch}
      enableSorting
      sortBy={sortBy}
      sortOrder={sortOrder}
      onSort={handleSort}
      enableSelection
      selectedRows={selectedRows}
      onSelectionChange={setSelectedRows}
      bulkActions={[
        {
          label: "Bulk Delete",
          onClick: () => onBulkDelete(selectedRows),
          variant: "destructive",
        },
      ]}
      enableExport
      onExport={handleExport}
      density={density}
      onDensityChange={handleDensityChange}
      layout={layout}
      onLayoutChange={handleLayoutChange}
      gridCols={3}
      renderCard={(row, selectionProps) => (
        <AutoCard
          row={row}
          columns={columnsWithActions}
          onEdit={() => onEdit(row)}
          onDelete={() => onDelete(row)}
          selectable={selectionProps?.selectable}
          selected={selectionProps?.selected}
          onSelectionChange={selectionProps?.onSelectionChange}
        />
      )}
      isLoading={isLoading}
      isError={isError}
      errorMessage={error?.message}
      onRetry={() => refetch()}
      responseTime={responseTime}
      lastLoadTime={lastLoadTime}
      onRefresh={handleRefresh}
      isRefreshing={isRefreshing}
      emptyMessage="No posts found."
      emptyAction={{ label: "+ Add Post", onClick: onCreate }}
      getRowId={(post) => post.id}
    />
  );
}
