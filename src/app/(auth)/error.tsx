"use client";

import { Button } from "@/components/ui/button";

export default function AuthError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="flex flex-col items-center gap-4 text-center">
        <h2 className="text-xl font-semibold tracking-tight">
          Something went wrong
        </h2>
        <p className="text-sm text-muted-foreground max-w-md">
          {error.message || "An unexpected error occurred."}
        </p>
        <Button onClick={reset} size="sm">
          Try again
        </Button>
      </div>
    </div>
  );
}
