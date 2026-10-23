import { promos } from "@/data/fixtures/promos";
import { simulateLatency } from "@/data/repositories/_latency";
import type { Promo } from "@/types/promo";

export async function listPromos(): Promise<Promo[]> {
  return simulateLatency([...promos]);
}

export async function listFeaturedPromos(limit = 4): Promise<Promo[]> {
  return simulateLatency(promos.slice(0, limit));
}

export async function getPromoById(id: string): Promise<Promo | null> {
  return simulateLatency(promos.find((p) => p.id === id) ?? null);
}

export async function listPromosByIds(ids: string[]): Promise<Promo[]> {
  return simulateLatency(promos.filter((p) => ids.includes(p.id)));
}
