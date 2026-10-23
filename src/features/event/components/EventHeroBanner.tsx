import Image from "next/image";

interface EventHeroBannerProps {
  imageUrl: string;
  alt: string;
}

export function EventHeroBanner({ imageUrl, alt }: EventHeroBannerProps) {
  return (
    <div className="relative aspect-[16/9] w-full overflow-hidden rounded-lg border border-[var(--color-border)] bg-[var(--color-background)] shadow-[var(--shadow-soft)] md:aspect-[21/9]">
      <Image
        src={imageUrl}
        alt={alt}
        fill
        sizes="(min-width: 1024px) 1024px, 100vw"
        className="object-cover"
        priority
      />
      <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-[rgb(8_17_22_/_0.82)] to-transparent" />
    </div>
  );
}
