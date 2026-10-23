import Image from "next/image";
import Link from "next/link";
import { formatDate } from "@/lib/format";
import type { BlogArticle } from "@/types/blog";
import { ChevronRight } from "lucide-react";

interface BlogSidebarProps {
  articles: BlogArticle[];
  type?: "latest" | "other";
}

export function BlogSidebar({ articles, type = "latest" }: BlogSidebarProps) {
  const latestArticles = articles.slice(0, 5);
  
  const categoryCounts = articles.reduce((acc, article) => {
    acc[article.category] = (acc[article.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  const categories = Object.entries(categoryCounts)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Latest / Other Articles */}
      <div className="rounded-2xl border border-[var(--color-border)] bg-surface-soft p-5 md:p-6">
        <h3 className="mb-6 font-display text-xl font-bold text-foreground">
          {type === "latest" ? "Baru Aja Rilis" : "Artikel Lainnya"}
        </h3>
        
        <div className="space-y-6">
          {latestArticles.map((article) => (
            <Link key={article.slug} href={`/blog/${article.slug}`} className="group flex gap-4">
              {type === "other" && (
                <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-muted">
                  <Image
                    src={article.coverImageUrl}
                    alt=""
                    fill
                    sizes="80px"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
              )}
              <div className="flex-1 space-y-1">
                <h4 className="line-clamp-2 font-display text-sm font-semibold leading-snug text-foreground group-hover:text-primary">
                  {article.title}
                </h4>
                <div className="flex flex-col gap-0.5 pt-1 text-xs text-muted-foreground">
                  <span>{formatDate(article.publishedAt)}</span>
                  {type === "other" && <span>{article.author}</span>}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Categories */}
      <div className={type === "latest" ? "rounded-2xl border border-[var(--color-border)] bg-surface-soft p-5 md:p-6" : "pt-4"}>
        <h3 className={`font-display font-bold text-foreground ${type === "latest" ? "mb-5 text-lg" : "mb-4 text-xl"}`}>
          {type === "latest" ? "Vibe Terfavorit" : "Kategori"}
        </h3>
        {type === "latest" ? (
          <ul className="space-y-3">
            {categories.map((category) => (
              <li key={category.name}>
                <Link href={`/blog?category=${encodeURIComponent(category.name)}`} className="group flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-primary">
                  <ChevronRight className="h-4 w-4 shrink-0 transition-transform group-hover:translate-x-1" />
                  <span>{category.name} ({category.count})</span>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <Link 
                key={category.name} 
                href={`/blog?category=${encodeURIComponent(category.name)}`}
                className="rounded-full bg-surface-soft px-4 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-[var(--glass-bg-subtle)] hover:text-foreground border border-border"
              >
                {category.name}
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
