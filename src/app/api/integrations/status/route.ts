import { getIntegrationHealth, sharedPaymentLink } from "@/lib/integrations";

export const runtime = "nodejs";

export async function GET() {
  return Response.json({ integrations: getIntegrationHealth(), sharedPaymentLinkConfigured: Boolean(sharedPaymentLink()) });
}
