import Image from "next/image";
import Link from "next/link";
import { formatDate } from "@/lib/format";
import type { BlogArticle } from "@/types/blog";

interface BlogCardProps {
  article: BlogArticle;
  featured?: boolean;
}

export function BlogCard({ article, featured = false }: BlogCardProps) {
  if (featured) {
    return (
      <article className="glass group overflow-hidden rounded-3xl shadow-xl transition-all duration-300 hover:border-primary/60 border border-transparent">
        <Link href={`/blog/${article.slug}`} className="flex flex-col md:flex-row">
          <div className="relative aspect-[16/9] lg:aspect-[2/1] w-full md:w-[50%] lg:w-[60%] shrink-0 overflow-hidden">
            <Image
              src={article.coverImageUrl}
              alt=""
              fill
              sizes="(min-width: 768px) 66vw, 100vw"
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
          </div>
          <div className="flex flex-1 flex-col justify-center p-6 md:p-8 lg:p-10 space-y-3">
            <span className="text-xs font-semibold uppercase tracking-[0.05em] text-primary">
              {article.category}
            </span>
            <h2 className="font-display text-2xl font-bold leading-tight text-foreground md:text-3xl group-hover:text-primary transition-colors underline-offset-4 group-hover:underline">
              {article.title}
            </h2>
            <p className="text-sm text-muted-foreground">{formatDate(article.publishedAt)}</p>
            <p className="line-clamp-3 text-sm leading-relaxed text-muted-foreground mt-2">
              {article.excerpt}
            </p>
          </div>
        </Link>
      </article>
    );
  }

  return (
    <article className="group flex flex-col gap-3 transition-all duration-300">
      <Link href={`/blog/${article.slug}`} className="block overflow-hidden rounded-2xl">
        <div className="relative aspect-[16/10] w-full overflow-hidden">
          <Image
            src={article.coverImageUrl}
            alt=""
            fill
            sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        </div>
      </Link>
      <div className="space-y-1.5 px-1">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-primary">
            {article.category}
          </span>
          {article.region && (
            <>
              <span className="text-xs text-muted-foreground/50">•</span>
              <span className="text-xs text-muted-foreground">{article.region}</span>
            </>
          )}
        </div>
        <Link href={`/blog/${article.slug}`} className="block">
          <h2 className="line-clamp-2 font-display text-lg font-bold leading-snug text-foreground transition-colors group-hover:text-primary">
            {article.title}
          </h2>
        </Link>
        <p className="text-xs text-muted-foreground">{formatDate(article.publishedAt)}</p>
      </div>
    </article>
  );
}
