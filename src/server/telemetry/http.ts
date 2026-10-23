import type { NextResponse } from "next/server";
import { requireRole } from "@/lib/auth/guards";

/**
 * Guards operational telemetry endpoints.
 *
 * Allows either an authenticated `admin` customer or a machine-to-machine
 * token in `x-telemetry-token` matching `TELEMETRY_FLUSH_TOKEN`. When no token
 * is configured, only admins are allowed.
 */
export async function authorizeTelemetryAdmin(
  request: Request,
): Promise<{ ok: true } | { ok: false; response: NextResponse }> {
  const expected = process.env.TELEMETRY_FLUSH_TOKEN;
  const provided = request.headers.get("x-telemetry-token");

  if (expected && provided && provided === expected) {
    return { ok: true };
  }

  const auth = await requireRole(request, ["admin"]);
  if (!auth.ok) return { ok: false, response: auth.response };
  return { ok: true };
}
