import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CommunityDetailView } from "@/features/community/components/CommunityDetailView";
import { getCommunityById } from "@/lib/interests";

interface CommunityDetailPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({
  params,
}: CommunityDetailPageProps): Promise<Metadata> {
  const { id } = await params;
  const community = getCommunityById(id);
  if (!community) return { title: "Komunitas tidak ditemukan" };

  return {
    title: community.title,
    description: community.description,
    openGraph: {
      title: community.title,
      description: community.description,
      images: [{ url: community.coverImage }],
    },
  };
}

export default async function CommunityDetailPage({
  params,
}: CommunityDetailPageProps) {
  const { id } = await params;
  const community = getCommunityById(id);
  if (!community) notFound();

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 md:px-6 md:py-10">
      <CommunityDetailView community={community} />
    </div>
  );
}
