"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { updatePost } from "../_server";
import { type Post, type PostBodyInput, postsQueryKey } from "../_server/type";
import { PostForm } from "./post-form";

type EditPostDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  post: Post;
};

export function EditPostDialog({
  open,
  onOpenChange,
  post,
}: EditPostDialogProps) {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (values: PostBodyInput) => updatePost(post.id, values),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: postsQueryKey });
      onOpenChange(false);
      toast.success("Post updated.");
    },
    onError: (err: Error) => {
      toast.error(err.message);
    },
  });

  const handleSubmit = (values: PostBodyInput) => {
    mutation.mutate(values);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent showCloseButton={!mutation.isPending}>
        <DialogHeader>
          <DialogTitle>Edit Post</DialogTitle>
        </DialogHeader>
        <PostForm
          mode="edit"
          initialValues={{
            name: post.name,
            content: post.content,
          }}
          isSubmitting={mutation.isPending}
          onSubmit={handleSubmit}
        />
      </DialogContent>
    </Dialog>
  );
}
