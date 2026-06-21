"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useState } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { PageHeader } from "@/components/page-header"
import { CardList } from "@/components/card-list"
import { deletePost, fetchPosts } from "../_server"
import type { Post } from "../_server/type"
import { postsQueryKey } from "../_server/type"
import { CreatePostDialog } from "./create-dialog"
import { EditPostDialog } from "./edit-dialog"

export function PostsPageClient() {
  const queryClient = useQueryClient()

  const {
    data: posts = [],
    isLoading,
    isError,
    error,
  } = useQuery<Post[], Error>({
    queryKey: postsQueryKey,
    queryFn: fetchPosts,
  })

  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [editingPost, setEditingPost] = useState<Post | null>(null)

  const deleteMutation = useMutation({
    mutationFn: deletePost,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: postsQueryKey })
      toast.success("Post deleted.")
    },
    onError: (err: Error) => {
      toast.error(err.message)
    },
  })

  function handleDelete(post: Post) {
    toast(`Are you sure you want to delete the post "${post.name}"?`, {
      action: {
        label: "Delete",
        onClick: () => {
          deleteMutation.mutate(post.id)
        },
      },
    })
  }

  return (
    <div className="min-h-screen bg-background px-6 py-8">
      <div className="mx-auto flex max-w-4xl flex-col gap-6">
        <PageHeader
          title="Posts"
          description="Simple CRUD interface for the posts table."
          action={{ label: "Add post", onClick: () => setIsCreateOpen(true) }}
        />

        <CardList
          data={posts}
          isLoading={isLoading}
          isError={isError}
          error={error ?? undefined}
          emptyMessage="No posts yet. Click &quot;Add post&quot; to create one."
          layout="list"
          renderItem={(post) => (
            <div className="flex items-start justify-between gap-4 rounded-lg border bg-card p-4 text-card-foreground shadow-sm">
              <div>
                <h2 className="text-sm font-semibold">{post.name}</h2>
                <p className="mt-1 text-xs text-muted-foreground">
                  {post.content}
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="xs"
                  onClick={() => {
                    setEditingPost(post)
                    setIsEditOpen(true)
                  }}
                >
                  Edit
                </Button>
                <Button
                  variant="destructive"
                  size="xs"
                  onClick={() => handleDelete(post)}
                >
                  Delete
                </Button>
              </div>
            </div>
          )}
          getRowId={(post) => post.id}
        />
      </div>

      <CreatePostDialog open={isCreateOpen} onOpenChange={setIsCreateOpen} />

      {editingPost && (
        <EditPostDialog
          open={isEditOpen}
          onOpenChange={(open) => {
            setIsEditOpen(open)
            if (!open) setEditingPost(null)
          }}
          post={editingPost}
        />
      )}
    </div>
  )
}
