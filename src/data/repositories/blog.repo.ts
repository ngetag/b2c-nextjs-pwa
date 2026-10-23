import { blogs } from "@/data/fixtures/blogs";
import { simulateLatency } from "@/data/repositories/_latency";
import type { BlogArticle } from "@/types/blog";

export async function listBlogs(): Promise<BlogArticle[]> {
  return simulateLatency([...blogs]);
}

export async function getBlogBySlug(slug: string): Promise<BlogArticle | null> {
  return simulateLatency(blogs.find((blog) => blog.slug === slug) ?? null);
}
