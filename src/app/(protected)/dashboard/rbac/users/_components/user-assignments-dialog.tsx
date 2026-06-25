"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  PlusIcon,
  TrashIcon,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { extractErrorMessage } from "@/lib/utils";
import { fetchAssignments } from "../../assignments/_server";
import { assignmentsQueryKey } from "../../assignments/_server/type";
import {
  assignUserToAssignment,
  removeUserFromAssignment,
} from "../../user-assignments/_server";
import { fetchUserAssignments } from "../_server";
import {
  type UserWithAssignments,
  userAssignmentsQueryKey,
} from "../_server/type";

interface UserAssignmentsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: UserWithAssignments;
}

export function UserAssignmentsDialog({
  open,
  onOpenChange,
  user,
}: UserAssignmentsDialogProps) {
  const [page, setPage] = useState(1);
  const [selectedAssignmentId, setSelectedAssignmentId] = useState<string>("");
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: userAssignmentsQueryKey(user.id),
    queryFn: () => fetchUserAssignments(user.id, { page, limit: 10 }),
    enabled: open,
  });

  const { data: assignmentsData } = useQuery({
    queryKey: assignmentsQueryKey,
    queryFn: () => fetchAssignments({ page: 1, limit: 100 }),
    enabled: open,
  });

  const assignments = data?.data ?? [];
  const pagination = data?.pagination;
  const allAssignments = assignmentsData?.data ?? [];
  const assignedIds = new Set(assignments.map((ua) => ua.assignmentId));
  const availableAssignments = allAssignments.filter(
    (a) => !assignedIds.has(a.id),
  );

  const assignMutation = useMutation({
    mutationFn: assignUserToAssignment,
    onSuccess: () => {
      toast.success("Assignment added.");
      setSelectedAssignmentId("");
      void queryClient.invalidateQueries({
        queryKey: userAssignmentsQueryKey(user.id),
      });
      void queryClient.invalidateQueries({ queryKey: ["users"] });
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const removeMutation = useMutation({
    mutationFn: ({ assignmentId }: { assignmentId: string }) =>
      removeUserFromAssignment(user.id, assignmentId),
    onSuccess: () => {
      toast.success("Assignment removed.");
      void queryClient.invalidateQueries({
        queryKey: userAssignmentsQueryKey(user.id),
      });
      void queryClient.invalidateQueries({ queryKey: ["users"] });
    },
    onError: (err: Error) => {
      try {
        const msg = extractErrorMessage("Failed to remove assignment", err);
        toast.error(msg);
      } catch {
        toast.error(err.message);
      }
    },
  });

  function handleAssign() {
    if (!selectedAssignmentId) return;
    assignMutation.mutate({
      userId: user.id,
      assignmentId: selectedAssignmentId,
    });
  }

  function handleRemove(assignmentId: string) {
    removeMutation.mutate({ assignmentId });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            Assignments for <span className="font-semibold">{user.name}</span>
          </DialogTitle>
        </DialogHeader>

        <div className="flex items-center gap-2">
          <Select
            value={selectedAssignmentId}
            onValueChange={setSelectedAssignmentId}
          >
            <SelectTrigger className="flex-1">
              <SelectValue placeholder="Select an assignment..." />
            </SelectTrigger>
            <SelectContent>
              {availableAssignments.length === 0 ? (
                <SelectItem value="__none" disabled>
                  No available assignments
                </SelectItem>
              ) : (
                availableAssignments.map((a) => (
                  <SelectItem key={a.id} value={a.id}>
                    {a.name}
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
          <Button
            size="sm"
            onClick={handleAssign}
            disabled={!selectedAssignmentId || assignMutation.isPending}
          >
            <PlusIcon className="h-4 w-4" />
            {assignMutation.isPending ? "Assigning..." : "Assign"}
          </Button>
        </div>

        {isLoading ? (
          <div className="py-8 text-center text-sm text-muted-foreground">
            Loading assignments...
          </div>
        ) : assignments.length === 0 ? (
          <div className="py-8 text-center text-sm text-muted-foreground">
            No assignments found for this user.
          </div>
        ) : (
          <div className="space-y-3">
            <div className="rounded-md border">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="px-3 py-2 text-left font-medium">
                      Assignment
                    </th>
                    <th className="px-3 py-2 text-left font-medium">
                      Scope Mode
                    </th>
                    <th className="px-3 py-2 text-left font-medium">
                      Assigned At
                    </th>
                    <th className="px-3 py-2 w-[50px]" />
                  </tr>
                </thead>
                <tbody>
                  {assignments.map((ua) => (
                    <tr key={ua.id} className="border-b last:border-0">
                      <td className="px-3 py-2 font-medium">
                        {ua.assignment.name}
                      </td>
                      <td className="px-3 py-2">
                        <Badge
                          variant={
                            ua.assignment.scopeMode === "global"
                              ? "default"
                              : "outline"
                          }
                        >
                          {ua.assignment.scopeMode}
                        </Badge>
                      </td>
                      <td className="px-3 py-2 text-muted-foreground">
                        {new Date(ua.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-3 py-2">
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => handleRemove(ua.assignmentId)}
                          disabled={removeMutation.isPending}
                        >
                          <TrashIcon className="h-4 w-4 text-destructive" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {pagination && pagination.totalPages > 1 && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  Page {pagination.page} of {pagination.totalPages}
                </span>
                <div className="flex items-center gap-1">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(page - 1)}
                    disabled={page <= 1}
                  >
                    <ChevronLeftIcon className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(page + 1)}
                    disabled={page >= pagination.totalPages}
                  >
                    <ChevronRightIcon className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
