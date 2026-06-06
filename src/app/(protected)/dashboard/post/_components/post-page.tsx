"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import { Button, buttonVariants } from "@/components/ui/button";
import { deletePost, fetchPosts } from "../_server";
import type { Post } from "../_server/type";
import { postsQueryKey } from "../_server/type";
import { CreatePostDialog } from "./create-dialog";
import { EditPostDialog } from "./edit-dialog";

export function PostsPageClient() {
  const queryClient = useQueryClient();

  const {
    data: posts = [],
    isLoading,
    isError,
    error,
  } = useQuery<Post[], Error>({
    queryKey: postsQueryKey,
    queryFn: fetchPosts,
  });

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<Post | null>(null);

  const deleteMutation = useMutation({
    mutationFn: deletePost,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: postsQueryKey });
      toast.success("Post deleted.");
    },
    onError: (err: Error) => {
      toast.error(err.message);
    },
  });

  async function handleDelete(post: Post) {
    toast(`Are you sure you want to delete the post "${post.name}"?`, {
      action: {
        label: "Delete",
        onClick: () => {
          deleteMutation.mutate(post.id);
        },
      },
    });
  }

  return (
    <div className="min-h-screen bg-background px-6 py-8">
      <div className="mx-auto flex max-w-4xl flex-col gap-6">
        <header className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Posts</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Simple CRUD interface for the posts table.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/settings"
              className={buttonVariants({ variant: "secondary" })}
            >
              Settings
            </Link>
            <Link
              href="/dashboard"
              className={buttonVariants({ variant: "secondary" })}
            >
              Dashboard
            </Link>
            <Button
              className={buttonVariants()}
              size="sm"
              onClick={() => setIsCreateOpen(true)}
            >
              Add post
            </Button>
          </div>
        </header>

        <main className="space-y-3">
          {isLoading ? (
            <p className="text-sm text-muted-foreground">Loading posts...</p>
          ) : isError ? (
            <p className="text-sm text-destructive">
              {error?.message ?? "Failed to load posts."}
            </p>
          ) : posts.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No posts yet. Click &quot;Add post&quot; to create one.
            </p>
          ) : (
            <ul className="space-y-3">
              {posts.map((post) => (
                <li
                  key={post.id}
                  className="flex items-start justify-between gap-4 rounded-lg border bg-card p-4 text-card-foreground shadow-sm"
                >
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
                        setEditingPost(post);
                        setIsEditOpen(true);
                      }}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="destructive"
                      size="xs"
                      onClick={() => void handleDelete(post)}
                    >
                      Delete
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </main>
      </div>

      <CreatePostDialog open={isCreateOpen} onOpenChange={setIsCreateOpen} />

      {editingPost && (
        <EditPostDialog
          open={isEditOpen}
          onOpenChange={(open) => {
            setIsEditOpen(open);
            if (!open) setEditingPost(null);
          }}
          post={editingPost}
        />
      )}
    </div>
  );
}
