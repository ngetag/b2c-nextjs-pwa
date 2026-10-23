import type { NextRequest } from "next/server";
import { handleApiError, jsonCreated, jsonOk } from "@/lib/api-response";
import { readArrayParam } from "@/lib/url";
import { createInterestSchema } from "@/schemas";
import { storeCreateInterest, storeListInterests } from "@/server/store";

export async function GET(request: NextRequest) {
  try {
    const sp = request.nextUrl.searchParams;
    const ids = readArrayParam(
      sp.getAll("ids").length > 0 ? sp.getAll("ids") : (sp.get("ids") ?? undefined),
    );
    const includeInactive = sp.get("includeInactive") === "true";

    return jsonOk(
      storeListInterests({
        ids: ids.length > 0 ? ids : undefined,
        includeInactive,
      }),
    );
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const input = createInterestSchema.parse(body);
    const created = storeCreateInterest(input);
    return jsonCreated(created);
  } catch (error) {
    return handleApiError(error);
  }
}
