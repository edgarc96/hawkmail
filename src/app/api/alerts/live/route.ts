import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { alerts } from "@/db/schema";
import { and, desc, eq } from "drizzle-orm";

// Server-Sent Events stream for live alerts per authenticated user
export async function GET(request: NextRequest) {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session?.user) {
    return new Response(JSON.stringify({ error: "Authentication required" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  const encoder = new TextEncoder();
  let intervalId: NodeJS.Timeout | null = null;
  let heartbeatId: NodeJS.Timeout | null = null;

  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      const write = (data: unknown) => {
        try {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
        } catch (_) {
          // ignore enqueue errors on closed streams
        }
      };

      // Initial snapshot of latest alerts (prioritize unread)
      (async () => {
        try {
          const initial = await db
            .select()
            .from(alerts)
            .where(eq(alerts.userId, session.user.id))
            .orderBy(desc(alerts.isRead), desc(alerts.createdAt))
            .limit(50);
          write({ type: "snapshot", alerts: initial });
        } catch (err) {
          write({ type: "error", message: "Failed to load initial alerts" });
        }
      })();

      // Poll DB periodically for latest alerts for this user
      intervalId = setInterval(async () => {
        try {
          const latest = await db
            .select()
            .from(alerts)
            .where(eq(alerts.userId, session.user.id))
            .orderBy(desc(alerts.isRead), desc(alerts.createdAt))
            .limit(50);
          write({ type: "update", alerts: latest });
        } catch (err) {
          write({ type: "error", message: "Failed to refresh alerts" });
        }
      }, 5000);

      // Heartbeat to keep connection alive
      heartbeatId = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(`: ping\n\n`));
        } catch (_) {}
      }, 15000);
    },
    cancel() {
      if (intervalId) clearInterval(intervalId);
      if (heartbeatId) clearInterval(heartbeatId);
    },
  });

  // Close streams on client abort
  request.signal.addEventListener("abort", () => {
    if (intervalId) clearInterval(intervalId);
    if (heartbeatId) clearInterval(heartbeatId);
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}

