import { readFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";

/**
 * Files from `swagger-ui-dist` that the docs page is allowed to load.
 * Restricting the list prevents path traversal through the catch-all segment.
 */
const ALLOWED_FILES: Record<string, string> = {
  "swagger-ui.css": "text/css; charset=utf-8",
  "swagger-ui-bundle.js": "text/javascript; charset=utf-8",
  "swagger-ui-standalone-preset.js": "text/javascript; charset=utf-8",
  "favicon-16x16.png": "image/png",
  "favicon-32x32.png": "image/png",
};

interface RouteContext {
  params: Promise<{ file: string }>;
}

/**
 * GET /api-docs/assets/:file
 *
 * Serves the Swagger UI static bundle from `node_modules/swagger-ui-dist` so the
 * documentation works offline (CDN requests are blocked inside the preview
 * iframe). Only the files above are exposed.
 */
export async function GET(_request: Request, { params }: RouteContext) {
  const { file } = await params;
  const contentType = ALLOWED_FILES[file];

  if (!contentType) {
    return NextResponse.json(
      { error: { code: "NOT_FOUND", message: `Asset '${file}' tidak tersedia` } },
      { status: 404 },
    );
  }

  try {
    const assetPath = path.join(process.cwd(), "node_modules", "swagger-ui-dist", file);
    const asset = await readFile(assetPath);
    return new NextResponse(new Uint8Array(asset), {
      headers: {
        "content-type": contentType,
        "cache-control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    return NextResponse.json(
      {
        error: {
          code: "ASSET_UNAVAILABLE",
          message:
            "Bundle Swagger UI belum terpasang. Jalankan `npm install` (paket `swagger-ui-dist`).",
        },
      },
      { status: 503 },
    );
  }
}
