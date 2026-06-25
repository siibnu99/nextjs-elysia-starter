"use client";

import { useState } from "react";
import { PageHeader } from "@/components/page-header";
import type { Post } from "../_server/type";
import { BulkDeleteDialog } from "./bulk-delete-dialog";
import { CreatePostDialog } from "./create-dialog";
import { DeletePostDialog } from "./delete-dialog";
import { EditPostDialog } from "./edit-dialog";
import { PostsDataTable } from "./posts-data-table";

export function PostsPageClient() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deletingPost, setDeletingPost] = useState<Post | null>(null);
  const [isBulkDeleteOpen, setIsBulkDeleteOpen] = useState(false);
  const [selectedPosts, setSelectedPosts] = useState<Post[]>([]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Posts"
        description="Manage your posts"
        action={{ label: "+ Add Post", onClick: () => setIsCreateOpen(true) }}
      />

      <PostsDataTable
        onEdit={(post) => {
          setEditingPost(post);
          setIsEditOpen(true);
        }}
        onDelete={(post) => {
          setDeletingPost(post);
          setIsDeleteOpen(true);
        }}
        onBulkDelete={(posts) => {
          setSelectedPosts(posts);
          setIsBulkDeleteOpen(true);
        }}
        onCreate={() => setIsCreateOpen(true)}
        onSelectionChange={setSelectedPosts}
      />

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

      {deletingPost && (
        <DeletePostDialog
          open={isDeleteOpen}
          onOpenChange={(open) => {
            setIsDeleteOpen(open);
            if (!open) setDeletingPost(null);
          }}
          post={deletingPost}
        />
      )}

      {selectedPosts.length > 0 && (
        <BulkDeleteDialog
          open={isBulkDeleteOpen}
          onOpenChange={(open) => {
            setIsBulkDeleteOpen(open);
            if (!open) setSelectedPosts([]);
          }}
          posts={selectedPosts}
        />
      )}
    </div>
  );
}
