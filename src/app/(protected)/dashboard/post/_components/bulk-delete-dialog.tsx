"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { deletePosts } from "../_server";
import { type Post, postsQueryKey } from "../_server/type";

interface BulkDeleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  posts: Post[];
}

export function BulkDeleteDialog({
  open,
  onOpenChange,
  posts,
}: BulkDeleteDialogProps) {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: () => deletePosts(posts.map((p) => p.id)),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: postsQueryKey });
      onOpenChange(false);
      toast.success(`${posts.length} posts deleted.`);
    },
    onError: (err: Error) => {
      toast.error(err.message);
    },
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent showCloseButton={!mutation.isPending}>
        <DialogHeader>
          <DialogTitle>Delete Posts</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete the following {posts.length} posts?
            This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <div className="max-h-60 overflow-auto rounded-md border p-2">
          <ul className="space-y-1 text-sm">
            {posts.map((p) => (
              <li key={p.id} className="rounded px-2 py-1 hover:bg-muted">
                {p.name}
              </li>
            ))}
          </ul>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={mutation.isPending}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={() => mutation.mutate()}
            disabled={mutation.isPending}
          >
            {mutation.isPending
              ? "Deleting..."
              : `Delete ${posts.length} Posts`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
