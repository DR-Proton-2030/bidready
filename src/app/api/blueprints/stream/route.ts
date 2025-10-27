import { NextRequest } from "next/server";
import QueueManager from "@/utils/queueManager";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const jobId = searchParams.get("jobId");

  if (!jobId) {
    return new Response(JSON.stringify({ error: "Job ID required" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const encoder = new TextEncoder();
  const queue = QueueManager.getInstance();
  const job = queue.getJob(jobId);

  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      const send = (data: any) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
      };

      // Send initial snapshot if available
      if (job) {
        send({ type: "snapshot", jobId, status: job.status, progress: job.progress, processedImages: job.processedImages });
      } else {
        send({ type: "error", jobId, error: "Job not found" });
      }

      // Subscribe to job events
      const listener = (evt: any) => {
        if (!evt || evt.jobId !== jobId) return;
        send(evt);
      };
      queue.onJob(jobId, listener);

      // Heartbeat to keep connection alive
      const heartbeat = setInterval(() => {
        controller.enqueue(encoder.encode(`: ping\n\n`));
      }, 15000);

      // Handle client disconnect
      const signal = req.signal;
      const onAbort = () => {
        clearInterval(heartbeat);
        queue.offJob(jobId, listener);
        try { controller.close(); } catch {}
      };
      if (signal.aborted) onAbort();
      signal.addEventListener("abort", onAbort);
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-store, must-revalidate",
      "Pragma": "no-cache",
      "Connection": "keep-alive",
      "Access-Control-Allow-Origin": "*",
    },
  });
}
