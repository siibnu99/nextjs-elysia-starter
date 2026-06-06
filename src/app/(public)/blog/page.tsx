"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import type { Post } from "@/app/(protected)/dashboard/post/_server/type";
import { buttonVariants } from "@/components/ui/button";
import BlogCard from "./_components/blog-card";
import { fetchBlogs } from "./_server";

export default function BlogPage() {
  const {
    data: blogs = [],
    isLoading,
    isError,
    error,
  } = useQuery<Post[], Error>({
    queryKey: ["blogs"],
    queryFn: fetchBlogs,
  });

  return (
    <div className="min-h-screen bg-background px-6 py-10">
      <div className="mx-auto max-w-3xl">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold tracking-tight mb-4">Blog</h1>
          <Link href="/" className={buttonVariants({ variant: "secondary" })}>
            Back to Home
          </Link>
        </div>
        {isLoading ? (
          <p className="text-muted-foreground">Loading blogs...</p>
        ) : isError ? (
          <p className="text-red-500">Failed to load blogs: {error?.message}</p>
        ) : blogs.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            There are no blogs available yet.
          </p>
        ) : (
          <div className="flex flex-col gap-4">
            {blogs.map((blog) => (
              <BlogCard key={blog.id} {...blog} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
