import type { Metadata } from "next";
import { listBlogs } from "@/data/repositories/blog.repo";
import { BlogLandingView } from "@/features/blog/components/BlogLandingView";

export const metadata: Metadata = {
  title: "Blog",
  description: "Cerita, rekomendasi, dan inspirasi hangout dari NgeTag.",
};

interface BlogPageProps {
  searchParams: Promise<{ category?: string }>;
}

export default async function BlogPage({ searchParams }: BlogPageProps) {
  const { category } = await searchParams;
  const articles = await listBlogs();

  return (
    <div className="min-h-screen overflow-x-hidden bg-background text-foreground">
      <div className="mx-auto max-w-7xl px-4 py-6 md:px-6 md:py-10">
        <BlogLandingView articles={articles} initialCategory={category} />
      </div>
    </div>
  );
}
