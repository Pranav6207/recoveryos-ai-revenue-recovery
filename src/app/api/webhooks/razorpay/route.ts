import { createHmac, timingSafeEqual } from "node:crypto";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
  if (!webhookSecret) {
    return Response.json({ accepted: false, error: "Webhook integration is not configured." }, { status: 503 });
  }

  const body = await request.text();
  const signature = request.headers.get("x-razorpay-signature");
  const eventId = request.headers.get("x-razorpay-event-id");
  if (!signature || !eventId) {
    return Response.json({ accepted: false, error: "Missing Razorpay webhook headers." }, { status: 400 });
  }

  const expected = createHmac("sha256", webhookSecret).update(body).digest("hex");
  const receivedBuffer = Buffer.from(signature, "utf8");
  const expectedBuffer = Buffer.from(expected, "utf8");
  if (receivedBuffer.length !== expectedBuffer.length || !timingSafeEqual(receivedBuffer, expectedBuffer)) {
    return Response.json({ accepted: false, error: "Invalid Razorpay signature." }, { status: 401 });
  }

  return Response.json({ accepted: true, eventId });
}
