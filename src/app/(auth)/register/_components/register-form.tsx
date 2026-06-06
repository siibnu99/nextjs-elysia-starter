"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button, buttonVariants } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";

export function RegisterForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const { error } = await authClient.signUp.email({
      email,
      password,
      name,
      callbackURL: "/dashboard",
    });

    if (error) {
      setError(
        error.message ?? "Registration failed, please check your details.",
      );
      setIsSubmitting(false);
      return;
    }

    router.push("/dashboard");
  }

  return (
    <div className="w-full max-w-md">
      <div className="rounded-xl border bg-card text-card-foreground shadow-md">
        <div className="flex items-center justify-between gap-4 px-6 py-4 border-b">
          <div>
            <h1 className="text-xl font-semibold tracking-tight">Sign up</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Create a new account to access the dashboard.
            </p>
          </div>
          <Link href="/" className={buttonVariants({ variant: "secondary" })}>
            Home
          </Link>
        </div>
        <form onSubmit={onSubmit} className="space-y-4 px-6 py-6">
          <div className="space-y-1.5">
            <label
              htmlFor="name"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Name
            </label>
            <input
              id="name"
              type="text"
              required
              autoComplete="name"
              className="flex h-9 w-full rounded-md border border-input bg-background px-3 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Full name"
            />
          </div>

          <div className="space-y-1.5">
            <label
              htmlFor="email"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              autoComplete="email"
              className="flex h-9 w-full rounded-md border border-input bg-background px-3 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
            />
          </div>

          <div className="space-y-1.5">
            <label
              htmlFor="password"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              required
              autoComplete="new-password"
              className="flex h-9 w-full rounded-md border border-input bg-background px-3 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 6 characters"
            />
          </div>

          {error && (
            <p className="text-sm text-destructive" aria-live="polite">
              {error}
            </p>
          )}

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "Processing..." : "Sign up"}
          </Button>
          <p className="text-sm text-muted-foreground">
            Already have an account? <Link href="/login">Login</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
