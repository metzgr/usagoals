import { getOverview } from "@/lib/apex";

export const dynamic = "force-dynamic";

export async function GET() {
  const overview = await getOverview();
  const payload = JSON.stringify(
    {
      generatedAt: new Date().toISOString(),
      ...overview,
    },
    null,
    2,
  );

  return new Response(payload, {
    headers: {
      "Cache-Control": "no-store",
      "Content-Disposition": 'attachment; filename="usa-goals-data.json"',
      "Content-Type": "application/json; charset=utf-8",
    },
  });
}
