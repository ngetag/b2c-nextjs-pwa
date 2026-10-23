"use client";

import { useMemo, useState } from "react";
import { BlogCard } from "@/features/blog/components/BlogCard";
import { BlogSidebar } from "@/features/blog/components/BlogSidebar";
import { Button } from "@/components/ui/button";
import type { BlogArticle } from "@/types/blog";

interface BlogLandingViewProps {
  articles: BlogArticle[];
  initialCategory?: string;
}

export function BlogLandingView({ articles, initialCategory }: BlogLandingViewProps) {
  const [activeTag, setActiveTag] = useState(initialCategory || "Semua");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9;

  const featured = articles.find((article) => article.featured) ?? articles[0];
  const tags = ["Semua", ...Array.from(new Set(articles.map((article) => article.category)))];

  const handleTagChange = (tag: string) => {
    setActiveTag(tag);
    setCurrentPage(1); // Reset page to 1 when changing filter
  };

  const filteredArticles = useMemo(
    () =>
      articles.filter(
        (article) => activeTag === "Semua" || article.category === activeTag,
      ),
    [activeTag, articles],
  );

  const gridArticles = filteredArticles.filter((article) => article.slug !== featured?.slug);
  const totalPages = Math.ceil(gridArticles.length / itemsPerPage);
  const paginatedArticles = gridArticles.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="space-y-10 lg:space-y-16">
      {featured && (
        <section aria-labelledby="featured-blog-title">
          <h2 id="featured-blog-title" className="mb-6 font-display text-2xl font-bold text-foreground md:text-3xl">
            Artikel <span className="text-primary">Pilihan</span>
          </h2>
          <BlogCard article={featured} featured />
        </section>
      )}

      <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
        {/* Main Content */}
        <div className="flex-1 min-w-0 space-y-10">
          <section aria-labelledby="blog-filter-title" className="space-y-6">
            <div className="scrollbar-hide -mx-1 flex gap-2 overflow-x-auto px-1 pb-1" role="group" aria-label="Filter kategori artikel">
              {tags.map((tag) => (
                <Button
                  key={tag}
                  type="button"
                  size="sm"
                  variant={activeTag === tag ? "default" : "outline"}
                  className="shrink-0 rounded-full"
                  onClick={() => handleTagChange(tag)}
                  aria-pressed={activeTag === tag}
                >
                  {tag}
                </Button>
              ))}
            </div>

            {paginatedArticles.length > 0 ? (
              <div className="grid min-w-0 gap-x-6 gap-y-10 sm:grid-cols-2 xl:grid-cols-3">
                {paginatedArticles.map((article) => <BlogCard key={article.slug} article={article} />)}
              </div>
            ) : (
              <p className="rounded-2xl border border-border bg-surface-soft p-6 text-sm text-muted-foreground">
                Belum ada artikel di vibe ini.
              </p>
            )}
          </section>

          {/* Pagination UI */}
          {totalPages > 1 && (
            <div className="flex justify-center md:justify-start pt-4">
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="rounded-lg bg-surface-soft px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-white/10 hover:text-foreground disabled:pointer-events-none disabled:opacity-50"
                >
                  « Sebelumnya
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                      currentPage === page
                        ? "border border-primary/50 bg-primary/10 text-primary"
                        : "bg-surface-soft text-muted-foreground hover:bg-white/10 hover:text-foreground"
                    }`}
                  >
                    {page}
                  </button>
                ))}
                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="rounded-lg bg-surface-soft px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-white/10 hover:text-foreground disabled:pointer-events-none disabled:opacity-50"
                >
                  Berikutnya »
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <aside className="w-full shrink-0 lg:w-[320px] xl:w-[360px]">
          <div className="sticky top-24">
            <BlogSidebar articles={articles} type="latest" />
          </div>
        </aside>
      </div>
    </div>
  );
}
