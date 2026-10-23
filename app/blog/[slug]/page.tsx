import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { routes } from "@/config/routes";
import { getBlogBySlug, listBlogs } from "@/data/repositories/blog.repo";
import { getSpotById } from "@/data/repositories/spot.repo";
import { listTags } from "@/data/repositories/tag.repo";
import { SpotCard } from "@/features/spot/components/SpotCard";
import { BlogSidebar } from "@/features/blog/components/BlogSidebar";
import { ShareButton } from "@/features/blog/components/ShareButton";
import { formatDate } from "@/lib/format";
import { siteConfig } from "@/config/site";
import { UserCircle2 } from "lucide-react";

interface BlogDetailPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: BlogDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const article = await getBlogBySlug(slug);

  if (!article) return { title: "Artikel tidak ditemukan" };

  return {
    title: article.title,
    description: article.excerpt,
    openGraph: {
      type: "article",
      title: article.title,
      description: article.excerpt,
      publishedTime: article.publishedAt,
      authors: [article.author],
      tags: article.tags,
      images: [{ url: article.coverImageUrl }],
    },
  };
}

export default async function BlogDetailPage({ params }: BlogDetailPageProps) {
  const { slug } = await params;
  const article = await getBlogBySlug(slug);
  if (!article) notFound();

  const [spots, tags, allArticles] = await Promise.all([
    Promise.all(article.spotIds.map((spotId) => getSpotById(spotId))),
    listTags(),
    listBlogs(),
  ]);
  const referencedSpots = spots.filter((spot) => spot !== null);
  const otherArticles = allArticles.filter((a) => a.slug !== article.slug);
  
  const articleUrl = `${siteConfig.url}${routes.blogArticle(article.slug)}`;
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: article.title,
    description: article.excerpt,
    image: [article.coverImageUrl],
    datePublished: article.publishedAt,
    author: { "@type": "Person", name: article.author },
    publisher: { "@type": "Organization", name: siteConfig.name },
    mainEntityOfPage: { "@type": "WebPage", "@id": articleUrl },
  };

  return (
    <div className="min-h-screen overflow-x-hidden bg-background text-foreground">
      <div className="mx-auto max-w-7xl px-4 py-6 md:px-6 md:py-10">
        
        {/* Header */}
        <header className="mb-6 space-y-4">
          <h1 className="font-display text-3xl font-bold leading-tight text-foreground md:text-4xl lg:text-5xl lg:w-5/6">
            {article.title}
          </h1>
          
          <div className="flex flex-wrap items-center gap-3 pt-1">
            <span className="rounded-full bg-primary/20 px-4 py-1.5 text-sm font-semibold text-primary">
              {article.category}
            </span>
            {article.region && (
              <span className="rounded-full border border-border bg-surface-soft px-4 py-1 text-sm text-muted-foreground">
                {article.region}
              </span>
            )}
          </div>
          
          <div className="flex flex-wrap items-center justify-between gap-4 pt-3">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <UserCircle2 className="h-5 w-5 text-primary" />
                <span className="text-sm font-bold text-foreground">{article.author}</span>
              </div>
              <span className="text-sm text-muted-foreground">{formatDate(article.publishedAt)}</span>
            </div>
          </div>
        </header>

        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
          {/* Main Content */}
          <article className="flex-1 min-w-0">
            <div className="relative aspect-[16/9] w-full overflow-hidden rounded-2xl bg-surface group">
              <Image
                src={article.coverImageUrl}
                alt=""
                fill
                priority
                sizes="(min-width: 1024px) 66vw, 100vw"
                className="object-cover"
              />
              <ShareButton title={article.title} url={articleUrl} />
            </div>
            <p className="mt-2 text-xs italic text-muted-foreground">
              Gambaran dari {article.region ? `wilayah ${article.region}` : article.title}
            </p>

            <div className="prose-ngetag mt-8 space-y-6">
              <p className="text-lg leading-8 text-foreground/90 font-medium">
                {article.excerpt}
              </p>
              
              {article.sections.map((section) => (
                <section key={section.heading} className="space-y-3">
                  <h2 className="font-display text-xl font-bold text-foreground md:text-2xl pt-4">{section.heading}</h2>
                  {section.paragraphs.map((paragraph) => (
                    <p key={paragraph} className="text-base leading-8 text-foreground/85">{paragraph}</p>
                  ))}
                </section>
              ))}
            </div>

            {/* Tags */}
            {article.tags && article.tags.length > 0 && (
              <div className="mt-10 flex flex-wrap gap-2 pt-6 border-t border-white/5">
                {article.tags.map(tag => (
                  <span key={tag} className="rounded-md bg-surface-soft px-3 py-1.5 text-sm font-medium text-muted-foreground border border-border">
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {referencedSpots.length > 0 ? (
              <section className="mt-16 border-t border-border pt-8" aria-labelledby="referenced-spots-title">
                <div className="mb-6">
                  <h2 id="referenced-spots-title" className="font-display text-2xl font-bold text-foreground">
                    Spot yang Dibahas
                  </h2>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  {referencedSpots.map((spot) => (
                    <SpotCard key={spot.id} spot={spot} tags={tags} />
                  ))}
                </div>
              </section>
            ) : null}
          </article>
          
          {/* Sidebar */}
          <aside className="w-full lg:w-[320px] xl:w-[360px] shrink-0">
            <div className="sticky top-24">
              <BlogSidebar articles={otherArticles} type="other" />
            </div>
          </aside>
        </div>

      </div>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    </div>
  );
}
