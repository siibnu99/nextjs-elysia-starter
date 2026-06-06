"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { Dialog, DialogContent } from "@/components/ui/dialog";
import { createPost } from "../_server";
import type { PostBodyInput } from "../_server/type";
import { postsQueryKey } from "../_server/type";
import { PostForm } from "./post-form";

type CreatePostDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function CreatePostDialog({
  open,
  onOpenChange,
}: CreatePostDialogProps) {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: createPost,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: postsQueryKey });
      onOpenChange(false);
      toast.success("Post created.");
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
        <PostForm
          mode="create"
          isSubmitting={mutation.isPending}
          onSubmit={handleSubmit}
        />
      </DialogContent>
    </Dialog>
  );
}
